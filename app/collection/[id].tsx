import { config, databases } from "@/lib/appwrite";
import { useLocalSearchParams,router } from "expo-router";
import { Query } from "appwrite";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

interface Flower {
  $id: string;
  name: string;
  description?: string;
  image_url?: string;
  cover_image?: string;
}

interface UserCollection {
  $id: string;
  name: string;
  userId: string;
  imageUrl?: string;
}

export default function CollectionDetail() {
  const { id: collectionId } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();

  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [collection, setCollection] = useState<UserCollection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCollection = async () => {
      try {
        // 1) ดึงข้อมูลคอลเลคชัน
        const col = await databases.getDocument(
          config.databaseId!,
          config.userCollectionId!,
          collectionId!
        );
        setCollection(col as unknown as UserCollection);

        // 2) ดึงรายการ flowerId ทั้งหมดจาก CollectionItems
        const res = await databases.listDocuments(
          config.databaseId!,
          config.CollectionItems!,
          [Query.equal("collectionId", collectionId)]
        );

        if (res.documents.length === 0) {
          setFlowers([]);
          return;
        }

        // ✅ รวมข้อมูล flower_info + cover_image จาก CollectionItems
const flowerDocs = await Promise.all(
  res.documents.map(async (doc) => {
    // ตรวจชื่อฟิลด์ที่เก็บ flower id
    const flowerId = doc.flowerId || doc.flower_id || doc.flowerID || doc.flower;

    if (!flowerId) {
      console.warn("⚠️ Missing flowerId in document:", doc);
      return null; // ถ้าไม่มี id ให้ข้าม
    }

    try {
      const flowerData = await databases.getDocument(
        config.databaseId!,
        config.flowersCollectionId!,
        flowerId
      );

      return {
        ...(flowerData as any),
        cover_image: doc.cover_image ?? null, // ใช้รูปจาก collection item ถ้ามี
      };
    } catch (err) {
      console.error("❌ Error loading flower:", flowerId, err);
      return null;
    }
  })
);

// กรองค่า null ออก
const uniqueFlowers = flowerDocs
  .filter((f): f is Flower => f !== null)
  .filter((f, index, self) => index === self.findIndex((t) => t.$id === f.$id));

setFlowers(uniqueFlowers);
      } catch (err) {
        console.error("loadCollectionFlowers error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCollection();
  }, [collectionId]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#EC4899" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header ด้านบน */}
      <View
        className="h-40 rounded-b-3xl overflow-hidden" // ✅ ทำให้รูปพื้นหลังโค้งมน
      >
        <ImageBackground
        source={require("@/assets/images/pink-bg.jpg")} // 🔹 เปลี่ยนเป็น path รูปของคุณ
        resizeMode="cover"
        className="h-40 rounded-b-3xl px-5 pt-12 justify-center"
        >
          {/* ปุ่มย้อนกลับ */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="absolute top-12 left-4 "
          >
            <Ionicons name="arrow-back" size={24} color="gray" />
          </TouchableOpacity>

          {/* ชื่อคอลเลคชัน */}
          <View className="items-center">
            <Text className="text-pink-400 text-4xl font-rubik">
              {collection?.name || "คอลเลคชัน"}
            </Text>
          </View>
        </ImageBackground>
      </View>

      {/* การด์ดอกไม้ */}
      <ScrollView className="flex-1 bg-gray-100 p-5">
        {flowers.length === 0 ? (
          <Text className="text-gray-500">ยังไม่มีดอกไม้ในคอลเลคชันนี้</Text>
        ) : (
          <View className="flex-row flex-wrap justify-between">
            {flowers.map((flower) => (
             <TouchableOpacity
              key={flower.$id}
              className="basis-[48%] bg-white rounded-2xl mb-4 shadow-md overflow-hidden"
              onPress={() =>
                router.push({
                  pathname: "/collection/flower/[flowerId]",
                  params: {
                    flowerId: flower.$id, // ✅ ต้องมี param นี้เสมอ
                    coverImage: flower.cover_image ?? flower.image_url ?? "",
                  },
                })
              }
            >
              {/* Image */}
              {flower.cover_image || flower.image_url ? (
                <Image
                  source={{ uri: flower.cover_image ?? flower.image_url }}
                  className="w-full h-32 bg-gray-100"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-32 bg-gray-200 items-center justify-center">
                  <Text className="text-gray-500">ไม่มีรูปภาพ</Text>
                </View>
              )}

              {/* เนื้อหาภายในการด์ดอกไม้ */}
              <View className="p-3">
                <Text
                  className="font-rubik-medium text-base text-gray-800"
                  numberOfLines={1}
                >
                  {flower.name}
                </Text>
                <Text className="text-xs font-rubik text-gray-500" numberOfLines={1}>
                  {flower.description || "-"}
                </Text>
              </View>
            </TouchableOpacity>

            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
