"use client"

import { AppState } from "@/interface"
import React, { createContext, ReactNode, useContext, useReducer } from "react"
import { notifier } from "@/components/notifier"
import initialState from "./initial.state"
import { RootReducer, AppAction } from "./reducer"

interface ProviderProps {
    children: ReactNode
}


const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<AppAction> } | undefined>(undefined);

const StateProvider  = ({ children }: ProviderProps) => {
    const [state, dispatch] = useReducer(RootReducer, initialState);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
}

export const useStateValue = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        notifier.error(`'useStateValue' must be used within a StateProvider`, 'State Management Error');
        throw new Error('useStateValue must be used within a StateProvider');
    }
    return context
}

export default StateProvider