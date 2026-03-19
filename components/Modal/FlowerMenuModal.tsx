// components/FlowerMenuModal.tsx
import React from "react";
import {
  Modal,
  Pressable,
  View,
  TouchableOpacity,
  Text,
} from "react-native";

interface FlowerMenuModalProps {
  visible: boolean;
  onClose: () => void;
  onShare: () => void;
  onDelete: () => void;
}

export const FlowerMenuModal: React.FC<FlowerMenuModalProps> = ({
  visible,
  onClose,
  onShare,
  onDelete,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          justifyContent: "flex-start", // ให้ขึ้นบน
          alignItems: "flex-end",       // ชิดขวา
          paddingTop: 25,               // เว้นตรงกับปุ่ม ⋮
          paddingRight: 15,             // เว้นจากขอบขวา
        }}
      >
        <View
          style={{
            backgroundColor: "rgba(0,0,0,0.3)",
            borderRadius: 15,
            width: 220,
            paddingVertical: 12,
            paddingHorizontal: 10,
          }}
          onStartShouldSetResponder={() => true}
        >
          <TouchableOpacity
            onPress={onShare}
            style={{
              backgroundColor: "rgba(255,255,255,0.1)",
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
              🌸 แชร์ไปยังคอมมูนิตี้
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onDelete}
            style={{
              backgroundColor: "rgba(255,255,255,0.1)",
              paddingVertical: 10,
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                color: "#FFCDD2",
                fontWeight: "600",
                textAlign: "center",
                fontSize: 15,
                fontFamily: "Rubik-Medium",
              }}
            >
              🗑️ ลบดอกไม้
            </Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};
