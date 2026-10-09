import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function useCollection(
  collectionName,
  orderField = "createdAt",
  direction = "desc",
) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const constraints = [];
    try {
      constraints.push(orderBy(orderField, direction));
    } catch {}
    const q = query(collection(db, collectionName), ...constraints);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = [];
        snapshot.forEach((docSnap) =>
          items.push({
            id: docSnap.id,
            ...docSnap.data(),
          }),
        );
        setData(items);
        setLoading(false);
      },
      () => setLoading(false),
    );
    return () => unsubscribe();
  }, [collectionName, orderField, direction]);
  return {
    data: data,
    loading: loading,
  };
}
