import { useEffect, useRef } from 'react'
import EditorJS from '@editorjs/editorjs'
import Header from '@editorjs/header'
import List from '@editorjs/list'
import Paragraph from '@editorjs/paragraph'
import ImageTool from '@editorjs/image'
import { supabase } from '../lib/supabase'

interface EditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function Editor({ value, onChange, placeholder }: EditorProps) {
  const editorRef = useRef<EditorJS | null>(null)

  useEffect(() => {
    if (!editorRef.current) {
      initEditor()
    }
    return () => {
      if (editorRef.current) {
        editorRef.current.destroy()
        editorRef.current = null
      }
    }
  }, [])

  async function initEditor() {
    const EditorJS = (await import('@editorjs/editorjs')).default
    const Header = (await import('@editorjs/header')).default
    const List = (await import('@editorjs/list')).default
    const ImageTool = (await import('@editorjs/image')).default

    if (!editorRef.current) {
      editorRef.current = new EditorJS({
        holder: 'editor',
        tools: {
          header: {
            class: Header,
            config: {
              levels: [2, 3, 4],
              defaultLevel: 2
            }
          },
          list: {
            class: List,
            inlineToolbar: true
          },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                uploadByFile: async (file: File) => {
                  try {
                    const fileExt = file.name.split('.').pop()
                    const fileName = `${Math.random()}.${fileExt}`
                    const filePath = `editor/${fileName}`

                    const { error: uploadError } = await supabase.storage
                      .from('public')
                      .upload(filePath, file)

                    if (uploadError) throw uploadError

                    const { data: { publicUrl } } = supabase.storage
                      .from('public')
                      .getPublicUrl(filePath)

                    return {
                      success: 1,
                      file: {
                        url: publicUrl
                      }
                    }
                  } catch (error) {
                    console.error('Error uploading image:', error)
                    return {
                      success: 0,
                      error
                    }
                  }
                }
              }
            }
          }
        },
        data: value ? JSON.parse(value) : {},
        placeholder: placeholder || 'Comece a escrever aqui...',
        onChange: async () => {
          const content = await editorRef.current?.save()
          onChange(JSON.stringify(content))
        },
      })
    }
  }

  return <div id="editor" className="min-h-[400px] border rounded-md p-4" />
}
