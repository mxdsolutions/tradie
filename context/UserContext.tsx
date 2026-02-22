import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useRouter, useRootNavigationState } from 'expo-router'; // Removed
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { OneSignal } from 'react-native-onesignal';

type UserMode = 'homeowner' | 'tradie';

interface UserContextType {
    userMode: UserMode;
    setUserMode: (mode: UserMode) => void;
    isAuthenticated: boolean;
    session: Session | null;
    user: User | null;
    toggleUserMode: () => void;
    signOut: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [userMode, setUserModeState] = useState<UserMode>('homeowner');
    const [session, setSession] = useState<Session | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // const router = useRouter(); // Removed to avoid context error
    // const navigationState = useRootNavigationState(); // Removed
    const [isNavigationReady, setIsNavigationReady] = useState(true); // Default to true as we handle nav elsewhere

    useEffect(() => {
        // Load persisted mode
        AsyncStorage.getItem('userMode').then((mode) => {
            if (mode) setUserModeState(mode as UserMode);
        });

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


    const setUserMode = async (mode: UserMode) => {
        setUserModeState(mode);
        await AsyncStorage.setItem('userMode', mode);
    };

    const toggleUserMode = async () => {
        const newMode = userMode === 'homeowner' ? 'tradie' : 'homeowner';
        await setUserMode(newMode);
        // Navigation should be handled by the component calling this
    };

    const signOut = async () => {
        OneSignal.logout();
        await supabase.auth.signOut();
        setIsAuthenticated(false);
        // Navigation should be handled by the component or a layout effect
    };

    return (
        <UserContext.Provider value={{
            userMode,
            setUserMode,
            isAuthenticated,
            session,
            user: session?.user ?? null,
            toggleUserMode,
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
