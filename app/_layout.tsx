import { Stack, Redirect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

SplashScreen.preventAutoHideAsync();

type InitialRoute = '/(tabs)' | '/login' | null;

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'SpaceMono': require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [initialRoute, setInitialRoute] = useState<InitialRoute>(null);
  const [isCheckingToken, setIsCheckingToken] = useState(true); // Add a loading state

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        setInitialRoute(token ? '/(tabs)' : '/login');
      } catch (error) {
        console.error('Error checking token:', error);
        setInitialRoute('/login');
      } finally {
        setIsCheckingToken(false); // Mark token check as complete
      }
    };

    checkToken();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && initialRoute) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, initialRoute]);

  if (!fontsLoaded || !initialRoute || isCheckingToken) {
    return null; // Render nothing while loading fonts or checking token
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="register"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
      </Stack>
      {initialRoute && <Redirect href={initialRoute as any} />}
    </View>
  );
}