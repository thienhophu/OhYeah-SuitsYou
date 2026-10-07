#!/usr/bin/env bash
# SessionStart: in Claude Code cloud sessions, install deps so lint/typecheck/tests work.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}"

if [ -f package.json ]; then
  pnpm install --frozen-lockfile 2>/dev/null || pnpm install
fi
