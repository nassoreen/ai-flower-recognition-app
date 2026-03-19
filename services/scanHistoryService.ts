import { ID } from "appwrite";
import { databases, config } from "@/lib/appwrite";

interface ScanHistoryData {
  userId: string;           // ✅ เพิ่มรับ userId จากผู้ใช้จริง
  flowerId: string;
  scannedAt: string;
  image_url?: string;
  flowerName?: string; 
}

export const saveToScanHistories = async (data: ScanHistoryData) => {
  try {
    if (!config.databaseId || !config.scanhistories) {
      console.error("Appwrite config ไม่สมบูรณ์");
      return;
    }

    await databases.createDocument(
      config.databaseId,
      config.scanhistories,
      ID.unique(),
      {
        userId: data.userId,          // ✅ ใช้ค่าที่ส่งเข้ามาจาก context
        flowerId: data.flowerId,
        scannedAt: data.scannedAt,
        image_url: data.image_url || "",
        flowerName: data.flowerName || "",
      }
    );

    console.log("✅ บันทึกประวัติสแกนสำเร็จสำหรับ:", data.userId);
  } catch (err) {
    console.error("❌ ไม่สามารถบันทึกประวัติได้:", err);
  }
};
