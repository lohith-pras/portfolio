import type { MDXComponents } from 'mdx/types'

// This file is required to use @next/mdx in the `app` directory.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Allows customizing built-in components, e.g. to add styling.
    h1: ({ children }) => <h1 className="text-4xl font-display font-bold text-foreground mt-8 mb-4">{children}</h1>,
    h2: ({ children }) => <h2 className="text-2xl font-display font-semibold text-foreground mt-8 mb-4">{children}</h2>,
    p: ({ children }) => <p className="font-body text-white/80 leading-relaxed mb-4">{children}</p>,
    ...components,
  }
}
