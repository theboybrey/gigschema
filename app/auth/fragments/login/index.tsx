"use client"

import { LoginAccount, LoginResponse } from '@/app/api/services/user.service'
import { Button } from '@/components/button'
import { Card } from '@/components/card'
import { notifier } from '@/components/notifier'
import { AuthContext } from '@/context/auth.context'
import { useStateValue } from '@/global/state.provider'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useContext, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

interface LoginFormData {
  email: string;
  password: string;
}

const LoginFragment = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { dispatch } = useStateValue()

  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error('LoginPage must be used within AuthProvider');
  }

  const { setAuthState } = auth;

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Invalid email format";
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return true;
  };

  const onSubmit = async (data: LoginFormData) => {
    const emailValidation = validateEmail(data.email);
    if (emailValidation !== true) {
      setError('email', {
        type: 'manual',
        message: emailValidation as string
      });
      return;
    }

    const passwordValidation = validatePassword(data.password);
    if (passwordValidation !== true) {
      setError('password', {
        type: 'manual',
        message: passwordValidation as string
      });
      return;
    }

    setLoading(true);

    try {
      await LoginAccount({
        email: data.email.trim(),
        password: data.password.trim()
      }, setLoading, async (responseData: LoginResponse) => {
        if (responseData && responseData.user) {
          setAuthState(responseData.user, responseData.token);
          dispatch({
            type: 'SET_USER',
            payload: responseData.user
          });
          dispatch({
            type: 'SET_TOKEN',
            payload: responseData.token
          })
          await new Promise(resolve => setTimeout(resolve, 100));
          router.replace("/");
        }
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Login error:', error);

      if (error?.errors) {
        Object.entries(error.errors).forEach(([key, message]) => {
          setError(key as keyof LoginFormData, {
            type: "manual",
            message: message as string
          });
        });
      } else {
        setError("root", {
          type: "manual",
          message: error?.message || "Login failed. Please try again."
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Background Image */}
      <Image
        src="/media/auth-pattern.png"
        alt="Authentication Background"
        layout="fill"
        objectFit="cover"
        quality={100}
        className="absolute z-0"
      />

      <div className="relative z-10 w-full max-w-md px-6">
        <Card className="p-8 shadow-2xl  backdrop-blur-sm rounded-3xl">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-medium font-syne text-gray-900 mb-2">
              Gigschema
            </h2>
            <p className="text-gray-600">
              Sign in to continue
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {errors.root && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-md text-center">
                {errors.root.message}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <div>
                    <input
                      {...field}
                      type="email"
                      placeholder="Enter your email"
                      className={`block w-full px-4 py-2 rounded-lg border text-sm ${errors.email ? 'border-red-300' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link
                  href="/auth?password=forgot"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Forgot Password?
                </Link>
              </div>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className={`block w-full px-4 py-2 rounded-lg border text-sm ${errors.password ? 'border-red-300' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full py-2 px-3 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-full"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Sign In
            </Button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link
                  href="/auth?u=new"
                  className="font-medium text-blue-600 hover:text-blue-800"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </Card>
        <Card className='mt-4 rounded-full shadow-lg p-0 border border-gray-300 '>
          <div className="p-0">
            <button
              onClick={() => {
                notifier.info('Feature not implemented yet', 'Coming Soon')
              }}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 
                          rounded-full 
                         hover:bg-gray-50 transition-colors 
                         focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <Image
                src="/media/google.svg"
                alt="Google Logo"
                width={24}
                height={24}
              />
              <span className="text-gray-700 font-medium">
                Continue with Google
              </span>
            </button>
          </div>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-600 space-y-2">
          <p className="px-4">
            By signing in, you agree to our{' '}
            <Link
              href="/terms"
              className="text-blue-600 hover:text-blue-800 
                         transition-colors font-medium"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              className="text-blue-600 hover:text-blue-800 
                         transition-colors font-medium"
            >
              Privacy Policy
            </Link>
          </p>

        </div>

      </div>
    </div>
  )
}

export default LoginFragment