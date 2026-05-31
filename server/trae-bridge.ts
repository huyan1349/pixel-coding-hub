import fs from 'fs';
import path from 'path';
import { exec, type ExecException } from 'child_process';

const GENERATED_DIR = path.resolve(process.cwd(), 'src/components/generated');

export function ensureGeneratedDir(): void {
  if (!fs.existsSync(GENERATED_DIR)) {
    fs.mkdirSync(GENERATED_DIR, { recursive: true });
  }
}

export function writeGeneratedFile(filename: string, content: string): string {
  ensureGeneratedDir();
  const filePath = path.join(GENERATED_DIR, filename);
  fs.writeFileSync(filePath, content, 'utf-8');
  return filePath;
}

export function tryOpenEditor(
  dir: string,
): Promise<{ launched: boolean; editor: string; error?: string }> {
  const editors = ['trae', 'code', 'cursor'];

  return new Promise((resolve) => {
    const tryNext = (index: number) => {
      if (index >= editors.length) {
        resolve({ launched: false, editor: 'none', error: 'No editor found' });
        return;
      }

      const editor = editors[index];
      exec(`${editor} "${dir}"`, (error: ExecException | null) => {
        if (error) {
          tryNext(index + 1);
        } else {
          resolve({ launched: true, editor });
        }
      });
    };

    tryNext(0);
  });
}

export function cleanupGeneratedFiles(): void {
  if (fs.existsSync(GENERATED_DIR)) {
    const files = fs.readdirSync(GENERATED_DIR);
    for (const file of files) {
      fs.unlinkSync(path.join(GENERATED_DIR, file));
    }
    fs.rmdirSync(GENERATED_DIR);
  }
}
