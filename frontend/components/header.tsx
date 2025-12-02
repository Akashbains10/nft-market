"use client"

import { useState, useEffect } from "react"
import WalletButton from "./wallet-button"
import ThemeToggle from "./theme-toggle"
import Link from "next/link"
import { usePathname } from "next/navigation"
import clsx from "clsx"

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  const tabs = [
    { name: "Explore", href: "/" },
    { name: "Mint NFT", href: "/mint" },
    { name: "Collections", href: "/collections" },
    { name: "My NFT's", href: "/my-nfts" },
  ]

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm"
          : "bg-background border-b border-border/20"
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Left Branding */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-11 h-11 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
            <span className="text-white font-bold text-lg">✦</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-foreground tracking-tight">
              NFT Market
            </span>
            <span className="text-xs text-muted-foreground">
              Premium Digital Assets
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {tabs.map((tab) => {
            const active = pathname === tab.href

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={clsx(
                  "text-sm font-medium transition-colors duration-200 relative group",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.name}

                <span
                  className={clsx(
                    "absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300",
                    active ? "w-full" : "w-0 group-hover:w-full"
                  )}
                />
              </Link>
            )
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <WalletButton />
        </div>
      </div>
    </header>
  )
}
