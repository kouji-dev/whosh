import * as React from 'react';
import { cn } from '@/lib/utils';

interface FileUploadPickerProps {
  label: string;
  icon: React.ReactNode;
  accept: string;
  multiple?: boolean;
  disabled?: boolean;
  value: File[];
  onChange: (files: File[]) => void;
}

export function FileUploadPicker({
  label,
  icon,
  accept,
  multiple = false,
  disabled = false,
  value,
  onChange,
}: FileUploadPickerProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <label
        className={cn(
          "flex items-center gap-2 cursor-pointer rounded-md border border-dashed border-muted-foreground/40 bg-muted px-4 py-3 text-muted-foreground hover:bg-accent transition-colors",
          disabled && "opacity-50 pointer-events-none"
        )}
      >
        {icon}
        <span>Click to select {multiple ? 'files' : 'a file'}</span>
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={e => onChange(Array.from(e.target.files || []))}
          disabled={disabled}
        />
      </label>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {value.map((file, idx) => (
            <span
              key={idx}
              className="rounded bg-accent px-2 py-1 text-xs text-accent-foreground"
            >
              {file.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
} 