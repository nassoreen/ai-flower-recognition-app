import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { categories, categoriess } from "@/constants/data";
import { router } from "expo-router";

//  Component ย่อย
const CategoryCard = ({ image, label, onPress }: { image: any; label: string; onPress?: () => void }) => {
  return (
    <TouchableOpacity
      className="w-[48%] mb-4 rounded-xl overflow-hidden"
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View className="h-28 relative">
        <Image source={image} className="w-full h-full" resizeMode="cover" />
        <View className="absolute inset-0  bg-opacity-70" />
        <Text className="absolute bottom-2 left-2 right-2 text-white font-semibold text-sm text-center">
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// 🔹 ตัวหลักที่ export ออกไป
const CategoryGrid = () => {
  return (
    <View className="px-5 pt-4">
    <View className="flex-row items-center space-x-2  mt-3 mb-3">
      <Image
        source={require("@/assets/images/category.png")} 
        className="w-5 h-5 "
        resizeMode="contain"
      />
      <Text className="text-lg font-rubik-medium text-gray-500 px-3">หมวดหมู่</Text>
    </View>
      <View className="flex-row flex-wrap justify-between">
        {categoriess.map((item, index) => (
          <CategoryCard
            key={index}
            image={item.image}
            label={item.label}
          />
        ))}
      </View>
    </View>
  );
};

export default CategoryGrid;
