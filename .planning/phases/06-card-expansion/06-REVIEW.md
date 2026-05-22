---
status: "issues_found"
files_reviewed: 4
critical: 0
warning: 3
info: 3
total: 6
---
# Code Review Report

## Summary
The implementation successfully introduces the intercepted routes and modal views for the project expansion phase using Next.js App Router parallel routes. The architecture uses best practices like passing server components as children to client components. However, there are some code duplication issues, accessibility improvements, and UX details that should be addressed.

## Findings

### [WR-01] DRY Violation: Duplicated `generateStaticParams` and dynamic import logic
**File**: `src/app/[locale]/@modal/(.)projects/[slug]/page.tsx` and `src/app/[locale]/projects/[slug]/page.tsx`
**Description**: Both the modal intercepted route and the main project page contain identical hardcoded arrays for `slugs` and `locales` within `generateStaticParams()`. They also duplicate the exact dynamic MDX import logic. Maintaining these lists in two places is error-prone and can lead to mismatched static generation if one is updated but not the other.
**Recommendation**: Extract the `slugs` and `locales` arrays (or the entire `generateStaticParams` function) into a shared utility file (e.g., `src/lib/projects.ts`) and import it in both page files. Next.js allows you to re-export `generateStaticParams` directly from a shared file.

### [WR-02] Accessibility: Modal lacks ARIA roles
**File**: `src/components/ModalClient.tsx`
**Description**: The modal container `motion.div` lacks the appropriate ARIA roles to be properly identified as a dialog by screen readers. 
**Recommendation**: Add `role="dialog"` and `aria-modal="true"` to the inner `motion.div` that serves as the modal container.

### [WR-03] UX: Modal close button scrolls out of view
**File**: `src/components/ModalClient.tsx`
**Description**: The close button is positioned `absolute` within the `motion.div`, which also has `overflow-y-auto`. Because of this, when the user scrolls down through long project content, the close button will scroll up and out of view. This makes it difficult to close the modal on mobile devices where clicking the background backdrop is harder.
**Recommendation**: Change the layout so the close button is `sticky` or `fixed`, or move the `overflow-y-auto` behavior to an inner wrapper `div` around `{children}` so the close button remains pinned to the top right of the modal shell.

### [IN-01] UX: Body scroll is not locked when modal is open
**File**: `src/components/ModalClient.tsx`
**Description**: When the modal is active, the user can still scroll the main page in the background if it is longer than the viewport. This is a common UX issue with custom modals that can cause disorientation.
**Recommendation**: Implement a body scroll lock using a `useEffect` when the modal mounts (e.g., `document.body.style.overflow = 'hidden'`) and clean it up by restoring the original value on unmount.

### [IN-02] Accessibility: Backdrop uses `div` with `onClick`
**File**: `src/components/ModalClient.tsx`
**Description**: The backdrop overlay is a `div` element with an `onClick` handler but lacks a semantic role or keyboard interactions. While screen reader users have the escape key and a dedicated close button, using interactive non-semantic elements triggers accessibility linters.
**Recommendation**: Add `role="presentation"` to the backdrop `motion.div` to indicate it is purely presentational, or implement it as a proper button with `aria-hidden="true"`.

### [IN-03] Defensive Programming: Validate dynamic route parameters
**File**: `src/app/[locale]/projects/[slug]/page.tsx` and `src/app/[locale]/@modal/(.)projects/[slug]/page.tsx`
**Description**: The `slug` and `locale` parameters from the URL are used directly in a dynamic `import()` statement. While Next.js routing restricts path segments from containing slashes (mitigating path traversal), it is best practice to validate these parameters against the known list of valid values before attempting file system operations.
**Recommendation**: Validate that the incoming `slug` exists in the predefined `slugs` array before executing the dynamic import, returning `notFound()` early if it does not match.
