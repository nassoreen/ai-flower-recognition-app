import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { config, databases, account } from "@/lib/appwrite";
import { useNavigation } from "@react-navigation/native";

import { Query } from "appwrite";
import { FlowerTabs } from "@/components/FlowerTabs";

interface Flower {
  $id: string;
  name: string;
  description?: string;
  image_url?: string;
  uses?: string;
  origin?: string;
}

interface FlowerCare {
  watering?: string;
  sunlight?: string;
  soil?: string;
  fertilizer?: string;
  pruning?: string;
  propagation?: string;
  environment?: string;
}

interface FlowerNote {
  $id: string;
  note: string;
  $createdAt: string;
}

export default function FlowerDetail() {
  const { flowerId, coverImage } = useLocalSearchParams<{
    flowerId: string;
    coverImage?: string;
  }>();

  const [flower, setFlower] = useState<Flower | null>(null);
  const [care, setCare] = useState<FlowerCare | null>(null);
  const [notes, setNotes] = useState<FlowerNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ✅ ดึงข้อมูลจาก flower_info
        const flowerDoc = await databases.getDocument(
          config.databaseId!,
          config.flowersCollectionId!,
          flowerId!
        );
        setFlower(flowerDoc as unknown as Flower);

        // ✅ ดึงข้อมูลจาก flower_care
        const careDocs = await databases.listDocuments(
          config.databaseId!,
          config.flowerCareCollectionId!,
          [Query.equal("flowerId", flowerId)]
        );
        if (careDocs.documents.length > 0)
          setCare(careDocs.documents[0] as FlowerCare);

        // ✅ ดึงข้อมูลจาก flower_notes
        const noteDocs = await databases.listDocuments(
          config.databaseId!,
          config.flowerNotesCollectionId!,
          [Query.equal("flowerId", flowerId)]
        );
        setNotes(noteDocs.documents as unknown as FlowerNote[]);
      } catch (error) {
        console.error("Error loading flower data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [flowerId]);

  if (loading)
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#EC4899" />
      </View>
    );

  if (!flower)
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text>ไม่พบข้อมูลดอกไม้</Text>
      </View>
    );

  const displayImage =
    coverImage && coverImage !== "" ? coverImage : flower.image_url;
  
  // 🗑️ ลบดอกไม้นี้
  const handleDeleteFlower = async () => {
  Alert.alert("ลบดอกไม้นี้?", "คุณแน่ใจหรือไม่ว่าต้องการลบดอกไม้นี้", [
    { text: "ยกเลิก", style: "cancel" },
    {
      text: "ลบ",
      style: "destructive",
      onPress: async () => {
        try {
          // ✅ ตรวจสอบว่าผู้ใช้ login แล้วหรือยัง
          const user = await account.get();

          // ✅ ดึงข้อมูลของดอกไม้ก่อนลบ
          const doc = await databases.getDocument(
            config.databaseId!,
            config.flowersCollectionId!,
            flower.$id
          );

          // ✅ ตรวจสอบว่าผู้ใช้มีสิทธิ์ลบไหม (เป็นเจ้าของหรือไม่)
          const permissions = doc.$permissions || [];
          const canDelete = permissions.some((perm: string) =>
            perm.includes(`user:${user.$id}`)
          );

          if (!canDelete) {
            Alert.alert(
              "ปฏิเสธการลบ",
              "คุณไม่มีสิทธิ์ลบดอกไม้นี้ ❌\n(เฉพาะเจ้าของหรือผู้ดูแลเท่านั้นที่สามารถลบได้)"
            );
            return;
          }

          // ✅ ลบดอกไม้
          await databases.deleteDocument(
            config.databaseId!,
            config.flowersCollectionId!,
            flower.$id
          );

          Alert.alert("สำเร็จ", "ลบดอกไม้เรียบร้อยแล้ว 🌸");
          router.back();
        } catch (err: any) {
          console.error("❌ ลบไม่สำเร็จ:", err);
          if (err.message?.includes("not authorized")) {
            Alert.alert(
              "เกิดข้อผิดพลาด",
              "คุณไม่มีสิทธิ์ลบดอกไม้นี้ โปรดตรวจสอบสิทธิ์ใน Appwrite"
            );
          } else {
            Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถลบได้ โปรดลองใหม่อีกครั้ง");
          }
        } finally {
          setMenuVisible(false);
        }
      },
    },
  ]);
};

  // 🌼 แชร์ไปยังคอมมูนิตี้
  const handleShareToCommunity = async () => {
    try {
      // จำลองการโพสต์ไปยังคอมมูนิตี้ (คุณสามารถเชื่อม Appwrite หรือ backend ของคุณเองภายหลังได้)
      // เช่น เพิ่ม document ลงใน collection "community_posts"
      await databases.createDocument(
        config.databaseId!,
        config.communityCollectionId!, // ✅ ต้องมีใน config
        "unique()", // หรือ ID.generate()
        {
          flowerId: flower.$id,
          name: flower.name,
          description: flower.description ?? "",
          image_url: displayImage,
          createdAt: new Date().toISOString(),
        }
      );

      Alert.alert("แชร์สำเร็จ", "โพสต์ดอกไม้นี้ไปยังคอมมูนิตี้แล้ว 🌸");
      setMenuVisible(false);
    } catch (err) {
      console.error("❌ แชร์ไม่สำเร็จ:", err);
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถแชร์ได้");
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 🌼 รูปดอกไม้ */}
        {displayImage ? (
          <Image
            source={{ uri: displayImage }}
            className="w-full h-96"
            resizeMode="cover"
            style={{
              borderBottomLeftRadius: 40,
              borderBottomRightRadius: 40,
            }}
          />
        ) : (
          <View className="w-full h-96 bg-gray-200 items-center justify-center rounded-b-3xl">
            <Text className="text-gray-500">ไม่มีรูปภาพ</Text>
          </View>
        )}

        {/* 🔹 ปุ่มหลัก */}
        <View className="px-5 mt-5">
          <View className="flex-row justify-between">
            <TouchableOpacity
              className="bg-pink-100 px-5 py-3 rounded-full flex-row items-center"
              onPress={() => router.push(`/3dModel?flowerName=${flower.name}`)}
            >
              <Ionicons name="cube-outline" size={18} color="#EC4899" />
              <Text className="ml-2 text-pink-700 font-medium">ดูแบบ 3D / AR</Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-green-100 px-5 py-3 rounded-full flex-row items-center">
              <Ionicons name="construct-outline" size={18} color="#16A34A" />
              <Text className="ml-2 text-green-700 font-medium">แยกส่วนโครงสร้าง</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 🔹 FlowerTabs */}
        <FlowerTabs flower={flower} care={care} notes={notes} />
      </ScrollView>

      {/* ส่วนหัว */}
      <View className="absolute top-12 left-0 right-0 flex-row items-center justify-between px-5">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="bg-black/40 p-2 rounded-full"
        >
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
         
        {/* ชื่อดอกไม้ */}
        <Text
          className="text-2xl font-rubik text-white"
          style={{
            textShadowColor: "rgba(0,0,0,0.4)",
            textShadowOffset: { width: 1, height: 2 },
            textShadowRadius: 4,
          }}
        >
          {flower.name}
        </Text>

        <TouchableOpacity className="bg-black/40 p-2 rounded-full"
          onPress={() => setMenuVisible(true)}>
          <Ionicons name="ellipsis-vertical" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* 🪄 Modal เมนูเพิ่มเติม */}
   <Modal
    visible={menuVisible}
    transparent
    animationType="fade"
    onRequestClose={() => setMenuVisible(false)}
  >
    {/* ชั้นพื้นหลังดำโปร่งเต็มจอ */}
    <Pressable
      onPress={() => setMenuVisible(false)}
      style={{
        flex: 1,
        justifyContent: "flex-start", // ด้านบน
        alignItems: "flex-end",       // ชิดขวา
        paddingTop: 25,               // ระยะจากขอบบน (ตรงกับปุ่ม ⋮)
        paddingRight: 15,             // ระยะจากขอบขวา
      }}
    >
      {/* กล่องเมนู */}
      <View
        style={{
          padding: 16,
          width: 220,

        }}
        onStartShouldSetResponder={() => true} // ป้องกันปิด modal ตอนกดในกล่อง
      >
        <TouchableOpacity
          onPress={handleShareToCommunity}
          style={{
            backgroundColor: "rgba(0,0,0,0.3)",
            paddingVertical: 10,
            borderRadius: 10,
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              color: "white",
              fontWeight: "600",
              textAlign: "center",
              fontSize: 15,
              fontFamily: "Rubik-Medium",
            }}
          >
            แชร์ไปยังคอมมูนิตี้
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDeleteFlower}
          style={{
            backgroundColor: "rgba(0,0,0,0.3)",
            paddingVertical: 10,
            borderRadius: 10,
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              color: "white",
              fontWeight: "600",
              textAlign: "center",
              fontSize: 15,
              fontFamily: "Rubik-Medium",
            }}
          >
            ลบดอกไม้
          </Text>
        </TouchableOpacity>

      </View>
    </Pressable>
  </Modal>
    </View>
  );
}
