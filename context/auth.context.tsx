"use client"

import React, { createContext, ReactNode, useContext, useReducer } from "react"
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

    function setAuthState(user: IUser | null) {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user))
        }
        setState(prev => ({ ...prev, user }))
    }

    function handleLogout() {
        setState(prev => ({ ...prev, user: null }))
        localStorage.removeItem('user')
        router.push('/auth')
    }

    async function initialize() {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }))

            const user = JSON.parse(localStorage.getItem('user') ?? 'null') as IUser | null

            if (!user) {
                setState(prev => ({ ...prev, loading: false }))
                return
            }

            let token = localStorage.getItem('token')

            if (!token) {
                handleLogout()
                return
            }

        } catch (error) {
            console.error(error)
            notifier.error('Failed to initialize authentication.', 'Authentication Error')
            setState(
                prev => ({ ...prev, loading: false, error: error as Error })
            )
        }
    }

    React.useEffect(() => {
        let mounted = true
        let initializeTimeout: NodeJS.Timeout

        const handeleStorageChange = (event: StorageEvent) => {
            if(['user'].includes(event.key ?? '')){
                clearTimeout(initializeTimeout)
                initializeTimeout = setTimeout(() => {
                    if(mounted){
                        initialize()
                    }
                }, 500)
            }
        }

        window.addEventListener('storage', handeleStorageChange)

        if (mounted) {
            initialize()
        }

        return () => {
            mounted = false
            clearTimeout(initializeTimeout)
            window.removeEventListener('storage', handeleStorageChange)
        }
    }, [])

    return (
        <AuthContext.Provider value={{ ...state, initialize, handleLogout, setAuthState }}>
            {children}
        </AuthContext.Provider>
    )
}

