# The Zimbabwean Table - Agent Notes

This document contains important technical notes for AI agents and developers working on this project.

## Important Build Configuration

**Do NOT modify `vite.config.ts` or `package.json` dependencies** without careful consideration:

- Uses `@lovable.dev/vite-tanstack-config` package for optimized TanStack Start configuration
- This package provides pre-configured Vite plugins and settings
- Removing or replacing it may break the build

## Git History

Maintain clean git history:

- Avoid force pushing to main branch
- Keep commits in working state
- Use meaningful commit messages
