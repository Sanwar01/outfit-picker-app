# Mobile code quality and architecture

Source of truth for the Expo/React Native app in `mobile/`. Follow this when adding or changing mobile UI. Visual behavior stays the same unless the task is a redesign.

## Folder map

```
mobile/
  app/                         # Expo Router only — thin re-exports
  components/
    atoms/                     # Domain-agnostic primitives
    molecules/                 # Small composites, still domain-agnostic
    organisms/                 # Larger generic chrome
  features/
    <name>/
      screens/                 # Full screens composed of sections
      sections/                # Domain-aware pieces of a screen
  lib/                         # Auth, queries, API clients, theme
```

Shared UI is imported from barrels:

```ts
import { Button, Box } from "@/components/atoms";
import { TextField, Chip } from "@/components/molecules";
import { Sheet } from "@/components/organisms";
```

Feature screens are imported from the feature, never the other way around:

```ts
import { WardrobeListScreen } from "@/features/wardrobe/screens/wardrobe-list-screen";
```

Existing `"@/*": ["./*"]` in `mobile/tsconfig.json` covers these paths. Do not add a new alias prefix unless a collision appears.

## Layer responsibilities

### Atoms (`mobile/components/atoms`)

Domain-agnostic primitives. Examples: `Box`, `Text`, `Button`, `Screen`, `ScreenTitle`, `ScreenSubtitle`, `CachedImage`, `HangerLogo`, `BrandMark`.

Must not:

- Call APIs or hooks that fetch data
- Import feature types (`ClothingItem`, drafts, outfits)
- Import molecules, organisms, or features

### Molecules (`mobile/components/molecules`)

Small composites built from atoms. Examples: `TextField`, `Chip`, `Checkbox`, `Divider`, `SearchBar`, `EmptyState`, `Banner`, `FooterLink`, `ComingSoonBadge`, `MenuRow`, `PaginationDots`.

Must not:

- Know wardrobe/outfit/auth domain models
- Fetch data
- Import features or organisms

### Organisms (`mobile/components/organisms`)

Larger generic chrome built from atoms and molecules. Examples: `Sheet`, `CitySearchField`, `StyleChips`.

Must not:

- Know feature domain models
- Import features

Auth-specific heroes, wardrobe cards, and similar stay in `features/<name>/sections`.

### Feature sections (`mobile/features/<name>/sections`)

Know domain models. Compose atoms, molecules, and organisms. May use `mobile/lib` and `@shared`.

Must not:

- Import another feature
- Deep-import another component’s internals (`button.tsx`, `button.styles.ts`)

### Feature screens (`mobile/features/<name>/screens`)

Wiring only: hooks, navigation, composing sections. Target 80–120 lines. Extract a section when a screen grows past that.

Must not:

- Import another feature
- Own large StyleSheets — those live with the section that needs them

### Expo Router (`mobile/app`)

File-based routes and layouts only. Screen files re-export:

```ts
export { WardrobeListScreen as default } from "@/features/wardrobe/screens/wardrobe-list-screen";
```

Layouts (`_layout.tsx`) stay in `app/`.

## Component folder contract

Every shared component and every feature section/screen that has styles uses this shape:

```
button/
  button.tsx
  button.styles.ts
  index.ts
```

- kebab-case folder names
- PascalCase named exports (`Button`, not `default` except Expo Router re-exports)
- Relative imports inside the folder: `import { styles } from "./button.styles"`
- Barrel `index.ts` re-exports the public API
- Layer barrel (`atoms/index.ts`) re-exports each component’s public API

Outside the folder, import from the layer or feature barrel — not from `button.tsx` or `button.styles.ts`.

Screens and sections follow the same contract when they have styles:

```
wardrobe-list-screen/
  wardrobe-list-screen.tsx
  wardrobe-list-screen.styles.ts
  index.ts
```

A screen with no local styles may be a single `wardrobe-list-screen.tsx` plus `index.ts`.

## Import rules

1. Prefer `@/components/atoms`, `@/components/molecules`, `@/components/organisms`.
2. Prefer `@/features/<name>/screens/<screen>` and `@/features/<name>/sections/<section>`.
3. Data and infra: `@/lib/...` and `@shared/...`.
4. Features do not import other features. Lift shared UI into atoms/molecules/organisms instead.
5. Do not import from `@/components/ui/primitives` or the old `@/components/{auth,wardrobe,today,outfits,profile,welcome}` folders — those are gone.

## Styling

- `StyleSheet.create` in the sibling `*.styles.ts` file
- Tokens from `@/lib/theme` (`colors`, `spacing`, `radius`, `fonts`)
- No new styling system (no NativeWind, no theme provider swap)
- No `StyleSheet` in the component file unless the file is a one-off with fewer than ~10 style keys *and* it is not a shared component — shared components always split styles

## TypeScript and exports

- `strict: true` stays on
- Named exports for components
- No `any`
- Props types live next to the component (same file, or `button.types.ts` if they grow large)
- Prefer explicit prop types over inferring from a giant inline object

## Data and hooks

- Stay in `mobile/lib` (queries, supabase, API clients, auth context) and `@shared`
- Do not colocate API clients inside features unless a later pass explicitly moves them
- Screens subscribe to hooks; atoms/molecules do not

## File-size targets

| Kind | Target | Split when |
| --- | --- | --- |
| Atom / molecule | ~80 lines of component logic | It starts encoding domain rules |
| Organism | ~120 lines | It needs a feature-specific variant |
| Feature section | ~150 lines | It mixes two visual jobs |
| Feature screen | 80–120 lines | Pull a section out |

Line counts are guidance, not a linter. Repeated UI and mixed concerns are the real signal.

## How to add a new atom vs a feature section

Add an **atom** when the piece is reusable with no domain types (a layout box, a button variant, a text style).

Add a **molecule** when two atoms are always used together and still have no domain types (a labeled input, a chip).

Add a **feature section** when the piece knows a domain model (`ClothingItem`, draft ID, occasion) or copy specific to one flow.

If a pattern appears in two features (chip rows, empty states, text fields), extract the generic part to molecules and keep the domain mapping in each feature section.

## Migrated features

Auth, wardrobe, welcome, onboarding, today, outfits, and profile live under `mobile/features/<name>/`. Expo Router files in `mobile/app/` are default re-exports. When adding a new flow, follow the same pattern: sections + screens in a feature, thin route files, no cross-feature imports.

## Do not

- Relocate `mobile/lib` as part of a UI refactor
- Import one feature from another
- Put business logic in atoms
- Redesign while restructuring
- Deep-import component internals from outside the folder
