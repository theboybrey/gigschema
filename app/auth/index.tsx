"use client"

import { AuthContext } from "@/context/auth.context"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import React, { Suspense, useContext, useEffect, useState } from "react"
import LoaderFragment from "../fragments/ui/loader"
import LoginFragment from "./fragments/login"
import RegisterFragment from "./fragments/register"
import VerifyEmailFragment from "./fragments/confirm"
import { ResetPassword, ForgotPassword } from "./fragments/password"

interface Props {
    children: React.ReactNode
}

type AuthPage =
    | "login"
    | "new"
    | "confirm"
    | "forgot"
    | "reset"


const Auth_Components: Record<AuthPage, React.FC> = {
    login: () => (
        <Suspense fallback={<LoaderFragment />}>
            <LoginFragment />
        </Suspense>
    ),
    new: () => (
        <Suspense fallback={<LoaderFragment />}>
            <RegisterFragment />
        </Suspense>
    ),
    confirm: () => (
        <Suspense fallback={<LoaderFragment />}>
            <VerifyEmailFragment />
        </Suspense>
    ),
    forgot: () => (
        <Suspense fallback={<LoaderFragment />}>
            <ForgotPassword />
        </Suspense>
    ),
    reset: () => (
        <Suspense fallback={<LoaderFragment />}>
            <ResetPassword />
        </Suspense>
    )
}

export function AuthorizeResourceHeaders({ children }: Props) {
    const auth = useContext(AuthContext)
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [page, setPage] = useState<AuthPage>("login")
    const [isLoading, setIsLoading] = useState<boolean>(true)

    if (!auth) throw new Error("'AuthorizeResourceHeaders' must be used within an 'AuthContext'")

    const { user, loading } = auth

    const isValidAuthRoute = () => {
        if (pathname !== '/auth') return false

        const authParams: Array<string> = ['u=new', 'confirm=email', 'password=forgot', 'password=reset']

        for (const param of authParams) {
            if (searchParams.toString().includes(param)) return true
        }

        return true
    }

    useEffect(() => {
        if (!loading) {
            const timeoutId = setTimeout(() => {
                setIsLoading(false)
            }, 100)
            return () => clearTimeout(timeoutId)
        }
    }, [loading])


    useEffect(() => {
        if (loading || isLoading) return

        if (user && isValidAuthRoute()) {
            router.replace('/baseboard')
            return
        }

        if (!user && !isValidAuthRoute()) {
            router.replace('/auth')
            return
        }

    }, [user, loading, isLoading, isValidAuthRoute])

    if (isLoading) return <LoaderFragment />

    if (user) {
        if (pathname === '/auth') {
            const Component = (() => {
                if (searchParams.toString().includes('u=new')) return Auth_Components.new
                if (searchParams.toString().includes('confirm=email')) return Auth_Components.confirm
                if (searchParams.toString().includes('password=forgot')) return Auth_Components.forgot
                if (searchParams.toString().includes('password=reset')) return Auth_Components.reset
                return Auth_Components.login
            })()

            return <Component />
        }

        return <Auth_Components.login />
    }

    if (isValidAuthRoute()) {
        return <LoaderFragment />
    }

    return children
}