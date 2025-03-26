"use client"

import React, { createContext, ReactNode } from "react"
import { notifier } from "@/components/notifier"
import { IUser } from "@/interface"
import { useRouter } from "next/navigation"

export interface AuthState {
    user: IUser | null
    loading: boolean
    error: string | null | Error
    initialize: () => Promise<void>
    handleLogout: () => void
    setAuthState: (user: IUser | null) => void
}

export const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = React.useState<Omit<AuthState, 'initialize' | 'handleLogout' | 'setAuthState'>>({
        user: null,
        loading: true,
        error: null
    })

    const router = useRouter()

    const setAuthState = (user: IUser | null) => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user))
        } else {
            localStorage.removeItem('user')
        }
        setState(prev => ({ ...prev, user, loading: false }))
    }

    const handleLogout = () => {
        setState(prev => ({ ...prev, user: null, loading: false }))
        localStorage.removeItem('user')
        router.push('/auth')
    }

    const initialize = async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }))
            const user = JSON.parse(localStorage.getItem('user') || 'null') as IUser | null

            if (!user) {
                setState(prev => ({ ...prev, user: null, loading: false }))
                return
            }

            // Simulate token validation or API call here if needed
            setState(prev => ({ ...prev, user, loading: false }))
        } catch (error) {
            console.error(error)
            notifier.error('Failed to initialize authentication.', 'Authentication Error')
            setState(prev => ({ ...prev, loading: false, error: error as Error }))
        }
    }

    React.useEffect(() => {
        initialize()
    }, [])

    return (
        <AuthContext.Provider value={{ ...state, initialize, handleLogout, setAuthState }}>
            {children}
        </AuthContext.Provider>
    )
}