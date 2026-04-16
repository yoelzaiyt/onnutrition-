import { db } from "@/firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  orderBy, 
  setDoc,
  getDoc
} from "firebase/firestore";
import { Meal, DaySummary } from "./foodDiary.types";

export async function getMealsByDate(patientId: string, date: string) {
  try {
    const q = query(
      collection(db, `patients/${patientId}/meals`),
      where("date", "==", date),
      orderBy("time", "asc")
    );
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Meal));
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
}

export async function addMeal(patientId: string, meal: Omit<Meal, 'id'>) {
  try {
    const docRef = await addDoc(collection(db, `patients/${patientId}/meals`), meal);
    return { data: { id: docRef.id, ...meal }, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
}

export async function updateMeal(patientId: string, mealId: string, updates: Partial<Meal>) {
  try {
    const docRef = doc(db, `patients/${patientId}/meals`, mealId);
    await updateDoc(docRef, updates);
    return { error: null };
  } catch (error: any) {
    return { error };
  }
}

export async function deleteMeal(patientId: string, mealId: string) {
  try {
    const docRef = doc(db, `patients/${patientId}/meals`, mealId);
    await deleteDoc(docRef);
    return { error: null };
  } catch (error: any) {
    return { error };
  }
}

export async function getDaySummary(patientId: string, date: string) {
  try {
    const docRef = doc(db, `patients/${patientId}/daySummaries`, date);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { data: docSnap.data() as DaySummary, error: null };
    }
    return { data: null, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
}

export async function updateDaySummary(patientId: string, date: string, summary: Partial<DaySummary>) {
  try {
    const docRef = doc(db, `patients/${patientId}/daySummaries`, date);
    await setDoc(docRef, summary, { merge: true });
    return { error: null };
  } catch (error: any) {
    return { error };
  }
}
