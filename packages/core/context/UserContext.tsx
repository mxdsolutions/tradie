import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { OneSignal } from 'react-native-onesignal';

export type UserMode = 'homeowner' | 'tradie';

interface UserContextType {
    userMode: UserMode;
    setUserMode: (mode: UserMode) => void;
    isAuthenticated: boolean;
    session: Session | null;
    user: User | null;
    signOut: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
    mode: UserMode;
    children: React.ReactNode;
}

export function UserProvider({ mode, children }: UserProviderProps) {
    const [userMode, setUserModeState] = useState<UserMode>(mode);
    const [session, setSession] = useState<Session | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setIsAuthenticated(!!session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setIsAuthenticated(!!session);

            // Map OneSignal user to Supabase user
            if (session?.user?.id) {
                OneSignal.login(session.user.id);
            } else {
                OneSignal.logout();
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const setUserMode = (mode: UserMode) => {
        setUserModeState(mode);
    };

    const signOut = async () => {
        OneSignal.logout();
        await supabase.auth.signOut();
        setIsAuthenticated(false);
    };

    return (
        <UserContext.Provider value={{
            userMode,
            setUserMode,
            isAuthenticated,
            session,
            user: session?.user ?? null,
            signOut
        }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
