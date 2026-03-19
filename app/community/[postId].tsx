import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { databases, config, ID } from "@/lib/appwrite";
import { useLocalSearchParams, router } from "expo-router";
import { useGlobalContext } from "@/lib/global-provider";
import { Query } from "appwrite";
import { Ionicons } from "@expo/vector-icons";

export default function PostDetail() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { user } = useGlobalContext();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      const doc = await databases.getDocument(
        config.databaseId!,
        config.communityCollectionId!,
        postId!
      );
      setPost(doc);
      setLoading(false);
    };

    const loadComments = async () => {
      const res = await databases.listDocuments(
        config.databaseId!,
        config.comments!,
        [Query.equal("postId", postId)]
      );
      setComments(res.documents);
    };

    loadPost();
    loadComments();
  }, [postId]);

  const addComment = async () => {
    if (!user || !user.$id) {
      Alert.alert("กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น");
      return;
    }

    if (!text.trim()) return;

    try {
      await databases.createDocument(
        config.databaseId!,
        config.comments!,
        ID.unique(),
        {
          postId,
          userId: user.$id,
          username: user.name,
          userAvatar: user.avatar || "https://i.pravatar.cc/150",
          text,
        }
      );

      await databases.updateDocument(
        config.databaseId!,
        config.communityCollectionId!,
        postId!,
        {
          commentsCount: (post?.commentsCount || 0) + 1,
        }
      );

      setComments((prev) => [
        ...prev,
        {
          username: user.name,
          userAvatar: user.avatar,
          text,
        },
      ]);
      setText("");
    } catch (err) {
      console.error("❌ Error adding comment:", err);
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถเพิ่มคอมเมนต์ได้");
    }
  };

  if (loading)
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#ec4899" />
        <Text className="text-gray-500 mt-3">กำลังโหลดโพสต์...</Text>
      </View>
    );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-white"
    >
      {/* 🌸 Header */}
      <View className="flex-row items-center justify-between px-5 pt-14 pb-4 bg-white shadow-sm">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
        >
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text className="text-lg font-rubik-medium text-gray-900">
          รายละเอียดโพสต์
        </Text>
        <View className="w-10" /> 
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
        className="px-5 pt-12"
      >
        {/* 🧑‍🌾 ส่วนข้อมูลผู้ใช้ */}
        <View className="flex-row items-center mb-4">
          <Image
            source={{ uri: post.userAvatar || "https://i.pravatar.cc/150" }}
            className="w-10 h-10 rounded-full mr-3"
          />
          <View>
            <Text className="font-rubik-medium text-gray-900">
              {post.username}
            </Text>
            <Text className="text-xs font-rubik text-gray-400">โพสต์ล่าสุด</Text>
          </View>
        </View>

        {/* ✏️ เนื้อหาโพสต์ */}
        <View className="bg-gray-50 rounded-2xl p-4 mb-5 border border-gray-100">
          {post.content ? (
            <Text className="text-gray-800 text-base leading-6 mb-3">
              {post.content}
            </Text>
          ) : null}

          {post.imageUrl ? (
            <Image
              source={{ uri: post.imageUrl }}
              className="w-full h-64 rounded-xl mb-2"
              resizeMode="cover"
            />
          ) : null}

          <View className="flex-row items-center mt-2 space-x-3">
            <Ionicons name="chatbubble-outline" size={18} color="#6B7280" />
            <Text className="text-gray-500 text-sm">
              {post.commentsCount || 0} ความคิดเห็น
            </Text>
          </View>
        </View>

        {/* 💬 ส่วนคอมเมนต์ */}
        <Text className="text-gray-700 font-rubik-medium mb-3">
          ความคิดเห็นทั้งหมด ({comments.length})
        </Text>

        {comments.length === 0 ? (
          <Text className="text-gray-400 text-center italic mt-5">
            ยังไม่มีความคิดเห็น 
          </Text>
        ) : (
          <FlatList
            data={comments}
            keyExtractor={(item, index) => item.$id || index.toString()}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View className="flex-row mb-3">
                <Image
                  source={{
                    uri: item.userAvatar || "https://i.pravatar.cc/150",
                  }}
                  className="w-9 h-9 rounded-full mr-3"
                />
                <View className="bg-gray-100 px-3 py-2 rounded-2xl flex-1">
                  <Text className="font-semibold text-gray-800">
                    {item.username}
                  </Text>
                  <Text className="text-gray-700 mt-0.5">{item.text}</Text>
                </View>
              </View>
            )}
          />
        )}
      </ScrollView>

      {/* 🗨️ กล่องพิมพ์คอมเมนต์ */}
      <View className="flex-row items-center border-t border-gray-200 bg-white px-5 py-3 absolute bottom-0 w-full">
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="แสดงความคิดเห็น..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 mr-2 text-gray-800"
          placeholderTextColor="#9ca3af"
        />
        <TouchableOpacity
          onPress={addComment}
          className="bg-pink-500 w-10 h-10 rounded-full items-center justify-center shadow-md"
          activeOpacity={0.8}
        >
          <Ionicons name="send" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
