import React from 'react';
import { QuickLink } from '../../services/systemSettings';

interface QuickLinksProps {
  enabled: boolean;
  links: QuickLink[];
  onToggle: (enabled: boolean) => void;
  onChange: (links: QuickLink[]) => void;
}

export function QuickLinks({ enabled = true, links = [], onToggle, onChange }: QuickLinksProps) {
  const handleAddLink = () => {
    const newLink = {
      id: crypto.randomUUID(),
      title: '',
      url: '',
      order_index: links.length
    };
    onChange([...links, newLink]);
  };

  const handleUpdateLink = (index: number, updatedLink: QuickLink) => {
    const updatedLinks = [...links];
    updatedLinks[index] = updatedLink;
    onChange(updatedLinks);
  };

  const handleMoveLink = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= links.length) return;

    const updatedLinks = [...links];
    [updatedLinks[index], updatedLinks[newIndex]] = [updatedLinks[newIndex], updatedLinks[index]];
    
    // Atualizar order_index
    updatedLinks.forEach((link, i) => {
      link.order_index = i;
    });
    
    onChange(updatedLinks);
  };

  const handleRemoveLink = (index: number) => {
    const updatedLinks = links.filter((_, i) => i !== index);
    // Atualizar order_index
    updatedLinks.forEach((link, i) => {
      link.order_index = i;
    });
    onChange(updatedLinks);
  };

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text">Links Rápidos</h2>
          <div className="mt-2">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => onToggle(e.target.checked)}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                {enabled ? 'Ativo' : 'Inativo'}
              </span>
            </label>
          </div>
        </div>
        <button
          onClick={handleAddLink}
          disabled={!enabled}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>+ Adicionar Link</span>
        </button>
      </div>
      <div className="space-y-4">
        {links.map((link, index) => (
          <div key={link.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-gray-400 text-sm font-medium">{index + 1}</span>
            <div className="flex-1 space-y-4">
              <input
                type="text"
                value={link.title}
                onChange={(e) => handleUpdateLink(index, { ...link, title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="Título do Link"
                disabled={!enabled}
              />
              <input
                type="url"
                value={link.url}
                onChange={(e) => handleUpdateLink(index, { ...link, url: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="URL do Link"
                disabled={!enabled}
              />
            </div>
            <div className="flex flex-col justify-center gap-2">
              <button
                onClick={() => handleMoveLink(index, 'up')}
                disabled={index === 0 || !enabled}
                className="p-2 text-gray-400 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ↑
              </button>
              <button
                onClick={() => handleMoveLink(index, 'down')}
                disabled={index === links.length - 1 || !enabled}
                className="p-2 text-gray-400 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ↓
              </button>
              <button
                onClick={() => handleRemoveLink(index)}
                disabled={!enabled}
                className="p-2 text-red-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
