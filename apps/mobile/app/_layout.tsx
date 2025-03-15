import { SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font"
import './global.css'
import { useEffect } from "react";
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo'
import { tokenCache } from '@/lib/auth'
import { LogBox } from "react-native";
import 'react-native-get-random-values';
import uuid from 'react-native-uuid';


const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
if (!publishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env',
  )
}
LogBox.ignoreLogs(["Clerk:"]);

// const testSecureStore = async () => {
//   try {
//     await SecureStore.setItemAsync("test_key", "test_value");
//     const value = await SecureStore.getItemAsync("test_key");
//     console.log("SecureStore test:", value); // Should log "test_value"
//   } catch (error) {
//     console.error("SecureStore is not working:", error);
//   }
// };
export default function RootLayout() {

  const [Fontsloaded] = useFonts({
    "Jakarta-Bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "Jakarta-ExtraBold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "Jakarta-ExtraLight": require("../assets/fonts/PlusJakartaSans-ExtraLight.ttf"),
    "Jakarta-Light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
    "Jakarta-Medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "Jakarta-Regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "Jakarta-SemiBold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
  });

  useEffect(() => {
    if (!Fontsloaded) {
      SplashScreen.hideAsync();
    }
  }, [Fontsloaded])

  if (!Fontsloaded) {
    return null;
  }
  // useEffect(() => {
  //   testSecureStore();
  // }, []);

  
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false}}></Stack.Screen>
          <Stack.Screen name="(auth)" options={{ headerShown: false}}></Stack.Screen>
          <Stack.Screen name="(root)" options={{ headerShown: false}}></Stack.Screen>
          {/* <Stack.Screen name="+not-found" /> */}
        </Stack>
      </ClerkLoaded>
    </ClerkProvider>
    
  )
}


