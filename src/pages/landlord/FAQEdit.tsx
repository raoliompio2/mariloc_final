import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { FAQ } from '../../types/company'
import { Loader2, Plus, Trash2, GripVertical } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { useToast } from '../../components/ui/use-toast'

export function FAQEdit() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadFaqs()
  }, [])

  async function loadFaqs() {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('order_index', { ascending: true })

      if (error) throw error
      setFaqs(data || [])
    } catch (error) {
      console.error('Error loading FAQs:', error)
      toast({
        variant: "destructive",
        title: "Erro ao carregar FAQs",
        description: "Não foi possível carregar as perguntas frequentes."
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleAddFaq() {
    const newFaq: Partial<FAQ> = {
      question: '',
      answer: '',
      category: 'rental',
      order_index: faqs.length
    }

    try {
      const { data, error } = await supabase
        .from('faqs')
        .insert([newFaq])
        .select()

      if (error) throw error
      if (data) {
        setFaqs([...faqs, data[0]])
      }
    } catch (error) {
      console.error('Error adding FAQ:', error)
      toast({
        variant: "destructive",
        title: "Erro ao adicionar FAQ",
        description: "Não foi possível adicionar a nova pergunta."
      })
    }
  }

  async function handleUpdateFaq(faq: FAQ) {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('faqs')
        .update({
          question: faq.question,
          answer: faq.answer,
          category: faq.category,
          order_index: faq.order_index,
          updated_at: new Date().toISOString()
        })
        .eq('id', faq.id)

      if (error) throw error

      toast({
        title: "Sucesso!",
        description: "FAQ atualizada com sucesso."
      })
    } catch (error) {
      console.error('Error updating FAQ:', error)
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar a FAQ."
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteFaq(id: string) {
    try {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', id)

      if (error) throw error
      setFaqs(faqs.filter(faq => faq.id !== id))

      toast({
        title: "Sucesso!",
        description: "FAQ removida com sucesso."
      })
    } catch (error) {
      console.error('Error deleting FAQ:', error)
      toast({
        variant: "destructive",
        title: "Erro ao remover",
        description: "Não foi possível remover a FAQ."
      })
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold">Editar FAQs</h1>
        <Button onClick={handleAddFaq}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar FAQ
        </Button>
      </div>

      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div
            key={faq.id}
            className="flex gap-4 rounded-lg border p-4"
          >
            <div className="flex items-center">
              <GripVertical className="h-5 w-5 text-gray-400" />
            </div>

            <div className="flex-1 space-y-4">
              <Input
                value={faq.question}
                onChange={(e) =>
                  handleUpdateFaq({ ...faq, question: e.target.value })
                }
                placeholder="Pergunta"
              />

              <Textarea
                value={faq.answer}
                onChange={(e) =>
                  handleUpdateFaq({ ...faq, answer: e.target.value })
                }
                placeholder="Resposta"
                rows={3}
              />

              <div className="flex items-center gap-4">
                <Select
                  value={faq.category}
                  onValueChange={(value: 'rental' | 'payment' | 'return' | 'maintenance') =>
                    handleUpdateFaq({ ...faq, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rental">Aluguel</SelectItem>
                    <SelectItem value="payment">Pagamento</SelectItem>
                    <SelectItem value="return">Devolução</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  value={faq.order_index}
                  onChange={(e) =>
                    handleUpdateFaq({
                      ...faq,
                      order_index: parseInt(e.target.value) || 0
                    })
                  }
                  placeholder="Ordem"
                  className="w-24"
                />

                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDeleteFaq(faq.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
