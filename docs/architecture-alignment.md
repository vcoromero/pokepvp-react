# Architecture alignment — PokePVP (stub)

**Canonical documentation lives in the Obsidian vault:**

`/home/victorr/Documents/dev/dev-notes/Projects/PokePVP Front/04 - Architecture alignment.md`

**Summary:** How the frontend stays aligned with Clean Code, SOLID, and hexagonal (ports & adapters) layering: ESLint-enforced dependency rules, single composition root (`app/services-context.tsx`), connection flow via `ConnectionService` / `RealtimeGateway`, URL normalization, and store sync through ports rather than features touching infrastructure directly.

For the project index in the vault, see `00 - PokePVP Front project.md` in the same folder.
