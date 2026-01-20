import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { parse as parseToml } from '@iarna/toml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
  includes: {
    guidelines: string[];
  };
  context?: {
    preamble?: string;
  };
}

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

function composeGuidelines(
  profile: Profile,
  guidelines: Map<string, Guideline>
): string {
  const included = profile.includes.guidelines
    .map((id) => {
      const guideline = guidelines.get(id);
      if (!guideline) {
        console.warn(`Warning: guideline '${id}' not found`);
      }
      return guideline;
    })
    .filter((g): g is Guideline => g !== undefined)
    .sort((a, b) => a.priority - b.priority);

  const sections = included.map((g) => g.content);

  const preamble = profile.context?.preamble ?? '';

  return [preamble, '', '---', '', sections.join('\n\n---\n\n')]
    .join('\n')
    .trim();
}

function generateClaudeMd(profile: Profile, content: string): string {
  return `<!-- AUTO-GENERATED FROM STANDARDS REPO — DO NOT EDIT -->
<!-- Profile: ${profile.profile.name} -->
<!-- Run "pnpm generate" to update -->

# Guidelines

${content}
`;
}

function generateCursorRules(profile: Profile, content: string): string {
  // Cursor uses the same markdown content
  return `# ${profile.profile.name}

${profile.profile.description}

---

${content}
`;
}

function generateMetadata(profile: Profile, guidelineIds: string[]): object {
  return {
    profile: profile.profile.name,
    description: profile.profile.description,
    guidelines: guidelineIds,
    generatedAt: new Date().toISOString(),
  };
}

async function generate(
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

  for (const file of tomlFiles) {
    const profile = await loadProfile(join(profilesDir, file));
    const profileId = file.replace('.toml', '');
    const outDir = join(outputDir, 'profiles', profileId);

    await mkdir(outDir, { recursive: true });

    const content = composeGuidelines(profile, guidelines);

    await writeFile(join(outDir, 'CLAUDE.md'), generateClaudeMd(profile, content));

    await writeFile(
      join(outDir, '.cursorrules'),
      generateCursorRules(profile, content)
    );

    await writeFile(join(outDir, 'guidelines.md'), content);

    await writeFile(
      join(outDir, 'metadata.json'),
      JSON.stringify(generateMetadata(profile, profile.includes.guidelines), null, 2)
    );

    console.log(`Generated: ${profileId}`);
  }

  console.log(`\nOutput written to: ${outputDir}/profiles/`);
}

// CLI entry - resolve paths relative to repo root
const repoRoot = join(__dirname, '..', '..');
const guidelinesDir = join(repoRoot, 'guidelines');
const profilesDir = join(repoRoot, 'profiles');
const outputDir = join(repoRoot, 'dist');

generate(guidelinesDir, profilesDir, outputDir);
