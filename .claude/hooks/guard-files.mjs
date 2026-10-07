#!/usr/bin/env node
// PreToolUse (Edit|Write): block edits that break project rules (see CLAUDE.md).
// Exit code 2 blocks the tool call and shows stderr to Claude.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
const filePath = input.tool_input?.file_path;
if (!filePath) process.exit(0);

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const rel = path.relative(root, path.resolve(root, filePath)).split(path.sep).join('/');

function block(msg) {
  process.stderr.write(`Blocked by .claude/hooks/guard-files.mjs: ${msg}\n`);
  process.exit(2);
}

if (rel === 'src/lib/database.types.ts') {
  block('database.types.ts is generated. Run `pnpm db:types` instead of editing it.');
}

const base = path.basename(rel);
if (/^\.env(\..+)?$/.test(base) && base !== '.env.example') {
  block(`${rel} may hold secrets. Edit .env.example and ask the user to set real values.`);
}

// Migrations already committed to git are treated as applied: add a new migration instead.
if (rel.startsWith('supabase/migrations/')) {
  try {
    execFileSync('git', ['ls-files', '--error-unmatch', rel], { cwd: root, stdio: 'ignore' });
    block(`${rel} is already committed. Never edit an applied migration; run \`supabase migration new <name>\`.`);
  } catch {
    // Not tracked: a new migration in progress, allowed.
  }
}

process.exit(0);
