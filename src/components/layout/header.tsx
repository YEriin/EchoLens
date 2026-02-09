"use client";

export function Header() {
  return (
    <header className="border-b border-border/40 bg-card shrink-0">
      <div className="px-4 py-2 flex items-center gap-3">
        <svg width="28" height="28" viewBox="0 0 28 28" className="shrink-0">
          <circle
            cx="14" cy="14" r="12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-foreground"
            style={{ filter: 'url(#sketchy)' }}
          />
          <text
            x="14" y="15"
            textAnchor="middle"
            dominantBaseline="central"
            className="text-foreground"
            style={{ fontSize: '13px', fontFamily: "'Caveat', cursive", fontWeight: 700 }}
          >
            E
          </text>
        </svg>
        <h1 className="text-sm font-semibold tracking-tight">EchoLens</h1>
        <span className="text-xs text-muted-foreground rotate-[-0.5deg]">消息发出前，看见对方眼中的你</span>
      </div>
    </header>
  );
}
