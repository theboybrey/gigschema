"use client"

import { AuthContext } from "@/context/auth.context"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import React, { Suspense, useCallback, useContext, useEffect } from "react"
import LoaderFragment from "../fragments/ui/loader"
import LoginFragment from "./fragments/login"
import RegisterFragment from "./fragments/register"
import VerifyEmailFragment from "./fragments/confirm"
import { ResetPassword, ForgotPassword } from "./fragments/password"

interface Props {
    children: React.ReactNode
}

type AuthPage = "login" | "new" | "confirm" | "forgot" | "reset"

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

    if (!auth) throw new Error("'AuthorizeResourceHeaders' must be used within an 'AuthContext'")

    const { user, loading } = auth

    const isValidAuthRoute = useCallback(() => {
        if (pathname !== "/auth") return false
        const authParams = ["u=new", "confirm=email", "password=forgot", "password=reset"]
        return authParams.some(param => searchParams.toString().includes(param)) || searchParams.toString() === ""
    }, [pathname, searchParams])

    useEffect(() => {
        if (loading) return

        if (user && isValidAuthRoute()) {
            router.replace("/")
        } else if (!user && !isValidAuthRoute()) {
            router.replace("/auth")
        }
    }, [user, loading, isValidAuthRoute, router])

    if (loading) return <LoaderFragment />

    if (!user && isValidAuthRoute()) {
        const params = searchParams.toString()
        const Component = params.includes("u=new")
            ? Auth_Components.new
            : params.includes("confirm=email")
                ? Auth_Components.confirm
                : params.includes("password=forgot")
                    ? Auth_Components.forgot
                    : params.includes("password=reset")
                        ? Auth_Components.reset
                        : Auth_Components.login
        return <Component />
    }

    if (user && !isValidAuthRoute()) {
        return <>{children}</>
    }

    return <LoaderFragment /> // Fallback for edge cases
}