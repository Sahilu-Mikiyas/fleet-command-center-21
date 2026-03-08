import { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
  label?: string;
  preview?: string | null;
  className?: string;
}

export function FileUpload({ onFileSelect, accept = 'image/*', label = 'Upload file', preview: externalPreview, className }: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(externalPreview || null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
    onFileSelect(file);
  }, [onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-all cursor-pointer',
          isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'
        )}
      >
        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative"
            >
              <img src={preview} alt="Preview" className="h-24 w-24 rounded-lg object-cover" />
              <button
                onClick={(e) => { e.stopPropagation(); handleFile(null); }}
                className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2 text-muted-foreground"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                {accept?.includes('image') ? (
                  <ImageIcon className="h-6 w-6 text-primary" />
                ) : (
                  <Upload className="h-6 w-6 text-primary" />
                )}
              </div>
              <p className="text-sm">Drag & drop or click to upload</p>
              <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
            </motion.div>
          )}
        </AnimatePresence>
        <input
          type="file"
          accept={accept}
          onChange={(e) => handleFile(e.target.files?.[0] || null)}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </div>
    </div>
  );
}
