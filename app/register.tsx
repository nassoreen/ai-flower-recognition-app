import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { registerWithEmail } from "@/lib/appwrite";
import { router } from "expo-router";

const Register = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!email || !password || !name) {
      Alert.alert("โปรดกรอกข้อมูลให้ครบถ้วน");
      return;
    }
    if (password.length < 8) {
      Alert.alert("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }

    try {
      await registerWithEmail(email, password, name);
      Alert.alert("✅ สมัครสมาชิกสำเร็จ", "กรุณาเข้าสู่ระบบ");
      router.push("/login");
    } catch (error: any) {
      Alert.alert("สมัครไม่สำเร็จ", error.message);
    }
  };

  return (
    <SafeAreaView className="bg-white h-full px-6">
      <ScrollView>
        <Text className="text-3xl font-bold text-center mt-10">Create Account</Text>
        <Text className="text-center text-gray-500 mt-2 mb-8">
          ลงทะเบียนเพื่อเริ่มใช้งาน
        </Text>

        <TextInput
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          className="border border-gray-300 rounded-xl px-4 py-3 mb-4"
        />
        <TextInput
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          className="border border-gray-300 rounded-xl px-4 py-3 mb-4"
        />
        <TextInput
          placeholder="Password (min 8 characters)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="border border-gray-300 rounded-xl px-4 py-3 mb-6"
        />

        <TouchableOpacity
          onPress={handleRegister}
          className="bg-blue-500 py-4 rounded-xl"
        >
          <Text className="text-white text-center font-semibold text-lg">Register</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/login")}
          className="mt-6"
        >
          <Text className="text-center text-blue-600">Already have an account? Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Register;
