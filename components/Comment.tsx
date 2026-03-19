import { Models } from "react-native-appwrite";
import { View, Text, Image } from "react-native";
import icons from "@/constants/icons";

interface CommentItem extends Models.Document {
  postId: string;
  userId: string;
  username: string;
  userAvatar?: string;
  text: string;
}

interface Props {
  item: CommentItem;
}

const Comment = ({ item }: Props) => {
  return (
    <View className="flex flex-col items-start bg-white p-3 rounded-2xl mb-3 shadow-sm">
      {/* ส่วนโปรไฟล์ */}
      <View className="flex flex-row items-center">
        <Image
          source={
            item.userAvatar
              ? { uri: item.userAvatar }
              : require("@/assets/images/avatar.png") // fallback
          }
          className="size-12 rounded-full"
        />
        <View className="ml-3">
          <Text className="text-base font-rubik-bold text-gray-800">
            {item.username}
          </Text>
          <Text className="text-xs text-gray-500">
            {new Date(item.$createdAt).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </Text>
        </View>
      </View>

      {/* เนื้อหาคอมเมนต์ */}
      <Text className="text-gray-700 text-base font-rubik mt-3">
        {item.text}
      </Text>

      {/* แสดงหัวใจ */}
      <View className="flex-row items-center mt-3">
        <Image source={icons.heart} className="size-5" tintColor="#EC4899" />
        <Text className="text-gray-600 text-sm font-rubik ml-1">ถูกใจ</Text>
      </View>
    </View>
  );
};

export default Comment;
