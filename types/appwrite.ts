// ดอกไม้
export interface Flower {
  $id: string;
  name: string;
  description?: string;
  care_instructions?: string;
  uses?: string;
  origin?: string;
  funfact?: string;
  image_url?: string;
}


export interface HistoryItem {
  $id: string;
  userId: string;
  flowerId: string;
  scannedAt: string;
  image_url?: string;
}

export interface UserCollection {
  $id: string;
  userId: string;
  name: string;
  createdAt?: string;
  imageUrl?: string;
}


