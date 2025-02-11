import { supabase } from './supabase'

export type UploadOptions = {
  bucket: string
  path: string
  file: File
  maxSize?: number // em bytes
  allowedTypes?: string[]
}

export class UploadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UploadError'
  }
}

export async function uploadFile({
  bucket,
  path,
  file,
  maxSize = 5 * 1024 * 1024, // 5MB por padrão
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
}: UploadOptions): Promise<string> {
  try {
    // Validações
    if (!file) {
      throw new UploadError('Nenhum arquivo selecionado')
    }

    if (!allowedTypes.includes(file.type)) {
      throw new UploadError(`Tipo de arquivo não permitido. Tipos permitidos: ${allowedTypes.join(', ')}`)
    }

    if (file.size > maxSize) {
      throw new UploadError(`Arquivo muito grande. Tamanho máximo permitido: ${maxSize / 1024 / 1024}MB`)
    }

    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${path}/${fileName}`

    // Upload do arquivo
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw new UploadError('Erro ao fazer upload do arquivo')
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    if (!publicUrl) {
      throw new UploadError('Erro ao gerar URL pública do arquivo')
    }

    return publicUrl
  } catch (error) {
    if (error instanceof UploadError) {
      throw error
    }
    throw new UploadError('Erro inesperado ao fazer upload do arquivo')
  }
}
