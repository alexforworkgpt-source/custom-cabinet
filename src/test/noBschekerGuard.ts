import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

export interface PolicySourceFile {
  path: string;
  content: string;
}

export interface PolicyViolation {
  path: string;
  marker: 'bschek' | 'reachability' | 'operator-assets';
}

const FORBIDDEN_MARKERS: ReadonlyArray<{
  marker: PolicyViolation['marker'];
  pattern: RegExp;
}> = [
  { marker: 'bschek', pattern: /bschek/iu },
  { marker: 'reachability', pattern: /reachability/iu },
];

const POLICY_FILES = new Set(['src/noBscheker.guard.test.ts', 'src/test/noBschekerGuard.ts']);
const SCANNED_DIRECTORIES = ['src', 'tests', 'public'];
const SCANNED_ROOT_FILES = [
  '.env.example',
  'index.html',
  'package.json',
  'playwright.config.ts',
  'tailwind.config.js',
  'vite.config.ts',
  'vitest.config.ts',
];
const TEXT_EXTENSIONS = new Set([
  '.css',
  '.env',
  '.html',
  '.js',
  '.json',
  '.jsx',
  '.mjs',
  '.svg',
  '.ts',
  '.tsx',
  '.yaml',
  '.yml',
]);

function normalizePath(path: string): string {
  return path.replace(/\\/gu, '/');
}

function collectDirectory(projectRoot: string, directory: string, out: PolicySourceFile[]): void {
  const absoluteDirectory = join(projectRoot, directory);
  if (!existsSync(absoluteDirectory)) return;

  for (const entry of readdirSync(absoluteDirectory, { withFileTypes: true })) {
    const absolutePath = join(absoluteDirectory, entry.name);
    const projectPath = normalizePath(relative(projectRoot, absolutePath));
    if (entry.isDirectory()) {
      collectDirectory(projectRoot, projectPath, out);
      continue;
    }
    if (!entry.isFile() || POLICY_FILES.has(projectPath)) continue;

    const isOperatorAsset = projectPath.toLowerCase().startsWith('src/assets/operators/');
    if (!isOperatorAsset && !TEXT_EXTENSIONS.has(extname(entry.name).toLowerCase())) continue;
    out.push({
      path: projectPath,
      content: isOperatorAsset ? '' : readFileSync(absolutePath, 'utf8'),
    });
  }
}

export function collectNoBschekerPolicyFiles(projectRoot: string): PolicySourceFile[] {
  const files: PolicySourceFile[] = [];
  for (const directory of SCANNED_DIRECTORIES) collectDirectory(projectRoot, directory, files);
  for (const projectPath of SCANNED_ROOT_FILES) {
    const absolutePath = join(projectRoot, projectPath);
    if (existsSync(absolutePath)) {
      files.push({ path: projectPath, content: readFileSync(absolutePath, 'utf8') });
    }
  }
  return files;
}

export function findNoBschekerPolicyViolations(
  files: ReadonlyArray<PolicySourceFile>,
): PolicyViolation[] {
  return files.flatMap((file) => {
    const normalizedPath = normalizePath(file.path).toLowerCase();
    const searchable = `${file.path}\n${file.content}`;
    const violations = FORBIDDEN_MARKERS.filter(({ pattern }) => pattern.test(searchable)).map(
      ({ marker }) => ({ path: file.path, marker }),
    );

    if (normalizedPath.startsWith('src/assets/operators/')) {
      violations.push({ path: file.path, marker: 'operator-assets' });
    }

    return violations;
  });
}
