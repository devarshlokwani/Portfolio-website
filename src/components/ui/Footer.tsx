export function Footer() {
  return (
    <footer className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-10 font-mono text-xs text-fg-subtle md:flex-row md:items-center md:justify-between md:px-10">
      <p>© {new Date().getFullYear()} Devarsh Lokwani</p>
      <p>Built with React, TypeScript, GSAP & Lenis</p>
    </footer>
  )
}
