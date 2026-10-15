import {
  collectNoBschekerPolicyFiles,
  exclusionPolicyContent,
  type PolicySourceFile,
} from './noBschekerGuard';

export const collectNoDpiCheckerPolicyFiles = collectNoBschekerPolicyFiles;

export function findNoDpiCheckerPolicyViolations(files: ReadonlyArray<PolicySourceFile>) {
  return files
    .filter((file) =>
      /dpichecker|dpi\s*\/\/\s*checker/iu.test(`${file.path}\n${exclusionPolicyContent(file)}`),
    )
    .map(({ path }) => ({ path, marker: 'dpichecker' as const }));
}
