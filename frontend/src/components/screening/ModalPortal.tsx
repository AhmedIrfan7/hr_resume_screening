"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ModalPortalProps {
  children: ReactNode;
}

// Renders children as a direct child of <body>, bypassing any ancestor's
// stacking context. Without this, a CSS `transform` on ANY ancestor (even a
// finished animation at rest, e.g. Tailwind's animate-fade-in-up) turns that
// ancestor into a containing block for position:fixed children, trapping the
// modal's z-index below sibling elements like the page header regardless of
// the modal's own z-index value.
export function ModalPortal({ children }: ModalPortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (!mounted) return null;
  return createPortal(children, document.body);
}
