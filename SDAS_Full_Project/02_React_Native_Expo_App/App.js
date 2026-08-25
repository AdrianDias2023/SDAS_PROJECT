import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { supabase } from './services/supabase';
import AppNavigator from './navigation/AppNavigator';
import { LanguageProvider } from './services/i18n';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth state changes (login / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0F4C81" />
      </View>
    );
  }

  return (
    <LanguageProvider>
      <NavigationContainer>
        <AppNavigator session={session} />
      </NavigationContainer>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
  },
});