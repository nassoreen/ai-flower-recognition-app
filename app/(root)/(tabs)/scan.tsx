import { RootStackParamList } from '@/navigation/types';
import { predictImage, PredictionResult } from '@/utils/predict';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useState } from 'react';
import { Alert, Image, Text, TouchableOpacity, View, Modal } from 'react-native';
import { uploadImage } from "@/services/uploadImage";
import { Ionicons } from "@expo/vector-icons";

export default function Scan() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showLowConfidenceModal, setShowLowConfidenceModal] = useState(false);
  const [lowConfidenceResult, setLowConfidenceResult] = useState<PredictionResult | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useFocusEffect(
    useCallback(() => {
      setImage(null);
      setLoading(false);
    }, [])
  );

  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'กรุณาอนุญาตใช้แกลเลอรี่');
      return false;
    }
    return true;
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'กรุณาอนุญาตใช้กล้อง');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const picked = result.assets[0];
      setImage(picked.uri);
      handlePredict(picked.uri);
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const picked = result.assets[0];
      setImage(picked.uri);
      handlePredict(picked.uri);
    }
  };

  const handlePredict = async (uri: string) => {
    try {
      setLoading(true);

      // ✅ 1. อัปโหลดภาพไป Appwrite Storage ก่อน
      const scanImageUrl = await uploadImage(uri);

      // ✅ 2. ส่งภาพเข้าโมเดลเพื่อทำนาย
      const result: PredictionResult = await predictImage(uri);

      // ✅ 3. ตรวจสอบความมั่นใจ
      const IsUnknow = result.name === "ไม่ทราบ" || result.confidence < 0.7;
      if (IsUnknow) {
          setLowConfidenceResult(result);
          setShowLowConfidenceModal(true); // 👈 แสดง modal
        } else {
          navigation.navigate("Result", {
            prediction: result,
            imageUrl: scanImageUrl,
          });
        }
      } catch (error: any) {
        alert(error.message || "เกิดข้อผิดพลาดในการทำนาย");
      } finally {
        setLoading(false);
      }
  };

  return (
    <View className="flex-1 items-center justify-center bg-pink-50 px-6 py-10">
      <Text className="text-3xl font-rubik-bold text-indigo-700 mb-6">
        สแกนดอกไม้
      </Text>

      {image ? (
        <>
          <Image
            source={{ uri: image }}
            className="w-56 h-56 mt-4 rounded-2xl border border-gray-300 shadow-md"
          />
          {loading && (
            <Text className="mt-5 text-base text-gray-600">กำลังทำนาย...</Text>
          )}
        </>
      ) : (
        <View className="flex-row flex-wrap justify-center items-center gap-6 mt-4">
          {/* ปุ่มเลือกภาพ */}
          <TouchableOpacity
            className="w-36 h-36 bg-indigo-100 rounded-2xl justify-center items-center shadow-md"
            onPress={pickImage}
          >
            <Image
              source={require('@/assets/images/gallery.png')}
              className="w-10 h-10 mb-2"
            />
            <Text className="text-indigo-700 text-base font-rubik-semibold text-center">
              เลือกจาก{'\n'}แกลเลอรี่
            </Text>
          </TouchableOpacity>

          {/* ปุ่มถ่ายรูป */}
          <TouchableOpacity
            className="w-36 h-36 bg-green-100 rounded-2xl justify-center items-center shadow-md"
            onPress={takePhoto}
          >
            <Image
              source={require('@/assets/images/camera.png')}
              className="w-10 h-10 mb-2"
            />
            <Text className="text-green-700 text-base font-rubik-semibold text-center">
              ถ่ายภาพ{'\n'}ด้วยกล้อง
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 🌼 Modal แจ้งเตือนความมั่นใจต่ำ */}
      <Modal visible={showLowConfidenceModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-3xl p-6 w-full max-w-md items-center shadow-xl">
            <Ionicons name="warning-outline" size={48} color="#F59E0B" />
            <Text className="text-xl font-rubik-bold text-yellow-800 mt-3">
              ผลการวิเคราะห์ไม่ชัดเจน
            </Text>
            <Text className="text-gray-600 font-rubik mt-2 text-center">
              AI มั่นใจเพียง{" "}
              {(lowConfidenceResult?.confidence! * 100).toFixed(1)}%{"\n"}
              ลองสแกนใหม่หรือดูผลลัพธ์อยู่ดีก็ได้
            </Text>

            <View className="flex-row mt-6 gap-3">
              <TouchableOpacity
                className="flex-1 bg-gray-200 py-3 rounded-full"
                onPress={() => {
                  setShowLowConfidenceModal(false);
                  setImage(null);
                }}
              >
                <Text className="text-center font-rubik-semibold text-gray-700">
                  สแกนใหม่
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-yellow-400 py-3 rounded-full"
                onPress={() => {
                  setShowLowConfidenceModal(false);
                  navigation.navigate("Result", {
                    prediction: lowConfidenceResult!,
                    imageUrl: uploadedUrl,
                  });
                }}
              >
                <Text className="text-center text-yellow-900 font-rubik-semibold">
                  ดูผลลัพธ์อยู่ดี
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
