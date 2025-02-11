import React from 'react';
import { useForm } from '../../hooks/useForm';
import { useAnalytics } from '../../hooks/useAnalytics';
import { FormInput } from '../common/FormInput';
import { LoadingButton } from '../common/LoadingOverlay';
import { quoteSchema } from '../../utils/validation-schemas';
import { handleError } from '../../utils/error-handler';
import { supabase } from '../../lib/api-client';

interface QuoteFormProps {
  machineId: string;
  onSuccess?: () => void;
}

export function QuoteForm({ machineId, onSuccess }: QuoteFormProps) {
  const { trackQuoteCreated, trackError } = useAnalytics();
  const startTime = React.useRef(Date.now());

  const form = useForm(quoteSchema, {
    onSubmit: async (data) => {
      try {
        const { data: quote, error } = await supabase
          .from('quotes')
          .insert({
            machine_id: machineId,
            rental_period: data.rentalPeriod,
            delivery_address: data.deliveryAddress,
            observations: data.observations,
            status: 'pending',
          })
          .select()
          .single();

        if (error) throw error;

        // Rastrear criação do orçamento com tempo de preenchimento
        trackQuoteCreated({
          ...quote,
          form_fill_time_ms: Date.now() - startTime.current,
        });

        onSuccess?.();
      } catch (error) {
        trackError(error as Error, { context: 'quote_creation' });
        handleError(error);
      }
    },
  });

  return (
    <form onSubmit={form.handleSubmit} className="space-y-4">
      <FormInput
        label="Período de Aluguel"
        name="rentalPeriod"
        register={form.register}
        error={form.formState.errors.rentalPeriod}
        required
        placeholder="Ex: 5 dias"
      />

      <FormInput
        label="Endereço de Entrega"
        name="deliveryAddress"
        register={form.register}
        error={form.formState.errors.deliveryAddress}
        required
        placeholder="Rua, número, bairro, cidade - Estado"
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Observações
        </label>
        <textarea
          {...form.register('observations')}
          className="w-full px-3 py-2 border rounded-md"
          rows={4}
          placeholder="Informações adicionais sobre o aluguel..."
        />
      </div>

      <LoadingButton
        type="submit"
        loading={form.formState.isSubmitting}
        loadingText="Enviando..."
        className="w-full bg-primary text-white"
      >
        Solicitar Orçamento
      </LoadingButton>
    </form>
  );
}
