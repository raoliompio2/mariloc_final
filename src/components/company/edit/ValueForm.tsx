import { Form } from "../../../components/ui/form"
import { Input } from "../../../components/ui/input"
import { Textarea } from "../../../components/ui/textarea"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "../../../components/ui/form"
import { UseFormReturn } from "react-hook-form"
import { ImageUploadField } from "./ImageUploadField"
import { SaveButton } from "./SaveButton"
import { Card } from "../../../components/ui/card"

interface ValueFormProps {
  form: UseFormReturn<any>
  onSubmit: (data: any) => Promise<void>
  saving: boolean
  handleImageUpload: (file: File, folder: string) => Promise<string | null>
}

export function ValueForm({
  form,
  onSubmit,
  saving,
  handleImageUpload
}: ValueFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="p-6">
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Informações do Valor</h3>
              <p className="text-sm text-gray-500 mt-1">
                Preencha as informações abaixo para adicionar um novo valor à sua empresa
              </p>
            </div>

            <div className="grid gap-8">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Nome do Valor</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Ex: Excelência" 
                          className="border-gray-200 focus:border-primary h-11"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Ícone
                        <span className="block text-xs font-normal text-gray-500 mt-0.5">
                          Nome do ícone do Lucide React
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Ex: Trophy" 
                          className="border-gray-200 focus:border-primary h-11"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Descrição do Valor
                      <span className="block text-xs font-normal text-gray-500 mt-0.5">
                        Explique o significado deste valor para sua empresa
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Ex: Buscamos a excelência em tudo o que fazemos..." 
                        className="border-gray-200 focus:border-primary min-h-[120px] resize-none"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <ImageUploadField
                form={form}
                name="image_url"
                label="Imagem Ilustrativa"
                folder="values"
                handleImageUpload={handleImageUpload}
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <SaveButton saving={saving} text="Adicionar Valor" />
        </div>
      </form>
    </Form>
  )
}
