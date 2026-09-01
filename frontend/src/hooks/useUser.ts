import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/api/user';
import { getErrorMessage } from '@/api/client';
import type { UpdateUserInput } from '@/types';

export function useUser() {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async () => {
      const response = await userApi.getProfile();
      return response.data;
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateUserInput) => userApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error ? getErrorMessage(profileQuery.error) : null,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
  };
}
