// services/flowerService.ts
import { config, databases } from "@/lib/appwrite";
import { ID } from "react-native-appwrite";

export async function addFlowerToUserCollection(
  userId: string,
  collectionId: string,
  flowerId: string
) {
  if (!config.databaseId || !config.CollectionItems) {
    throw new Error("Missing Appwrite config");
  }

  return databases.createDocument(
    config.databaseId,
    config.CollectionItems,  // ✅ ตารางกลาง (CollectionItems)
    ID.unique(),
    {
      userId,
      collectionId,
      flowerId,
    }
  );
}
