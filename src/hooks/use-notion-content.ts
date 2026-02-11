import { useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getBenefits,
  getCarouselSlides,
  getFeatures,
  getServices,
  getTermsSections,
} from '@/lib/services/notion-content.service'

const CONTENT_QUERY_KEY = 'notionContent'

export const useCarouselSlides = () => {
  return useQuery({
    gcTime: 30 * 60 * 1000,
    queryFn: () => getCarouselSlides(),
    queryKey: [CONTENT_QUERY_KEY, 'slides'],
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })
}

export const useServices = (full = false) => {
  return useQuery({
    gcTime: 30 * 60 * 1000,
    queryFn: () => getServices(full),
    queryKey: [CONTENT_QUERY_KEY, 'services', full],
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })
}

export const useBenefits = (page: 'landing' | 'membership' = 'landing') => {
  return useQuery({
    gcTime: 30 * 60 * 1000,
    queryFn: () => getBenefits(page),
    queryKey: [CONTENT_QUERY_KEY, 'benefits', page],
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })
}

export const useFeatures = () => {
  return useQuery({
    gcTime: 30 * 60 * 1000,
    queryFn: () => getFeatures(),
    queryKey: [CONTENT_QUERY_KEY, 'features'],
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })
}

export const useTermsSections = () => {
  return useQuery({
    gcTime: 30 * 60 * 1000,
    queryFn: () => getTermsSections(),
    queryKey: [CONTENT_QUERY_KEY, 'terms'],
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })
}

export const usePrefetchServices = () => {
  const queryClient = useQueryClient()

  return () => {
    void queryClient.prefetchQuery({
      queryFn: () => getServices(true),
      queryKey: [CONTENT_QUERY_KEY, 'services', true],
      staleTime: 5 * 60 * 1000,
    })
  }
}

export const usePrefetchTerms = () => {
  const queryClient = useQueryClient()

  return () => {
    void queryClient.prefetchQuery({
      queryFn: () => getTermsSections(),
      queryKey: [CONTENT_QUERY_KEY, 'terms'],
      staleTime: 5 * 60 * 1000,
    })
  }
}

export const useInvalidateContent = () => {
  const queryClient = useQueryClient()

  return () => {
    void queryClient.invalidateQueries({ queryKey: [CONTENT_QUERY_KEY] })
  }
}
