import type { MDXComponents } from 'mdx/types'
import type { ComponentPropsWithoutRef } from 'react'

// This file is required to use @next/mdx in the `app` directory.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Heading overrides
    h1: ({ children }) => (
      <h1 className="text-4xl font-display font-bold text-foreground mt-8 mb-4">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-display font-semibold text-foreground mt-8 mb-4">
        {children}
      </h2>
    ),
    p: ({ children }) => (
      <p className="font-body text-white/80 leading-relaxed mb-4">{children}</p>
    ),

    // Code block container — rehype-pretty-code wraps code blocks with <pre data-theme="...">
    pre: ({ children, ...props }: ComponentPropsWithoutRef<'pre'>) => (
      <pre
        className="relative overflow-x-auto p-5 rounded-xl border border-white/10 bg-[#0d0d0d] my-6 font-mono text-sm leading-relaxed shadow-lg"
        {...props}
      >
        {children}
      </pre>
    ),

    // Inline code vs block code:
    // rehype-pretty-code adds `data-theme` to <code> inside a <pre> block.
    // Inline code snippets (like `const x = 5`) have NO data-theme attribute.
    code: (props: ComponentPropsWithoutRef<'code'>) => {
      // Cast to access data-theme (set by rehype-pretty-code on block code)
      const isBlockCode = 'data-theme' in props || 'data-language' in props

      if (isBlockCode) {
        // Inside a <pre> block — let Shiki token colors render cleanly
        return (
          <code
            className="font-mono text-sm block [&>[data-line]]:px-1"
            {...props}
          />
        )
      }

      // Inline code — styled with subtle background and accent color
      return (
        <code
          className="font-mono text-xs px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[#FF6B35]"
          {...props}
        />
      )
    },

    ...components,
  }
}
