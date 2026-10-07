#!/usr/bin/env node
// PostToolUse (Edit|Write): run Prettier on the edited file once the project has it installed.
// Never fails the tool call.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

try {
  const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
  const filePath = input.tool_input?.file_path;
  const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const prettier = path.join(root, 'node_modules', '.bin', 'prettier');
  if (filePath && existsSync(prettier) && /\.(tsx?|jsx?|mjs|cjs|json|css|md|ya?ml|html)$/.test(filePath)) {
    execFileSync(prettier, ['--write', '--ignore-unknown', '--log-level', 'silent', filePath], {
      cwd: root,
      stdio: 'ignore',
      timeout: 20000,
    });
  }
} catch {
  // Formatting is best effort.
}
process.exit(0);
