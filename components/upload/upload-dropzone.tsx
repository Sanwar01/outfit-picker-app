"use client";

import { useRef } from "react";
import { Camera, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export function UploadDropzone({ onFilesSelected, disabled }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) {
      onFilesSelected(files);
    }
    e.target.value = "";
  }

  return (
    <div className="rounded-2xl border-2 border-dashed border-border bg-background p-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
        <ImagePlus className="h-6 w-6 text-ink-faint" />
      </div>
      <h3 className="font-medium text-foreground">Add to your closet</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Upload photos of individual clothing items
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button
          type="button"
          className="rounded-xl"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus className="mr-2 h-4 w-4" />
          Choose photos
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-xl"
          disabled={disabled}
          onClick={() => {
            if (inputRef.current) {
              inputRef.current.setAttribute("capture", "environment");
              inputRef.current.click();
              inputRef.current.removeAttribute("capture");
            }
          }}
        >
          <Camera className="mr-2 h-4 w-4" />
          Take photo
        </Button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
    </div>
  );
}
