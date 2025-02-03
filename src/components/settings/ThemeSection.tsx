import React from 'react';
import { ColorPicker } from './ColorPicker';
import { LogoUploader } from './LogoUploader';

interface ThemeSectionProps {
  title: string;
  header_color: string;
  header_text_color: string;
  footer_color: string;
  footer_text_color: string;
  header_logo_url: string;
  footer_logo_url: string;
  theme_prefix: 'light' | 'dark';
  onColorChange: (key: string, value: string) => void;
  onHeaderLogoUpload: (file: File) => void;
  onFooterLogoUpload: (file: File) => void;
}

export function ThemeSection({
  title,
  header_color,
  header_text_color,
  footer_color,
  footer_text_color,
  header_logo_url,
  footer_logo_url,
  theme_prefix,
  onColorChange,
  onHeaderLogoUpload,
  onFooterLogoUpload
}: ThemeSectionProps) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-text mb-6">{title}</h2>
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text">Header</h3>
            <ColorPicker
              label="Cor do Header"
              value={header_color}
              onChange={(value) => onColorChange(`${theme_prefix}_header_color`, value)}
            />
            <ColorPicker
              label="Cor do Texto do Header"
              value={header_text_color}
              onChange={(value) => onColorChange(`${theme_prefix}_header_text_color`, value)}
            />
            <LogoUploader
              label="Logo do Header"
              logoUrl={header_logo_url}
              onFileSelect={onHeaderLogoUpload}
            />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text">Footer</h3>
            <ColorPicker
              label="Cor do Footer"
              value={footer_color}
              onChange={(value) => onColorChange(`${theme_prefix}_footer_color`, value)}
            />
            <ColorPicker
              label="Cor do Texto do Footer"
              value={footer_text_color}
              onChange={(value) => onColorChange(`${theme_prefix}_footer_text_color`, value)}
            />
            <LogoUploader
              label="Logo do Footer"
              logoUrl={footer_logo_url}
              onFileSelect={onFooterLogoUpload}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
