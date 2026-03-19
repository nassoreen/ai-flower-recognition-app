import { Canvas, useThree } from "@react-three/fiber/native";
import { OrbitControls } from "@react-three/drei";
import React, { useRef } from "react";
import { View, Button } from "react-native";
import Sunflower from "./Starlink";

function ZoomButtons({ controlsRef }) {
  const { camera } = useThree();

  const zoomIn = () => {
    camera.position.z -= 1;
    controlsRef.current?.update(); // อัปเดต OrbitControls
  };

  const zoomOut = () => {
    camera.position.z += 1;
    controlsRef.current?.update();
  };

  return (
    <View style={{ position: "absolute", bottom: 50, left: 20 }}>
      <Button title="Zoom In" onPress={zoomIn} />
      <Button title="Zoom Out" onPress={zoomOut} />
    </View>
  );
}

export default function Scene() {
  const controlsRef = useRef(null);

  return (
    <>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <Sunflower />
        <OrbitControls ref={controlsRef} enableZoom enableRotate />
      </Canvas>
      <ZoomButtons controlsRef={controlsRef} />
    </>
  );
}
