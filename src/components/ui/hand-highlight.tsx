"use client";

import { useRef, useEffect, type ReactNode } from "react";
import { annotate } from "rough-notation";
import type { RoughAnnotation, RoughAnnotationType } from "rough-notation/lib/model";

interface HandHighlightProps {
  type?: RoughAnnotationType;
  color?: string;
  animate?: boolean;
  strokeWidth?: number;
  children: ReactNode;
}

export function HandHighlight({
  type = "highlight",
  color = "rgba(220, 80, 60, 0.2)",
  animate = true,
  strokeWidth = 2,
  children,
}: HandHighlightProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const annotationRef = useRef<RoughAnnotation | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const annotation = annotate(ref.current, {
      type,
      color,
      animate,
      animationDuration: 400,
      strokeWidth,
      multiline: true,
    });

    annotationRef.current = annotation;
    annotation.show();

    return () => {
      annotation.remove();
    };
  }, [type, color, animate, strokeWidth]);

  return <span ref={ref}>{children}</span>;
}
