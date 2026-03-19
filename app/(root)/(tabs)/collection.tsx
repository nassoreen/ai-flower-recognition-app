
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";

import Search from "@/components/Search";    //ควรลบออก
import { config, databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import CollectionCard from "@/components/CollectionCard";
import { createCollection } from "@/services/addcollection";
import { useGlobalContext } from "@/lib/global-provider";
import { Ionicons } from "@expo/vector-icons";


interface UserCollection {
  $id: string;
  userId: string;
  name: string;       // ✅ ชื่อคอลเลคชัน
  createdAt?: string; // optional
  imageUrl?: string;
}


async function fetchUserCollections(userId: string): Promise<UserCollection[]> {
  if (!config.databaseId || !config.userCollectionId) {
    throw new Error("Missing Appwrite config");
  }
  const res = await databases.listDocuments(
    config.databaseId,
    config.userCollectionId,
    [Query.equal("userId", userId)]
  );
  return res.documents as unknown as UserCollection[];
}


const Explore = () => {
  const { user } = useGlobalContext();
  const [collections, setCollections] = useState<UserCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  

  const loadCollections = async (silent = false) => {
    if (!user?.$id) {
      console.warn("⏳ ยังไม่มี userId — ข้ามการโหลดชั่วคราว");
      return;
    }

    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const userCollections = await fetchUserCollections(user.$id);
      setCollections(userCollections);
    } catch (e) {
      console.error("❌ โหลดคอลเลคชันล้มเหลว:", e);
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถโหลดคอลเลคชันได้");
    } finally {
      if (!silent) setLoading(false);
      else setRefreshing(false);
    }
  };


  useEffect(() => {
    loadCollections(); // โหลดพร้อม spinner ครั้งแรก
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCollections(true); // โหลดแบบเงียบเมื่อกลับมาหน้า
    }, [])
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [collectionName, setCollectionName] = useState("");
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [addFlowerModal, setAddFlowerModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<UserCollection | null>(null);
  const [editName, setEditName] = useState("");

  const handleSaveCollection = async () => {
    if (!collectionName.trim()) return;
    try {
      let imageUrl = "";

      if (selectedImageUri) {
        // เก็บ URI ของ asset โดยตรง
        imageUrl = selectedImageUri;
      }

      await createCollection(user?.$id!, collectionName.trim(), imageUrl);

      Alert.alert("สำเร็จ", `สร้างคอลเลคชัน: ${collectionName}`);
      setModalVisible(false);
      setCollectionName("");
      setSelectedImageUri(null);
      loadCollections();
    } catch (err) {
      Alert.alert("ผิดพลาด", "ไม่สามารถสร้างคอลเลคชันได้");
    }
  };



 // ตัวเลือกภาพที่เตรียมไว้
const predefinedImages = [
  require("@/assets/collections/collection_1.jpeg"),
  require("@/assets/collections/collection_2.jpeg"),
  require("@/assets/collections/collection_3.jpeg"),
  require("@/assets/collections/collection_4.jpeg"),
  require("@/assets/collections/collection_5.jpeg"),
];


{/* แสดงภาพที่เลือก */}
{selectedImageUri && (
  <Image
    source={{ uri: selectedImageUri }}
    className="w-32 h-32 rounded self-center my-3"
  />
  )
  }
  
  async function deleteCollection(collectionId: string) {
  try {
    await databases.deleteDocument(config.databaseId!, config.userCollectionId!, collectionId);
    Alert.alert("ลบสำเร็จ", "คอลเลคชันถูกลบเรียบร้อยแล้ว");
    loadCollections();
    setMenuVisible(false);
  } catch (err) {
    console.error(err);
    Alert.alert("ผิดพลาด", "ไม่สามารถลบคอลเลคชันได้");
  }
}

async function updateCollectionName(collectionId: string, newName: string) {
  if (!newName.trim()) return;
  try {
    await databases.updateDocument(config.databaseId!, config.userCollectionId!, collectionId, {
      name: newName.trim(),
    });
    Alert.alert("สำเร็จ", "แก้ไขชื่อคอลเลคชันเรียบร้อยแล้ว");
    loadCollections();
    setMenuVisible(false);
  } catch (err) {
    console.error(err);
    Alert.alert("ผิดพลาด", "ไม่สามารถแก้ไขได้");
  }
}

  return (
    <SafeAreaView className="flex-1 bg-white px-5 pt-12 pb-6">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-5">
        <TouchableOpacity className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
          <Text className="text-white text-lg font-bold">≡</Text>
        </TouchableOpacity>

        <Text className="flex-1 text-lg font-rubik-bold text-pink-100 ml-4">
          My Collections
        </Text>

        <View className="flex-row items-center">
          <View className="mr-4">
            <TouchableOpacity onPress={() => router.push("/HistoryScreen")}>
              <Image
                source={require("@/assets/icons/history.png")}
                className="w-5 h-5 tint-green-700"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View className="px-5 mt-5 flex-1">
        {/* Search bar */}
        <Search />

        {/* Title */}
        <View className="flex-row justify-between items-center mt-3">
          <Text className="text-gray-800 font-rubik-medium">
            คอลเลกชัน ({collections.length})
          </Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text className="text-yellow-500 font-rubik-medium">สร้างใหม่</Text>
        </TouchableOpacity>
        
        
        {/* Modal สรา้ง collection */}

        <Modal visible={modalVisible} transparent animationType="slide">
          <View className="flex-1 bg-black/50 justify-center items-center">
            <View className="bg-white w-4/5 p-5 rounded-2xl relative">
              {/* ปุ่มปิด (X) มุมขวาบน */}
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="absolute top-3 right-3 z-10"
              >
                <Text className="text-gray-400 text-2xl font-bold">×</Text>
              </TouchableOpacity>

              {/* หัวข้อ */}
              <Text className="text-lg font-rubik mb-3 text-center">สร้างคอลเลคชัน</Text>

              {/* ช่องกรอกชื่อ */}
              <TextInput
                value={collectionName}
                onChangeText={setCollectionName}
                placeholder="กรอกชื่อคอลเลคชัน"
                className="border border-gray-300 p-2 rounded-lg mb-4"
              />

              {/* เลือกรูปจากที่กำหนด */}
              <Text className="mb-2 font-rubik">เลือกรูปปก</Text>
              <View className="flex-row flex-wrap justify-between">
                {predefinedImages.map((img, idx) => {
                  const uri = Image.resolveAssetSource(img).uri;
                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => setSelectedImageUri(uri)}
                      className={`m-1 border-2 rounded-lg ${
                        selectedImageUri === uri ? "border-pink-500" : "border-gray-300"
                      }`}
                    >
                      <Image source={img} className="w-20 h-20 rounded-lg" />
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* แสดงภาพที่เลือก */}
              {selectedImageUri && (
                <Image
                  source={{ uri: selectedImageUri }}
                  className="w-32 h-32 rounded self-center my-3"
                />
              )}

              {/* ปุ่มบันทึก */}
              <TouchableOpacity
                onPress={handleSaveCollection}
                className="bg-pink-500 py-3 rounded-lg mt-3"
              >
                <Text className="text-white text-center font-rubik">บันทึก</Text>
              </TouchableOpacity>

              {/* ปุ่มยกเลิก */}
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setCollectionName("");
                  setSelectedImageUri(null);
                }}
                className="mt-3 py-3 rounded-lg border border-gray-300"
              >
                <Text className="text-gray-600 text-center font-rubik">ยกเลิก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

          
          {/* Modal จัดการ collection */}
          
        <Modal visible={menuVisible} transparent animationType="fade">
          <View className="flex-1 bg-black/40 justify-center items-center">
            <View className="bg-white w-[85%] p-6 rounded-3xl shadow-2xl">
              {/* ปุ่มปิด (X) */}
              <TouchableOpacity
                onPress={() => setMenuVisible(false)}
                className="absolute top-3 right-3 z-10"
              >
                <Text className="text-gray-400 text-3xl font-bold">×</Text>
              </TouchableOpacity>

              {/* หัวข้อ */}
              <Text className="text-xl font-rubik-bold text-center text-pink-600 mb-1">
                จัดการคอลเลคชัน
              </Text>
              <View className="h-1 w-16 bg-pink-300 rounded-full self-center mb-4" />

              {selectedCollection && (
                <>
                  {/* ข้อมูลคอลเลคชัน */}
                  <View className="bg-pink-50 rounded-2xl p-3 mb-3">
                    <Text className="text-gray-700 font-rubik">
                      <Text className="font-rubik">ชื่อปัจจุบัน:</Text>{" "}
                      {selectedCollection.name}
                    </Text>
                  </View>

                  {/* ช่องกรอกชื่อใหม่ */}
                  <TextInput
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="ชื่อใหม่..."
                    className="border border-gray-300 rounded-xl p-3 mb-4 text-gray-700"
                    placeholderTextColor="#aaa"
                  />

                  {/* ปุ่มแก้ไขชื่อ */}
                  <TouchableOpacity
                    className="bg-pink-500 py-3 rounded-2xl mb-3 shadow-sm flex-row items-center justify-center"
                    onPress={() =>
                      updateCollectionName(selectedCollection.$id, editName)
                    }
                  >
                    <Ionicons name="create-outline" size={20} color="white" style={{ marginRight: 8 }} />
                    <Text className="text-white font-rubik text-lg">แก้ไขชื่อ</Text>
                  </TouchableOpacity>

                  {/* ปุ่มลบ */}
                  <TouchableOpacity
                    className="bg-red-500 py-3 rounded-2xl shadow-sm flex-row justify-center items-center"
                    onPress={() => deleteCollection(selectedCollection.$id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="white" style={{ marginRight: 8 }} />
                    <Text className="text-white text-center font-rubik text-lg">
                      ลบคอลเลคชัน
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {/* ปุ่มยกเลิก */}
              <TouchableOpacity
                className="mt-5 py-3 rounded-2xl border border-gray-300 bg-gray-50"
                onPress={() => setMenuVisible(false)}
              >
                <Text className="text-gray-600 text-center font-rubik">ยกเลิก</Text>
              </TouchableOpacity>
            </View>
          </View>
          </Modal>

          {/* 🌸 Modal เพิ่มดอกไม้ */}
          <Modal visible={addFlowerModal} transparent animationType="slide">
            <View className="flex-1 bg-black/40">
              {/* ส่วนคลิกนอก popup เพื่อปิด */}
              <TouchableOpacity
                className="flex-1"
                activeOpacity={1}
                onPressOut={() => setAddFlowerModal(false)}
              />

              {/* ส่วน popup ที่เลื่อนขึ้นจากล่าง */}
              <View className="bg-white rounded-t-3xl px-6 py-6 shadow-2xl">
                {/* แถบเล็กด้านบน (Drag indicator) */}
                <View className="w-12 h-1.5 bg-gray-300 self-center rounded-full mb-5" />

                {/* หัวข้อ */}
                <Text className="text-xl font-rubik-bold text-center text-pink-600 mb-2">
                  เพิ่มดอกไม้
                </Text>
                <View className="h-1 w-16 bg-pink-300 rounded-full self-center mb-6" />

                {/* ปุ่มสแกนดอกไม้ */}
                <TouchableOpacity
                  onPress={() => {
                    setAddFlowerModal(false);
                    router.push("/scan");
                  }}
                  className="bg-pink-500 py-3 rounded-2xl mb-3 shadow-sm flex-row justify-center items-center"
                >
                  <Ionicons
                    name="camera-outline"
                    size={22}
                    color="white"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-white font-rubik text-lg">
                    สแกนดอกไม้ใหม่
                  </Text>
                </TouchableOpacity>

                {/* ปุ่มเลือกจากระบบ */}
                <TouchableOpacity
                  onPress={() => {
                    setAddFlowerModal(false);
                    router.push("/test-fetch");
                  }}
                  className="bg-pink-100 py-3 rounded-2xl border border-pink-300 flex-row justify-center items-center"
                >
                  <Ionicons
                    name="flower-outline"
                    size={22}
                    color="#EC4899"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-pink-600 font-rubik text-lg">
                    เลือกจากดอกไม้ในระบบ
                  </Text>
                </TouchableOpacity>

                {/* ปุ่มยกเลิก */}
                <TouchableOpacity
                  onPress={() => setAddFlowerModal(false)}
                  className="mt-5 py-3 rounded-2xl border border-gray-300 bg-gray-50"
                >
                  <Text className="text-gray-600 text-center font-rubik">ยกเลิก</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          
          
      </View>

        {/* Loading */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#EC4899" />
          </View>
        ) : collections.length === 0 ? (
          /* --- กรณีไม่มีดอกไม้ --- */
         <View className="items-center" style={{ top: 120 }}>
            {/* Outer circle */}
            <View
              className="w-60 h-60 rounded-full bg-white items-center justify-center"
              style={{
                elevation: 40,
                shadowColor: "#fdabc7",
                shadowOffset: { width: 10, height: 10 },
                shadowOpacity: 4,
                shadowRadius: 30,
              }}
            >
              {/* Inner circle */}
              <View
                className="w-48 h-48 rounded-full bg-white items-center justify-center"
                style={{
                  elevation: 5,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                }}
              >
                <Image
                  source={require("@/assets/images/FlowerColletion.png")}
                  className="w-32 h-32"
                  resizeMode="contain"
                />
              </View>

              {/* Left icon */}
              <View
                className="absolute -left-16 top-1/2 opacity-40"
                style={{ transform: [{ translateY: -1 }] }}
              >
                <Image
                  source={require("@/assets/images/sakura.png")}
                  className="w-10 h-10"
                />
              </View>

              {/* Right icon */}
              <View
                className="absolute -right-16 top-1/2 opacity-40"
                style={{ transform: [{ translateY: -1 }] }}
              >
                <Image
                  source={require("@/assets/images/sakura.png")}
                  className="w-10 h-10"
                />
              </View>
          </View>

            {/* Text */}
            <Text className="text-center text-black text-lg font-rubik mt-16 mb-4">
              เพิ่มดอกไม้ในคอลเลคชั่น
            </Text>

            {/* Button */}
            <TouchableOpacity
              className="bg-pink-100 w-[75%] py-3 rounded-[10px]"
              onPress={() => setAddFlowerModal(true)}
            >
              <Text className="text-white font-rubik-medium text-lg text-center">
                เพิ่มดอกไม้
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* --- กรณีมีดอกไม้ --- */
          <ScrollView
            className="mt-4"
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-row flex-wrap justify-between gap-y-4">
              {collections.map((collection) => (
                <TouchableOpacity
                  key={collection.$id}
                  onPress={() => router.push(`/collection/${collection.$id}`)} // ✅ ส่ง id ไป
                >
                  <CollectionCard
                    title={collection.name}
                    location="My Collection"
                    imageUrl={collection.imageUrl ?? "https://placehold.co/600x400?text=No+Image"}
                    onMorePress={() => {
                      setSelectedCollection(collection);
                      setEditName(collection.name);
                      setMenuVisible(true);
                    }}
                    
                  />
                </TouchableOpacity>

                
              ))}
                  
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Explore;