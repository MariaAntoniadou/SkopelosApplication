import React, { useEffect, useState } from 'react';
import Navigation from './navigation/Navigation';
import { enableScreens } from 'react-native-screens';
import './locales/i18n.js';
import { WeatherProvider } from './context/WeatherContext.js';
import { AuthProvider } from './context/AuthContext.js';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, StatusBar, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  enableScreens();

  const [fontsLoaded] = useFonts({
  'Inter-Variable': require('./assets/fonts/Inter-VariableFont_opsz,wght.ttf'),
  'Inter-Italic-Variable': require('./assets/fonts/Inter-Italic-VariableFont_opsz,wght.ttf'),
});

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('transparent', true);
      StatusBar.setBarStyle('light-content', true);
      StatusBar.setTranslucent(true);
    }
  }, []);

  if (!fontsLoaded) {
    return null; 
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
        <AuthProvider>
          <WeatherProvider>
            <Navigation/>
          </WeatherProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}