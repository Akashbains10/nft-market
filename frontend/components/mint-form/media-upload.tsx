"use client"

import type React from "react"
import { Upload } from "lucide-react"

interface MediaUploadProps {
  mediaLoading: boolean
  mediaUrl: string
  mediaPreview: string
  onMediaUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
}

export function MediaUpload({ mediaLoading, mediaUrl, mediaPreview, onMediaUpload, error }: MediaUploadProps) {
  const isVideo =
    mediaUrl?.toLowerCase().endsWith(".mp4") ||
    mediaUrl?.toLowerCase().endsWith(".mov") ||
    mediaUrl?.toLowerCase().endsWith(".webm") ||
    mediaUrl?.toLowerCase().endsWith(".gif")

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-sm font-semibold text-foreground mb-3 block">Media Upload *</span>

        <div className="relative w-full h-64 border-2 border-dashed border-border rounded-lg overflow-hidden">

          {/* Hidden input */}
          <input
            type="file"
            disabled={mediaLoading}
            accept="image/*,video/*"
            onChange={onMediaUpload}
            className="hidden"
            id="media-upload"
          />

          {/* Upload Box / Preview */}
          <label
            htmlFor={!mediaLoading ? "media-upload" : undefined}
            className={`
              absolute inset-0 flex items-center justify-center flex-col cursor-pointer
              transition-all duration-200 bg-muted/30
              ${mediaLoading ? "pointer-events-none opacity-40 blur-[1px]" : "hover:border-primary hover:bg-secondary"}
            `}
          >
            {/* If media is uploaded, show preview inside the same box */}
            {mediaPreview ? (
              isVideo ? (
                <video
                  src={mediaPreview}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={mediaPreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              )
            ) : (
              // Default upload UI
              <div className="flex flex-col items-center">
                <Upload className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-foreground">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, MP4, GIF (Max 100MB)</p>
              </div>
            )}
          </label>

          {/* Loader Overlay */}
          {mediaLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/50">
              <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm mt-3 font-medium text-foreground">Uploading file…</p>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      </label>
    </div>
  )
}
