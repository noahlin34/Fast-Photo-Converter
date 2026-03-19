# AGENTS.md

## Product

Fast Photo Converter is an iOS-first Expo app for painless on-device photo conversion.

The product promise is:

- pick a photo from the library or camera
- choose a target format
- convert it locally on-device
- save it, share it, or revisit it later from history

The app should feel calm, premium, fast, and trustworthy. Competing apps in this category are often ad-heavy, visually noisy, or manipulative. Do not copy that pattern.

## Product Rules

- Keep the experience simple. One obvious next action per screen.
- Prefer native-feeling iOS interactions and restrained motion.
- Preserve the current warm, editorial visual direction unless the user asks for a redesign.
- Avoid fake utility-app patterns: ads, upsells, cluttered dashboards, nagging prompts, fake urgency.
- Keep photo handling on-device unless the user explicitly asks for cloud or backend behavior.
- Treat trust as a feature: clear permission copy, clear storage behavior, clear save/share outcomes.

## Current App Shape

- Expo SDK 55 app using Expo Router and a root `Stack`.
- This is not a tab-layout app. Navigation is a custom floating bottom nav implemented in shared UI.
- Route files in `src/app` are intentionally thin wrappers around screen components in `src/components/converter`.

Current routes:

- `/`: Home upload screen
- `/format`: format + quality selection
- `/processing`: conversion progress screen
- `/done`: post-conversion success screen
- `/history`: persistent local archive list
- `/history/[id]`: archive detail screen
- `/settings`: defaults, history behavior, privacy/support

Current user flow:

1. Pick or capture a photo on Home.
2. Choose output format and quality on Format.
3. Convert locally on Processing.
4. Save/share on Done.
5. Revisit exports through History.

## Architecture Overview

### Providers and app shell

- `src/app/_layout.tsx`
  - installs `expo-sqlite/localStorage/install`
  - wraps the app in `ConverterSettingsProvider` and `ConverterProvider`
  - owns the root stack and navigation theme

### State layers

- `src/features/converter/converter-settings.tsx`
  - persisted settings under `converter.settings.v1`
  - stores:
    - `defaultOutputFormat`
    - `defaultQuality`
    - `keepHistoryEnabled`

- `src/features/converter/converter-context.tsx`
  - transient conversion state
  - current photo, selected format, quality, current export
  - archive access helpers:
    - `history`
    - `getHistoryItem`
    - `deleteHistoryItem`
    - `clearHistory`
    - `startConversionFromHistory`
  - conversion happens here via `expo-image-manipulator`

- `src/features/converter/converter-history-storage.ts`
  - persistent archive metadata under `converter.history.v1`
  - stores managed converted files in app documents under `converter-history/`
  - trims archive to the 50 newest items
  - removes missing/corrupt entries during hydration

### Shared logic

- `src/features/converter/use-export-actions.ts`
  - shared `Save to Photos` and `Share` behavior
  - used by both Done and History detail

- `src/features/converter/converter-utils.ts`
  - types, file naming, size formatting, format labels, history date helpers

### Shared UI

- `src/components/converter/shared.tsx`
  - `ConverterScreen`, floating bottom nav, cards, buttons, slider, progress bar, reusable display components

- `src/constants/theme.ts`
  - color tokens, spacing, max content width, font tokens

## Important Product Constraints

### Supported export formats

- Real conversion support today is:
  - JPEG
  - PNG
  - WebP

- `HEIC` appears in the format UI, but it is not implemented for export yet.
- Do not accidentally treat `outputFormat` as always directly convertible.
- `supportedOutputFormat` is the guardrail in converter state for this.

### History behavior

- History is local-only and on-device.
- Archiving is optional and controlled by Settings.
- When `keepHistoryEnabled` is off:
  - conversions still work
  - the Done screen still works
  - new exports are not persisted to history
  - Home hides recent history
  - History shows a disabled-state message instead of archive content
- Clearing history deletes app-managed archived files and metadata only.
- Clearing history must not delete photos the user already saved to the Photos library.

### Persistence model

- Settings are persisted with localStorage backed by `expo-sqlite`.
- History metadata is persisted in localStorage.
- Archived converted files are copied into app-managed document storage.
- `currentExport` is transient app state for the immediate Done flow; history is the durable archive.

## Key Files

- `src/app/_layout.tsx`: providers, router stack, app theme
- `src/app/index.tsx`: Home route
- `src/app/format.tsx`: Format route
- `src/app/processing.tsx`: Processing route
- `src/app/done.tsx`: Done route
- `src/app/history/index.tsx`: History list route
- `src/app/history/[id].tsx`: History detail route
- `src/app/settings.tsx`: Settings route

- `src/components/converter/home-upload-screen.tsx`: photo picking, camera access, recent archive preview
- `src/components/converter/format-selection-screen.tsx`: preview, output format selection, quality slider
- `src/components/converter/processing-screen.tsx`: progress UI and conversion trigger
- `src/components/converter/conversion-success-screen.tsx`: save/share/convert-another
- `src/components/converter/history-screen.tsx`: archive list and disabled state
- `src/components/converter/history-detail-screen.tsx`: detail view, save/share/convert again/delete
- `src/components/converter/settings-screen.tsx`: defaults, history settings, privacy/support
- `src/components/converter/shared.tsx`: common UI building blocks

- `src/features/converter/converter-context.tsx`: conversion state + archive integration
- `src/features/converter/converter-settings.tsx`: persisted preferences
- `src/features/converter/converter-history-storage.ts`: archive persistence and file cleanup
- `src/features/converter/use-export-actions.ts`: save/share helpers
- `src/features/converter/converter-utils.ts`: types and formatting helpers

- `src/constants/theme.ts`: visual tokens
- `app.json`: Expo config and permission copy

## Package Guidance

Prefer Expo-native packages first.

Core packages in active use:

- `expo-router`
- `expo-image-picker`
- `expo-image-manipulator`
- `expo-media-library`
- `expo-sharing`
- `expo-haptics`
- `expo-image`
- `expo-file-system`
- `expo-sqlite`
- `expo-web-browser`
- `@react-native-community/slider`
- `react-native-reanimated`
- `react-native-safe-area-context`
- `expo-symbols`

If a new feature can be solved with an Expo package, prefer that over adding extra native dependencies.

## Coding Guidance

- Keep route files thin. Put real screen code in `src/components/converter`.
- Put business logic in `src/features/converter`.
- Reuse existing shared UI primitives in `src/components/converter/shared.tsx` before inventing new one-off components.
- If you touch export behavior, also check:
  - `converter-context.tsx`
  - `use-export-actions.ts`
  - `converter-history-storage.ts`
  - `app.json` permission copy
- If you touch settings, keep them in `converter-settings.tsx` rather than burying them in transient screen state.
- If you touch history, remember it has both metadata and file-system cleanup concerns.
- Prefer `expo-image` for image rendering in the converter flow.
- Avoid custom gesture-heavy controls unless truly necessary. The app deliberately moved to a native slider to avoid flicker.
- Keep transitions and progress UI smooth and stable; regressions like slider/progress flicker are considered product bugs.

## UX Guidance

- The current design language is soft, spacious, rounded, and warm.
- Typography and spacing should feel intentional, not like an Expo starter or generic SaaS dashboard.
- The app is utility-focused, but should still feel premium.
- Empty states should be useful and reassuring, not promotional.
- Success/error language should stay calm and plain.

## Validation

Before handing work back, run:

- `npx tsc --noEmit`
- `npm run lint`

If behavior changed materially, do a simulator or device pass when practical, especially for:

- image picking
- camera permissions
- save/share flows
- history persistence across relaunch
- settings toggles that affect archive behavior

## Good Next Features

- image resize presets before export
- batch conversion
- metadata stripping toggle
- rename/export filename controls
- true HEIC export support if the platform/tooling path is solid
- better progress estimation if conversion steps become more complex

## Things To Be Careful About

- any feature that uploads photos or metadata off-device
- feature creep that turns the app into a bloated toolbox
- ad-like or growth-hack UI patterns
- Android-first compromises that make the iOS experience feel generic
- breaking the local archive contract when changing save/delete behavior
- claiming a format works when the actual conversion pipeline does not support it

## Repo Notes

- There are still some Expo starter-era files/components in the repo outside the converter flow. Do not reintroduce starter navigation or tutorial patterns unless the user explicitly asks for them.
- `README.md` may lag behind the actual product.
- Ignore `.agents/` and `skills-lock.json` unless the user explicitly asks to work on local agent tooling.
