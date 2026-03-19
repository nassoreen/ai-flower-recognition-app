import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  ScrollView,
} from "react-native";
import { ID, Query } from "react-native-appwrite";
import { databases, config } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function CreatePost() {
  const { user } = useGlobalContext();
  const [content, setContent] = useState("");
  const [selectedFlower, setSelectedFlower] = useState<any>(null);
  const [flowers, setFlowers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ ฟังก์ชันดึงชื่อดอกไม้จาก flowerId
  const fetchFlowerNameById = async (flowerId: string) => {
    try {
      const flowerDoc = await databases.getDocument(
        config.databaseId!,
        config.flowersCollectionId!, // ✅ collection หลักของดอกไม้
        flowerId
      );
      return flowerDoc.name || "ไม่ทราบชื่อ";
    } catch (error) {
      console.error("❌ Error fetching flower name:", error);
      return "ไม่ทราบชื่อ";
    }
  };

  // ✅ โหลดดอกไม้จากคอลเลคชันของผู้ใช้ + ดึงชื่อจาก flowerId
  useEffect(() => {
    const fetchFlowers = async () => {
      if (!user?.$id) return;
      try {
        const res = await databases.listDocuments(
          config.databaseId!,
          config.CollectionItems!,
          [Query.equal("userId", user.$id)]
        );

        // ดึงชื่อจาก flowerId แล้ว merge เข้ามาใน state
        const withNames = await Promise.all(
          res.documents.map(async (item) => {
            const flowerName = await fetchFlowerNameById(item.flowerId);
            return { ...item, flowerName };
          })
        );

        setFlowers(withNames);
      } catch (err) {
        console.error("❌ Error fetching flowers:", err);
      }
    };
    fetchFlowers();
  }, [user?.$id]);

  // ✅ ฟังก์ชันโพสต์
  const handlePost = async () => {
    if (!content.trim() && !selectedFlower) {
      Alert.alert("แจ้งเตือน", "กรุณาเลือกดอกไม้หรือพิมพ์ข้อความก่อนโพสต์");
      return;
    }

    setLoading(true);
    try {
      if (!user) {
        Alert.alert("แจ้งเตือน", "กรุณาเข้าสู่ระบบก่อนโพสต์");
        return;
      }

      await databases.createDocument(
        config.databaseId!,
        config.communityCollectionId!,
        ID.unique(),
        {
          userId: user.$id,
          username: user.name,
          userAvatar: (user as any).prefs?.avatarUrl || "https://i.pravatar.cc/150",
          content,
          flowerId: selectedFlower?.flowerId || "",
          flowerName: selectedFlower?.flowerName || "",
          likes: [],
          imageUrl: selectedFlower?.cover_image || "",
        }
      );

      Alert.alert("🌸 สำเร็จ", "โพสต์ของคุณถูกเผยแพร่แล้ว!");
      router.back();
    } catch (err) {
      console.error("❌ Error creating post:", err);
      Alert.alert("ผิดพลาด", "ไม่สามารถโพสต์ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* 🌸 Header */}
      <View className="flex-row justify-between items-center px-5 pt-16 pb-4 bg-white shadow-sm">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
        >
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>

        <Text className="text-lg font-rubik-medium text-gray-900">สร้างโพสต์ใหม่</Text>

        <View className="w-10">
          {/* ช่องว่างด้านขวาเพื่อสมดุล */}
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        {/* 📝 Text Input */}
        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-5">
          <TextInput
            className="text-gray-800 text-base h-28"
            placeholder="คุณกำลังคิดอะไรอยู่? "
            placeholderTextColor="#9ca3af"
            multiline
            value={content}
            onChangeText={setContent}
          />
        </View>

        {/* 🌼 เลือกดอกไม้ */}
        <Text className="text-gray-700 font-rubik mb-2">เลือกดอกไม้จากคอลเลคชันของคุณ</Text>

        <FlatList
          data={flowers}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={{ paddingVertical: 6 }}
          renderItem={({ item }) => {
            const isSelected = selectedFlower?.$id === item.$id;
            return (
              <TouchableOpacity
                onPress={() => setSelectedFlower(item)}
                className={`mr-3 ${isSelected ? "border-2 border-pink-500 rounded-2xl p-1" : ""}`}
              >
                <Image
                  source={{ uri: item.cover_image }}
                  className="w-24 h-24 rounded-2xl"
                  resizeMode="cover"
                />
                <Text
                  className={`text-center mt-1 text-sm ${
                    isSelected ? "text-pink-500 font-rubik-medium" : "text-gray-700"
                  }`}
                >
                  {item.flowerName || "ไม่ทราบชื่อ"}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        {selectedFlower && (
          <View className="items-center mt-4">
            <Text className="text-gray-700 mb-1"> ดอกไม้ที่เลือก :</Text>
            <Text className="font-rubik-bold text-pink-500">{selectedFlower.flowerName}</Text>
          </View>
        )}

        {/* 💗 ปุ่มโพสต์ */}
        <TouchableOpacity
          onPress={handlePost}
          disabled={loading}
          activeOpacity={0.85}
          className="bg-pink-500 py-4 rounded-2xl items-center mt-8 shadow-md"
          style={{
            shadowColor: "#ec4899",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 5,
          }}
        >
          <Text className="text-white font-rubik text-lg tracking-wide">
            {loading ? "กำลังโพสต์..." : "โพสต์เลย "}
          </Text>
        </TouchableOpacity>

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
