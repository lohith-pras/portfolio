---
status: "issues_found"
files_reviewed: 4
critical: 1
warning: 1
info: 1
total: 3
---
# Code Review Report

## Summary
The review of the i18n implementation identified three issues. The most critical is a middleware matcher misconfiguration that causes runtime errors on deep links without locale prefixes. Additionally, the separation of layouts causes the HTML `lang` attribute to be hardcoded, which harms SEO and accessibility. Finally, passing the entire translation dictionary to client components can impact performance in the future.

## Findings

### [CR-01] Middleware Matcher Skips Unprefixed Deep Links
**File**: `src/middleware.ts`
**Description**: The middleware `matcher` is configured as `['/', '/(de|en)/:path*']`. This successfully matches the root path and paths that already have a locale prefix, but completely misses deep links like `/life` or `/projects/foo`. When a user navigates to an unprefixed deep link, the middleware fails to intercept it. Next.js then routes the request to the `app/[locale]` catch-all, mapping the first path segment (e.g., `"life"`) to the `[locale]` parameter. This results in a `NEXT_INTL_LOCALE_UNSUPPORTED` runtime crash when `setRequestLocale("life")` is called.
**Recommendation**: Update the matcher to intercept all non-internal paths so next-intl can automatically prefix them with the default locale. 
Change it to catch all paths excluding API, Next.js internals, and static files: 
`matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']`

### [WR-01] Hardcoded HTML Lang Attribute Due to Split Layouts
**File**: `src/app/[locale]/layout.tsx`
**Description**: Currently, `app/[locale]/layout.tsx` acts as an inner layout and relies on `app/layout.tsx` to render the `<html>` and `<body>` tags. Because `app/layout.tsx` is outside the `[locale]` segment, it cannot access the locale parameter, forcing `lang="en"` to be hardcoded for all languages (including German). This breaks accessibility (screen readers) and SEO (search engines) for non-English locales.
**Recommendation**: Move the `<html>` and `<body>` tags, along with font definitions and metadata, from `app/layout.tsx` into `app/[locale]/layout.tsx`. Pass the dynamic locale to the HTML tag: `<html lang={locale}>`. After moving the contents, delete `app/layout.tsx` (and `app/page.tsx` since the root redirect is handled by middleware) so Next.js correctly uses the localized layout as the root.

### [IN-01] Unnecessary Client Bundle Inflation via Messages
**File**: `src/app/[locale]/layout.tsx`
**Description**: `NextIntlClientProvider` is initialized with all messages (`messages={messages}`). Passing the entire translation dictionary to the provider will send all strings to the client, increasing the initial payload size as the application scales.
**Recommendation**: If client components do not need translations (i.e., only Server Components use translations), you can omit the `messages` prop entirely. If some client components do need them, consider passing only the necessary namespaces using `lodash/pick`, as recommended in the next-intl documentation.
