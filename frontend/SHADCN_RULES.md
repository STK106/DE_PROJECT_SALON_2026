# Shadcn UI Rules for This Frontend

This project must use shadcn components for UI building blocks.

## Source of truth

- Core UI components live in `src/components/ui`.
- Shared composed blocks can live in `src/components/common` and `src/components/layout`, but they should be built from `src/components/ui` primitives.

## Allowed and not allowed

- Allowed: `@/components/ui/*` imports in pages and feature components.
- Allowed: direct `@radix-ui/*` imports only inside `src/components/ui` wrappers.
- Not allowed: adding another UI library (MUI, Ant Design, Chakra, Bootstrap, Mantine, PrimeReact, etc.).
- Not allowed: parent-relative imports like `../../components/...`; use `@/` aliases.

## Add new shadcn components

Run from `frontend`:

```bash
npx shadcn@latest add button card input select dialog tabs table textarea badge avatar
```

Or add one component:

```bash
npx shadcn@latest add sheet
```

Generated files will be placed in `src/components/ui` according to `components.json`.

## Validation

Run lint before commit:

```bash
npm run lint
```

Auto-fix what can be fixed:

```bash
npm run lint:fix
```
