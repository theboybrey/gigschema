"use client"
import { AuthProvider } from "@/context/auth.context"
import React from "react"
import { AuthorizeResourceHeaders } from "."

type Props = {
    children: React.ReactNode
}


export default function AuthenticatorFragment({ children }: Props) {


    return (
        <AuthProvider>
            <AuthorizeResourceHeaders>
                {children}
            </AuthorizeResourceHeaders>
        </AuthProvider>
    )

}

