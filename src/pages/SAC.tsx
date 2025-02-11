import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { FAQ } from '../types/company'
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react'

export function SAC() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [openFaq, setOpenFaq] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
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
      } finally {
        setLoading(false)
      }
    }

    loadFaqs()
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const categories = ['all', ...new Set(faqs.map((faq) => faq.category))]
  const filteredFaqs =
    selectedCategory === 'all'
      ? faqs
      : faqs.filter((faq) => faq.category === selectedCategory)

  const categoryLabels: Record<string, string> = {
    all: 'Todas as Categorias',
    rental: 'Aluguel',
    payment: 'Pagamento',
    return: 'Devolução',
    maintenance: 'Manutenção',
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold">Central de Ajuda</h1>

      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                selectedCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {categoryLabels[category]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredFaqs.map((faq) => (
          <div
            key={faq.id}
            className="rounded-lg border bg-white"
          >
            <button
              onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
              className="flex w-full items-center justify-between p-4 text-left"
            >
              <span className="text-lg font-medium">{faq.question}</span>
              {openFaq === faq.id ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
            {openFaq === faq.id && (
              <div className="border-t p-4">
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
