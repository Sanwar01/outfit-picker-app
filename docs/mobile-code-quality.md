# Mobile code quality and architecture

UI and folder contract for the Expo/React Native app in `mobile/`. Aligns with `.cursor/rules/app-architecture.md`. Visual behavior stays the same unless the task is a redesign.

## Folder map

```
mobile/
  app/                         # Screens (Expo Router) + layouts
  features/
    <name>/
      components/              # Domain-aware UI used by those screens
      hooks/                   # Feature TanStack Query / local hooks (when needed)
      api/                     # Feature API / data access (when needed)
      styles/                  # StyleSheets for that feature's screens
  components/
    atoms/                     # Domain-agnostic primitives
    molecules/                 # Small composites, still domain-agnostic
    organisms/                 # Larger generic chrome
  services/                    # Central API client, supabase, oauth, billing, location
  hooks/                       # Shared hooks (auth, usage)
  theme/                       # Colors, fonts, radius, brand copy
  assets/
```

Do not create empty feature folders (`stores/`, `schemas/`, `api/`) until they contain meaningful code.

Shared UI is imported from barrels:

```ts
import { Button, Box } from "@/components/atoms";
import { TextField, Chip } from "@/components/molecules";
import { Sheet } from "@/components/organisms";
```

Screens live in `app/` and import feature components:

```ts
import { WardrobeGridCard } from "@/features/wardrobe/components/wardrobe-grid-card";
import { styles } from "@/features/wardrobe/styles/list";

export default function WardrobeListScreen() {
  // ...
}
```

`"@/*": ["./*"]` in `mobile/tsconfig.json` covers these paths.

## Layer responsibilities

### Atoms / molecules / organisms (`components`)

Same rules as before: domain-agnostic. Must not fetch data or import features.

Auth heroes, wardrobe cards, and similar stay in `features/<name>/components`.

### Feature components

Know domain models. Compose atoms, molecules, and organisms. May use `services`, feature `api`/`hooks`, and `@shared`.

Must not import another feature or `app/` screens.

### App screens (`app`)

Compose UI, connect hooks, handle navigation, show loading/error. Target 80–120 lines; extract a feature component when a screen grows past that.

Must not contain raw `fetch()`, provider SDK details, or large data transformations — those belong in feature `api` / `hooks` / `services`.

Expo Router treats every file under `app/` as a route, so do not colocate styles, helpers, or components there. Screen styles live in `features/<name>/styles`.

Layouts (`_layout.tsx`) stay in `app/`.

## Component folder contract

```
button/
  button.tsx
  button.styles.ts
  index.ts
```

- kebab-case folder names
- PascalCase named exports (`Button`; Expo Router files default-export)
- Relative imports inside the folder: `import { styles } from "./button.styles"`
- Import from the layer or feature path — not from `button.tsx` or `button.styles.ts`

## Import rules

1. Prefer `@/components/atoms`, `@/components/molecules`, `@/components/organisms`.
2. Prefer `@/features/<name>/components/<component>` for domain UI and `@/features/<name>/styles/<screen>` for that screen's styles.
3. Shared infra: `@/services/...`, `@/hooks/...`, `@/theme`.
4. Domain data: `@/features/<name>/api` and `@/features/<name>/hooks`.
5. Shared domain: `@shared/...`.
6. Features do not import other features. Lift shared UI into atoms/molecules/organisms, shared data into `services`/`hooks`.
7. Feature components do not import `app/` screens.
8. Do not put non-route files in `app/`.

## Styling

- `StyleSheet.create` in the sibling `*.styles.ts` file (feature components) or `features/<name>/styles/<screen>.ts` (app screens)
- Tokens from `@/theme`
- No new styling system
- Shared components always split styles

## Data and hooks

```
Screen → feature hook → TanStack Query → feature API → apiClient / supabase
```

- Server/API state: TanStack Query
- One-screen state: `useState`
- Do not introduce Zustand until genuinely shared client state needs it
- Atoms/molecules do not subscribe to data hooks

## File-size targets

| Kind | Target | Split when |
| --- | --- | --- |
| Atom / molecule | ~80 lines of component logic | It starts encoding domain rules |
| Organism | ~120 lines | It needs a feature-specific variant |
| Feature component | ~150 lines | It mixes two visual jobs |
| App screen | 80–120 lines | Pull a feature component out |

## Do not

- Relocate shared repo `lib/` as part of a mobile UI refactor
- Import one feature from another
- Put business logic in atoms
- Redesign while restructuring
- Deep-import component internals from outside the folder
- Put non-route files in `app/`
