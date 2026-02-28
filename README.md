# Context Forge

10 questions → project scaffold → export anywhere.

Answer 10 focused questions about your project. Get 10 production-ready config files (soul.md, claude.md, package.json, types.ts, etc.) that any AI coding agent can read.

## Stack
React 19 + Vite 6. Zero backend. Client-side only.

## Integrations (user connects their own)
- **Airtable** — push scaffolds to a base
- **Google Sheets** — append rows
- **Clipboard** — copy all files
- **Download** — save as bundle

## Deploy

```bash
npm install
npm run build
npx vercel --yes  # creates new project automatically
```

## Dev

```bash
npm install
npm run dev
```

Built with Context Forge.
