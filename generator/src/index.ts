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
    // Object with properties like { severity: "error", max: 4 }
    const entries = Object.entries(value)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
    return `{ ${entries} }`;
  }
  return String(value);
}

function generateRulesetMarkdown(filename: string, config: RulesetConfig): string {
  const lines: string[] = [
    '<!-- AUTO-GENERATED — DO NOT EDIT -->',
    `<!-- Ruleset: ${filename} -->`,
    '<!-- Run "pnpm generate:rulesets" to update -->',
    '',
    `# ${filename.replace('.toml', '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`,
    '',
  ];

  // Process sections
  function processSection(obj: Record<string, unknown>, prefix: string = '', depth: number = 2): void {
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) continue;

      if (typeof value === 'object' && !Array.isArray(value)) {
        const heading = '#'.repeat(Math.min(depth, 4));
        const title = key.split('.').pop() || key;
        const formattedTitle = title
          .split(/[-_]/)
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');

        lines.push(`${heading} ${formattedTitle}`);
        lines.push('');

        // Check if this is a rules object (values are rule configs)
        const isRulesSection = key.includes('rules') || key.endsWith('.rules');

        if (isRulesSection) {
          lines.push('| Rule | Config |');
          lines.push('|------|--------|');
          for (const [ruleName, ruleConfig] of Object.entries(value as Record<string, unknown>)) {
            lines.push(`| \`${ruleName}\` | ${formatValue(ruleConfig)} |`);
          }
          lines.push('');
        } else if (key.includes('require') || key.endsWith('.require')) {
          // TSC require section - table format
          lines.push('| Option | Value |');
          lines.push('|--------|-------|');
          for (const [optName, optValue] of Object.entries(value as Record<string, unknown>)) {
            lines.push(`| \`${optName}\` | ${formatValue(optValue)} |`);
          }
          lines.push('');
        } else {
          // Check for simple key-value pairs
          const entries = Object.entries(value as Record<string, unknown>);
          const hasNestedObjects = entries.some(([, v]) => typeof v === 'object' && !Array.isArray(v));

          if (!hasNestedObjects && entries.length > 0) {
            // Simple section with key-value pairs
            for (const [k, v] of entries) {
              lines.push(`- **${k}**: ${formatValue(v)}`);
            }
            lines.push('');
          } else {
            // Recurse into nested objects
            processSection(value as Record<string, unknown>, key, depth + 1);
          }
        }
      }
    }
  }

  processSection(config as Record<string, unknown>);

  return lines.join('\n');
}

async function generateRulesets(
  rulesetsDir: string,
  outputDir: string
): Promise<void> {
  let rulesetFiles: string[];
  try {
    rulesetFiles = await readdir(rulesetsDir);
  } catch {
    console.error(`Rulesets directory not found: ${rulesetsDir}`);
    return;
  }

  const tomlFiles = rulesetFiles.filter((f) => f.endsWith('.toml'));
  if (tomlFiles.length === 0) {
    console.warn('No ruleset files found');
    return;
  }

  const outDir = join(outputDir, 'rulesets');
  await mkdir(outDir, { recursive: true });

  for (const file of tomlFiles) {
    const ruleset = await loadRuleset(join(rulesetsDir, file));
    const rulesetId = file.replace('.toml', '');

    const markdown = generateRulesetMarkdown(file, ruleset);

    await writeFile(join(outDir, `${rulesetId}.md`), markdown);
    console.log(`Generated ruleset: ${rulesetId}.md`);
  }
}

// =============================================================================
// CLI
// =============================================================================

const repoRoot = join(__dirname, '..', '..');
const rulesetsDir = join(repoRoot, 'rulesets');
const outputDir = join(repoRoot, 'generated');

async function main() {
  await generateRulesets(rulesetsDir, outputDir);
  console.log(`\nRulesets written to: ${outputDir}/rulesets/`);
}

main().catch(console.error);
