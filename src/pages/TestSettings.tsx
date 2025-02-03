import React, { useEffect, useState } from 'react';
import { testSystemSettings } from '../services/systemSettings';
import { SystemSettings } from '../types/system';

export const TestSettings: React.FC = () => {
  const [result, setResult] = useState<SystemSettings | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const runTest = async () => {
      try {
        const settings = await testSystemSettings();
        setResult(settings);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      }
    };

    runTest();
  }, []);

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Erro ao testar configurações</h1>
        <pre className="bg-red-100 p-4 rounded">{error}</pre>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Testando configurações...</h1>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Configurações inseridas com sucesso</h1>
      <div className="space-y-4">
        <div>
          <h2 className="font-bold">Dados da empresa:</h2>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(
              {
                company_name: result.company_name,
                address: result.address,
                phone: result.phone,
                email: result.email,
              },
              null,
              2
            )}
          </pre>
        </div>

        <div>
          <h2 className="font-bold">Links rápidos:</h2>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(result.quick_links, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="font-bold">Logos em destaque:</h2>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(result.featured_logos, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
