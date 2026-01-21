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
  return `/* GitHub/Linear inspired dark theme overrides */

:root {
  --body-background-color: #0d1117;
  --sidebar-color: #010409;
  --body-text-color: #e6edf3;
  --body-heading-color: #ffffff;
  --link-color: #58a6ff;
  --nav-child-link-color: #8b949e;
  --search-background-color: #0d1117;
  --search-result-preview-color: #8b949e;
  --border-color: #30363d;
  --code-background-color: #161b22;
  --table-background-color: #0d1117;
  --feedback-color: #8b949e;
}

/* Sidebar */
.side-bar {
  background-color: #010409;
  border-right: 1px solid #30363d;
}

.site-title {
  color: #ffffff !important;
  font-weight: 600;
}

/* Navigation */
.nav-list-link {
  color: #e6edf3;
}

.nav-list-link:hover,
.nav-list-link.active {
  color: #58a6ff;
  background-color: rgba(88, 166, 255, 0.1);
}

.nav-list-expander {
  color: #8b949e;
}

/* Main content */
.main {
  background-color: #0d1117;
}

.main-content {
  color: #e6edf3;
}

h1, h2, h3, h4, h5, h6 {
  color: #ffffff;
  font-weight: 600;
}

/* Links */
a {
  color: #58a6ff;
}

a:hover {
  color: #79c0ff;
}

/* Code blocks */
code {
  background-color: #161b22;
  border: 1px solid #30363d;
  color: #e6edf3;
  border-radius: 6px;
  padding: 0.2em 0.4em;
}

pre {
  background-color: #161b22;
  border: 1px solid #30363d;
  border-radius: 6px;
}

pre code {
  border: none;
  padding: 0;
}

/* Tables - GitHub style */
.table-wrapper {
  border: 1px solid #30363d;
  border-radius: 6px;
  overflow: hidden;
}

table {
  background-color: #0d1117;
  border-collapse: collapse;
  width: 100%;
}

th {
  background-color: #161b22;
  color: #e6edf3;
  font-weight: 600;
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #30363d;
}

td {
  padding: 12px 16px;
  border-bottom: 1px solid #21262d;
  color: #e6edf3;
}

tr:last-child td {
  border-bottom: none;
}

tr:hover {
  background-color: #161b22;
}

/* Search */
.search-input {
  background-color: #0d1117;
  border: 1px solid #30363d;
  color: #e6edf3;
  border-radius: 6px;
}

.search-input:focus {
  border-color: #58a6ff;
  box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.3);
}

.search-results {
  background-color: #161b22;
  border: 1px solid #30363d;
  border-radius: 6px;
}

.search-result {
  border-bottom: 1px solid #30363d;
}

.search-result:hover {
  background-color: #21262d;
}

/* Buttons */
.site-button {
  background-color: #21262d;
  border: 1px solid #30363d;
  color: #e6edf3;
  border-radius: 6px;
}

.site-button:hover {
  background-color: #30363d;
  border-color: #8b949e;
}

/* Footer */
.site-footer {
  color: #8b949e;
  border-top: 1px solid #30363d;
}

/* Anchor links */
.anchor-heading svg {
  color: #8b949e;
}

.anchor-heading:hover svg {
  color: #58a6ff;
}

/* Horizontal rules */
hr {
  border-color: #30363d;
}

/* Back to top */
#back-to-top {
  color: #8b949e;
}

#back-to-top:hover {
  color: #58a6ff;
}

/* Header bar */
.main-header {
  background-color: #010409;
  border-bottom: 1px solid #30363d;
}

/* Aux nav */
.aux-nav-list-item a {
  color: #e6edf3;
}

/* Breadcrumbs */
.breadcrumb-nav-list-item {
  color: #8b949e;
}

/* Lists */
ul, ol {
  color: #e6edf3;
}

/* Blockquotes */
blockquote {
  border-left: 4px solid #30363d;
  color: #8b949e;
  background-color: #161b22;
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
