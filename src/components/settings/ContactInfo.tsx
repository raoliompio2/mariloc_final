import React from 'react';

interface ContactInfoProps {
  address: string;
  phone: string;
  email: string;
  onChange: (field: 'address' | 'phone' | 'email', value: string) => void;
}

export function ContactInfo({ 
  address = '', 
  phone = '', 
  email = '', 
  onChange 
}: ContactInfoProps) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-text mb-6">Informações de Contato</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1">
            Endereço
          </label>
          <input
            type="text"
            value={address || ''}
            onChange={(e) => onChange('address', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
            placeholder="Ex: Av. Principal, 123 - Manaus, AM"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">
            Telefone
          </label>
          <input
            type="text"
            value={phone || ''}
            onChange={(e) => onChange('phone', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
            placeholder="Ex: (92) 98842-5424"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">
            E-mail
          </label>
          <input
            type="email"
            value={email || ''}
            onChange={(e) => onChange('email', e.target.value)}
            className="block w-full rounded-lg border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-white dark:bg-gray-800"
            placeholder="Ex: contato@empresa.com.br"
          />
        </div>
      </div>
    </section>
  );
}
