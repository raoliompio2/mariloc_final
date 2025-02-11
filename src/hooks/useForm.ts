import { useForm as useHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { handleError } from '../utils/error-handler';

interface UseFormOptions<T> {
  onSubmit: (data: T) => Promise<void> | void;
  defaultValues?: Partial<T>;
}

export function useForm<T extends z.ZodType>(
  schema: T,
  { onSubmit, defaultValues }: UseFormOptions<z.infer<T>>
) {
  const form = useHookForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      handleError(error);
    }
  });

  return {
    ...form,
    handleSubmit,
    // Helper para mostrar erros de forma amigável
    getFieldError: (field: keyof z.infer<T>) => {
      const error = form.formState.errors[field as string];
      return error?.message as string | undefined;
    },
  };
}
