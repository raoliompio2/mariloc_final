import React from 'react';
import { MessageCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { StepIndicator } from './StepIndicator';

interface FormData {
  rentalPeriod: string;
  observations: string;
  deliveryAddress: string;
  name: string;
  phone: string;
  email: string;
}

interface QuoteFormProps {
  currentStep: string;
  formData: FormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onPrevStep: () => void;
  onNextStep: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  machine: any;
  accessories: any[];
  selectedAccessories: string[];
  onAccessoryToggle: (id: string) => void;
}

const steps = [
  { label: 'Locação', value: 'rental' },
  { label: 'Contato', value: 'contact' },
  { label: 'Revisão', value: 'review' }
];

export function QuoteForm({
  currentStep,
  formData,
  onInputChange,
  onPrevStep,
  onNextStep,
  onSubmit,
  submitting,
  machine,
  accessories,
  selectedAccessories,
  onAccessoryToggle
}: QuoteFormProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <StepIndicator steps={steps} currentStep={currentStep} />

      <div className="bg-white dark:bg-secondary rounded-xl shadow-lg p-6">
        {currentStep === 'rental' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-text mb-6">Detalhes da Locação</h2>
            
            {/* Machine Info */}
            <div className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <img
                src={machine.mainImageUrl}
                alt={machine.name}
                className="w-24 h-24 object-contain"
              />
              <div>
                <h3 className="text-lg font-semibold text-text">{machine.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{machine.description}</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Período de Locação
                </label>
                <input
                  type="text"
                  name="rentalPeriod"
                  value={formData.rentalPeriod}
                  onChange={onInputChange}
                  placeholder="Ex: 1 semana, 2 meses"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Endereço de Entrega
                </label>
                <input
                  type="text"
                  name="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={onInputChange}
                  placeholder="Endereço completo"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Observações (Opcional)
                </label>
                <textarea
                  name="observations"
                  value={formData.observations}
                  onChange={onInputChange}
                  placeholder="Informações adicionais"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                  rows={3}
                />
              </div>
            </div>

            {/* Accessories */}
            {accessories.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-text mb-4">
                  Acessórios Disponíveis
                </h3>
                <div className="space-y-4">
                  {accessories.map((accessory) => (
                    <label
                      key={accessory.id}
                      className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAccessories.includes(accessory.id)}
                        onChange={() => onAccessoryToggle(accessory.id)}
                        className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <div className="flex-1">
                        <div className="flex gap-4">
                          {accessory.mainImageUrl && (
                            <img
                              src={accessory.mainImageUrl}
                              alt={accessory.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div>
                            <h4 className="font-medium text-text">
                              {accessory.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                              {accessory.description}
                            </p>
                            <p className="text-sm font-medium text-primary mt-1">
                              R$ {accessory.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {currentStep === 'contact' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-text mb-6">Seus Dados</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={onInputChange}
                  placeholder="Seu nome completo"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={onInputChange}
                  placeholder="(00) 00000-0000"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  E-mail
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={onInputChange}
                  placeholder="seu@email.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 'review' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-text mb-6">Revisar Solicitação</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-text mb-2">Máquina</h3>
                <p>{machine.name}</p>
              </div>

              {selectedAccessories.length > 0 && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h3 className="font-semibold text-text mb-2">Acessórios Selecionados</h3>
                  <ul className="list-disc list-inside">
                    {accessories
                      .filter(acc => selectedAccessories.includes(acc.id))
                      .map(acc => (
                        <li key={acc.id}>{acc.name}</li>
                      ))}
                  </ul>
                </div>
              )}

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-text mb-2">Detalhes da Locação</h3>
                <div className="space-y-2">
                  <p><strong>Período:</strong> {formData.rentalPeriod}</p>
                  <p><strong>Endereço de Entrega:</strong> {formData.deliveryAddress}</p>
                  {formData.observations && (
                    <p><strong>Observações:</strong> {formData.observations}</p>
                  )}
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-text mb-2">Seus Dados</h3>
                <div className="space-y-2">
                  <p><strong>Nome:</strong> {formData.name}</p>
                  <p><strong>Telefone:</strong> {formData.phone}</p>
                  <p><strong>E-mail:</strong> {formData.email}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          {currentStep !== 'rental' && (
            <button
              onClick={onPrevStep}
              className="flex items-center px-6 py-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar
            </button>
          )}
          {currentStep === 'review' ? (
            <button
              onClick={onSubmit}
              disabled={submitting}
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 ml-auto"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Enviar via WhatsApp
                </>
              )}
            </button>
          ) : (
            <button
              onClick={onNextStep}
              className="flex items-center px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 ml-auto"
            >
              Próximo
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}