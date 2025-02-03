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
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
            placeholder="Ex: contato@nortec.com.br"
          />
        </div>
      </div>
    </section>
  );
}
