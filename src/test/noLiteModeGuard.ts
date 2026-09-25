import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

export interface LiteModePolicySourceFile {
  path: string;
  content: string;
}

export interface LiteModePolicyViolation {
  path: string;
  marker: 'contract' | 'screen' | 'component' | 'utility';
}

const FORBIDDEN_MARKERS: ReadonlyArray<{
  marker: LiteModePolicyViolation['marker'];
  pattern: RegExp;
}> = [
  {
    marker: 'contract',
    pattern:
      /cabinet-lite-mode|branding\/lite-mode|(?:get|update)LiteModeEnabled|useLiteMode|LITE_MODE|\bliteMode\b/iu,
  },
  {
    marker: 'screen',
    pattern:
      /\b(?:HomeScreen|DashboardLite|SubscriptionScreen|SubscriptionLite|TariffPickerLite)\b/iu,
  },
  {
    marker: 'component',
    pattern: /(?:^|[/\\])components[/\\]lite(?:[/\\]|$)|LiteMeter|LitePromoSlot|LiteRow/iu,
  },
  { marker: 'utility', pattern: /liteDate|liteMeter|liteStatus/iu },
];

const POLICY_FILES = new Set(['src/noLiteMode.guard.test.ts', 'src/test/noLiteModeGuard.ts']);
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

function collectDirectory(
  projectRoot: string,
  directory: string,
  out: LiteModePolicySourceFile[],
): void {
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
    if (!TEXT_EXTENSIONS.has(extname(entry.name).toLowerCase())) continue;
    out.push({ path: projectPath, content: readFileSync(absolutePath, 'utf8') });
  }
}

export function collectNoLiteModePolicyFiles(projectRoot: string): LiteModePolicySourceFile[] {
  const files: LiteModePolicySourceFile[] = [];
  for (const directory of SCANNED_DIRECTORIES) collectDirectory(projectRoot, directory, files);
  for (const projectPath of SCANNED_ROOT_FILES) {
    const absolutePath = join(projectRoot, projectPath);
    if (existsSync(absolutePath)) {
      files.push({ path: projectPath, content: readFileSync(absolutePath, 'utf8') });
    }
  }
  return files;
}

export function findNoLiteModePolicyViolations(
  files: ReadonlyArray<LiteModePolicySourceFile>,
): LiteModePolicyViolation[] {
  return files.flatMap((file) => {
    const searchable = `${file.path}\n${file.content}`;
    return FORBIDDEN_MARKERS.filter(({ pattern }) => pattern.test(searchable)).map(
      ({ marker }) => ({
        path: file.path,
        marker,
      }),
    );
  });
}
