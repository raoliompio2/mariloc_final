import React, { useRef } from 'react';
import { Upload } from 'lucide-react';

interface LogoUploaderProps {
  label: string;
  logoUrl?: string;
  onFileSelect: (file: File) => void;
}

export function LogoUploader({ label, logoUrl, onFileSelect }: LogoUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-text">
        {label}
      </label>
      <div className="space-y-2">
        <input
          type="file"
          ref={fileRef}
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onFileSelect(file);
            }
          }}
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center justify-center gap-2"
        >
          <Upload size={20} />
          Escolher Logo
        </button>
        {logoUrl && (
          <div className="mt-2">
            <p className="text-sm text-gray-600 mb-1">Logo atual:</p>
            <img src={logoUrl} alt="Logo" className="h-16" />
          </div>
        )}
      </div>
    </div>
  );
}
