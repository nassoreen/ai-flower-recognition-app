import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { databases, config } from "@/lib/appwrite";
import { Query } from "appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { HistoryItem} from "@/types/appwrite";


interface Flower {
  $id: string;
  name: string;
  image_url?: string;
}


export default function HistoryScreen() {
  const { user } = useGlobalContext();
  const userId = user?.$id; // ✅ ใช้ id จริงของผู้ใช้
  const navigation = useNavigation();

  const [history, setHistory] = useState<(HistoryItem & { flowerName?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistoryAndFlowers = async () => {
      if (!userId) {
        console.warn("ไม่มี userId — ข้ามการโหลด");
        return;
      }
      
      try {
        // ดึงประวัติ
        const historyRes = await databases.listDocuments(
          config.databaseId!,
          config.scanhistories!,
          [Query.equal("userId", userId), Query.orderDesc("scannedAt")]
        );
        const historyDocs = historyRes.documents as unknown as HistoryItem[];

        // ดึง id ดอกไม้ที่พบในประวัติ (ไม่ซ้ำ)
        const flowerIds = Array.from(new Set(historyDocs.map((h) => h.flowerId)));

        // ดึงข้อมูลดอกไม้
        let flowerMap: Record<string, Flower> = {};
        if (flowerIds.length > 0) {
          const flowerRes = await databases.listDocuments(
            config.databaseId!,
            config.flowersCollectionId!, // ต้องกำหนดใน config ด้วย
            [Query.equal("$id", flowerIds)]
          );
          const flowers = flowerRes.documents as unknown as Flower[];
          flowerMap = flowers.reduce((acc, f) => {
            acc[f.$id] = f;
            return acc;
          }, {} as Record<string, Flower>);
        }

        // ผนวกชื่อดอกไม้และรูปลงในประวัติ
        const historyWithNames = historyDocs.map((h) => ({
          ...h,
          flowerName: flowerMap[h.flowerId]?.name ?? "ไม่ทราบชื่อ",
          image_url: h.image_url || flowerMap[h.flowerId]?.image_url || "",
        }));

        setHistory(historyWithNames);
      } catch (error) {
        console.error("โหลดประวัติไม่สำเร็จ:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryAndFlowers();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#22c55e" />
        <Text className="mt-4 text-lg text-gray-700">กำลังโหลดประวัติ...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-pink-50">
      {/* Header */}
      <ImageBackground
        source={require("@/assets/images/japan.png")}
        resizeMode="cover"
        className="px-4 pt-12 pb-4 flex-row items-center justify-center rounded-b-2xl overflow-hidden"
      >
        {/* ปุ่มย้อนกลับ */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="absolute left-4"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        {/* ชื่อหัวข้อ */}
        <Text className="text-white text-lg font-bold">
          ประวัติการสแกน
        </Text>
      </ImageBackground>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
      >
        {history.length === 0 ? (
          <View className="flex-1 justify-center items-center mt-20">
            <Text className="text-gray-400 text-lg">ยังไม่มีประวัติการสแกน</Text>
          </View>
        ) : (
          history.map((item) => (
            <View
              key={item.$id}
              className="mb-4 bg-white rounded-2xl p-4 flex-row items-center shadow-lg shadow-green-100 border border-green-50"
            >
              {item.image_url ? (
                <Image
                  source={{ uri: item.image_url }}
                  className="w-16 h-16 rounded-xl mr-4 border border-green-100"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-16 h-16 bg-gray-200 rounded-xl mr-4 justify-center items-center border border-gray-300">
                  <Text className="text-xs text-gray-500">ไม่มีรูป</Text>
                </View>
              )}

              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900">
                  {item.flowerName}
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  {new Date(item.scannedAt).toLocaleString()}
                </Text>
              </View>

              <View className="w-8 h-8 rounded-full bg-green-50 justify-center items-center">
                <Text className="text-green-500 text-lg">›</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>

  );
}
