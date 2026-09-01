import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@skill-map/contracts/src/auth.ts';
import { Sparkles, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import Card, { CardContent } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser, isRegistering, registerError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'student' },
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      await registerUser(data);
    } catch {
      // error handled by hook
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-navy-900">Skill Map</span>
          </Link>
          <h1 className="text-2xl font-bold text-navy-900">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1">Start building your competency passport</p>
        </div>

        <Card>
          <CardContent className="py-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {registerError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
                  {registerError}
                </div>
              )}

              <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                icon={<User className="h-4 w-4 text-gray-400" />}
                error={errors.name?.message}
                {...register('name')}
              />

              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                icon={<Mail className="h-4 w-4 text-gray-400" />}
                error={errors.email?.message}
                {...register('email')}
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  icon={<Lock className="h-4 w-4 text-gray-400" />}
                  error={errors.password?.message}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1.5">I am a</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'student', label: 'Student' },
                    { value: 'faculty', label: 'Faculty' },
                    { value: 'industry', label: 'Industry' },
                    { value: 'institution_admin', label: 'Institution Admin' },
                  ].map((role) => (
                    <label key={role.value} className="cursor-pointer">
                      <input
                        type="radio"
                        value={role.value}
                        className="peer sr-only"
                        {...register('role')}
                      />
                      <div className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-center text-gray-600 peer-checked:border-accent peer-checked:bg-accent/5 peer-checked:text-accent transition-all">
                        {role.label}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" isLoading={isRegistering}>
                Create Account
              </Button>

              <p className="text-xs text-gray-500 text-center">
                By creating an account, you agree to our{' '}
                <Link to="/terms" className="text-accent hover:text-accent-dark font-medium">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-accent hover:text-accent-dark font-medium">Privacy Policy</Link>.
              </p>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:text-accent-dark font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
