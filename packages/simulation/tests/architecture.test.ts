import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

function getFilesRecursively(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(filePath));
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      results.push(filePath);
    }
  });
  return results;
}

describe("Fitness d'Architecture — Simulation headless", () => {
  it("ne doit importer ni React, ni Three.js, ni utiliser d'API DOM dans la simulation", () => {
    const srcDir = path.resolve(__dirname, '../src');
    const files = getFilesRecursively(srcDir);

    expect(files.length).toBeGreaterThan(0);

    const forbiddenImports = [
      'react',
      'react-dom',
      'three',
      '@react-three/fiber',
      '@react-three/drei'
    ];
    const forbiddenDOMGlobals = [
      'window',
      'document',
      'navigator',
      'localStorage',
      'sessionStorage',
      'requestAnimationFrame',
      'cancelAnimationFrame',
      'HTMLElement',
      'HTMLCanvasElement'
    ];

    files.forEach((file) => {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('/*')) {
          return;
        }

        forbiddenImports.forEach((forbidden) => {
          const escaped = forbidden.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const importRegex = new RegExp(
            `(?:from\\s+|import\\s+|import\\s*\\(|require\\s*\\()\\s*['"]${escaped}(?:/[^'"]*)?['"]`,
            'i'
          );
          if (importRegex.test(line)) {
            throw new Error(
              `Violation d'architecture dans ${path.relative(srcDir, file)}:L${index + 1}. Import de "${forbidden}" interdit dans packages/simulation.`
            );
          }
        });

        forbiddenDOMGlobals.forEach((globalName) => {
          const globalRegex = new RegExp(`\\b${globalName}\\b`);
          if (globalRegex.test(line)) {
            const codePart = line.split('//')[0];
            if (globalRegex.test(codePart)) {
              throw new Error(
                `Violation d'architecture dans ${path.relative(srcDir, file)}:L${index + 1}. Utilisation de l'API DOM "${globalName}" interdite dans packages/simulation.`
              );
            }
          }
        });
      });
    });
  });
});
