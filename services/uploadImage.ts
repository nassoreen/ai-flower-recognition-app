import * as FileSystem from "expo-file-system";
import { storage, config } from "@/lib/appwrite";
import { ID } from "react-native-appwrite";

export async function uploadImage(uri: string) {
  if (!config.bucketId) throw new Error("Missing bucketId");

  // 🔍 ตรวจว่ามีไฟล์จริงไหม
  const fileInfo = await FileSystem.getInfoAsync(uri);
  if (!fileInfo.exists) throw new Error("File not found");

  // 📁 สร้าง object ของไฟล์ที่จะอัปโหลด
  const file = {
    uri,
    type: "image/jpeg",
    name: `scan_${Date.now()}.jpg`,
    size: fileInfo.size ?? 0,
  };

  // 📤 อัปโหลดไปที่ Appwrite Storage
  const uploaded = await storage.createFile(config.bucketId!, ID.unique(), file);

  if (!uploaded || !uploaded.$id) {
    throw new Error("Upload failed: no file ID returned");
  }

  // ✅ ใช้ /view (ไม่ใช้ /preview) เพื่อให้ React Native โหลดได้จริง
  const imageUrl = `${config.endpoint}/storage/buckets/${config.bucketId}/files/${uploaded.$id}/view?project=${config.projectId}`;

  return imageUrl; // ✅ คืน URL ที่ใช้ได้จริง
}
