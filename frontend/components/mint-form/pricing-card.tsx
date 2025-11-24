"use client"

import type React from "react"

interface PricingCardProps {
  icon: string
  title: string
  symbol: string
  subtitle: string
  value: string
  placeholder: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  step?: string
  gradientFrom: string
  gradientTo: string
}

export function PricingCard({
  icon,
  title,
  symbol,
  subtitle,
  value,
  placeholder,
  onChange,
  step,
  gradientFrom,
  gradientTo,
}: PricingCardProps) {
  return (
    <div
      className={`p-6 rounded-lg border border-border bg-gradient-to-br ${gradientFrom} ${gradientTo} hover:border-primary transition-all duration-200 hover:shadow-md`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
            {icon}
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{title}</h4>
            <p className="text-xs text-muted-foreground">{symbol}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <input
        type="number"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        step={step}
        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground hover:border-primary focus:border-primary transition-all duration-200"
      />
    </div>
  )
}
