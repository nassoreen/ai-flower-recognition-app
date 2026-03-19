import { router } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function QuickMenu() {
  const items = [
    {
      icon: "camera", // กล้อง
      label: "สแกนภาพ",
      color: "#FCE4EC",
      onPress: () => router.push("/scan"),
    },
    {
      icon: "time", // นาฬิกา = ประวัติ
      label: "ประวัติ",
      color: "#E8F5E9",
      onPress: () => router.push("/HistoryScreen"),
    },
    {
      icon: "leaf", // ใบไม้ = บันทึกการดูแล
      label: "บันทึกการดูแล",
      color: "#FFF8E1",
      onPress: () => router.push("/collection/flower/[flowerId]"),
    },
    {
      icon: "people", // คนหลายคน = ชุมชน
      label: "ชุมชน",
      color: "#E3F2FD",
      onPress: () => router.push("/community"),
    },
  ];

  return (
    <View className="flex-row justify-around px-5 py-5">
      {items.map((item, index) => (
        <TouchableOpacity
          key={index}
          activeOpacity={0.8}
          onPress={item.onPress}
          className="items-center"
        >
          <View
            className="p-5 rounded-2xl shadow-md"
            style={{ backgroundColor: item.color }}
          >
              <Ionicons name={item.icon as any} size={28} color="rgba(0,0,0,0.45)" />
          </View>
          <Text className="text-sm text-gray-700 mt-2 font-rubik-medium">
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
