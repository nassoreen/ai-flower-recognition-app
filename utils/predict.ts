// utils/predict.ts

import axios from "axios";

export type PredictionResult = {
  name: string;
  confidence: number;
};

//  รายชื่อคลาสต้องตรงกับ FastAPI
const CLASS_NAMES = [
"เดซี่","แดนดิไลอัน","ชบา","ดอกเข็ม","มะลิ","บัว","ดาวเรือง","กล้วยไม้","กุหลาบ","ทานตะวัน","ทิวลิป", "ไม่ทราบ"
];

const CONFIDENCE_THRESHOLD = 0.7;

export const predictImage = async (imageUri: string): Promise<PredictionResult> => {
  const formData = new FormData();     //สร้าง FormData เพื่อส่งรูปไปยัง API
  formData.append('file', {
    uri: imageUri,
    name: 'photo.jpg',
    type: 'image/jpeg',
  } as any);

  const response = await axios.post('https://test-mddp.onrender.com/predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  });

  const index = response.data.class_index;
  const confidence = response.data.confidence;

  const isLowConfidence = confidence < CONFIDENCE_THRESHOLD;
  return {
    name: isLowConfidence ? "ไม่ทราบ" : CLASS_NAMES[index],
    confidence,
  };
};
