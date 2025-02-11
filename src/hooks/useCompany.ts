import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

interface Company {
  id: string
  name: string
  logo_url?: string
  created_at: string
  updated_at: string
  user_id: string
}

export function useCompany() {
  const { user } = useAuth()
  const [company, setCompany] = useState<Company | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchCompany() {
      if (!user?.id) {
        setCompany(null)
        setIsLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('company')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error) throw error

        setCompany(data)
      } catch (err) {
        console.error('Error fetching company:', err)
        setError(err instanceof Error ? err : new Error('Failed to fetch company'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompany()
  }, [user?.id])

  return { company, isLoading, error }
}
