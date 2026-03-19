import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { databases, storage, account, config } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";

export default function EditProfile() {
  const { user, refetch } = useGlobalContext();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [loading, setLoading] = useState(false);

  // 📸 เลือกรูปใหม่
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  // 💾 บันทึกการเปลี่ยนแปลง
  const handleSave = async () => {
    try {
      setLoading(true);
      const currentUser = await account.get();

      let avatarUrl = avatar;

      // ✅ ถ้ามีรูปใหม่ → อัปโหลดไป Storage
      if (avatar && avatar !== user?.avatar) {
        const file = await storage.createFile(config.bucketId!, "unique()", avatar);
        avatarUrl = storage.getFileView(config.bucketId!, file.$id);
      }

      // ✅ อัปเดตใน Database collection `users`
      const response = await databases.updateDocument(
        config.databaseId!,
        config.userCollectionId!, // ใส่ collectionId ของ `users`
        user?.$id!, // document ID ของผู้ใช้
        {
          name,
          email,
          avatarUrl,
        }
      );

      Alert.alert("✅ สำเร็จ", "อัปเดตข้อมูลผู้ใช้เรียบร้อยแล้ว");
      refetch(); // โหลดข้อมูลใหม่
    } catch (error) {
      console.error(error);
      Alert.alert("❌ เกิดข้อผิดพลาด", "ไม่สามารถอัปเดตข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white p-6">
      <Text className="text-xl font-rubik-medium mb-4 text-pink-600">แก้ไขโปรไฟล์</Text>

      <TouchableOpacity onPress={pickImage} className="items-center mb-4">
        <Image
          source={{ uri: avatar || user?.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png" }}
          className="w-28 h-28 rounded-full border-2 border-pink-300"
        />
        <Text className="text-pink-500 mt-2">เปลี่ยนรูปโปรไฟล์</Text>
      </TouchableOpacity>

      <Text className="text-gray-700 mb-1">ชื่อ</Text>
      <TextInput
        className="border border-gray-300 rounded-lg p-3 mb-3"
        value={name}
        onChangeText={setName}
      />

      <Text className="text-gray-700 mb-1">อีเมล</Text>
      <TextInput
        className="border border-gray-300 rounded-lg p-3 mb-5"
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity
        onPress={handleSave}
        disabled={loading}
        className="bg-pink-500 py-3 rounded-xl items-center"
      >
        <Text className="text-white font-rubik-medium">
          {loading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
