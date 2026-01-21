import { readdir, readFile, writeFile, mkdir, copyFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parse as parseToml } from '@iarna/toml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// =============================================================================
// Types
// =============================================================================

interface RulesetConfig {
  [key: string]: unknown;
}

interface GuidelineFrontmatter {
  id: string;
  title: string;
  category: string;
  priority: number;
  tags: string[];
}

interface Guideline {
  frontmatter: GuidelineFrontmatter;
  content: string;
  filename: string;
}

// =============================================================================
// Utilities
// =============================================================================

function parseFrontmatter(content: string): { frontmatter: GuidelineFrontmatter; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error('Invalid frontmatter');
  }

  const yamlContent = match[1];
  const body = match[2];

  // Simple YAML parsing for our known structure
  const frontmatter: Record<string, unknown> = {};
  for (const line of yamlContent.split('\n')) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    let value: unknown = line.slice(colonIndex + 1).trim();

    // Parse arrays
    if (typeof value === 'string' && value.startsWith('[')) {
      value = value.slice(1, -1).split(',').map(s => s.trim());
    }
    // Parse numbers
    else if (typeof value === 'string' && /^\d+$/.test(value)) {
      value = parseInt(value, 10);
    }

    frontmatter[key] = value;
  }

  return { frontmatter: frontmatter as GuidelineFrontmatter, body };
}

function toTitleCase(str: string): string {
  return str.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// =============================================================================
// Ruleset Generation
// =============================================================================

async function loadRuleset(path: string): Promise<RulesetConfig> {
  const content = await readFile(path, 'utf-8');
  return parseToml(content) as RulesetConfig;
}

function formatValue(value: unknown): string {
  if (typeof value === 'string') return `\`${value}\``;
  if (typeof value === 'number' || typeof value === 'boolean') return `\`${value}\``;
  if (typeof value === 'object' && value !== null) {
    if (Array.isArray(value)) {
      return value.map((v) => `\`${v}\``).join(', ');
    }
    const entries = Object.entries(value)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
    return `{ ${entries} }`;
  }
  return String(value);
}

function generateRulesetMarkdown(filename: string, config: RulesetConfig, forSite: boolean = false): string {
  const rulesetId = filename.replace('.toml', '');
  const title = toTitleCase(rulesetId);

  const lines: string[] = [];

  if (forSite) {
    // Add Jekyll frontmatter for the site
    lines.push('---');
    lines.push(`title: "${title}"`);
    lines.push('layout: default');
    lines.push(`parent: Rulesets`);
    lines.push('---');
    lines.push('');
  }

  lines.push('<!-- AUTO-GENERATED — DO NOT EDIT -->');
  lines.push(`<!-- Ruleset: ${filename} -->`);
  lines.push('<!-- Run "pnpm generate" to update -->');
  lines.push('');
  lines.push(`# ${title}`);
  lines.push('');

  function processSection(obj: Record<string, unknown>, prefix: string = '', depth: number = 2): void {
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) continue;

      if (typeof value === 'object' && !Array.isArray(value)) {
        const heading = '#'.repeat(Math.min(depth, 4));
        const sectionTitle = key.split('.').pop() || key;
        const formattedTitle = sectionTitle
          .split(/[-_]/)
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');

        lines.push(`${heading} ${formattedTitle}`);
        lines.push('');

        const isRulesSection = key.includes('rules') || key.endsWith('.rules');

        if (isRulesSection) {
          lines.push('| Rule | Config |');
          lines.push('|------|--------|');
          for (const [ruleName, ruleConfig] of Object.entries(value as Record<string, unknown>)) {
            lines.push(`| \`${ruleName}\` | ${formatValue(ruleConfig)} |`);
          }
          lines.push('');
        } else if (key.includes('require') || key.endsWith('.require')) {
          lines.push('| Option | Value |');
          lines.push('|--------|-------|');
          for (const [optName, optValue] of Object.entries(value as Record<string, unknown>)) {
            lines.push(`| \`${optName}\` | ${formatValue(optValue)} |`);
          }
          lines.push('');
        } else {
          const entries = Object.entries(value as Record<string, unknown>);
          const hasNestedObjects = entries.some(([, v]) => typeof v === 'object' && !Array.isArray(v));

          if (!hasNestedObjects && entries.length > 0) {
            for (const [k, v] of entries) {
              lines.push(`- **${k}**: ${formatValue(v)}`);
            }
            lines.push('');
          } else {
            processSection(value as Record<string, unknown>, key, depth + 1);
          }
        }
      }
    }
  }

  processSection(config as Record<string, unknown>);

  return lines.join('\n');
}

// =============================================================================
// Site Generation
// =============================================================================

async function loadGuidelines(guidelinesDir: string): Promise<Guideline[]> {
  const files = await readdir(guidelinesDir);
  const mdFiles = files.filter(f => f.endsWith('.md'));

  const guidelines: Guideline[] = [];
  for (const file of mdFiles) {
    const content = await readFile(join(guidelinesDir, file), 'utf-8');
    const { frontmatter, body } = parseFrontmatter(content);
    guidelines.push({ frontmatter, content: body, filename: file });
  }

  // Sort by priority
  return guidelines.sort((a, b) => a.frontmatter.priority - b.frontmatter.priority);
}

function generateGuidelineForSite(guideline: Guideline): string {
  const lines: string[] = [
    '---',
    `title: "${guideline.frontmatter.title}"`,
    'layout: default',
    'parent: Guidelines',
    '---',
    '',
    guideline.content
  ];
  return lines.join('\n');
}

function generateSiteIndex(guidelines: Guideline[], rulesetIds: string[]): string {
  const lines: string[] = [
    '---',
    'title: Home',
    'layout: default',
    'nav_order: 1',
    '---',
    '',
    '# Palindrom Standards',
    '',
    'Composable coding standards and guidelines for Palindrom projects.',
    '',
    '## Quick Links',
    '',
    '- [Guidelines](./guidelines/) - Architectural and implementation standards',
    '- [Rulesets](./rulesets/) - Linting and tooling configurations',
    '',
    '## Guidelines Overview',
    '',
    '| Guideline | Category | Tags |',
    '|-----------|----------|------|',
  ];

  for (const g of guidelines) {
    const tags = Array.isArray(g.frontmatter.tags) ? g.frontmatter.tags.join(', ') : g.frontmatter.tags;
    lines.push(`| [${g.frontmatter.title}](./guidelines/${g.frontmatter.id}.html) | ${g.frontmatter.category} | ${tags} |`);
  }

  lines.push('');
  lines.push('## Rulesets Overview');
  lines.push('');
  lines.push('| Ruleset | Language | Tier |');
  lines.push('|---------|----------|------|');

  for (const id of rulesetIds.sort()) {
    const [lang, tier] = id.split('-');
    lines.push(`| [${toTitleCase(id)}](./rulesets/${id}.html) | ${toTitleCase(lang)} | ${toTitleCase(tier)} |`);
  }

  return lines.join('\n');
}

function generateGuidelinesIndex(guidelines: Guideline[]): string {
  const lines: string[] = [
    '---',
    'title: Guidelines',
    'layout: default',
    'nav_order: 2',
    'has_children: true',
    '---',
    '',
    '# Guidelines',
    '',
    'Architectural and implementation standards for Palindrom projects.',
    '',
  ];

  // Group by category
  const byCategory = new Map<string, Guideline[]>();
  for (const g of guidelines) {
    const cat = g.frontmatter.category;
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(g);
  }

  for (const [category, items] of byCategory) {
    lines.push(`## ${toTitleCase(category)}`);
    lines.push('');
    for (const g of items) {
      lines.push(`- [${g.frontmatter.title}](./${g.frontmatter.id}.html)`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

function generateRulesetsIndex(rulesetIds: string[]): string {
  const lines: string[] = [
    '---',
    'title: Rulesets',
    'layout: default',
    'nav_order: 3',
    'has_children: true',
    '---',
    '',
    '# Rulesets',
    '',
    'Linting and tooling configurations at different strictness tiers.',
    '',
    '## Tiers',
    '',
    '- **Production**: Strictest settings for production code',
    '- **Internal**: Moderate settings for internal tools',
    '- **Prototype**: Relaxed settings for rapid prototyping',
    '',
    '## TypeScript',
    '',
  ];

  for (const id of rulesetIds.filter(r => r.startsWith('typescript')).sort()) {
    lines.push(`- [${toTitleCase(id)}](./${id}.html)`);
  }

  lines.push('');
  lines.push('## Python');
  lines.push('');

  for (const id of rulesetIds.filter(r => r.startsWith('python')).sort()) {
    lines.push(`- [${toTitleCase(id)}](./${id}.html)`);
  }

  return lines.join('\n');
}

function generateJekyllConfig(): string {
  return `title: Palindrom Standards
description: Composable coding standards and guidelines
baseurl: /standards
url: https://palindrom-ai.github.io
remote_theme: just-the-docs/just-the-docs

plugins:
  - jekyll-remote-theme
  - jekyll-seo-tag
  - jekyll-include-cache

# Aux links for the upper right navigation
aux_links:
  "GitHub":
    - "https://github.com/palindrom-ai/standards"

# Footer content
footer_content: "Palindrom Standards"

# Color scheme
color_scheme: dark

# Search
search_enabled: true
search:
  heading_level: 2
  previews: 3

# Back to top link
back_to_top: true
back_to_top_text: "Back to top"
`;
}

function generateCustomStyles(): string {
  return `/* GitHub/Linear inspired dark theme - using !important to override theme */

/* Base elements */
body {
  background-color: #0d1117 !important;
  color: #e6edf3 !important;
}

/* Sidebar */
.side-bar {
  background-color: #010409 !important;
  border-right: 1px solid #30363d !important;
}

.site-title {
  color: #ffffff !important;
}

.site-header {
  background-color: #010409 !important;
}

/* Navigation */
.nav-list-link {
  color: #e6edf3 !important;
}

.nav-list-link:hover,
.nav-list-link.active {
  color: #58a6ff !important;
  background-color: rgba(88, 166, 255, 0.1) !important;
}

.nav-list-expander {
  color: #8b949e !important;
}

.nav-list-expander svg {
  color: #8b949e !important;
}

/* Main content area */
.main {
  background-color: #0d1117 !important;
}

.main-content-wrap {
  background-color: #0d1117 !important;
}

.main-content {
  color: #e6edf3 !important;
}

/* Headings */
h1, h2, h3, h4, h5, h6,
.main-content h1, .main-content h2, .main-content h3,
.main-content h4, .main-content h5, .main-content h6 {
  color: #ffffff !important;
}

/* Links */
a, .main-content a {
  color: #58a6ff !important;
}

a:hover, .main-content a:hover {
  color: #79c0ff !important;
}

/* Paragraphs and text */
p, li, .main-content p, .main-content li {
  color: #e6edf3 !important;
}

/* Code */
code, .main-content code {
  background-color: #161b22 !important;
  border: 1px solid #30363d !important;
  color: #e6edf3 !important;
  border-radius: 6px !important;
}

pre, .main-content pre {
  background-color: #161b22 !important;
  border: 1px solid #30363d !important;
  border-radius: 6px !important;
}

pre code {
  border: none !important;
  background-color: transparent !important;
}

/* Tables */
table {
  background-color: #0d1117 !important;
}

.table-wrapper {
  border: 1px solid #30363d !important;
  border-radius: 6px !important;
  overflow: hidden !important;
}

th {
  background-color: #161b22 !important;
  color: #e6edf3 !important;
  border-bottom: 1px solid #30363d !important;
  padding: 12px 16px !important;
}

td {
  background-color: #0d1117 !important;
  color: #e6edf3 !important;
  border-bottom: 1px solid #21262d !important;
  padding: 12px 16px !important;
}

tr:hover td {
  background-color: #161b22 !important;
}

tbody tr:last-child td {
  border-bottom: none !important;
}

/* Search */
.search-input {
  background-color: #0d1117 !important;
  border: 1px solid #30363d !important;
  color: #e6edf3 !important;
  border-radius: 6px !important;
}

.search-input:focus {
  border-color: #58a6ff !important;
  box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.3) !important;
}

.search-results {
  background-color: #161b22 !important;
  border: 1px solid #30363d !important;
}

.search-result-title {
  color: #58a6ff !important;
}

.search-result-doc-title {
  color: #8b949e !important;
}

.search-result-preview {
  color: #8b949e !important;
}

.search-result:hover {
  background-color: #21262d !important;
}

/* Header */
.main-header {
  background-color: #010409 !important;
  border-bottom: 1px solid #30363d !important;
}

/* Buttons */
.site-button {
  background-color: #21262d !important;
  border: 1px solid #30363d !important;
  color: #e6edf3 !important;
  border-radius: 6px !important;
}

.site-button:hover {
  background-color: #30363d !important;
  border-color: #8b949e !important;
}

/* Footer */
.site-footer {
  color: #8b949e !important;
  border-top: 1px solid #30363d !important;
}

footer {
  color: #8b949e !important;
}

footer p, footer a {
  color: #8b949e !important;
}

#back-to-top {
  color: #58a6ff !important;
}

/* Misc */
hr {
  border-color: #30363d !important;
}

.anchor-heading svg {
  color: #8b949e !important;
}

.anchor-heading:hover svg {
  color: #58a6ff !important;
}

blockquote {
  border-left: 4px solid #30363d !important;
  color: #8b949e !important;
  background-color: #161b22 !important;
}

/* Search overlay */
.search-overlay {
  background-color: rgba(0, 0, 0, 0.5) !important;
}

/* Navigation icons */
.nav-list-expander svg,
.search-icon,
.icon {
  color: #8b949e !important;
}
`;
}

// =============================================================================
// Main
// =============================================================================

const repoRoot = join(__dirname, '..');
const rulesetsDir = join(repoRoot, 'rulesets');
const guidelinesDir = join(repoRoot, 'guidelines');
const outputDir = join(repoRoot, 'generated');
const siteDir = join(outputDir, 'site');

async function main() {
  // Generate raw rulesets (for programmatic use)
  const rulesetFiles = (await readdir(rulesetsDir)).filter(f => f.endsWith('.toml'));
  const rulesetIds: string[] = [];

  await mkdir(join(outputDir, 'rulesets'), { recursive: true });

  for (const file of rulesetFiles) {
    const ruleset = await loadRuleset(join(rulesetsDir, file));
    const rulesetId = file.replace('.toml', '');
    rulesetIds.push(rulesetId);

    const markdown = generateRulesetMarkdown(file, ruleset, false);
    await writeFile(join(outputDir, 'rulesets', `${rulesetId}.md`), markdown);
    console.log(`Generated ruleset: ${rulesetId}.md`);
  }

  // Generate site
  console.log('\nGenerating site...');

  await mkdir(join(siteDir, 'guidelines'), { recursive: true });
  await mkdir(join(siteDir, 'rulesets'), { recursive: true });
  await mkdir(join(siteDir, '_includes'), { recursive: true });

  // Load and process guidelines
  const guidelines = await loadGuidelines(guidelinesDir);

  for (const guideline of guidelines) {
    const siteContent = generateGuidelineForSite(guideline);
    await writeFile(join(siteDir, 'guidelines', `${guideline.frontmatter.id}.md`), siteContent);
    console.log(`Generated guideline page: ${guideline.frontmatter.id}.md`);
  }

  // Generate rulesets for site
  for (const file of rulesetFiles) {
    const ruleset = await loadRuleset(join(rulesetsDir, file));
    const rulesetId = file.replace('.toml', '');

    const markdown = generateRulesetMarkdown(file, ruleset, true);
    await writeFile(join(siteDir, 'rulesets', `${rulesetId}.md`), markdown);
    console.log(`Generated ruleset page: ${rulesetId}.md`);
  }

  // Generate index pages
  await writeFile(join(siteDir, 'index.md'), generateSiteIndex(guidelines, rulesetIds));
  console.log('Generated: index.md');

  await writeFile(join(siteDir, 'guidelines', 'index.md'), generateGuidelinesIndex(guidelines));
  console.log('Generated: guidelines/index.md');

  await writeFile(join(siteDir, 'rulesets', 'index.md'), generateRulesetsIndex(rulesetIds));
  console.log('Generated: rulesets/index.md');

  // Generate Jekyll config
  await writeFile(join(siteDir, '_config.yml'), generateJekyllConfig());
  console.log('Generated: _config.yml');

  // Generate custom styles
  const headCustom = `<style>\n${generateCustomStyles()}\n</style>`;
  await writeFile(join(siteDir, '_includes', 'head_custom.html'), headCustom);
  console.log('Generated: _includes/head_custom.html');

  console.log(`\nSite generated at: ${siteDir}/`);
  console.log('To deploy: Enable GitHub Pages in repo settings, pointing to generated/site/');
}

main().catch(console.error);
