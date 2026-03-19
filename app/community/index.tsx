import React, { useState, useCallback } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { databases, config } from "@/lib/appwrite";
import { Query } from "appwrite";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { toggleLike } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";

export default function CommunityPage() {
  const { user } = useGlobalContext();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleLike = async (postId: string) => {
    if (!user?.$id) return;
    try {
      const updatedLikes = await toggleLike(postId, user.$id);
      setPosts((prev) =>
        prev.map((p) => (p.$id === postId ? { ...p, likes: updatedLikes } : p))
      );
    } catch (err) {
      console.error(" Error liking post:", err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const fetchAllPosts = async () => {
        try {
          setLoading(true);
          const res = await databases.listDocuments(
            config.databaseId!,
            config.communityCollectionId!,
            [Query.orderDesc("$createdAt")]
          );
          setPosts(res.documents);
        } catch (err) {
          console.error(" Error fetching posts:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchAllPosts();
    }, [])
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#ec4899" />
        <Text className="text-gray-400 mt-4">กำลังโหลดโพสต์...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* 🌸 Header */}
      <View className="flex-row justify-between items-center px-6 pt-12 pb-12 mt-3 bg-white">
        {/* 🔙 ปุ่มย้อนกลับ */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
        >
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>

        {/* 🪷 หัวข้อกลาง */}
        <View className="items-center">
          <Text className="text-xl font-rubik-medium text-gray-900 ">Community</Text>
          <Text className="text-xs text-gray-400">โพสต์ล่าสุด</Text>
        </View>

        {/* 🔔 ปุ่มแจ้งเตือน */}
        <TouchableOpacity
          onPress={() => console.log("Notifications")}
          className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
        >
          <Ionicons name="notifications-outline" size={22} color="#6B21A8" />
        </TouchableOpacity>
      </View>

      {/* 🪴 Post Feed */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/community/[postId]",
                params: { postId: item.$id },
              })
            }
            className="bg-white rounded-3xl p-5 mb-5 border border-gray-100 shadow-sm"
          >
            {/* 🧑‍🌾 User Info */}
            <View className="flex-row items-center mb-3">
              <Image
                source={{ uri: item.userAvatar }}
                className="w-10 h-10 rounded-full border border-pink-100"
              />
              <View className="ml-3">
                <View className="flex-row items-center">
                  <Text className="font-rubik-medium text-gray-900">{item.username || "ผู้ใช้ไม่ทราบชื่อ"}</Text>
                  {item.verified && (
                    <Ionicons name="checkmark-circle" size={16} color="#10b981" className="ml-1" />
                  )}
                </View>
                <Text className="text-xs text-gray-400">
                  {new Date(item.$createdAt).toLocaleString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "short",
                  })}
                </Text>
              </View>
              <View className="ml-auto">
                <Ionicons name="ellipsis-horizontal" size={18} color="#9ca3af" />
              </View>
            </View>

            {/* ✏️ เนื้อหาโพสต์ */}
            {item.content ? (
              <Text className="text-gray-800 text-[15px] leading-6 mb-3">
                {item.content}
              </Text>
            ) : null}

            {/* 🌸 รูปภาพ */}
            {item.imageUrl && (
              <Image
                source={{ uri: item.imageUrl }}
                className="w-full h-48 rounded-2xl mb-4"
                resizeMode="cover"
              />
            )}

            {/* 💬 Reaction Bar */}
            <View className="flex-row justify-around items-center pt-2 border-t border-gray-100">
              <TouchableOpacity
                onPress={() => handleLike(item.$id)}
                className="flex-row items-center bg-gray-50 px-3 py-2 rounded-full"
              >
                <Ionicons
                  name={
                    Array.isArray(item.likes) && item.likes.includes(user?.$id)
                      ? "heart"
                      : "heart-outline"
                  }
                  size={18}
                  color={
                    Array.isArray(item.likes) && item.likes.includes(user?.$id)
                      ? "#ec4899"
                      : "#6b7280"
                  }
                />
                <Text className="ml-2 text-gray-600 text-sm">
                  {Array.isArray(item.likes) ? item.likes.length : 0}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/community/[postId]",
                    params: { postId: item.$id },
                  })
                }
                className="flex-row items-center bg-gray-50 px-3 py-2 rounded-full"
              >
                <Ionicons name="chatbubble-outline" size={18} color="#6b7280" />
                <Text className="ml-2 text-gray-600 text-sm">{item.commentsCount || 0}</Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center bg-gray-50 px-3 py-2 rounded-full">
                <Ionicons name="arrow-redo-outline" size={18} color="#6b7280" />
                <Text className="ml-2 text-gray-600 text-sm">แชร์</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* ➕ Floating Button */}
      <View className="absolute bottom-20 right-6">
        <TouchableOpacity
            onPress={() => router.push("/community/create")}
            className="w-16 h-16 rounded-full items-center justify-center shadow-2xl"
            style={{
              backgroundColor: "#ec4899", // 🌸 สีพื้นหลังชมพู
              shadowColor: "#ec4899",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3,
              shadowRadius: 10,
              elevation: 8,
            }}
          >
            <Ionicons name="add" size={32} color="white" />
          </TouchableOpacity>
      </View>
    </View>
  );
}
