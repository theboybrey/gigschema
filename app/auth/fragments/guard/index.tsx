"use client"
import { AuthProvider } from "@/context/auth.context"
import React from "react"
import  AuthorizeResourceHeaders  from "./layout"


export function AuthenticatorFragment({ children }: {
    children: React.ReactNode
}) {

    return (
        <AuthProvider>
            <AuthorizeResourceHeaders>
                {children ?? <> </>}
            </AuthorizeResourceHeaders>
        </AuthProvider>
    )
}

