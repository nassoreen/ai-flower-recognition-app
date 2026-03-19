import {
  Client,
  Account,
  ID,
  Databases,
  OAuthProvider,
  Avatars,
  Query,
  Storage,
} from "react-native-appwrite";
import * as Linking from "expo-linking";
import * as FileSystem from "expo-file-system";
import { openAuthSessionAsync } from "expo-web-browser";

export const config = {
  platform: "com.jsm.flower",
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
  flowersCollectionId: process.env.EXPO_PUBLIC_APPWRITE_FLOWER_INFO_COLLECTION_ID,
  userCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USER_COLLECTION_COLLECTION_ID,
  scanhistories: process.env.EXPO_PUBLIC_APPWRITE_SCANHISTORIES_COLLECTION_ID,
  CollectionItems: process.env.EXPO_PUBLIC_APPWRITE_COLLECTIONITEM_COLLECTION_ID,
  flowerCareCollectionId: process.env.EXPO_PUBLIC_APPWRITE_FLOWER_CARE_COLLECTION_ID,
  flowerNotesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_FLOWER_NOTES_COLLECTION_ID,
  communityCollectionId: process.env.EXPO_PUBLIC_APPWRITE_COMMUNITY_COLLECTION_ID,
  comments: process.env.EXPO_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID,
  users: process.env.EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
  bucketId: process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID,
  
};

// สร้าง client และ databases instance
export const client = new Client()
  .setEndpoint(config.endpoint!)
  .setProject(config.projectId!)
  .setPlatform(config.platform!);

export const databases = new Databases(client);
export const account = new Account(client);
export const avatar = new Avatars(client);
export const storage = new Storage(client);


export { ID, Query };

export async function login() {
  try {
    const redirectUri = Linking.createURL("/");

    const response = await account.createOAuth2Token(
      OAuthProvider.Google,
      redirectUri
    );
    if (!response) throw new Error("Create OAuth2 token failed");

    const browserResult = await openAuthSessionAsync(
      response.toString(),
      redirectUri
    );
    if (browserResult.type !== "success")
      throw new Error("Create OAuth2 token failed");

    const url = new URL(browserResult.url);
    const secret = url.searchParams.get("secret")?.toString();
    const userId = url.searchParams.get("userId")?.toString();
    if (!secret || !userId) throw new Error("Create OAuth2 token failed");

    const session = await account.createSession(userId, secret);
    if (!session) throw new Error("Failed to create session");

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function logout() {
  try {
    const result = await account.deleteSession("current");
    return result;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getCurrentUser() {
  try {
    const accountInfo = await account.get();
    if (!accountInfo) return null;

    const nameOrEmail = accountInfo.name || accountInfo.email || "User";

    // ✅ ใช้ projectId จาก config (ไม่ต้องใช้ APPWRITE_PROJECT_ID)
    const avatarUrl = `https://cloud.appwrite.io/v1/avatars/initials/${encodeURIComponent(
      nameOrEmail
    )}?project=${config.projectId}`;

    console.log("✅ Avatar URL:", avatarUrl);

    return {
      $id: accountInfo.$id,
      name: accountInfo.name || "User",
      email: accountInfo.email,
      avatar: avatarUrl,
    };
  } catch (error) {
    console.log("⚠️ No active session found:", error);
    return null;
  }
}

export async function getFlowerByName(name: string) {
  try {
    const result = await databases.listDocuments(
      config.databaseId!,
      process.env.EXPO_PUBLIC_APPWRITE_FLOWER_INFO_COLLECTION_ID!, // ตั้งค่าใน .env
      [Query.equal("name", name)]
    );

    if (result.documents.length > 0) {
      return result.documents[0];
    }
    return null;
  } catch (error) {
    console.error("Error fetching flower by name:", error);
    return null;
  }
}

//นับจำนวน collection และ note หน้า Home
export async function getCounts(userId?: string) {
  try {
    const [collections, notes] = await Promise.all([
      databases.listDocuments(config.databaseId!, config.userCollectionId!, [
        userId ? Query.equal("userId", userId) : Query.limit(100),
      ]),
      databases.listDocuments(config.databaseId!, config.flowerNotesCollectionId!, [
        userId ? Query.equal("userId", userId) : Query.limit(100),
      ]),
    ]);

    return {
      collections: collections.total,
      notes: notes.total,
    };
  } catch (err) {
    console.error("Error fetching counts:", err);
    return { collections: 0, notes: 0 };
  }
}


export async function countUserCollections(userId: string) {
  if (!config.databaseId || !config.userCollectionId) {
    throw new Error("Missing Appwrite config");
  }

  const res = await databases.listDocuments(
    config.databaseId,
    config.userCollectionId,
    [Query.equal("userId", userId)]
  );

  return res.total; // ✅ คืนค่าจำนวนเอกสาร
}





//หน้า Home แสดงผลการสแกนล่าสุด

export async function getLatestScans(userId: string) {
  if (!config.databaseId || !config.scanhistories || !config.flowersCollectionId)
    throw new Error("Missing Appwrite config");

  const { documents: scans } = await databases.listDocuments(
    config.databaseId,
    config.scanhistories,
    [Query.equal("userId", userId), Query.orderDesc("$createdAt"), Query.limit(3)]
  );

  if (scans.length === 0) return [];

  const flowerIds = [...new Set(scans.map((s: any) => s.flowerId))];
  const { documents: flowers } = await databases.listDocuments(
    config.databaseId,
    config.flowersCollectionId,
    [Query.equal("$id", flowerIds)]
  );

  const flowerMap = Object.fromEntries(flowers.map((f: any) => [f.$id, f]));

  return scans.map((s: any) => ({
    $id: s.$id,
    flowerId: s.flowerId,
    flowerName: flowerMap[s.flowerId]?.name ?? "ไม่ทราบชื่อ",
    imageUrl: s.image_url || flowerMap[s.flowerId]?.image_url || "",
    scannedAt: s.scannedAt,
    $createdAt: s.$createdAt,
  }));
}



// ✅ toggleLike: กดถูกใจ / ยกเลิกถูกใจ
export const toggleLike = async (postId: string, userId: string) => {
  try {
    const post = await databases.getDocument(
      config.databaseId!,
      config.communityCollectionId!,
      postId
    );

    // ✅ บังคับให้ likes เป็น array เสมอ (แม้จะเป็น null หรือ undefined)
    const currentLikes = Array.isArray(post.likes)
      ? post.likes
      : post.likes
      ? [post.likes]
      : [];

    // ✅ toggle like
    const updatedLikes = currentLikes.includes(userId)
      ? currentLikes.filter((id: string) => id !== userId)
      : [...currentLikes, userId];

    // ✅ อัปเดต database
    await databases.updateDocument(
      config.databaseId!,
      config.communityCollectionId!,
      postId,
      { likes: updatedLikes }
    );

    return updatedLikes;
  } catch (err) {
    console.error("❌ Error toggling like:", err);
    return [];
  }
};


// 🟢 สมัครสมาชิก (Register ผ่าน Appwrite จริง)
export async function registerWithEmail(email: string, password: string, name: string) {
  try {
    // ✅ สร้างบัญชีผู้ใช้ในระบบ Appwrite Authentication
    const newUser = await account.create(ID.unique(), email, password, name);
    console.log("✅ Registered:", newUser);
    return newUser;
  } catch (error: any) {
    console.error("❌ Register error:", error);
    throw new Error(error.message || "Register failed");
  }
}

// 🟡 เข้าสู่ระบบ (Login)
export async function loginWithEmail(email: string, password: string) {
  try {
    // ✅ ใช้ Appwrite Auth (ต้องใช้ฟังก์ชันนี้!)
    const session = await account.createEmailPasswordSession(email, password);
    console.log("✅ Login success:", session);
    return session;
  } catch (error: any) {
    console.error("❌ Login error:", error);
    throw new Error(error.message || "Login failed");
  }
}


// 📸 ฟังก์ชันอัปโหลดรูปโปรไฟล์ไป Appwrite Storage
export async function uploadAvatar(imageUri: string) {
  if (!config.bucketId) throw new Error("Missing bucketId");

  // ตรวจสอบว่าไฟล์มีอยู่จริง
  const fileInfo = await FileSystem.getInfoAsync(imageUri);
  if (!fileInfo.exists) throw new Error("File not found");

  const file = {
    uri: imageUri,
    type: "image/jpeg",
    name: `avatar_${Date.now()}.jpg`,
    size: fileInfo.size ?? 0,
  };

  // ✅ อัปโหลดไป Appwrite Storage
  const uploaded = await storage.createFile(config.bucketId!, ID.unique(), file);

  // ✅ สร้าง URL string ด้วยตนเอง (ไม่ต้องพึ่ง object)
  const fileUrl = `${config.endpoint}/storage/buckets/${config.bucketId}/files/${uploaded.$id}/view?project=${config.projectId}`;

  console.log("✅ Final Avatar URL:", fileUrl);

  return fileUrl; // ✅ คืน URL แบบ string แท้แน่นอน
}


