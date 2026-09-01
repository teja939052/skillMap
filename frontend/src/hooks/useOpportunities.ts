import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { opportunityApi } from '@/api/opportunity';
import { getErrorMessage } from '@/api/client';

export function useOpportunities(params?: { type?: string; status?: string; search?: string }) {
  return useQuery({
    queryKey: ['opportunities', params],
    queryFn: async () => {
      const response = await opportunityApi.getOpportunities({ page: 1, limit: 20, order: 'desc', ...params });
      return response.data;
    },
  });
}

export function useOpportunity(id: string) {
  return useQuery({
    queryKey: ['opportunity', id],
    queryFn: async () => {
      const response = await opportunityApi.getOpportunity(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useApplications(params?: { status?: string }) {
  return useQuery({
    queryKey: ['applications', params],
    queryFn: async () => {
      const response = await opportunityApi.getApplications({ page: 1, limit: 20, order: 'desc', ...params });
      return response.data;
    },
  });
}

export function useApplyToOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ opportunityId, data }: { opportunityId: string; data: { coverLetter?: string } }) =>
      opportunityApi.applyToOpportunity(opportunityId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}

export function useMatchScore(opportunityId: string) {
  return useQuery({
    queryKey: ['match-score', opportunityId],
    queryFn: async () => {
      const response = await opportunityApi.getMatchScore(opportunityId);
      return response.data;
    },
    enabled: !!opportunityId,
  });
}

export function useOpportunityActions() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: opportunityApi.createOpportunity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof opportunityApi.updateOpportunity>[1] }) =>
      opportunityApi.updateOpportunity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });

  return {
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    error: createMutation.error ? getErrorMessage(createMutation.error) : null,
  };
}
