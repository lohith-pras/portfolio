---
status: "issues_found"
files_reviewed: 5
critical: 0
warning: 2
info: 2
total: 4
---
# Code Review Report

## Summary
The review of the Phase 02 Static Shell files indicates a solid architectural foundation with `next-intl` integration and Tailwind CSS. However, there are two warnings related to the root layout that affect internationalization (i18n) accessibility and SEO, as English values are currently hardcoded for all locales. Minor informational findings relate to improving accessibility (a11y) through proper ARIA attributes.

## Findings

### [WR-01] Hardcoded `lang="en"` in Root Layout
**File**: `/Users/lohith/Projects/Personal/portfolio_v2/src/app/layout.tsx`
**Description**: The `<html>` tag has a hardcoded `lang="en"` attribute. Since the application uses internationalization (`next-intl`), this means German routes (e.g., `/de`) will still be served with `lang="en"`. This harms accessibility (screen readers will apply English pronunciation rules to German text) and SEO.
**Recommendation**: Move the `<html>` and `<body>` tags to a locale-specific layout (e.g., `src/app/[locale]/layout.tsx`) where the dynamic locale can be passed to the `lang` attribute, or resolve the locale dynamically in the root layout if your routing structure supports it.

### [WR-02] Static Non-Localized Metadata
**File**: `/Users/lohith/Projects/Personal/portfolio_v2/src/app/layout.tsx`
**Description**: The Next.js `metadata` object is statically exported with hardcoded English content. In an i18n application, metadata should be localized so that foreign-language routes receive the correct title and description for search engines and social sharing.
**Recommendation**: Move metadata generation to the locale-specific layout and use Next.js's `generateMetadata` function alongside `next-intl`'s `getTranslations` to provide localized metadata.

### [IN-01] Missing `aria-hidden` on Decorative SVG
**File**: `/Users/lohith/Projects/Personal/portfolio_v2/src/components/AboutSection.tsx`
**Description**: The placeholder SVG illustration does not have an `aria-hidden="true"` attribute. Screen readers may attempt to read the SVG elements, causing unnecessary noise for visually impaired users.
**Recommendation**: Add `aria-hidden="true"` to the `<svg>` element to explicitly hide it from assistive technologies.

### [IN-02] Missing `aria-label`s for Language Switchers
**File**: `/Users/lohith/Projects/Personal/portfolio_v2/src/components/NavbarMobile.tsx`
**Description**: The "EN" and "DE" language switcher links lack `aria-label`s, unlike the main navigation icon links which have them.
**Recommendation**: Consider adding descriptive `aria-label`s (e.g., `aria-label={t('switch_en')}`) to the language switcher links for improved accessibility.
