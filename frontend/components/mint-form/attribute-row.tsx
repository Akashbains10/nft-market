"use client"

import { Trash2 } from "lucide-react"
import type { Attribute } from "./types"

interface AttributeRowProps {
  attribute: Attribute
  onUpdate: (id: string, field: "traitType" | "value", value: string) => void
  onRemove: (id: string) => void
}

export function AttributeRow({ attribute, onUpdate, onRemove }: AttributeRowProps) {
  return (
    <div className="flex gap-3 items-end p-4 rounded-lg border border-border bg-muted/20 hover:border-primary transition-all duration-200">
      <input
        type="text"
        placeholder="Trait type"
        value={attribute.traitType}
        onChange={(e) => onUpdate(attribute.id, "traitType", e.target.value)}
        className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm hover:border-primary focus:border-primary transition-all duration-200"
      />
      <input
        type="text"
        placeholder="Value"
        value={attribute.value}
        onChange={(e) => onUpdate(attribute.id, "value", e.target.value)}
        className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm hover:border-primary focus:border-primary transition-all duration-200"
      />
      <button
        onClick={() => onRemove(attribute.id)}
        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all duration-200"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
