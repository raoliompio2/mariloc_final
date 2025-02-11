import { z } from 'zod';

// Schemas comuns que podem ser reutilizados
export const emailSchema = z
  .string()
  .email('Email inválido')
  .min(1, 'Email é obrigatório');

export const phoneSchema = z
  .string()
  .min(10, 'Telefone deve ter pelo menos 10 dígitos')
  .max(11, 'Telefone não pode ter mais que 11 dígitos')
  .regex(/^\d+$/, 'Telefone deve conter apenas números');

export const cpfCnpjSchema = z
  .string()
  .min(11, 'CPF/CNPJ deve ter pelo menos 11 dígitos')
  .max(14, 'CPF/CNPJ não pode ter mais que 14 dígitos')
  .regex(/^\d+$/, 'CPF/CNPJ deve conter apenas números');

// Schema para endereço
export const addressSchema = z.object({
  street: z.string().min(1, 'Rua é obrigatória'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().length(2, 'Estado deve ter 2 letras'),
  postalCode: z.string().length(8, 'CEP deve ter 8 dígitos'),
});

// Schema para orçamento
export const quoteSchema = z.object({
  machineId: z.string().uuid('ID da máquina inválido'),
  rentalPeriod: z.string().min(1, 'Período de aluguel é obrigatório'),
  deliveryAddress: addressSchema,
  observations: z.string().optional(),
  accessories: z.array(z.string().uuid()).optional(),
});

// Schema para perfil do usuário
export const profileSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: emailSchema,
  phone: phoneSchema,
  cpfCnpj: cpfCnpjSchema,
  address: addressSchema,
});

// Schema para máquina
export const machineSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  categoryId: z.string().uuid('Categoria inválida'),
  secondaryCategoryId: z.string().uuid('Categoria secundária inválida').optional(),
  specifications: z.array(z.object({
    key: z.string().min(1, 'Nome da especificação é obrigatório'),
    value: z.string().min(1, 'Valor da especificação é obrigatório'),
  })).optional(),
});

// Hook personalizado para usar com react-hook-form
export const useZodForm = <T extends z.ZodType>(schema: T) => {
  return {
    validate: (data: unknown) => {
      try {
        schema.parse(data);
        return { success: true, data: data as z.infer<T> };
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errors = error.errors.reduce((acc, curr) => {
            const path = curr.path.join('.');
            acc[path] = curr.message;
            return acc;
          }, {} as Record<string, string>);
          return { success: false, errors };
        }
        return { success: false, errors: { _: 'Erro de validação desconhecido' } };
      }
    }
  };
};
