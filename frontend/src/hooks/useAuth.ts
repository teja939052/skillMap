import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/stores/authStore';
import { getErrorMessage } from '@/api/client';

export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, setTokens, logout } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      if (response.data) {
        setUser(response.data.user);
        setTokens(response.data.tokens);
        const role = response.data.user.role;
        if (role === 'platform_admin') {
          navigate('/admin/dashboard');
        } else if (role === 'institution_admin') {
          navigate('/institution/dashboard');
        } else {
          navigate(`/${role}/dashboard`);
        }
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (response) => {
      if (response.data) {
        setUser(response.data.user);
        setTokens(response.data.tokens);
        navigate('/student/dashboard');
      }
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      logout();
      queryClient.clear();
      navigate('/login');
    },
  });

  return {
    user,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutate,
    loginError: loginMutation.error ? getErrorMessage(loginMutation.error) : null,
    registerError: registerMutation.error ? getErrorMessage(registerMutation.error) : null,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await authApi.getProfile();
      return response.data;
    },
    enabled: !!useAuthStore.getState().isAuthenticated,
  });
}
