// Plain <img>, not next/image: the logo is a small static asset and this
// sidesteps a Next dev-mode image-optimizer glitch after hot-replacing the file.
export function Logo({ className }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/logo-gli.jpg" alt="GLI — Grupo Linros Interinsumos" className={className} />;
}
