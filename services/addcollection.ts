import { config, databases } from "@/lib/appwrite";
import { ID } from "react-native-appwrite";

export async function createCollection(
  userId: string,
  name: string,
  imageUrl?: string
) {
  if (!config.databaseId || !config.userCollectionId) {
    throw new Error("Missing Appwrite config");
  }

  return databases.createDocument(
    config.databaseId,
    config.userCollectionId,
    ID.unique(),
    {
      userId,
      name,
      imageUrl: imageUrl ?? "",  // ต้องเป็น string เท่านั้น
      addedAt: new Date().toISOString(),
    }
  );
}
