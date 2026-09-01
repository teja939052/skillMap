import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { competencyApi } from '@/api/competency';
import { getErrorMessage } from '@/api/client';

export function useCompetencies(params?: { type?: string; domain?: string; search?: string }) {
  return useQuery({
    queryKey: ['competencies', params],
    queryFn: async () => {
      const response = await competencyApi.getCompetencies({ page: 1, limit: 50, order: 'asc', ...params });
      return response.data;
    },
  });
}

export function useCompetency(id: string) {
  return useQuery({
    queryKey: ['competency', id],
    queryFn: async () => {
      const response = await competencyApi.getCompetency(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useRoleBlueprints() {
  return useQuery({
    queryKey: ['role-blueprints'],
    queryFn: async () => {
      const response = await competencyApi.getRoleBlueprints({ page: 1, limit: 50, order: 'asc' });
      return response.data;
    },
  });
}

export function useCreateCompetency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: competencyApi.createCompetency,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competencies'] });
    },
  });
}

export function useUpdateCompetency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof competencyApi.updateCompetency>[1] }) =>
      competencyApi.updateCompetency(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competencies'] });
    },
  });
}

export function useCompetencyActions() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: competencyApi.createCompetency,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competencies'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: competencyApi.deleteCompetency,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competencies'] });
    },
  });

  return {
    create: createMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
    error: createMutation.error ? getErrorMessage(createMutation.error) : null,
  };
}
