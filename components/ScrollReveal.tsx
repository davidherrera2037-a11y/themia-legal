"use client";

import { useEffect } from "react";

/**
 * Watches every element with the `.reveal` class and adds `.is-visible`
 * once it scrolls into view. Mount this once near the top of the page.
 */
export function ScrollReveal() {
  useEffect(() => {
    const targets = document.querySelectorAll(".reveal");

    if (!("IntersectionObserver" in window) || targets.length === 0) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
