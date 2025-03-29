"use client"

import { VerifyAccount } from '@/app/api/services/user.service'
import { Button } from '@/components/button'
import { Card } from '@/components/card'
import { notifier } from '@/components/notifier'
import { RiLoader5Fill } from '@remixicon/react'
import { CheckCircle2, XCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const VerifyEmailFragment = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            notifier.error('No verification token found', 'Verification Error');
            setVerificationStatus('error');
            setErrorMessage('Invalid or missing verification token');
            setLoading(false);
            return;
        }

        const handleVerification = async () => {
            try {
                await VerifyAccount(token, setLoading, (data) => {
                    if (data?.message) {
                        notifier.success(data.message, 'Verification Successful');
                    }
                    setVerificationStatus('success');
                    setLoading(false);
                    setTimeout(() => {
                        router.push('/auth')
                    }, 3000)
                });
            } catch (error: any) {
                setVerificationStatus('error');
                setErrorMessage(
                    error?.message ||
                    error?.response?.data?.message ||
                    'Verification failed. Please try again.'
                );
            }
        };

        handleVerification();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, [searchParams, router]);

    const renderContent = () => {
        switch (verificationStatus) {
            case 'pending':
                return (
                    <div className="text-center">
                        <RiLoader5Fill className="mx-auto h-16 w-16 animate-spin text-blue-600 mb-4" />
                        <h3 className="text-2xl font-medium text-gray-900 mb-2">
                            Verifying Your Email
                        </h3>
                        <p className="text-gray-600">
                            Please wait while we verify your email address
                        </p>
                    </div>
                );

            case 'success':
                return (
                    <div className="text-center">
                        <CheckCircle2 className="mx-auto h-16 w-16 text-green-600 mb-4" />
                        <h3 className="text-2xl font-medium text-gray-900 mb-2">
                            Email Verified Successfully
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Your email has been verified. You can now sign in to your account.
                        </p>
                        <Button
                            onClick={() => router.push('/auth')}
                            className="w-full py-2 px-3 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-full"
                        >
                            Go to Sign In
                        </Button>
                    </div>
                );

            case 'error':
                return (
                    <div className="text-center">
                        <XCircle className="mx-auto h-12 w-12 text-red-600 mb-4" />
                        <h3 className="text-2xl font-medium text-gray-900 mb-2">
                            Verification Failed
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {!loading && errorMessage || 'Unable to verify your email address'}
                        </p>
                        <div className="space-y-3">
                            <Button
                                onClick={() => router.push('/auth?u=new')}
                                className="w-full py-2 px-3 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-full"
                            >
                                Resend Verification Email
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => router.push('/auth')}
                                className="w-full py-2 px-3 border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 rounded-full"
                            >
                                Back to Sign In
                            </Button>
                        </div>
                    </div>
                );
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
                <Card className="p-8 shadow-2xl backdrop-blur-sm rounded-3xl">
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-medium font-syne text-gray-900 mb-2">
                            Gigschema
                        </h2>
                        <p className="text-gray-600">
                            Email Verification
                        </p>
                    </div>

                    {renderContent()}
                </Card>

                <div className="mt-8 text-center text-sm text-gray-600 space-y-2">
                    <p className="px-4">
                        By verifying your email, you agree to our{' '}
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

export default VerifyEmailFragment