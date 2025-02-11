import React from 'react';
import { useForm } from '../../hooks/useForm';
import { useAnalytics } from '../../hooks/useAnalytics';
import { FormInput } from '../common/FormInput';
import { LoadingButton } from '../common/LoadingOverlay';
import { handleError } from '../../utils/error-handler';
import { supabase } from '../../lib/api-client';
import { z } from 'zod';

const responseSchema = z.object({
  response: z.string().min(1, 'A resposta é obrigatória'),
  responsePrice: z.number().min(0, 'O preço deve ser maior que zero'),
});

interface QuoteResponseProps {
  quoteId: string;
  onSuccess?: () => void;
}

export function QuoteResponse({ quoteId, onSuccess }: QuoteResponseProps) {
  const { trackQuoteResponded, trackError } = useAnalytics();
  const startTime = React.useRef(Date.now());

  const form = useForm(responseSchema, {
    onSubmit: async (data) => {
      try {
        const responseTime = Date.now() - startTime.current;

        const { data: quote, error } = await supabase
          .from('quotes')
          .update({
            response: data.response,
            response_price: data.responsePrice,
            status: 'answered',
          })
          .eq('id', quoteId)
          .select()
          .single();

        if (error) throw error;

        // Rastrear resposta ao orçamento
        trackQuoteResponded(quoteId, 'answered', {
          response_time: responseTime,
          response_price: data.responsePrice,
        });

        onSuccess?.();
      } catch (error) {
        trackError(error as Error, { context: 'quote_response' });
        handleError(error);
      }
    },
  });

  const handleReject = async () => {
    try {
      const responseTime = Date.now() - startTime.current;

      const { data: quote, error } = await supabase
        .from('quotes')
        .update({
          status: 'rejected',
          response: 'Orçamento rejeitado',
        })
        .eq('id', quoteId)
        .select()
        .single();

      if (error) throw error;

      // Rastrear rejeição do orçamento
      trackQuoteResponded(quoteId, 'rejected', {
        response_time: responseTime,
      });

      onSuccess?.();
    } catch (error) {
      trackError(error as Error, { context: 'quote_rejection' });
      handleError(error);
    }
  };

  return (
    <form onSubmit={form.handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Sua Resposta
        </label>
        <textarea
          {...form.register('response')}
          className="w-full px-3 py-2 border rounded-md"
          rows={4}
          placeholder="Detalhes sobre o orçamento, condições especiais..."
        />
        {form.formState.errors.response && (
          <p className="text-sm text-red-500">
            {form.formState.errors.response.message}
          </p>
        )}
      </div>

      <FormInput
        label="Preço (R$)"
        name="responsePrice"
        type="number"
        register={form.register}
        error={form.formState.errors.responsePrice}
        required
        placeholder="0.00"
      />

      <div className="flex gap-4">
        <LoadingButton
          type="submit"
          loading={form.formState.isSubmitting}
          loadingText="Enviando..."
          className="flex-1 bg-primary text-white"
        >
          Aprovar e Responder
        </LoadingButton>

        <LoadingButton
          type="button"
          onClick={handleReject}
          loading={form.formState.isSubmitting}
          loadingText="Rejeitando..."
          className="flex-1 bg-red-500 text-white"
        >
          Rejeitar
        </LoadingButton>
      </div>
    </form>
  );
}
