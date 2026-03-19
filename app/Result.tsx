import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { databases, config } from "@/lib/appwrite";
import { Query, ID } from "appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { saveToScanHistories } from "@/services/scanHistoryService";
import type { RootStackParamList } from "@/navigation/types";

type ResultRouteProp = RouteProp<RootStackParamList, "Result">;

interface Flower {
  $id: string;
  name: string;
  description?: string;
  care_instructions?: string;
  uses?: string;
  origin?: string;
  image_url?: string;
}

interface UserCollection {
  $id: string;
  userId: string;
  name: string;
  imageUrl?: string;
}

export default function ResultScreen() {
  const { prediction, imageUrl } = useRoute<ResultRouteProp>().params as any;
  const navigation = useNavigation();
  const { user } = useGlobalContext();
  const userId = user?.$id;

  const [flowerInfo, setFlowerInfo] = useState<Flower | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collections, setCollections] = useState<UserCollection[]>([]);
  const [selectModalVisible, setSelectModalVisible] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const loadCollections = async () => {
      try {
        const res = await databases.listDocuments(
          config.databaseId!,
          config.userCollectionId!,
          [Query.equal("userId", userId)]
        );
        setCollections(res.documents as unknown as UserCollection[]);
      } catch (err) {
        console.error("❌ loadUserCollections error:", err);
      }
    };

    loadCollections();
  }, [userId]);

  useEffect(() => {
    let isMounted = true;

    async function fetchFlowerByName(name: string) {
      try {
        const res = await databases.listDocuments(
          config.databaseId!,
          config.flowersCollectionId!,
          [Query.equal("name", name)]
        );

        if (res.documents.length > 0) {
          const flower = res.documents[0] as unknown as Flower;
          if (isMounted) setFlowerInfo(flower);

          if (userId) {
            await saveToScanHistories({
              userId,
              flowerId: flower.$id,
              scannedAt: new Date().toISOString(),
              image_url: imageUrl ?? flower.image_url,
              flowerName: flower.name,
            });
          }
        } else {
          if (isMounted) setError("ไม่พบข้อมูลดอกไม้ที่ค้นหา");
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchFlowerByName(prediction.name);
    return () => {
      isMounted = false;
    };
  }, [prediction.name]);

  const handleAddToCollection = async (selectedCollectionId: string) => {
    if (!userId || !flowerInfo) {
      Alert.alert("เกิดข้อผิดพลาด", "ข้อมูลไม่ครบถ้วน");
      return;
    }

    try {
      await databases.createDocument(
        config.databaseId!,
        config.CollectionItems!,
        ID.unique(),
        {
          userId,
          collectionId: selectedCollectionId,
          flowerId: flowerInfo.$id,
          cover_image: imageUrl,
        }
      );

      Alert.alert("✅ เพิ่มดอกไม้ลงในคอลเลคชันเรียบร้อยแล้ว");
      setSelectModalVisible(false);
    } catch (error) {
      console.error("❌ handleAddToCollection error:", error);
      Alert.alert("เกิดข้อผิดพลาดในการเพิ่มในคอลเลคชัน");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#6B21A8" />
        <Text className="mt-4 text-lg">กำลังโหลดข้อมูล...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-4">
        <Text className="text-red-600 text-center mb-4">{error}</Text>
        <TouchableOpacity
          className="bg-indigo-700 px-6 py-3 rounded"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-semibold">กลับ</Text>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <View className="flex-1 bg-white">
      <View>
        {flowerInfo?.image_url ? (
          <Image
            source={{ uri: flowerInfo.image_url}}
            resizeMode="cover"
            className="w-full h-96"
          />
        ) : (
          <View className="w-full h-96 bg-gray-200 justify-center items-center">
            <Text className="text-gray-500">ไม่มีรูปภาพ</Text>
          </View>
        )}
        <TouchableOpacity
          className="absolute top-10 right-4 bg-white/70 p-2 rounded-full"
          onPress={() => navigation.goBack()}
          accessibilityLabel="ปิดหน้าจอ"
        >
          <Ionicons name="close" size={18} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 -mt-8 bg-white rounded-t-3xl p-6">
        <View className="flex-row items-center mb-2">
          <Image
            source={require("@/assets/images/correct.png")}
            className="w-4 h-4 mr-2"
          />
          <Text className="text-green-600 font-rubik text-sm">
            พบแล้ว! ดอกไม้นี้คือ...
          </Text>
        </View>



        <Text className="text-2xl font-rubik-bold text-pink-300 mb-6 mt-3">
          ผลลัพธ์การทำนาย
        </Text>

        <Text className="text-xl font-rubik mb-3">
          ดอกไม้ที่คาดว่าเป็น: <Text className="text-green-700">{prediction.name}</Text>
        </Text>

        <View className="mt-3 mb-8">
          {/* ข้อความ */}
          <Text className="text-gray-700 font-rubik mb-2 ">
            ความมั่นใจของ AI : {Math.round(prediction.confidence * 100)}%
          </Text>

          {/* หลอด progress */}
          <View className="w-[85%] h-4 bg-gray-200 rounded-full overflow-hidden">
            <View
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${prediction.confidence * 100}%` }}
            />
          </View>
        </View>


        {flowerInfo && (
          <>
            <Text className="text-lg font-semibold mb-1">รายละเอียด:</Text>
            <Text className="mb-4">{flowerInfo.description || '-'}</Text>
      {/* ปุ่ม "รายละเอียดเพิ่มเติม" — ขนาดพอดี ไม่เต็มจอ */}
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/alldetail",
              params: { flowerId: flowerInfo?.$id },
            })
          }
          className="flex-row items-center bg-white px-4 py-2 rounded-full border border-gray-300 shadow-sm self-start mb-6"
          activeOpacity={0.8}
        >
          <Ionicons
            name="information-circle-outline"
            size={18}
            color="#6B21A8"
          />
          <Text className="text-gray-700 font-rubik text-base ml-2">
            รายละเอียดเพิ่มเติม
          </Text>
        </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/*modal เพิ่มไปยัง collection */}
      <Modal visible={selectModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          {/* กล่องหลัก */}
          <View className="bg-white w-full rounded-3xl p-6 shadow-2xl border border-pink-200">
            {/* หัวข้อ */}
            <View className="items-center mb-5">
              <View className="w-14 h-1.5 bg-pink-300/80 rounded-full mb-3" />
              <Text className="text-2xl font-rubik-bold text-pink-500 tracking-wide">
                เพิ่มลงในคอลเลคชัน
              </Text>
              <Text className="text-gray-500 mt-1 text-center font-rubik text-sm leading-5">
                เลือกคอลเลคชันที่คุณต้องการเพิ่มดอกไม้นี้ลงไป 
              </Text>
            </View>

            {/* เนื้อหา */}
            {collections.length === 0 ? (
              <View className="items-center mb-6">
                <Image
                  source={require("@/assets/images/camera.png")}
                  className="w-24 h-24 mb-3 opacity-80"
                  resizeMode="contain"
                />
                <Text className="text-gray-500 text-center text-base leading-6">
                  คุณยังไม่มีคอลเลคชันเลย {"\n"}ลองสร้างใหม่ดูสิ!
                </Text>
              </View>
            ) : (
              <ScrollView
                className="max-h-[320px]"
                showsVerticalScrollIndicator={false}
              >
                {collections.map((c, i) => (
                  <TouchableOpacity
                    key={c.$id}
                    onPress={() => handleAddToCollection(c.$id)}
                    activeOpacity={0.9}
                    className={`p-4 mb-3 rounded-3xl flex-row items-center shadow-sm border
                      ${i % 2 === 0 ? "bg-pink-50 border-pink-100" : "bg-rose-50 border-rose-100"}`}
                  >
                    <View className="w-14 h-14 rounded-2xl overflow-hidden mr-3">
                      <Image
                        source={
                          c.imageUrl
                            ? { uri: c.imageUrl }
                            : require("@/assets/images/avatar.png")
                        }
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-rubik-medium text-gray-800">
                        {c.name}
                      </Text>
                      <Text className="text-xs text-gray-500 font-rubik">แตะเพื่อเพิ่ม</Text>
                    </View>
                    <View className="bg-white p-2 rounded-full shadow-sm">
                      <Ionicons name="add" size={18} color="#EC4899" />
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* เส้นคั่น */}
            <View className="border-t border-pink-100 mt-4 mb-3" />

            {/* ปุ่มล่าง */}
            <View className="flex-row justify-between mt-2 gap-3">
              <TouchableOpacity
                onPress={() => setSelectModalVisible(false)}
                className="flex-1 bg-gray-100 py-3 rounded-full items-center shadow-sm active:opacity-80"
              >
                <Text className="text-gray-700 font-rubik-medium text-base">
                  ยกเลิก
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/collection")}
                className="flex-1 bg-gradient-to-r from-pink-400 to-rose-500 py-3 rounded-full items-center shadow-md active:opacity-90"
              >
                <Text className="text-white font-rubik-medium text-base">
                   สร้างใหม่
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


    
      <View className="flex-row justify-center items-center mb-12 gap-x-6">
        {/* ปุ่มไปหน้า 3D Model */}
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/3dModel",
              params: { flowerName: prediction.name }, // 👈 ส่งชื่อดอกไม้ไป
            })
          }
          className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-md"
        >
          <Image
            source={require("@/assets/icons/modal.png")}
            className="w-6 h-6"
            style={{ tintColor: "#9333EA" }}
          />
        </TouchableOpacity>

        {/* ปุ่มเพิ่มในคอลเลคชั่น */}
      <TouchableOpacity
        className="flex-row items-center justify-center bg-pink-500 px-8 py-4 rounded-full shadow-lg w-[75%] self-center"
        onPress={() => setSelectModalVisible(true)}   // ✅ เปิด modal
      >
        <Ionicons name="heart" size={18} color="white" />
        <Text className="text-white font-semibold text-base ml-2">
          เพิ่มในคอลเลคชัน
        </Text>
      </TouchableOpacity>

      </View>

    </View>
  );
}
