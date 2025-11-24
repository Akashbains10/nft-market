"use client"

import { Plus } from "lucide-react"
import type { Attribute } from "./types"
import { AttributeRow } from "./attribute-row"

interface AttributesSectionProps {
  attributes: Attribute[]
  onAdd: () => void
  onUpdate: (id: string, field: "traitType" | "value", value: string) => void
  onRemove: (id: string) => void
}

export function AttributesSection({ attributes, onAdd, onUpdate, onRemove }: AttributesSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Attributes</h3>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all duration-200 hover:shadow-md"
        >
          <Plus className="w-4 h-4" />
          Add Attribute
        </button>
      </div>

      {attributes.length > 0 ? (
        <div className="space-y-3">
          {attributes.map((attr) => (
            <AttributeRow key={attr.id} attribute={attr} onUpdate={onUpdate} onRemove={onRemove} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-6 border border-dashed border-border rounded-lg">
          No attributes added yet. Click "Add Attribute" to get started.
        </p>
      )}
    </div>
  )
}
