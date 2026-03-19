import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Redirect, router } from "expo-router";
import { useGlobalContext } from "@/lib/global-provider";
import images from "@/constants/images";

const Auth = () => {
  const { loading, isLogged } = useGlobalContext();

  // ถ้าเข้าสู่ระบบแล้ว → ไปหน้า Home
  if (!loading && isLogged) return <Redirect href="/" />;

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView contentContainerStyle={{ height: "100%" }}>
        {/* รูปภาพ onboarding */}
        <Image
          source={images.onboarding}
          className="w-full h-4/6"
          resizeMode="contain"
        />

        <View className="px-10">
          <Text className="text-base text-center uppercase font-rubik text-black-200">
            Welcome To Real Scout
          </Text>

          <Text className="text-3xl font-rubik-bold text-black-300 text-center mt-2">
            Let s Get You Closer To {"\n"}
            <Text className="text-primary-300">Your Ideal Home</Text>
          </Text>

          <Text className="text-lg font-rubik text-black-200 text-center mt-12">
            Login to Real Scout
          </Text>

          {/* ปุ่มไปหน้า Login */}
          <TouchableOpacity
            onPress={() => router.push("/login")}
            className="bg-pink-100 rounded-full w-full py-4 mt-3"
          >
            <Text className="text-white text-center text-lg font-rubik-medium">
              Login
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Auth;
