import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isDemoUser, setIsDemoUser] = useState(false);
  const [activeRole, setActiveRole] = useState('OPERATOR'); // 'ADMIN' | 'OPERATOR' | 'VIEWER'
  const [loading, setLoading] = useState(true);
  const [loginTimestamp, setLoginTimestamp] = useState(new Date().toISOString());

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem('@sdas_demo_auth'),
      AsyncStorage.getItem('@sdas_operator_role'),
    ]).then(([demoVal, roleVal]) => {
      if (demoVal === 'true') {
        setIsDemoUser(true);
      }
      if (roleVal && ['ADMIN', 'OPERATOR', 'VIEWER'].includes(roleVal)) {
        setActiveRole(roleVal);
      }
    }).catch(() => {});

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) setLoginTimestamp(new Date().toISOString());
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) setLoginTimestamp(new Date().toISOString());
    });

    return () => subscription?.unsubscribe();
  }, []);

  const loginWithDemo = async (role = 'OPERATOR') => {
    try {
      await AsyncStorage.setItem('@sdas_demo_auth', 'true');
      await AsyncStorage.setItem('@sdas_operator_role', role);
    } catch (e) {}
    setActiveRole(role);
    setIsDemoUser(true);
    setLoginTimestamp(new Date().toISOString());
  };

  const switchRole = async (newRole) => {
    if (!['ADMIN', 'OPERATOR', 'VIEWER'].includes(newRole)) return;
    try {
      await AsyncStorage.setItem('@sdas_operator_role', newRole);
    } catch (e) {}
    setActiveRole(newRole);
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@sdas_demo_auth');
      await AsyncStorage.removeItem('@sdas_operator_role');
    } catch (e) {}
    setIsDemoUser(false);
    setActiveRole('OPERATOR');
    try {
      await supabase.auth.signOut();
    } catch (e) {}
  };

  const isAuthenticated = !!session || isDemoUser;
  const role = activeRole || 'OPERATOR';

  const user = session?.user
    ? {
        ...session.user,
        role,
        name: role === 'ADMIN' ? 'System Administrator' : role === 'VIEWER' ? 'Supervisory Auditor' : 'Certified Dam Operator',
        operatorId: 'OP-2026-TAB-01',
      }
    : (isDemoUser
        ? {
            email: role === 'ADMIN' ? 'admin@sdas.gov.lk' : role === 'VIEWER' ? 'viewer@sdas.gov.lk' : 'operator@sdas.gov.lk',
            role,
            name: role === 'ADMIN' ? 'Eng. K. Samarasinghe (Admin)' : role === 'VIEWER' ? 'DMC Supervisory Auditor' : 'Dam Operator On-Duty',
            operatorId: 'OP-2026-TAB-01',
          }
        : null);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        role,
        switchRole,
        isDemoUser,
        isAuthenticated,
        loading,
        loginTimestamp,
        loginWithDemo,
        logout,
      }}
    >
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
      role: 'OPERATOR',
      switchRole: async () => {},
      isDemoUser: false,
      isAuthenticated: false,
      loading: false,
      loginTimestamp: null,
      loginWithDemo: async () => {},
      logout: async () => {},
    };
  }
  return ctx;
}
