// components/CollectionCard.tsx

import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

interface CollectionCardProps {
  imageUrl: string;
  title: string;
  location: string;
  onMorePress?: () => void;
}

const CollectionCard: React.FC<CollectionCardProps> = ({
  imageUrl,
  title,
  location,
  onMorePress,
}) => {
  return (
    <View className="w-44 bg-pink-50 rounded-2xl p-2 shadow-sm mr-4 relative">
      {/* Image */}
      <View className="relative">
        <Image
          source={{ uri: imageUrl }}
          className="w-full h-36 rounded-2xl"
          resizeMode="cover"
        />
      </View>

      {/* Title & location */}
      <View className="mt-2">
        <Text
          className="text-sm font-rubik-medium text-gray-900"
          numberOfLines={1}
        >
          {title}
        </Text>
        <View className="flex-row items-center mt-1">
          <FontAwesome name="map-marker" size={12} color="#999" />
          <Text className="text-xs text-gray-500 ml-1">{location}</Text>
        </View>
      </View>

      {/* More options icon */}
      <TouchableOpacity
        className="absolute bottom-2 right-2"
        onPress={onMorePress}
      >
        <FontAwesome name="ellipsis-v" size={16} color="#888" />
      </TouchableOpacity>
    </View>
  );
};

export default CollectionCard;
