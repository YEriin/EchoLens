"use client";

export function Footer() {
  return (
    <footer className="py-6 mt-12" style={{ borderTop: '2px dashed var(--border)', filter: 'url(#sketchy)' }}>
      <div className="max-w-4xl mx-auto px-4 text-center text-xs text-muted-foreground">
        <p>EchoLens — 沟通翻车的核心原因：你以为的语气 ≠ 对方感受到的语气</p>
        <p className="mt-1">Powered by Claude</p>
      </div>
    </footer>
  );
}
