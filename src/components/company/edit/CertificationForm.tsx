import { Form } from "../../../components/ui/form"
import { Input } from "../../../components/ui/input"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "../../../components/ui/form"
import { UseFormReturn } from "react-hook-form"
import { ImageUploadField } from "./ImageUploadField"
import { SaveButton } from "./SaveButton"

interface CertificationFormProps {
  form: UseFormReturn<any>
  onSubmit: (data: any) => Promise<void>
  saving: boolean
  handleImageUpload: (file: File, folder: string) => Promise<string | null>
}

export function CertificationForm({
  form,
  onSubmit,
  saving,
  handleImageUpload
}: CertificationFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Nome da Certificação</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Ex: ISO 9001" 
                    className="border-gray-200 focus:border-primary h-11"
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <ImageUploadField
            form={form}
            name="image_url"
            label="Logo da Certificação"
            folder="certifications"
            handleImageUpload={handleImageUpload}
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <SaveButton saving={saving} text="Adicionar Certificação" />
        </div>
      </form>
    </Form>
  )
}
