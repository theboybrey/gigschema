"use client"

import { ResetPassword as ChangePassword, ForgotPassword as RequestMagicLink } from '@/app/api/services/user.service'
import { Button } from '@/components/button'
import { Card } from '@/components/card'
import { notifier } from '@/components/notifier'
import { CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

interface ForgotPasswordFormData {
    email: string;
}

const ForgotPassword = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const {
        control,
        handleSubmit,
        setError,
        watch,
        formState: { errors }
    } = useForm<ForgotPasswordFormData>({
        defaultValues: {
            email: ''
        }
    });

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) return "Email is required";
        if (!emailRegex.test(email)) return "Invalid email format";
        return true;
    };

    const onSubmit = async (data: ForgotPasswordFormData) => {
        const emailValidation = validateEmail(data.email);
        if (emailValidation !== true) {
            setError('email', {
                type: 'manual',
                message: emailValidation as string
            });
            return;
        }

        setLoading(true);

        try {
            await RequestMagicLink(
                data.email.trim(),
                setLoading,
                (responseData) => {
                    setEmailSent(true);
                    notifier.success(responseData?.message || 'Password reset link sent successfully', 'Success');
                }
            );
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error('Forgot password error:', error);

            if (error?.errors) {
                Object.entries(error.errors).forEach(([key, message]) => {
                    setError(key as keyof ForgotPasswordFormData, {
                        type: "manual",
                        message: message as string
                    });
                });
            } else {
                setError("root", {
                    type: "manual",
                    message: error?.message || "Password reset request failed. Please try again."
                });
            }
        }
    };

    const renderContent = () => {
        if (emailSent) {
            return (
                <div className="text-center">
                    <p className="text-gray-600 mb-6 text-sm">
                        We&apos;ve sent a password reset link to {watch('email')}.
                        Check your inbox and follow the instructions.
                    </p>
                    <Button
                        onClick={() => router.push('/auth?login=true')}
                        className="w-full py-2 px-3 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-full"
                    >
                        Back to Sign In
                    </Button>
                </div>
            );
        }

        return (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
                {errors.root && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-md text-center">
                        {errors.root.message}
                    </div>
                )}

                <div className='mb-4'>
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

                <Button
                    type="submit"
                    className="w-full py-2 px-3 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-full"
                    disabled={loading}
                >
                    {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Reset Password
                </Button>

                <Button
                    type="button"
                    variant='secondary'
                    onClick={() => router.push('/auth?login=true')}
                    className="text-sm rounded-full flex items-center justify-center gap-2 w-full"
                >
                    Back to Sign In
                </Button>
            </form>
        );
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center">
            <Image
                src="/media/auth-pattern.png"
                alt="Authentication Background"
                layout="fill"
                objectFit="cover"
                quality={100}
                className="absolute z-0"
            />

            <div className="relative z-10 w-full max-w-md px-6">
                <Card className="p-8 shadow-2xl backdrop-blur-sm rounded-3xl">
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-medium font-syne text-gray-900 mb-2">
                            Gigschema
                        </h2>
                        <p className="text-gray-600">
                            Forgot Password
                        </p>
                    </div>

                    {renderContent()}
                </Card>

                <div className="mt-8 text-center text-sm text-gray-600 space-y-2">
                    <p className="px-4">
                        By resetting your password, you agree to our{' '}
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

interface ResetPasswordFormData {
    password: string;
    confirmPassword: string;
}

const ResetPassword = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);

    const {
        control,
        handleSubmit,
        setError,
        formState: { errors }
    } = useForm<ResetPasswordFormData>({
        defaultValues: {
            password: '',
            confirmPassword: ''
        }
    });

    const validatePassword = (password: string) => {
        if (!password) return "Password is required";
        if (password.length < 6) return "Password must be at least 6 characters";
        return true;
    };

    const onSubmit = async (data: ResetPasswordFormData) => {
        const passwordValidation = validatePassword(data.password);
        if (passwordValidation !== true) {
            setError('password', {
                type: 'manual',
                message: passwordValidation as string
            });
            return;
        }

        if (data.password !== data.confirmPassword) {
            setError('confirmPassword', {
                type: 'manual',
                message: "Passwords do not match"
            });
            return;
        }

        const token = searchParams.get('token');
        if (!token) {
            notifier.error('Invalid or missing reset token', 'Reset Password Error');
            return;
        }

        setLoading(true);

        try {
            await ChangePassword(
                token,
                data.password.trim(),
                setLoading,
                () => {
                    setPasswordResetSuccess(true);
                }
            );
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error('Reset password error:', error);

            if (error?.errors) {
                Object.entries(error.errors).forEach(([key, message]) => {
                    setError(key as keyof ResetPasswordFormData, {
                        type: "manual",
                        message: message as string
                    });
                });
            } else {
                setError("root", {
                    type: "manual",
                    message: error?.message || "Password reset failed. Please try again."
                });
            }
        }
    };

    const renderContent = () => {


        if (passwordResetSuccess) {
            return (
                <div className="text-center">
                    <CheckCircle2 className="mx-auto h-16 w-16 text-green-600 mb-4" />
                    <h3 className="text-2xl font-medium text-gray-900 mb-2">
                        Password Reset Successful
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Your password has been successfully reset.
                    </p>
                    <Button
                        onClick={() => router.push('/auth?login=true')}
                        className="w-full py-2 px-3 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-full"
                    >
                        Go to Sign In
                    </Button>
                </div>
            );
        }

        return (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {errors.root && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-md text-center">
                        {errors.root.message}
                    </div>
                )}

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                    </label>
                    <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                            <div className="relative">
                                <input
                                    {...field}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter new password"
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

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                    </label>
                    <Controller
                        name="confirmPassword"
                        control={control}
                        render={({ field }) => (
                            <div className="relative">
                                <input
                                    {...field}
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm new password"
                                    className={`block w-full px-4 py-2 rounded-lg border text-sm ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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

                <Button
                    type="submit"
                    className="w-full py-2 px-3 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-full"
                    disabled={loading}
                >
                    {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Reset Password
                </Button>
            </form>
        );


    };

    return (
        <div className="relative min-h-screen flex items-center justify-center">
            <Image
                src="/media/auth-pattern.png"
                alt="Authentication Background"
                layout="fill"
                objectFit="cover"
                quality={100}
                className="absolute z-0"
            />

            <div className="relative z-10 w-full max-w-md px-6">
                <Card className="p-8 shadow-2xl backdrop-blur-sm rounded-3xl">
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-medium font-syne text-gray-900 mb-2">
                            Gigschema
                        </h2>
                        <p className="text-gray-600">
                            Reset Your Password
                        </p>
                    </div>

                    {renderContent()}
                </Card>

                <div className="mt-8 text-center text-sm text-gray-600 space-y-2">
                    <p className="px-4">
                        By resetting your password, you agree to our{' '}
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


export { ForgotPassword, ResetPassword }
