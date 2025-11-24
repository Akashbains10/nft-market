"use client";

import type React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaUpload } from "./media-upload";
import { AttributesSection } from "./attributes-section";
import type { FormData } from "./types";

interface NFTDetailsStepProps {
  formData: FormData;
  mediaLoading: boolean;
  errors: Record<string, string>;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onMediaUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddAttribute: () => void;
  onUpdateAttribute: (
    id: string,
    field: "traitType" | "value",
    value: string
  ) => void;
  onRemoveAttribute: (id: string) => void;
  onSaveDraft: () => void;
  onNext: () => void;
  isDetailsValid: boolean;
}

export function NFTDetailsStep({
  formData,
  errors,
  mediaLoading,
  onInputChange,
  onMediaUpload,
  onAddAttribute,
  onUpdateAttribute,
  onRemoveAttribute,
  onSaveDraft,
  onNext,
  isDetailsValid,
}: NFTDetailsStepProps) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-lg overflow-hidden p-8 space-y-8 animate-in fade-in duration-300">
      <MediaUpload
        mediaLoading={mediaLoading}
        mediaUrl={formData.mediaUrl}
        mediaPreview={formData.mediaPreview}
        onMediaUpload={onMediaUpload}
        error={errors.media}
      />

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">
          NFT Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={onInputChange}
          placeholder="Enter NFT name"
          className={cn(
            "w-full px-4 py-3 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground transition-all duration-200",
            errors.name
              ? "border-destructive"
              : "border-border hover:border-primary focus:border-primary"
          )}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={onInputChange}
          placeholder="Describe your NFT asset..."
          rows={4}
          className={cn(
            "w-full px-4 py-3 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground transition-all duration-200 resize-none",
            errors.description
              ? "border-destructive"
              : "border-border hover:border-primary focus:border-primary"
          )}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">
          Collection
        </label>
        <input
          type="text"
          name="collection"
          value={formData.collection}
          onChange={onInputChange}
          placeholder="Enter collection name (optional)"
          className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground hover:border-primary focus:border-primary transition-all duration-200"
        />
      </div>

      <AttributesSection
        attributes={formData.attributes}
        onAdd={onAddAttribute}
        onUpdate={onUpdateAttribute}
        onRemove={onRemoveAttribute}
      />

      <div className="flex gap-4 justify-end pt-4 border-t border-border">
        <button
          onClick={onSaveDraft}
          className="px-6 py-3 rounded-lg border border-border bg-background text-foreground font-medium hover:bg-muted hover:border-primary transition-all duration-200 hover:shadow-md"
        >
          Save Draft
        </button>
        <button
          onClick={onNext}
          disabled={!isDetailsValid}
          className={cn(
            "px-8 py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium transition-all duration-200 flex items-center gap-2",
            isDetailsValid
              ? "hover:shadow-lg hover:shadow-primary/25 hover:scale-105 cursor-pointer"
              : "opacity-50 cursor-not-allowed"
          )}
        >
          Add Pricing
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
