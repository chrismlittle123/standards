import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
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

  const frontmatter: Record<string, unknown> = {};
  for (const line of yamlContent.split('\n')) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    let value: unknown = line.slice(colonIndex + 1).trim();

    if (typeof value === 'string' && value.startsWith('[')) {
      value = value.slice(1, -1).split(',').map(s => s.trim());
    } else if (typeof value === 'string' && /^\d+$/.test(value)) {
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

function generateRulesetMarkdown(filename: string, config: RulesetConfig): string {
  const rulesetId = filename.replace('.toml', '');
  const title = toTitleCase(rulesetId);

  const lines: string[] = [
    `# ${title}`,
    '',
    '<!-- AUTO-GENERATED — DO NOT EDIT -->',
    '<!-- Run "pnpm generate" to update -->',
    '',
  ];

  function processSection(obj: Record<string, unknown>, depth: number = 2): void {
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
            processSection(value as Record<string, unknown>, depth + 1);
          }
        }
      }
    }
  }

  processSection(config as Record<string, unknown>);

  return lines.join('\n');
}

// =============================================================================
// Site Generation (MkDocs Material)
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

  return guidelines.sort((a, b) => a.frontmatter.priority - b.frontmatter.priority);
}

function generateGuidelineForSite(guideline: Guideline): string {
  // MkDocs doesn't need frontmatter, just the content with a title
  return guideline.content;
}

function generateSiteIndex(guidelines: Guideline[], rulesetIds: string[]): string {
  const lines: string[] = [
    '# Palindrom Standards',
    '',
    'Composable coding standards and guidelines for Palindrom projects.',
    '',
    '## Quick Links',
    '',
    '- [Guidelines](guidelines/index.md) - Architectural and implementation standards',
    '- [Rulesets](rulesets/index.md) - Linting and tooling configurations',
    '',
    '## Guidelines Overview',
    '',
    '| Guideline | Category | Tags |',
    '|-----------|----------|------|',
  ];

  for (const g of guidelines) {
    const tags = Array.isArray(g.frontmatter.tags) ? g.frontmatter.tags.join(', ') : g.frontmatter.tags;
    lines.push(`| [${g.frontmatter.title}](guidelines/${g.frontmatter.id}.md) | ${g.frontmatter.category} | ${tags} |`);
  }

  lines.push('');
  lines.push('## Rulesets Overview');
  lines.push('');
  lines.push('| Ruleset | Language | Tier |');
  lines.push('|---------|----------|------|');

  for (const id of rulesetIds.sort()) {
    const [lang, tier] = id.split('-');
    lines.push(`| [${toTitleCase(id)}](rulesets/${id}.md) | ${toTitleCase(lang)} | ${toTitleCase(tier)} |`);
  }

  return lines.join('\n');
}

function generateGuidelinesIndex(guidelines: Guideline[]): string {
  const lines: string[] = [
    '# Guidelines',
    '',
    'Architectural and implementation standards for Palindrom projects.',
    '',
  ];

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
      lines.push(`- [${g.frontmatter.title}](${g.frontmatter.id}.md)`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

function generateRulesetsIndex(rulesetIds: string[]): string {
  const lines: string[] = [
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
    lines.push(`- [${toTitleCase(id)}](${id}.md)`);
  }

  lines.push('');
  lines.push('## Python');
  lines.push('');

  for (const id of rulesetIds.filter(r => r.startsWith('python')).sort()) {
    lines.push(`- [${toTitleCase(id)}](${id}.md)`);
  }

  return lines.join('\n');
}

function generateMkDocsConfig(guidelines: Guideline[], rulesetIds: string[]): string {
  const guidelineNav = guidelines.map(g => `        - "${g.frontmatter.title}": guidelines/${g.frontmatter.id}.md`).join('\n');

  const tsRulesets = rulesetIds.filter(r => r.startsWith('typescript')).sort()
    .map(id => `        - "${toTitleCase(id)}": rulesets/${id}.md`).join('\n');

  const pyRulesets = rulesetIds.filter(r => r.startsWith('python')).sort()
    .map(id => `        - "${toTitleCase(id)}": rulesets/${id}.md`).join('\n');

  return `site_name: Palindrom Standards
site_url: https://palindrom-ai.github.io/standards/
site_description: Composable coding standards and guidelines for Palindrom projects

repo_name: palindrom-ai/standards
repo_url: https://github.com/palindrom-ai/standards

theme:
  name: material
  palette:
    - scheme: slate
      primary: indigo
      accent: blue
      toggle:
        icon: material/brightness-4
        name: Switch to light mode
    - scheme: default
      primary: indigo
      accent: blue
      toggle:
        icon: material/brightness-7
        name: Switch to dark mode
  features:
    - navigation.instant
    - navigation.tracking
    - navigation.sections
    - navigation.expand
    - navigation.top
    - search.suggest
    - search.highlight
    - content.code.copy

markdown_extensions:
  - pymdownx.highlight:
      anchor_linenums: true
  - pymdownx.superfences
  - pymdownx.tabbed:
      alternate_style: true
  - tables
  - admonition
  - pymdownx.details

nav:
  - Home: index.md
  - Guidelines:
      - guidelines/index.md
${guidelineNav}
  - Rulesets:
      - rulesets/index.md
${tsRulesets}
${pyRulesets}
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
const docsDir = join(siteDir, 'docs');

async function main() {
  // Generate raw rulesets (for programmatic use)
  const rulesetFiles = (await readdir(rulesetsDir)).filter(f => f.endsWith('.toml'));
  const rulesetIds: string[] = [];

  await mkdir(join(outputDir, 'rulesets'), { recursive: true });

  for (const file of rulesetFiles) {
    const ruleset = await loadRuleset(join(rulesetsDir, file));
    const rulesetId = file.replace('.toml', '');
    rulesetIds.push(rulesetId);

    const markdown = generateRulesetMarkdown(file, ruleset);
    await writeFile(join(outputDir, 'rulesets', `${rulesetId}.md`), markdown);
    console.log(`Generated ruleset: ${rulesetId}.md`);
  }

  // Generate MkDocs site
  console.log('\nGenerating MkDocs site...');

  await mkdir(join(docsDir, 'guidelines'), { recursive: true });
  await mkdir(join(docsDir, 'rulesets'), { recursive: true });

  // Load and process guidelines
  const guidelines = await loadGuidelines(guidelinesDir);

  for (const guideline of guidelines) {
    const siteContent = generateGuidelineForSite(guideline);
    await writeFile(join(docsDir, 'guidelines', `${guideline.frontmatter.id}.md`), siteContent);
    console.log(`Generated guideline: ${guideline.frontmatter.id}.md`);
  }

  // Generate rulesets for site
  for (const file of rulesetFiles) {
    const ruleset = await loadRuleset(join(rulesetsDir, file));
    const rulesetId = file.replace('.toml', '');

    const markdown = generateRulesetMarkdown(file, ruleset);
    await writeFile(join(docsDir, 'rulesets', `${rulesetId}.md`), markdown);
    console.log(`Generated ruleset page: ${rulesetId}.md`);
  }

  // Generate index pages
  await writeFile(join(docsDir, 'index.md'), generateSiteIndex(guidelines, rulesetIds));
  console.log('Generated: index.md');

  await writeFile(join(docsDir, 'guidelines', 'index.md'), generateGuidelinesIndex(guidelines));
  console.log('Generated: guidelines/index.md');

  await writeFile(join(docsDir, 'rulesets', 'index.md'), generateRulesetsIndex(rulesetIds));
  console.log('Generated: rulesets/index.md');

  // Generate MkDocs config
  await writeFile(join(siteDir, 'mkdocs.yml'), generateMkDocsConfig(guidelines, rulesetIds));
  console.log('Generated: mkdocs.yml');

  console.log(`\nMkDocs site generated at: ${siteDir}/`);
  console.log('To preview locally: cd generated/site && mkdocs serve');
}

main().catch(console.error);
