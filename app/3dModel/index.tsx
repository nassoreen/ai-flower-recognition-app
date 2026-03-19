import Gradient from "@/components/3dModel/Gradient";
import Loader from "@/components/3dModel/Loader";
import Daisy from "@/components/3dModel/Daisy";
import Jasmine from "@/components/3dModel/Jasmine";
import Hibiscus from "@/components/3dModel/hibiscus";
import Ixora from "@/components/3dModel/ixora";
import Lotus from "@/components/3dModel/lotus";
import Marigold from "@/components/3dModel/marigold";
import Orchid from "@/components/3dModel/orchid";
import Rose from "@/components/3dModel/rose";
import Tulip from "@/components/3dModel/tulip";
import Trigger from "@/components/3dModel/Trigger";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber/native";
import { StatusBar } from "expo-status-bar";
import React, { Suspense, useState, useRef } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";

const Index = () => {
  const [loading, setLoading] = useState(false);
  const controlsRef = useRef<any>(null);

  const { flowerName } = useLocalSearchParams<{ flowerName: string }>();

  // ✅ Map ดอกไม้กับโมเดล
  const flowerModels: Record<string, React.FC<any>> = {
    "เดซี่": Daisy,
    "มะลิ": Jasmine,
    "ชบา": Hibiscus,
    "ดอกเข็ม": Ixora,
    "บัว": Lotus,
    "ดาวเรือง": Marigold,
    "กล้วยไม้": Orchid,
    "กุหลาบ": Rose,
    "ทิวลิป": Tulip,
  };

  const SelectedModel = flowerName ? flowerModels[flowerName] : undefined;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar animated style="light" />
      <View style={styles.textContainer}>
        <Text style={styles.textTitle}>
          {flowerName ? ` ${flowerName}` : "❌ ไม่พบชื่อดอกไม้"}
        </Text>
      </View>

      <View style={styles.modelContainer}>
        <Gradient />
        {loading && <Loader />}
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <OrbitControls ref={controlsRef} enablePan enableRotate enableZoom />
          <ambientLight intensity={0.5} />
          <directionalLight position={[1, 1, 1]} intensity={1.5} />
          <directionalLight position={[-1, -1, -1]} intensity={1} />
          <Suspense fallback={<Trigger setLoading={setLoading} />}>
            {SelectedModel ? (
              <SelectedModel />
            ) : (
              <Text style={{ color: "white" }}>❌ ไม่พบโมเดลดอกไม้</Text>
            )}
          </Suspense>
        </Canvas>

      </View>
    </SafeAreaView>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  modelContainer: {
    flex: 1,
  },
  textContainer: {
    marginHorizontal: 24,
    marginVertical: 20,
  },
  textTitle: {
    fontFamily: "Inter-Bold",
    color: "white",
    fontSize: 18,
    textAlign: "center",
  },
  zoomContainer: {
    position: "absolute",
    bottom: 80,
    right: 20,
    flexDirection: "column",
    gap: 10,
  },
  zoomButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 5,
  },
  zoomText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "black",
  },
});
