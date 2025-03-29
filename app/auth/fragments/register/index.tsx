"use client"

import { LoginResponse, RegisterAccount } from '@/app/api/services/user.service'
import { Button } from '@/components/button'
import { Card } from '@/components/card'
import { notifier } from '@/components/notifier'
import { AuthContext } from '@/context/auth.context'
import { useStateValue } from '@/global/state.provider'
import {
  Info,
  Loader2,
  Mars,
  Venus
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useContext, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'system' | 'admin' | 'user' | undefined
  gender: 'male' | 'female' | 'unknown' | undefined
  phone: string
}

const RegisterPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { dispatch } = useStateValue()

  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error('RegisterPage must be used within AuthProvider');
  }

  const { setAuthState } = auth;

  const {
    control,
    handleSubmit,
    setError,
    trigger,
    getValues,
    formState: { errors }
  } = useForm<RegisterFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'user',
      gender: 'unknown',
      phone: ''
    }
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Invalid email format";
    return true;
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[+]?[0-9]{10,14}$/;
    if (!phone) return "Phone number is required";
    if (!phoneRegex.test(phone)) return "Invalid phone number format";
    return true;
  }

  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain a number";
    return true;
  };

  const validateStep1 = async () => {
    const result = await trigger(['firstName', 'lastName']);
    return result;
  };

  const validateStep2 = async () => {
    const result = await trigger(['email', 'phone']);
    return result;
  };

  const validateStep3 = async () => {
    const result = await trigger(['gender']);
    return result;
  };

  const validateStep4 = async () => {
    const result = await trigger(['password', 'confirmPassword']);
    return result;
  };

  const handleNextStep = async () => {
    let isValid = false;
    switch (currentStep) {
      case 1:
        isValid = await validateStep1();
        break;
      case 2:
        isValid = await validateStep2();
        break;
      case 3:
        isValid = await validateStep3();
        break;
      case 4:
        isValid = await validateStep4();
        break;
    }

    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);

    try {
      await RegisterAccount({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim(),
        password: data.password.trim(),
        role: data.role,
        phone: data.phone
      }, setLoading, async (responseData: LoginResponse) => {
        if (responseData && responseData.user) {
          setAuthState(responseData.user, responseData.token);
          dispatch({
            type: 'SET_USER',
            payload: responseData.user
          });
          await new Promise(resolve => setTimeout(resolve, 100));
          router.replace("/");
        }
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Registration error:', error);

      if (error?.errors) {
        Object.entries(error.errors).forEach(([key, message]) => {
          setError(key as keyof RegisterFormData, {
            type: "manual",
            message: message as string
          });
        });
      } else {
        notifier.error(
          error?.message || "Registration failed. Please try again.",
          "Registration Error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => {
    return (
      <div className="flex justify-center items-center space-x-2 mb-6">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`w-10 h-1 rounded-full transition-all duration-300 ${currentStep >= step
              ? 'bg-blue-500'
              : 'bg-gray-200'
              }`}
          />
        ))}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <Controller
                name="firstName"
                control={control}
                rules={{
                  required: "First name is required",
                  minLength: { value: 2, message: "First name must be at least 2 characters" }
                }}
                render={({ field }) => (
                  <div>
                    <input
                      {...field}
                      type="text"
                      autoComplete='false'
                      placeholder="Enter your first name"
                      className={`w-full px-4 py-3 rounded-lg border text-sm 
                        ${errors.firstName
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                        } 
                        focus:outline-none focus:ring-2 focus:border-transparent`}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <Controller
                name="lastName"
                control={control}
                rules={{
                  required: "Last name is required",
                  minLength: { value: 2, message: "Last name must be at least 2 characters" }
                }}
                render={({ field }) => (
                  <div>
                    <input
                      {...field}
                      type="text"
                      placeholder="Enter your last name"
                      className={`w-full px-4 py-3 rounded-lg border text-sm 
                        ${errors.lastName
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                        } 
                        focus:outline-none focus:ring-2 focus:border-transparent`}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <Controller
                name="phone"
                control={control}
                rules={{
                  required: "Phone is required",
                  validate: (value) => {
                    const emailValidation = validatePhone(value);
                    return emailValidation === true || emailValidation;
                  }
                }}
                render={({ field }) => (
                  <div>
                    <input
                      {...field}
                      type="phone"
                      placeholder="0209685612"
                      className={`w-full px-4 py-3 rounded-lg border text-sm 
                        ${errors.phone
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                        } 
                        focus:outline-none focus:ring-2 focus:border-transparent`}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                )}
              />

            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <Controller
                name="email"
                control={control}
                rules={{
                  required: "Email is required",
                  validate: (value) => {
                    const emailValidation = validateEmail(value);
                    return emailValidation === true || emailValidation;
                  }
                }}
                render={({ field }) => (
                  <div>
                    <input
                      {...field}
                      type="email"
                      placeholder="your@email.com"
                      className={`w-full px-4 py-3 rounded-lg border text-sm 
                        ${errors.email
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                        } 
                        focus:outline-none focus:ring-2 focus:border-transparent`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <div className="mt-2 flex items-center text-gray-600 text-xs">
                <Info className="mr-2 text-blue-500" size={16} />
                We&apos;ll send a verification email to confirm your account
              </div>
            </div>

          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Your Gender
              </label>
              <Controller
                name="gender"
                control={control}
                rules={{ required: "Gender selection is required" }}
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      {
                        value: 'male',
                        label: 'Male',
                        icon: Mars
                      },
                      {
                        value: 'female',
                        label: 'Female',
                        icon: Venus
                      }
                    ].map((genderOption) => {
                      const Icon = genderOption.icon;
                      return (
                        <label
                          key={genderOption.value}
                          className={`
                              cursor-pointer border rounded-lg p-4 text-center 
                              flex flex-col items-center justify-center
                              transition-all duration-300
                              ${field.value === genderOption.value
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 hover:border-gray-400'
                            }
                            `}
                        >
                          <input
                            type="radio"
                            {...field}
                            value={genderOption.value}
                            className="hidden"
                          />
                          <Icon
                            size={48}
                            className={`mb-2 ${field.value === genderOption.value
                              ? 'text-blue-600'
                              : 'text-gray-400'
                              }`}
                          />
                          <span className="text-sm">
                            {genderOption.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              />
              {errors.gender && (
                <p className="mt-2 text-sm text-red-600 text-center">
                  {errors.gender.message}
                </p>
              )}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Create Password
              </label>
              <Controller
                name="password"
                control={control}
                rules={{
                  required: "Password is required",
                  validate: (value) => {
                    const passwordValidation = validatePassword(value);
                    return passwordValidation === true || passwordValidation;
                  }
                }}
                render={({ field }) => (
                  <div className="relative">
                    <input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      className={`w-full px-4 py-3 rounded-lg border text-sm pr-12
                        ${errors.password
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                        } 
                        focus:outline-none focus:ring-2 focus:border-transparent`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600  justify-center items-center flex "
                    >
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <Controller
                name="confirmPassword"
                control={control}
                rules={{
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === getValues('password') || "Passwords do not match"
                }}
                render={({ field }) => (
                  <div className="relative">
                    <input
                      {...field}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      className={`w-full px-4 py-3 rounded-lg border text-sm pr-12
                        ${errors.confirmPassword
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                        } 
                        focus:outline-none focus:ring-2 focus:border-transparent`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                    </button>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="text-center space-y-6">
            <div className="bg-slate-50 border border-slate-200 text-blue-800 px-6 py-8 rounded-xl">
              <p className="text-gray-600 mb-4 text-sm">
                You&apos;re about to join our platform.
                Review your details and click Submit to complete registration.
              </p>
              <div className="bg-white border border-blue-100 rounded-lg p-4 text-left">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-500">First Name</p>
                    <p className="font-medium">{getValues('firstName')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Last Name</p>
                    <p className="font-medium">{getValues('lastName')}</p>
                  </div>
                  <div className="">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium">
                      {getValues('email')?.length > 10
                        ? `${getValues('email')?.slice(0, 7)}...`
                        : getValues('email')?.slice(0, 10)}
                    </p>                  </div>
                  <div className="">
                    <p className="text-xs text-gray-500">Gender</p>
                    <p className="font-medium capitalize">{getValues('gender')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderStepNavigation = () => {
    return (
      <div className="flex w-full justify-between mt-6 gap-2">
        {currentStep > 1 && currentStep < 5 && (
          <Button
            type="button"
            className="w-full flex items-center bg-transparent border border-gray-400 text-muted-foreground font-medium hover:bg-transparent gap-2 px-4 py-2 rounded-full"
            onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
          >
            Previous
          </Button>
        )}

        {currentStep < 5 && (
          <Button
            type="button"
            className={`ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-full ${currentStep === 1 ? "w-full py-3 px-3" : ''}`}
            onClick={handleNextStep}
          >
            {currentStep === 4 ? 'Proceed' : 'Next'}
          </Button>
        )}

        {currentStep === 5 && (
          <Button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-full"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Create Account
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Image
        src="/media/auth-pattern.png"
        alt="Authentication Background"
        layout="fill"
        objectFit="cover"
        quality={100}
        className="absolute z-0"
      />
      <div className="w-full max-w-md">
        <Card className="p-8 shadow-xl rounded-2xl border border-gray-100">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-medium font-syne text-gray-800 mb-2">
              Create Account
            </h2>
            <p className="text-gray-600">
              Join Gigschema in just a few steps
            </p>
          </div>

          {renderStepIndicator()}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {renderStepContent()}
            {renderStepNavigation()}
          </form>

          {currentStep === 5 && (
            <div className="mt-6 text-center text-xs text-gray-500">
              By creating an account, you agree to our{' '}
              <Link
                href="/terms"
                className="text-blue-600 hover:underline font-medium"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy"
                className="text-blue-600 hover:underline font-medium"
              >
                Privacy Policy
              </Link>
            </div>
          )}
        </Card>

        {currentStep !== 5 && <Card className='mt-4 rounded-full shadow-lg p-0 border border-gray-300 '>
          <div className="p-0">
            <button
              onClick={() => {
                notifier.info('Feature not implemented yet', 'Coming Soon')
                router.push('/auth')
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
        </Card>}

        <div className="mt-8 text-center text-sm text-gray-600 space-y-2">
          <p className="px-4">
            By registering, you agree to our{' '}
            <Link
              href="/terms"
              className="text-blue-600 hover:text-blue-800 
                         transition-colors font-medium"
            >
              Terms of Service
            </Link>{' '}
            · {' '}
            <Link
              href="/auth"
              className="text-blue-600 hover:text-blue-800 
                         transition-colors font-medium"
            >
              Privacy Policy
            </Link>
          </p>


        </div>
      </div>
    </div>
  );
}

export default RegisterPage