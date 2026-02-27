"use client";

import { ImageIcon, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

export default function ImageUploadField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [sizeError, setSizeError] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const hasImage = !!value;
  const isDataUrl = value.startsWith("data:");

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_BYTES) {
      setSizeError(true);
      e.target.value = "";
      return;
    }

    setSizeError(false);
    setImgFailed(false);

    const reader = new FileReader();
    reader.onload = () => {
      onChange(reader.result as string);
    };
    reader.readAsDataURL(file);
    // Clear input so re-selecting the same file fires onChange
    e.target.value = "";
  }

  function handleRemove() {
    onChange("");
    setSizeError(false);
    setImgFailed(false);
  }

  return (
    <div className="space-y-2">
      {/* Clickable preview / dropzone */}
      <button
        type="button"
        className="group relative w-full overflow-hidden rounded-lg border-2 border-dashed border-border bg-secondary/30 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{ minHeight: 96 }}
        onClick={() => inputRef.current?.click()}
        aria-label="Upload image"
      >
        {hasImage && !imgFailed ? (
          <>
            <img
              src={value}
              alt="Asset preview"
              className="max-h-36 w-full object-cover"
              onError={() => setImgFailed(true)}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/35 group-hover:opacity-100">
              <span className="rounded-md bg-black/60 px-2 py-1 text-[11px] font-medium text-white">
                Change image
              </span>
            </div>
          </>
        ) : (
          <div className="flex min-h-[96px] flex-col items-center justify-center gap-1.5 text-muted-foreground/50">
            <ImageIcon className="h-6 w-6" />
            <span className="text-xs">Click to upload image</span>
            <span className="text-[10px]">Max 2 MB · PNG, JPG, WEBP</span>
          </div>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 flex-1 text-[11px]"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="mr-1.5 h-3 w-3" />
          {hasImage ? "Change" : "Upload image"}
        </Button>
        {hasImage && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={handleRemove}
            aria-label="Remove image"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {sizeError && (
        <p className="text-[11px] text-destructive">
          File is too large — max 2 MB.
        </p>
      )}

      {/* URL fallback */}
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-border/40" />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground/40">
          or URL
        </span>
        <div className="h-px flex-1 bg-border/40" />
      </div>
      <Input
        value={isDataUrl ? "" : value}
        onChange={(e) => {
          setSizeError(false);
          setImgFailed(false);
          onChange(e.target.value);
        }}
        placeholder="https://…"
        className="h-8 text-xs"
      />
    </div>
  );
}
