"use client"
import { AuthProvider } from "@/context/auth.context"
import React from "react"
import { AuthorizeResourceHeaders } from "."

type Props = {
    children: React.ReactNode
}

const AuthenticatorFragment = ({ children }: Props) => {
    return (
        <AuthProvider>
            <AuthorizeResourceHeaders>
                {children}
            </AuthorizeResourceHeaders>
        </AuthProvider>
    )

}

export default AuthenticatorFragment