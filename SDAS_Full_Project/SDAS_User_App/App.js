import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './navigation/AppNavigator';
import TermsScreen, { TERMS_STORAGE_KEY } from './screens/public/TermsScreen';
import { LanguageProvider } from './services/i18n';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function App() {
  const [termsAccepted, setTermsAccepted] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(TERMS_STORAGE_KEY)
      .then((terms) => {
        setTermsAccepted(terms === 'true');
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading || termsAccepted === null) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!termsAccepted) {
    return (
      <LanguageProvider>
        <TermsScreen onAccept={() => setTermsAccepted(true)} />
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
});