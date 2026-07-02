"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { NAV_ITEMS } from "@/constants/navigation";
import { useScrollPosition } from "@/hooks/use-scroll-position";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

export function Navbar() {
  const scrolled = useScrollPosition(24);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-4 sm:top-6 z-50 flex justify-center px-4 pointer-events-none">
      <motion.nav
        initial={false}
        animate={{
          scale: scrolled ? 0.96 : 1,
          y: scrolled ? -2 : 0,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 24 }}
        className={cn(
          "pointer-events-auto relative w-full max-w-5xl",
          "flex items-center justify-between gap-4",
          "rounded-full border border-white/60 bg-white/70 backdrop-blur-xl",
          "px-4 sm:px-5 py-2.5 sm:py-3",
          "shadow-[0_10px_40px_-12px_rgba(17,24,39,0.18)]",
          scrolled && "border-white/80 bg-white/90 shadow-[0_18px_50px_-18px_rgba(17,24,39,0.22)]",
        )}
      >
        <Logo />

        <ul className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium rounded-full transition-colors",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-full bg-foreground/[0.06]"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="accent"
            size="sm"
            className="hidden sm:inline-flex"
          >
            <Link href="/book">
              Book Service
              <ArrowUpRight className="size-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
            </Link>
          </Button>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden grid place-items-center size-10 rounded-full hover:bg-foreground/5 transition-colors"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden pointer-events-auto absolute top-full mt-3 w-[calc(100%-2rem)] max-w-md left-1/2 -translate-x-1/2 rounded-3xl border border-white/60 bg-white/95 backdrop-blur-xl shadow-lift p-3"
          >
            <ul className="flex flex-col">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl px-4 py-3 text-sm font-medium text-foreground/80 hover:bg-foreground/5"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Button
                  asChild
                  variant="accent"
                  className="w-full"
                  onClick={() => setOpen(false)}
                >
                  <Link href="/book">Book Service</Link>
                </Button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
