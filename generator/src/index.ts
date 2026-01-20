import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { parse as parseToml } from '@iarna/toml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// =============================================================================
// Types
// =============================================================================

interface Guideline {
  id: string;
  title: string;
  category: string;
  priority: number;
  content: string;
}

interface Profile {
  profile: {
    name: string;
    description: string;
  };
  includes?: {
    guidelines?: string[];
  };
  context?: {
    preamble?: string;
    postamble?: string;
  };
  content?: {
    markdown?: string;
  };
}

// =============================================================================
// Profile Generation
// =============================================================================

async function loadGuidelines(dir: string): Promise<Map<string, Guideline>> {
  const guidelines = new Map<string, Guideline>();

  let files: string[];
  try {
    files = await readdir(dir);
  } catch {
    console.warn(`Guidelines directory not found: ${dir}`);
    return guidelines;
  }

  for (const file of files) {
    if (!file.endsWith('.md')) continue;

    const content = await readFile(join(dir, file), 'utf-8');
    const { data, content: body } = matter(content);

    if (!data.id) {
      console.warn(`Skipping ${file}: missing 'id' in frontmatter`);
      continue;
    }

    guidelines.set(data.id, {
      id: data.id,
      title: data.title ?? data.id,
      category: data.category ?? 'general',
      priority: data.priority ?? 99,
      content: body.trim(),
    });
  }

  return guidelines;
}

async function loadProfile(path: string): Promise<Profile> {
  const content = await readFile(path, 'utf-8');
  return parseToml(content) as unknown as Profile;
}

function composeProfile(
  profile: Profile,
  guidelines: Map<string, Guideline>
): string {
  const parts: string[] = [];

  // Add preamble if present
  const preamble = profile.context?.preamble?.trim();
  if (preamble) {
    parts.push(preamble);
  }

  // Add custom markdown content if present
  const customMarkdown = profile.content?.markdown?.trim();
  if (customMarkdown) {
    if (parts.length > 0) parts.push('---');
    parts.push(customMarkdown);
  }

  // Add guidelines if present
  const guidelineIds = profile.includes?.guidelines ?? [];
  if (guidelineIds.length > 0) {
    const included = guidelineIds
      .map((id) => {
        const guideline = guidelines.get(id);
        if (!guideline) {
          console.warn(`Warning: guideline '${id}' not found`);
        }
        return guideline;
      })
      .filter((g): g is Guideline => g !== undefined)
      .sort((a, b) => a.priority - b.priority);

    if (included.length > 0) {
      if (parts.length > 0) parts.push('---');
      parts.push(included.map((g) => g.content).join('\n\n---\n\n'));
    }
  }

  // Add postamble if present
  const postamble = profile.context?.postamble?.trim();
  if (postamble) {
    if (parts.length > 0) parts.push('---');
    parts.push(postamble);
  }

  return parts.join('\n\n').trim();
}

function generateProfileMarkdown(profile: Profile, content: string): string {
  return `<!-- AUTO-GENERATED — DO NOT EDIT -->
<!-- Profile: ${profile.profile.name} -->
<!-- Run "pnpm generate:profiles" to update -->

# ${profile.profile.name}

${profile.profile.description}

---

${content}
`;
}

async function generateProfiles(
  guidelinesDir: string,
  profilesDir: string,
  outputDir: string
): Promise<void> {
  console.log('Loading guidelines...');
  const guidelines = await loadGuidelines(guidelinesDir);
  console.log(`Loaded ${guidelines.size} guidelines`);

  let profileFiles: string[];
  try {
    profileFiles = await readdir(profilesDir);
  } catch {
    console.error(`Profiles directory not found: ${profilesDir}`);
    process.exit(1);
  }

  const tomlFiles = profileFiles.filter((f) => f.endsWith('.toml'));
  if (tomlFiles.length === 0) {
    console.warn('No profile files found');
    return;
  }

  const outDir = join(outputDir, 'profiles');
  await mkdir(outDir, { recursive: true });

  for (const file of tomlFiles) {
    const profile = await loadProfile(join(profilesDir, file));
    const profileId = file.replace('.toml', '');

    const content = composeProfile(profile, guidelines);
    const markdown = generateProfileMarkdown(profile, content);

    await writeFile(join(outDir, `${profileId}.md`), markdown);
    console.log(`Generated profile: ${profileId}.md`);
  }
}

// =============================================================================
// Ruleset Generation
// =============================================================================

interface RulesetConfig {
  [key: string]: unknown;
}

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

  // Extract comment from first line if present
  const firstKey = Object.keys(config)[0];
  if (firstKey && typeof config[firstKey] === 'string' && !firstKey.includes('.')) {
    // Skip, it's probably a title comment handled by TOML parser
  }

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
const guidelinesDir = join(repoRoot, 'guidelines');
const profilesDir = join(repoRoot, 'profiles');
const rulesetsDir = join(repoRoot, 'rulesets');
const outputDir = join(repoRoot, 'dist');

const command = process.argv[2];

async function main() {
  switch (command) {
    case 'profiles':
      await generateProfiles(guidelinesDir, profilesDir, outputDir);
      console.log(`\nProfiles written to: ${outputDir}/profiles/`);
      break;

    case 'rulesets':
      await generateRulesets(rulesetsDir, outputDir);
      console.log(`\nRulesets written to: ${outputDir}/rulesets/`);
      break;

    default:
      // Run both
      await generateProfiles(guidelinesDir, profilesDir, outputDir);
      console.log(`\nProfiles written to: ${outputDir}/profiles/`);
      await generateRulesets(rulesetsDir, outputDir);
      console.log(`Rulesets written to: ${outputDir}/rulesets/`);
      break;
  }
}

main().catch(console.error);
