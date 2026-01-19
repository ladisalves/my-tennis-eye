# Repository Guidelines

## Project Structure & Module Organization
This repository contains:
- `README.md` for the high-level overview.
- `src/` for the Phase 1 web client (`index.html`, `styles.css`, `main.ts`).

If you add source code, tests, or assets, keep them in clear, conventional locations (for example: `src/` for application code, `tests/` or `__tests__/` for tests, and `assets/` for static files). Update this document as the structure evolves so contributors can navigate it quickly.

## Build, Test, and Development Commands
No build, run, or test commands are defined yet. When you add tooling, document the exact commands and purpose. Example format:
- `npm run dev` — start the local development server.
- `npm test` — run the test suite.
- `make build` — produce a production build.

## Coding Style & Naming Conventions
No formatting or linting rules are defined yet. If you introduce a formatter or linter (for example, `prettier`, `ruff`, or `black`), document the command and configuration file. Keep names consistent and descriptive:
- Directories: `kebab-case` (e.g., `data-models/`)
- Files: match the language conventions (e.g., `snake_case.py`, `camelCase.ts`)
- Tests: include the component or module name (e.g., `player_tracker.test.ts`)

## Testing Guidelines
There is no test framework configured yet. When tests are added, specify:
- The framework and how to run tests (e.g., `pytest`, `jest`).
- Naming conventions for test files.
- Any minimum coverage requirements.

## Commit & Pull Request Guidelines
No commit message conventions are established in the repository history. Until guidelines are added, use short, descriptive messages (e.g., `add shot detection prototype`). For pull requests:
- Include a clear description of the change.
- Link related issues or tickets if applicable.
- Add screenshots or logs for UI/visual changes.

## Configuration & Secrets
Do not commit secrets. If configuration files or environment variables are introduced, document required keys and provide example templates (e.g., `.env.example`).
