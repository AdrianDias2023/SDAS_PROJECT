import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { supabase } from './services/supabase';
import AppNavigator from './navigation/AppNavigator';
import { LanguageProvider } from './services/i18n';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function App() {
  const [session, setSession]             = useState(null);
  const [isDemoSession, setIsDemoSession] = useState(false);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (!session) setIsDemoSession(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (_) {}
    setSession(null);
    setIsDemoSession(false);
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );
  }

  const isAuthenticated = Boolean(session || isDemoSession);

  return (
    <LanguageProvider>
      <NavigationContainer>
        <AppNavigator
          isAuthenticated={isAuthenticated}
          isDemoSession={isDemoSession}
          onEnterDemo={() => setIsDemoSession(true)}
          onLogout={handleLogout}
        />
      </NavigationContainer>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0B132B',
  },
});