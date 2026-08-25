import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './services/supabase';
import AppNavigator from './navigation/AppNavigator';
import TermsScreen, { TERMS_STORAGE_KEY } from './screens/public/TermsScreen';
import { LanguageProvider } from './services/i18n';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function App() {
  const [session,       setSession]       = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(null);
  const [initialRole,   setInitialRole]   = useState('public');
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    // 1. Check existing session and terms acceptance concurrently
    Promise.all([
      supabase.auth.getSession(),
      AsyncStorage.getItem(TERMS_STORAGE_KEY),
    ]).then(([{ data: { session } }, terms]) => {
      setSession(session);
      setTermsAccepted(terms === 'true');
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // 2. Listen for auth state changes (login / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading || termsAccepted === null) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0F4C81" />
      </View>
    );
  }

  // First-launch: Display Terms & Conditions and Privacy Notice
  if (!termsAccepted) {
    return (
      <LanguageProvider>
        <TermsScreen
          onAccept={(role) => {
            setInitialRole(role);
            setTermsAccepted(true);
          }}
        />
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <NavigationContainer>
        <AppNavigator session={session} initialRole={initialRole} />
      </NavigationContainer>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F4C81',
  },
});