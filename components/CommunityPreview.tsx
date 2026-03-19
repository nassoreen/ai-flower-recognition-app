import { View, Text, Image, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { databases, config } from "@/lib/appwrite";
import { Query } from "appwrite";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export const CommunityPreview = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ ดึงโพสต์ล่าสุดจาก Appwrite
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await databases.listDocuments(
          config.databaseId!,
          config.communityCollectionId!,
          [Query.orderDesc("$createdAt"), Query.limit(1)]
        );
        setPosts(res.documents);
      } catch (err) {
        console.error("❌ Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // ✅ แสดงสถานะกำลังโหลด
  if (loading) {
    return (
      <View className="items-center justify-center py-10">
        <ActivityIndicator size="small" color="#ff4d67" />
        <Text className="text-gray-400 mt-2">กำลังโหลดโพสต์จากคอมมูนิตี้...</Text>
      </View>
    );
  }

  // ✅ แสดงโพสต์ล่าสุด
  return (
    <View className="mt-6 px-5">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-rubik-medium text-gray-800">คอมมูนิตี้ล่าสุด</Text>
        <TouchableOpacity onPress={() => router.push("/community")}>
          <Text className="text-pink-500 font-rubik-medium">ดูเพิ่มเติม</Text>
        </TouchableOpacity>
      </View>

      {/* Post List */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        nestedScrollEnabled
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/community/[postId]",
                params: { postId: item.$id },
              })
            }
            className="bg-white rounded-2xl p-4 mb-4 shadow-sm"
          >
            {/* User Info */}
            <View className="flex-row items-center mb-2">
              <Image
                source={{
                  uri: item.userAvatar || "https://i.pravatar.cc/150?u=default",
                }}
                className="w-10 h-10 rounded-full mr-3"
              />
              <View>
                <Text className="font-rubik-medium text-gray-800">
                  {item.username || "ผู้ใช้ไม่ทราบชื่อ"}
                </Text>
                <Text className="text-xs text-gray-400">
                  {new Date(item.$createdAt).toLocaleString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "short",
                  })}
                </Text>
              </View>
            </View>

            {/* Content */}
            {item.content && (
              <Text className="text-gray-800 mb-2">{item.content}</Text>
            )}

            {/* Image */}
            {item.imageUrl && (
              <Image
                source={{ uri: item.imageUrl }}
                className="w-full h-48 rounded-xl mb-3"
                resizeMode="cover"
              />
            )}

            {/* Reaction bar */}
            <View className="flex-row justify-between items-center mt-2">
              <View className="flex-row space-x-5">
                <View className="flex-row items-center space-x-1">
                  <Ionicons name="heart-outline" size={18} color="#ff4d67" />
                  <Text className="text-gray-600 text-sm">
                    {Array.isArray(item.likes) ? item.likes.length : 0}
                  </Text>
                </View>
                <View className="flex-row items-center space-x-1">
                  <Ionicons name="chatbubble-outline" size={18} color="#5b6b7a" />
                  <Text className="text-gray-600 text-sm">
                    {item.commentsCount || 0}
                  </Text>
                </View>
              </View>
              <Ionicons name="ellipsis-horizontal" size={18} color="#5b6b7a" />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};
