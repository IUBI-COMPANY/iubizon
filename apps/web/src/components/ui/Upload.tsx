import React, { useRef, useState, useCallback } from "react";
import { twMerge } from "tailwind-merge";
import {
  Upload as UploadIcon,
  X,
  FileText as FileIcon,
  Video as VideoIcon,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";

interface Props {
  name: string;
  label?: string;
  files?: File[];
  onChange?: (files: File[]) => void;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  hidden?: boolean;
  className?: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
}

export const Upload = ({
  name,
  label,
  files = [],
  onChange,
  error = false,
  helperText,
  required = false,
  hidden = false,
  className,
  accept = "image/*,video/*",
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = multiple ? 5 : 1,
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (maxSize && file.size > maxSize) {
        return `El archivo es demasiado grande. Máximo ${Math.round(maxSize / 1024 / 1024)}MB`;
      }

      const acceptedTypes = accept.split(",").map((type) => type.trim());
      const isValidType = acceptedTypes.some((type) => {
        if (type === "image/*") return file.type.startsWith("image/");
        if (type === "video/*") return file.type.startsWith("video/");
        return file.type === type;
      });

      if (!isValidType) {
        return `Tipo de archivo no válido. Se aceptan: ${accept}`;
      }

      return null;
    },
    [accept, maxSize],
  );

  const handleFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles);
      const validFiles: File[] = [];
      let errorMessage = "";

      for (const file of fileArray) {
        const error = validateFile(file);
        if (error) {
          errorMessage = error;
          break;
        }
        validFiles.push(file);
      }

      if (errorMessage) {
        console.error(errorMessage);
        return;
      }

      if (multiple) {
        const totalFiles = [...files, ...validFiles];
        if (totalFiles.length > maxFiles) {
          console.error(`Máximo ${maxFiles} archivos permitidos`);
          return;
        }
        onChange?.(totalFiles.slice(0, maxFiles));
      } else {
        onChange?.(validFiles.slice(0, 1));
      }
    },
    [files, multiple, maxFiles, onChange, validateFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles],
  );

  const removeFile = useCallback(
    (index: number) => {
      const newFiles = files.filter((_, i) => i !== index);
      onChange?.(newFiles);
    },
    [files, onChange],
  );

  const handleClick = () => {
    inputRef.current?.click();
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/"))
      return <ImageIcon className="w-5 h-5" />;
    if (file.type.startsWith("video/"))
      return <VideoIcon className="w-5 h-5" />;
    return <FileIcon className="w-5 h-5" />;
  };

  const getPreviewUrl = (file: File) => {
    return URL.createObjectURL(file);
  };

  return (
    <div className={twMerge("", hidden && "hidden", className)}>
      {label && (
        <label className="block text-sm/6 font-semibold text-secondary mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Upload Area */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={twMerge(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200",
          "hover:border-secondary/50 hover:bg-secondary/5",
          isDragOver && "border-secondary bg-secondary/10",
          error ? "border-red-300 bg-red-50" : "border-gray-300 bg-gray-50",
        )}
      >
        <UploadIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 mb-1">
          {isDragOver
            ? "Suelta los archivos aquí"
            : "Haz clic o arrastra archivos aquí"}
        </p>
        <p className="text-xs text-gray-500">
          {accept === "image/*,video/*" ? "Imágenes y videos" : accept}
          {maxSize && ` • Máx. ${Math.round(maxSize / 1024 / 1024)}MB`}
          {multiple && ` • Hasta ${maxFiles} archivos`}
        </p>
      </div>

      {/* Hidden Input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        className="hidden"
        aria-describedby={error ? `${name}-error` : undefined}
        aria-invalid={error}
      />

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {file.type.startsWith("image/") && (
                  <Image
                    src={getPreviewUrl(file)}
                    alt={file.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 object-cover rounded"
                  />
                )}
                {file.type.startsWith("video/") && (
                  <video
                    src={getPreviewUrl(file)}
                    className="w-10 h-10 object-cover rounded"
                    muted
                  />
                )}
                {!file.type.startsWith("image/") &&
                  !file.type.startsWith("video/") && (
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                      {getFileIcon(file)}
                    </div>
                  )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeFile(index)}
                className="p-1 text-red-500 hover:text-red-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      {error && helperText && (
        <p
          id={`${name}-error`}
          className="mt-1 text-sm text-red-600 scroll-error-anchor"
          role="alert"
        >
          {helperText}
        </p>
      )}
    </div>
  );
};
