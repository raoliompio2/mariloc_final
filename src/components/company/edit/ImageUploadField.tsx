import { Button } from "../../../components/ui/button"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../../components/ui/form"
import { Input } from "../../../components/ui/input"
import { Upload, Eye } from "lucide-react"
import { UseFormReturn } from "react-hook-form"

interface ImageUploadFieldProps {
  form: UseFormReturn<any>
  name: string
  label: string
  folder: string
  handleImageUpload: (file: File, folder: string) => Promise<string | null>
}

export function ImageUploadField({
  form,
  name,
  label,
  folder,
  handleImageUpload
}: ImageUploadFieldProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-gray-700 font-medium">{label}</FormLabel>
          <div className="flex gap-6 items-start">
            {field.value && (
              <div className="relative group">
                <img 
                  src={field.value} 
                  alt="Preview" 
                  className="h-40 w-64 object-cover rounded-lg border border-gray-200 shadow-sm"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <Eye className="h-6 w-6 text-white" />
                </div>
              </div>
            )}
            <div className="flex-1 space-y-3">
              <FormControl>
                <Input 
                  {...field} 
                  type="url" 
                  placeholder="URL da imagem" 
                  className="border-gray-200 focus:border-primary h-11"
                />
              </FormControl>
              <Button 
                type="button" 
                variant="outline"
                className="w-full justify-center border-dashed hover:border-primary hover:bg-primary/5"
                onClick={async () => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = 'image/*'
                  input.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (file) {
                      const url = await handleImageUpload(file, folder)
                      if (url) form.setValue(name, url)
                    }
                  }
                  input.click()
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Imagem
              </Button>
            </div>
          </div>
          <FormMessage className="text-red-500" />
        </FormItem>
      )}
    />
  )
}
