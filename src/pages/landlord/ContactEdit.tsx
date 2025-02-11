import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { ContactInfo } from '../../types/company'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Switch } from '../../components/ui/switch'
import { useToast } from '../../components/ui/use-toast'

export function ContactEdit() {
  const [contacts, setContacts] = useState<ContactInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadContacts()
  }, [])

  async function loadContacts() {
    try {
      const { data, error } = await supabase
        .from('contact_info')
        .select('*')
        .order('is_primary', { ascending: false })

      if (error) throw error
      setContacts(data || [])
    } catch (error) {
      console.error('Error loading contacts:', error)
      toast({
        variant: "destructive",
        title: "Erro ao carregar contatos",
        description: "Não foi possível carregar as informações de contato."
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleAddContact() {
    const newContact: Partial<ContactInfo> = {
      type: 'phone',
      value: '',
      is_primary: false
    }

    try {
      const { data, error } = await supabase
        .from('contact_info')
        .insert([newContact])
        .select()

      if (error) throw error
      if (data) {
        setContacts([...contacts, data[0]])
      }
    } catch (error) {
      console.error('Error adding contact:', error)
      toast({
        variant: "destructive",
        title: "Erro ao adicionar contato",
        description: "Não foi possível adicionar o novo contato."
      })
    }
  }

  async function handleUpdateContact(contact: ContactInfo) {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('contact_info')
        .update({
          type: contact.type,
          value: contact.value,
          is_primary: contact.is_primary,
          updated_at: new Date().toISOString()
        })
        .eq('id', contact.id)

      if (error) throw error

      toast({
        title: "Sucesso!",
        description: "Contato atualizado com sucesso."
      })
    } catch (error) {
      console.error('Error updating contact:', error)
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o contato."
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteContact(id: string) {
    try {
      const { error } = await supabase
        .from('contact_info')
        .delete()
        .eq('id', id)

      if (error) throw error
      setContacts(contacts.filter(contact => contact.id !== id))

      toast({
        title: "Sucesso!",
        description: "Contato removido com sucesso."
      })
    } catch (error) {
      console.error('Error deleting contact:', error)
      toast({
        variant: "destructive",
        title: "Erro ao remover",
        description: "Não foi possível remover o contato."
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
        <h1 className="text-4xl font-bold">Editar Contatos</h1>
        <Button onClick={handleAddContact}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Contato
        </Button>
      </div>

      <div className="space-y-6">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="flex items-start gap-4 rounded-lg border p-4"
          >
            <Select
              value={contact.type}
              onValueChange={(value: 'phone' | 'email' | 'whatsapp' | 'address') =>
                handleUpdateContact({ ...contact, type: value })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo de contato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="phone">Telefone</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="address">Endereço</SelectItem>
              </SelectContent>
            </Select>

            <Input
              value={contact.value}
              onChange={(e) =>
                handleUpdateContact({ ...contact, value: e.target.value })
              }
              placeholder="Valor do contato"
              className="flex-1"
            />

            <div className="flex items-center gap-2">
              <Switch
                checked={contact.is_primary}
                onCheckedChange={(checked) =>
                  handleUpdateContact({ ...contact, is_primary: checked })
                }
              />
              <span className="text-sm">Principal</span>
            </div>

            <Button
              variant="destructive"
              size="icon"
              onClick={() => handleDeleteContact(contact.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
