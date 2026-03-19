import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Redirect, router } from "expo-router";
import { useGlobalContext } from "@/lib/global-provider";
import { login, loginWithEmail } from "@/lib/appwrite"; // ✅ เพิ่ม loginWithEmail
import icons from "@/constants/icons";
import images from "@/constants/images";
import { Ionicons } from "@expo/vector-icons";

const Auth = () => {
  const { refetch, loading, isLogged } = useGlobalContext();

  // 🧩 state สำหรับ Email Login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  if (!loading && isLogged) return <Redirect href="/" />;

  // 🟢 Google Login
  const handleLogin = async () => {
    const result = await login();
    if (result) refetch();
    else Alert.alert("Error", "Failed to login with Google");
  };

  // 🔵 Email Login
  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert("กรุณากรอกข้อมูลให้ครบ", "โปรดกรอกอีเมลและรหัสผ่าน");
      return;
    }

    try {
      await loginWithEmail(email, password);
      Alert.alert("สำเร็จ", "เข้าสู่ระบบเรียบร้อยแล้ว");
      refetch();
    } catch (error: any) {
      Alert.alert("เข้าสู่ระบบไม่สำเร็จ", error.message);
    }
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        {/* Title */}
        <Text className="text-3xl font-rubik-bold text-black-300 mb-2">
          Login
        </Text>
        <Text className="text-base text-gray-500 mb-6">
          Welcome back! Please sign in to continue.
        </Text>

        {/* Email Field */}
        <Text className="text-sm font-rubik text-black-300 mb-2">
          Email Address
        </Text>
        <TextInput
          placeholder="hello@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#9CA3AF"
          className="border border-gray-300 rounded-xl p-3 mb-4"
        />

        {/* Password Field */}
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm font-rubik text-black-300">Password</Text>
          <TouchableOpacity>
            <Text className="text-blue-500 text-sm">Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <View className="relative mb-4">
          <TextInput
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholderTextColor="#9CA3AF"
            className="border border-gray-300 rounded-xl p-3 pr-10"
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3"
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#6B7280"
            />
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleEmailLogin}
          className="bg-blue-600 py-4 rounded-xl mb-6"
        >
          <Text className="text-black text-center text-lg font-rubik-medium">
            Login
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View className="flex-row items-center mb-6">
          <View className="flex-1 h-px bg-gray-300" />
          <Text className="mx-3 text-gray-400 text-sm">or sign in with</Text>
          <View className="flex-1 h-px bg-gray-300" />
        </View>

        {/* Google Login */}
        <TouchableOpacity
          onPress={handleLogin}
          className="flex-row items-center justify-center border border-gray-300 rounded-xl py-3 bg-gray-50"
        >
          <Image
            source={icons.google}
            className="w-5 h-5 mr-2"
            resizeMode="contain"
          />
          <Text className="text-gray-700 font-rubik-medium">
            Continue with Google
          </Text>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <TouchableOpacity
            onPress={() => router.push("/register")}
            className="mt-8">
            
          <Text className="text-center text-blue-500 text-base">
            Create an account
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Auth;
