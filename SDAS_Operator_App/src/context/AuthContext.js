import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isDemoUser, setIsDemoUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('@sdas_demo_auth').then((val) => {
      if (val === 'true') {
        setIsDemoUser(true);
      }
    }).catch(() => {});

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const loginWithDemo = async () => {
    try {
      await AsyncStorage.setItem('@sdas_demo_auth', 'true');
    } catch (e) {}
    setIsDemoUser(true);
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@sdas_demo_auth');
    } catch (e) {}
    setIsDemoUser(false);
    try {
      await supabase.auth.signOut();
    } catch (e) {}
  };

  const isAuthenticated = !!session || isDemoUser;
  const user = session?.user || (isDemoUser ? { email: 'operator@sdas.gov.lk', role: 'OPERATOR' } : null);

  return (
    <AuthContext.Provider value={{ session, user, isDemoUser, isAuthenticated, loading, loginWithDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return {
      session: null,
      user: null,
      isDemoUser: false,
      isAuthenticated: false,
      loading: false,
      loginWithDemo: async () => {},
      logout: async () => {},
    };
  }
  return ctx;
}
