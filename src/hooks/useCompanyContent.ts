import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import {
  CompanyHero,
  CompanyMissionVisionValue,
  CompanyTimeline,
  CompanyValue,
  CompanySector,
  CompanyCertification,
} from '../types/company'

export function useCompanyContent() {
  const queryClient = useQueryClient()

  const { data: hero, isLoading: isLoadingHero, refetch: refetchHero } = useQuery<CompanyHero[]>({
    queryKey: ['company-hero'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_hero')
        .select('id, title, subtitle, video_url, poster_url, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar hero:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    cacheTime: 1000 * 60 * 30, // 30 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false
  })

  const { data: missionVisionValues, isLoading: isLoadingMVV } = useQuery<CompanyMissionVisionValue[]>({
    queryKey: ['company-mission-vision-values'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_mission_vision_values')
        .select('*')
        .order('type')

      if (error) throw error
      return data || []
    },
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false
  })

  const { data: timeline, isLoading: isLoadingTimeline } = useQuery<CompanyTimeline[]>({
    queryKey: ['company-timeline'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_timeline')
        .select('*')
        .order('year')

      if (error) throw error
      return data || []
    },
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false
  })

  const { data: values, isLoading: isLoadingValues } = useQuery<CompanyValue[]>({
    queryKey: ['company-values'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_values')
        .select('*')

      if (error) throw error
      return data || []
    },
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false
  })

  const { data: sectors, isLoading: isLoadingSectors } = useQuery<CompanySector[]>({
    queryKey: ['company-sectors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_sectors')
        .select('*')

      if (error) throw error
      return data || []
    },
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false
  })

  const { data: certifications, isLoading: isLoadingCertifications } = useQuery<CompanyCertification[]>({
    queryKey: ['company-certifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_certifications')
        .select('*')

      if (error) throw error
      return data || []
    },
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false
  })

  // Combina todos os estados de loading em um único
  const isLoading = isLoadingHero || isLoadingMVV || isLoadingTimeline || isLoadingValues || isLoadingSectors || isLoadingCertifications

  return {
    hero: hero || [],
    missionVisionValues: missionVisionValues || [],
    timeline: timeline || [],
    values: values || [],
    sectors: sectors || [],
    certifications: certifications || [],
    isLoading,
    refetch: refetchHero
  }
}
