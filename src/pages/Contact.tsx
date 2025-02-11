import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { ContactInfo } from '../types/company'
import { Loader2, Phone, Mail, MessageSquare, MapPin } from 'lucide-react'

function Contact() {
  const [contacts, setContacts] = useState<ContactInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
      } finally {
        setLoading(false)
      }
    }

    loadContacts()
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'phone':
        return <Phone className="h-6 w-6" />
      case 'email':
        return <Mail className="h-6 w-6" />
      case 'whatsapp':
        return <MessageSquare className="h-6 w-6" />
      case 'address':
        return <MapPin className="h-6 w-6" />
      default:
        return null
    }
  }

  const getContactLink = (contact: ContactInfo) => {
    switch (contact.type) {
      case 'phone':
        return `tel:${contact.value.replace(/\D/g, '')}`
      case 'email':
        return `mailto:${contact.value}`
      case 'whatsapp':
        return `https://wa.me/${contact.value.replace(/\D/g, '')}`
      default:
        return '#'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold">Entre em Contato</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {contacts.map((contact) => (
          <a
            key={contact.id}
            href={getContactLink(contact)}
            target={contact.type === 'whatsapp' ? '_blank' : undefined}
            rel={contact.type === 'whatsapp' ? 'noopener noreferrer' : undefined}
            className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-gray-50"
          >
            {getIcon(contact.type)}
            <div>
              <p className="text-sm font-medium uppercase text-gray-500">
                {contact.type}
              </p>
              <p className="text-lg">{contact.value}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

export { Contact }
