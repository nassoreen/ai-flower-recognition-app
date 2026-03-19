import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { config, databases } from "@/lib/appwrite";
import { Flower } from "@/types/appwrite";


export default function FlowerDetailScreen() {
  const { flowerId } = useLocalSearchParams<{ flowerId: string }>();
  const [flower, setFlower] = useState<Flower | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlowerDetail = async () => {
      try {
        const res = await databases.getDocument(
          config.databaseId!,
          config.flowersCollectionId!,
          flowerId!
        );
        setFlower(res as unknown as Flower);
      } catch (err) {
        console.error("❌ Error fetching flower detail:", err);
        setError("ไม่สามารถโหลดข้อมูลดอกไม้ได้");
      } finally {
        setLoading(false);
      }
    };

    fetchFlowerDetail();
  }, [flowerId]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#9333EA" />
        <Text className="mt-3 text-gray-600">กำลังโหลดข้อมูล...</Text>
      </View>
    );
  }

  if (error || !flower) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-6">
        <Text className="text-red-500 text-center mb-3">{error}</Text>
        <TouchableOpacity
          className="bg-pink-500 px-6 py-3 rounded-full"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold text-base">กลับ</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
     <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 bg-white"
    >
      {/* ภาพพื้นหลังส่วนหัว */}
      <View className="relative">
        {flower.image_url ? (
          <Image
            source={{ uri: flower.image_url }}
            className="w-full h-[380px] rounded-b-[40px]"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-[380px] bg-gray-200 justify-center items-center rounded-b-[40px]">
            <Text className="text-gray-500">ไม่มีรูปภาพ</Text>
          </View>
        )}

        {/* overlay gradient */}
        <View className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent rounded-b-[40px]" />

        {/* ปุ่มย้อนกลับ */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-12 left-5 bg-white/90 p-3 rounded-full shadow"
        >
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
      </View>

      {/* เนื้อหา */}
      <View className="p-6 mt-2">
        {/* ชื่อดอกไม้ */}
        <Text className="text-3xl font-rubik-bold text-pink-600 mb-1">
          {flower.name}
        </Text>
        <Text className="text-gray-500 font-rubik mb-4 italic">
          {flower.origin ? `แหล่งกำเนิด: ${flower.origin}` : "ไม่มีข้อมูลแหล่งกำเนิด"}
        </Text>

        {/* การ์ดข้อมูล */}
        <View className="bg-pink-50 rounded-3xl p-5 mb-6 shadow-sm border border-pink-100">
          <Text className="text-lg font-rubik-semibold text-pink-700 mb-2">
            รายละเอียด 
          </Text>
          <Text className="text-gray-700 font-rubik leading-6">
            {flower.description || "ไม่มีข้อมูล"}
          </Text>
        </View>

        <View className="bg-green-50 rounded-3xl p-5 mb-6 shadow-sm border border-green-100">
          <Text className="text-lg font-rubik-semibold text-green-700 mb-2">
            การดูแล 
          </Text>
          <Text className="text-gray-700 font-rubik leading-6">
            {flower.care_instructions || "ไม่มีข้อมูล"}
          </Text>
        </View>

        <View className="bg-yellow-50 rounded-3xl p-5 mb-6 shadow-sm border border-yellow-100">
          <Text className="text-lg font-rubik-semibold text-yellow-700 mb-2">
            การใช้งาน 
          </Text>
          <Text className="text-gray-700 font-rubik leading-6">
            {flower.uses || "ไม่มีข้อมูล"}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
