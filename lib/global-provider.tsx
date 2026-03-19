// ✅ import React และ Hook พื้นฐาน
import React, { createContext, ReactNode, useContext } from "react";

// ✅ import ฟังก์ชันที่ใช้ดึงข้อมูลผู้ใช้จาก Appwrite
import { getCurrentUser } from "./appwrite";

// ✅ import custom hook สำหรับเรียก API ของ Appwrite
import { useAppwrite } from "./useAppwrite";

/* -------------------------------------------------------------
   🧠 กำหนดชนิดข้อมูลของ Global Context (สิ่งที่จะแชร์ให้ทั้งแอปใช้ร่วมกัน)
-------------------------------------------------------------- */
interface GlobalContextType {
  isLogged: boolean;     // ✅ บอกสถานะว่าเข้าสู่ระบบหรือยัง (true/false)
  user: User | null;     // ✅ เก็บข้อมูลของผู้ใช้ (หรือ null ถ้ายังไม่ล็อกอิน)
  loading: boolean;      // ✅ บอกสถานะกำลังโหลดข้อมูลผู้ใช้
  refetch: () => void;   // ✅ ฟังก์ชันรีเฟรชข้อมูล (ดึง user ใหม่อีกครั้ง)
}

/* -------------------------------------------------------------
   🧍‍♂️ กำหนดชนิดข้อมูลของ "User"
-------------------------------------------------------------- */
interface User {
  $id: string;   // รหัสผู้ใช้ใน Appwrite
  name: string;  // ชื่อผู้ใช้
  email: string; // อีเมลของผู้ใช้
  avatar: string; // URL ของรูปโปรไฟล์ (avatar)
}

/* -------------------------------------------------------------
   🌍 สร้าง Context กลาง (GlobalContext)
   - เริ่มต้นเป็น undefined เพื่อป้องกันการเข้าถึงโดยไม่มี Provider
-------------------------------------------------------------- */
const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

/* -------------------------------------------------------------
   🧩 กำหนด Props ของ GlobalProvider
   - children คือ component ทั้งหมดที่อยู่ภายใน Provider นี้
-------------------------------------------------------------- */
interface GlobalProviderProps {
  children: ReactNode;
}

/* -------------------------------------------------------------
   🌐 Component หลัก: GlobalProvider
   - ใช้สำหรับครอบทั้งแอป เพื่อให้ทุกหน้าเข้าถึงข้อมูล user ได้
-------------------------------------------------------------- */
export const GlobalProvider = ({ children }: GlobalProviderProps) => {
  // ✅ ใช้ custom hook "useAppwrite" เพื่อดึงข้อมูลผู้ใช้ปัจจุบัน
  //    - fn คือฟังก์ชัน getCurrentUser() (เรียกไปยัง Appwrite)
  const {
    data: user,     // ✅ data จะเป็นข้อมูลผู้ใช้ที่ได้กลับมา
    loading,        // ✅ กำลังโหลดหรือไม่
    refetch,        // ✅ ฟังก์ชันที่ใช้ดึงข้อมูลใหม่ (เช่นหลังล็อกอิน)
  } = useAppwrite({
    fn: getCurrentUser,
  });

  // ✅ แปลงค่าผู้ใช้ให้เป็นสถานะ boolean ว่า "เข้าสู่ระบบแล้ว" หรือยัง
  const isLogged = !!user;

  /* -------------------------------------------------------------
     ✅ ส่งค่าทั้งหมดไปยัง GlobalContext.Provider
     เพื่อให้ component ลูก (children) ทั้งหมดเรียกใช้ได้
  -------------------------------------------------------------- */
  return (
    <GlobalContext.Provider
      value={{
        isLogged,   // สถานะล็อกอิน
        user,       // ข้อมูลผู้ใช้
        loading,    // กำลังโหลดข้อมูลผู้ใช้
        refetch,    // ฟังก์ชันรีโหลดข้อมูล
      }}
    >
      {/* ✅ children หมายถึง component ทั้งหมดในแอป */}
      {children}
    </GlobalContext.Provider>
  );
};

/* -------------------------------------------------------------
   🔄 Hook: useGlobalContext
   - ใช้เพื่อเข้าถึงค่าจาก GlobalContext ได้ทุกที่ในแอป
   - ป้องกันการเรียกใช้ผิดที่ (ถ้าอยู่นอก Provider)
-------------------------------------------------------------- */
export const useGlobalContext = (): GlobalContextType => {
  const context = useContext(GlobalContext); // ✅ ดึงค่าจาก Context ปัจจุบัน

  // ถ้าไม่มี Provider ครอบอยู่ → แจ้ง error ทันที (ช่วย debug)
  if (!context)
    throw new Error("useGlobalContext must be used within a GlobalProvider");

  return context; // ✅ คืนค่าที่มีทั้งหมด (isLogged, user, loading, refetch)
};

/* -------------------------------------------------------------
   🧾 export ค่าเริ่มต้น เพื่อให้ import ได้สะดวก
-------------------------------------------------------------- */
export default GlobalProvider;
