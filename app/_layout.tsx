import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import * as Location from 'expo-location';
import { createContext, useState } from 'react';
import { Loc } from './(tabs)';



export type HCContext = {
  activePin: Loc | null;
  setActivePin: React.Dispatch<React.SetStateAction<Loc | null>>;
  showActivePin: boolean;
  setShowActivePin: React.Dispatch<React.SetStateAction<boolean>>;
  showDistance: boolean;
  setShowDistance: React.Dispatch<React.SetStateAction<boolean>>;
  showDirection: boolean;
  setShowDirection: React.Dispatch<React.SetStateAction<boolean>>;
  winDistance: number;
  setWinDistance: React.Dispatch<React.SetStateAction<number>>;
  circleRadius: number;
  setCircleRadius: React.Dispatch<React.SetStateAction<number>>;
  circleLoc: Loc | null;
  setCircleLoc: React.Dispatch<React.SetStateAction<Loc | null>>;
  closeDistanceMet: boolean;
  setCloseDistanceMet: React.Dispatch<React.SetStateAction<boolean>>;
  location: Location.LocationObject | null;
  setLocation: React.Dispatch<React.SetStateAction<Location.LocationObject | null>>;
}

export const GlobalContext = createContext<HCContext>({
  activePin: null,
  setActivePin: () => { },
  showActivePin: true,
  setShowActivePin: () => {},
  showDistance: true,
  setShowDistance: () => {},
  showDirection: true,
  setShowDirection: () => {},
  winDistance: 2,
  setWinDistance: () => {},
  circleRadius: 100,
  setCircleRadius: () => {},
  circleLoc: null,
  setCircleLoc: () => {},
  closeDistanceMet: false,
  setCloseDistanceMet: () => {},
  location: null,
  setLocation: () => {},
});



export const unstable_settings = {
  anchor: '(tabs)',
};



export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [activePin, setActivePin] = useState<Loc | null>(null)
  const [showActivePin, setShowActivePin] = useState<boolean>(true)
  const [showDistance, setShowDistance] = useState<boolean>(true)
  const [showDirection, setShowDirection] = useState<boolean>(true)
  const [winDistance, setWinDistance] = useState<number>(2)
  const [circleRadius, setCircleRadius] = useState<number>(100)
  const [circleLoc, setCircleLoc] = useState<Loc | null>(null)
  const [closeDistanceMet, setCloseDistanceMet] = useState<boolean>(false)
  const [location, setLocation] = useState<Location.LocationObject | null>(null)

  return (
    <GlobalContext.Provider value={{
      activePin,
      setActivePin,
      showActivePin,
      setShowActivePin,
      showDistance,
      setShowDistance,
      showDirection,
      setShowDirection,
      winDistance,
      setWinDistance,
      circleLoc,
      setCircleLoc,
      circleRadius,
      setCircleRadius,
      closeDistanceMet,
      setCloseDistanceMet,
      location,
      setLocation,
    }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GlobalContext.Provider>
  );
}
