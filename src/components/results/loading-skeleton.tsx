"use client";

import { motion } from "framer-motion";

export function LoadingSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="space-y-3">
        <div className="h-4 w-24 rounded-sm sketch-loading" />
        <div className="h-20 rounded-sm sketch-loading" />
        <div className="h-6 rounded-sm sketch-loading" />
      </div>

      <div className="h-10 rounded-sm sketch-loading" />

      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2 p-4 border border-border/60 rounded-sm hand-card">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-sm sketch-loading" />
            <div className="h-4 w-20 rounded-sm sketch-loading" />
          </div>
          <div className="h-16 rounded-sm sketch-loading" />
        </div>
      ))}
    </motion.div>
  );
}
