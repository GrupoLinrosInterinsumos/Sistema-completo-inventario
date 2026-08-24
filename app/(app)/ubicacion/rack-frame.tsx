// Marco decorativo que da un efecto de profundidad ("estantería vista de
// frente, en 3/4") alrededor de la grilla del rack: una cara superior y una
// cara lateral derecha, como un gabinete físico. Puramente visual — no
// interfiere con los clics/taps de la grilla, que sigue siendo un grid plano
// para no arriesgar la precisión táctil.
export function RackFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative pt-3 pr-3">
      <div
        aria-hidden="true"
        className="absolute right-0 top-0 h-3 rounded-t-md bg-primary-container"
        style={{ left: 14, transform: "skewX(-38deg) translateX(-8px)", transformOrigin: "bottom left" }}
      />
      <div
        aria-hidden="true"
        className="absolute right-0 top-0 w-3 rounded-r-md bg-primary"
        style={{ bottom: 0, top: 6, transform: "skewY(-38deg) translateY(-6px)", transformOrigin: "top left" }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
