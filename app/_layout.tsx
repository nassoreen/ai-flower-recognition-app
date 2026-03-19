// import { useFonts } from "expo-font";
// import * as NavigationBar from "expo-navigation-bar";
// import { SplashScreen } from "expo-router";
// import { Stack } from "expo-router/stack";
// import { useEffect } from "react";
// import { Platform } from "react-native";
// import { GestureHandlerRootView } from "react-native-gesture-handler";

// export default function RootLayout() {
//   const [loaded] = useFonts({
//     "Rubik-Bold": require("../assets/fonts/Rubik-Bold.ttf"),
//     "Rubik-ExtraBold": require("../assets/fonts/Rubik-ExtraBold.ttf"),
//     "Rubik-Light": require("../assets/fonts/Rubik-Light.ttf"),
//     "Rubik-Medium": require("../assets/fonts/Rubik-Medium.ttf"),
//   });

//   useEffect(() => {
//     if (loaded) {
//       SplashScreen.hideAsync();
//     }
//   }, [loaded]);

//   if (!loaded) {
//     return null;
//   }

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <Stack
//         screenOptions={{
//           headerShown: false,
//           animation: "ios_from_right",
//         }}
//       >
//         <Stack.Screen name="index" />
//         <Stack.Screen name="3dModel/index" />
//       </Stack>
//     </GestureHandlerRootView>
//   );
// }
import { useEffect } from "react";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

import "./global.css";
import GlobalProvider from "@/lib/global-provider";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Rubik-Bold": require("../assets/fonts/Rubik-Bold.ttf"),
    "Rubik-ExtraBold": require("../assets/fonts/Rubik-ExtraBold.ttf"),
    "Rubik-Light": require("../assets/fonts/Rubik-Light.ttf"),
    "Rubik-Medium": require("../assets/fonts/Rubik-Medium.ttf"),
    "Rubik-Regular": require("../assets/fonts/Rubik-Regular.ttf"),
    "Rubik-SemiBold": require("../assets/fonts/Rubik-SemiBold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GlobalProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </GlobalProvider>
  );
}
