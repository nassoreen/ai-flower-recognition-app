import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Image,
} from "react-native";
import { databases, config } from "@/lib/appwrite";
import { ID } from "react-native-appwrite";
import { useGlobalContext } from "@/lib/global-provider";

export function FlowerTabs({ flower, care, notes }: any) {
  const [tab, setTab] = useState("info");
  const [newNote, setNewNote] = useState("");
  const [noteList, setNoteList] = useState(notes || []);
  const { user } = useGlobalContext();

  // ✅ เพิ่มบันทึกใหม่ลง Appwrite
  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    if (!user?.$id) {
      Alert.alert("กรุณาเข้าสู่ระบบก่อนเพิ่มบันทึก");
      return;
    }

    try {
      const newDoc = await databases.createDocument(
        config.databaseId!,
        config.flowerNotesCollectionId!,
        ID.unique(),
        {
          flowerId: flower.$id,
          userId: user.$id,
          note: newNote.trim(),
        }
      );

      setNoteList((prev: any) => [...prev, newDoc]);
      setNewNote("");
      Alert.alert("สำเร็จ", "บันทึกของคุณถูกเพิ่มแล้ว");
    } catch (error) {
      console.error("❌ handleAddNote error:", error);
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถเพิ่มบันทึกได้");
    }
  };

  return (
    <View className="mt-8">
      {/* 🔹 แท็บเลือกข้อมูล */}
      <View className="flex-row justify-around border-b border-gray-200 pb-2">
        {[
          { id: "info", label: "ข้อมูลทั่วไป" },
          { id: "care", label: "การดูแล" },
          { id: "env", label: "บันทึก" },
        ].map((item) => (
          <TouchableOpacity key={item.id} onPress={() => setTab(item.id)}>
            <Text
              className={`text-lg pb-2 font-rubik-medium ${
                tab === item.id
                  ? "text-pink-600 border-b-2 border-pink-500"
                  : "text-gray-400"
              }`}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView className="p-5 bg-white rounded-2xl mt-3 shadow-sm">
        {/* 🌸 ข้อมูลทั่วไป */}
        {tab === "info" && (
          <View className="space-y-4 mt-2">
            <View>
              <Text className="text-pink-600 font-rubik-medium text-xl mb-1">
                คำอธิบาย
              </Text>
              <Text className="text-gray-800 text-base leading-relaxed">
                {flower.description || "ไม่มีข้อมูล"}
              </Text>
            </View>

            <View>
              <Text className="text-pink-600 font-rubik-medium text-xl mb-1 mt-3">
                แหล่งกำเนิด
              </Text>
              <Text className="text-gray-800 text-base leading-relaxed">
                {flower.origin || "ไม่ระบุ"}
              </Text>
            </View>

            <View>
              <Text className="text-pink-600 font-rubik-medium text-xl mb-1 mt-3">
                การใช้งาน
              </Text>
              <Text className="text-gray-800 text-base leading-relaxed">
                {flower.uses || "ไม่ระบุ"}
              </Text>
            </View>
          </View>
        )}

        {/* 💧 การดูแล */}
        {tab === "care" && care && (
          <View className="space-y-4 mt-3 px-4">
            {[
              { icon: require("@/assets/images/sun.png"), title: "แสงแดด", value: care.sunlight },
              { icon: require("@/assets/images/water.png"), title: "น้ำ", value: care.watering },
              { icon: require("@/assets/images/earth.png"), title: "ดิน", value: care.soil },
              { icon: require("@/assets/images/fertilizer.png"), title: "ปุ๋ย", value: care.fertilizer },
              { icon: require("@/assets/images/pruning.png"), title: "การตัดแต่ง", value: care.pruning },
              { icon: require("@/assets/images/spropagation.png"), title: "การขยายพันธุ์", value: care.propagation },
              { icon: require("@/assets/images/environment.png"), title: "สิ่งแวดล้อม", value: care.environment },
            ].map((item, index) => (
              <View
                key={index}
                className="flex-row items-center bg-white rounded-3xl py-5 px-5 shadow-sm border border-gray-100"
              >
                <View className="bg-pink-100 w-12 h-12 rounded-full items-center justify-center mr-6">
                  <Image source={item.icon} className="w-6 h-6" resizeMode="contain" />
                </View>
                <View className="flex-1 ml-1 px-3">
                  <Text className="text-pink-600 font-rubik-medium text-lg mb-1">
                    {item.title}
                  </Text>
                  <Text className="text-gray-700 font-rubik text-base leading-relaxed">
                    {item.value || "ไม่ระบุ"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 🪴 บันทึก */}
        {tab === "env" && (
          <View>
            <Text className="font-semibold text-gray-800 mb-3 text-lg">
              บันทึกของฉัน
            </Text>

            {noteList.length > 0 ? (
              noteList.map((n: any) => (
                <View
                  key={n.$id}
                  className="border border-gray-200 rounded-lg p-3 mb-2 bg-gray-50"
                >
                  <Text className="text-gray-700">{n.note}</Text>
                </View>
              ))
            ) : (
              <Text className="text-gray-400">ยังไม่มีบันทึก</Text>
            )}

            {/* ✏️ เพิ่มบันทึกใหม่ */}
            <View className="mt-4">
              <TextInput
                placeholder="พิมพ์บันทึกของคุณ..."
                value={newNote}
                onChangeText={setNewNote}
                className="border border-gray-300 rounded-lg p-3 text-gray-700 bg-gray-50"
              />
              <TouchableOpacity
                onPress={handleAddNote}
                className="bg-pink-500 mt-3 py-3 rounded-lg"
              >
                <Text className="text-white text-center font-semibold text-base">
                  เพิ่มบันทึก
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
