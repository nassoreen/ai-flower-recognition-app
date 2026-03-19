import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { databases, config } from "@/lib/appwrite";
import { Query } from "appwrite";
import { useGlobalContext } from "@/lib/global-provider";

export const MyCollectionPreview = () => {
  const { user } = useGlobalContext();
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ ดึงคอลเลคชันล่าสุดของผู้ใช้
  const fetchCollections = async () => {
    if (!user?.$id) return;
    setLoading(true);
    try {
      const res = await databases.listDocuments(
        config.databaseId!,
        config.userCollectionId!,
        [
          Query.equal("userId", user.$id),
          Query.orderDesc("$createdAt"),
          Query.limit(3),
        ]
      );
      setCollections(res.documents);
    } catch (err) {
      console.error("❌ Error fetching collections:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ โหลดใหม่ทุกครั้งที่ผู้ใช้กลับมาที่หน้า
  useFocusEffect(
    useCallback(() => {
      fetchCollections();
    }, [user?.$id])
  );

  if (loading) {
    return (
      <ActivityIndicator size="small" color="#EC4899" className="mt-5" />
    );
  }

  return (
    <View className="mt-6 px-5">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-rubik-medium text-black-300">
          คอลเลคชันของฉัน
        </Text>
        <TouchableOpacity onPress={() => router.push("/collection")}>
          <Text className="text-pink-500 font-rubik">ดูทั้งหมด ›</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {collections.length === 0 ? (
        <Text className="text-gray-400">ยังไม่มีคอลเลคชัน</Text>
      ) : (
        <FlatList
          horizontal
          data={collections}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.$id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/collection/[id]",
                  params: { id: item.$id },
                })
              }
              className="mr-4"
            >
              <View className="bg-white w-32 rounded-2xl shadow-sm overflow-hidden">
                <Image
                  source={
                    item.imageUrl
                      ? { uri: item.imageUrl }
                      : require("@/assets/images/gallery.png")
                  }
                  className="w-32 h-32"
                  resizeMode="cover"
                />
                <View className="p-2">
                  <Text
                    className="text-center text-gray-700 font-rubik"
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};
