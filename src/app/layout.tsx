import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EchoLens — 消息误读模拟器",
  description: "消息发出前，看见对方眼中的你",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=LXGW+WenKai:wght@300;400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="antialiased bg-background text-foreground min-h-screen"
        style={{ fontFamily: "'LXGW WenKai', 'Caveat', cursive" }}
      >
        {/* Hidden SVG for sketchy filter */}
        <svg width="0" height="0" className="absolute">
          <defs>
            <filter id="sketchy">
              <feTurbulence
                type="turbulence"
                baseFrequency="0.03"
                numOctaves="4"
                seed="1"
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="2"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
        {children}
      </body>
    </html>
  );
}
