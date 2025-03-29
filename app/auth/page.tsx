import { AuthProvider } from "@/context/auth.context"
import React from "react"
import { AuthorizeResourceHeaders } from "."


export default function AuthenticatorFragment({ children }: {
    children: React.ReactNode
}) {

    return (
        <AuthProvider>
            <AuthorizeResourceHeaders>
                {children}
            </AuthorizeResourceHeaders>
        </AuthProvider>
    )
}

