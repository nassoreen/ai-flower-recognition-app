import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import icons from "@/constants/icons";
import Search from "@/components/Search";

import { useGlobalContext } from "@/lib/global-provider";
import CategoryGrid from "@/components/CategoryGrid";
import QuickMenu from "@/components/QuickMenu";
import { countUserCollections, getCounts, getLatestScans } from "@/lib/appwrite";
import { MyCollectionPreview } from "@/components/MyCollectionPreview";
import { CommunityPreview } from "@/components/CommunityPreview";



const Home = () => {
  const { user } = useGlobalContext();
  const [counts, setCounts] = useState({ collections: 0, notes: 0 });
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [loadingScans, setLoadingScans] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    setLoadingCounts(true);
    try {
      const [countsData, collectionsCount] = await Promise.all([
        getCounts(user?.$id),
        countUserCollections(user?.$id ?? ""),
      ]);


      setCounts({
        collections: collectionsCount,
        notes: countsData.notes,
      });
    } catch (error) {
      console.error("Error fetching counts:", error);
    } finally {
      setLoadingCounts(false);
    }
  };

  fetchData();
}, [user?.$id]);
  
  // โหลดข้อมูลการสแกนล่าสุด
useEffect(() => {
  const loadScans = async () => {
    if (!user?.$id) return;
    setLoadingScans(true);
    try {
      const scans = await getLatestScans(user.$id);
      setRecentScans(scans);
    } catch (err) {
      console.error("❌ Error fetching recent scans:", err);
    } finally {
      setLoadingScans(false);
    }
  };

  loadScans();
}, [user?.$id]);
  

  return (
    <SafeAreaView className="h-full bg-white">
      <FlatList
        data={[]}
        renderItem={() => null}
        ListHeaderComponent={() => (
          <>
            {/* Header สีเขียวมุมโค้ง */}
            <View className="bg-pink-100 rounded-b-3xl px-5 pt-5 pb-12">
              <View className="flex-row items-center justify-between ">
                <View className="flex-row items-center">
                  <Image
                    source={{ uri: user?.avatar }}
                    className="w-12 h-12 rounded-full border-2 border-white"
                  />
                  <View className="ml-2">
                    <Text className="text-white text-xs font-rubik">
                      ยินดีต้อนรับ
                    </Text>
                    <Text className="text-white text-base font-rubik-medium">
                      {user?.name}
                    </Text>
                  </View>
                </View>
                <Image source={icons.bell} className="w-6 h-6 tint-white" />
              </View>
            </View>

            {/* กล่องข้อมูลลอย */}
            <View className="mx-8 -mt-6 bg-pink-50 rounded-2xl shadow-lg flex-row divide-x divide-black overflow-hidden">
              {/* ซ้าย */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push("/collection")}
                className="flex-1 flex-row items-center justify-center py-4">
                <View className="bg-pink-200 p-3 rounded-full">
                  <Image
                    source={require('@/assets/icons/calendar.png')}
                    className="w-5 h-5 tint-green-600"
                  />
                </View>
                <View className="ml-2">
                  <Text className="text-pink-100 font-rubik text-base">
                     {loadingCounts ? ".." : counts.collections}
                  </Text>
                  <Text className="text-gray-500 text-xs">คอลเลคชั่น</Text>
                </View>
              </TouchableOpacity>

              {/* ขวา */}
              <View className="flex-1 flex-row items-center justify-center py-4">
                <View className="bg-pink-200 p-3 rounded-full">
                  <Image
                    source={require('@/assets/icons/collection.png')}
                    className="w-5 h-5 tint-green-600"
                  />
                </View>
                <View className="ml-2">
                  <Text className="text-pink-100 font-rubik text-base">
                    {loadingCounts ? ".." : counts.notes}
                  </Text>
                  <Text className="text-gray-500 text-xs">บันทึก</Text>
                </View>
              </View>
            </View>


            

            {/* ส่วน Search, Featured, Filters */}
            <View className="px-5 mt-5">

                  <View className="flex-1 bg-white">
                    <QuickMenu />
                  </View>

              <Search />

              <View className="mt-6">
                <Text className=" font-rubik text-black-300 mb-3 px-5">
                  ดอกไม้ที่สแกนล่าสุด
                </Text>

                {loadingScans ? (
                  <ActivityIndicator size="small" color="#EC4899" />
                ) : recentScans.length === 0 ? (
                  <Text className="text-gray-400 px-5">ยังไม่มีการสแกน</Text>
                ) : (
                  <FlatList
                    data={recentScans}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.$id}
                    contentContainerClassName="px-5"
                    renderItem={({ item }) => (
                    <View className="mr-4">
                      <View className="w-36 bg-white rounded-xl shadow-sm overflow-hidden">
                        <Image
                          source={{ uri: item.imageUrl }}
                          className="w-36 h-36"
                          resizeMode="cover"
                        />
                        <View className="p-2">
                          <Text className="text-center text-gray-700 font-rubik">
                            {item.flowerName}
                          </Text>
                          <Text className="text-center text-xs text-gray-400">
                            {new Date(item.$createdAt).toLocaleDateString("th-TH")}
                          </Text>
                        </View>
                      </View>
                    </View>
                    )}
                  />
                )}
              </View>
              <View>
                <MyCollectionPreview />
              </View>
              <CommunityPreview />
              <CategoryGrid />

            </View>
          </>
        )}
      />
      
    </SafeAreaView>
  );
};

export default Home;
