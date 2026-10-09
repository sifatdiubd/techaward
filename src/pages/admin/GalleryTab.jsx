import { useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function GalleryTab({ gallery, isSuperAdmin }) {
  const [form, setForm] = useState({
    image: "",
    caption: "",
  });
  const handleAdd = async () => {
    if (!form.image) {
      return alert("Image URL required");
    }
    await addDoc(collection(db, "gallery"), {
      ...form,
      createdAt: serverTimestamp(),
    });
    setForm({
      image: "",
      caption: "",
    });
  };
  const handleDelete = async (a) => {
    if (a && confirm("Delete?")) {
      await deleteDoc(doc(db, "gallery", a));
    }
  };
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">
        Gallery ({gallery.length})
      </h2>
      {isSuperAdmin && (
        <div className="glass p-6 rounded-xl border border-gray-800 mb-6">
          <h3 className="text-amber-500 font-bold mb-4">Add Gallery Image</h3>
          <div className="space-y-3">
            <input
              placeholder="Image URL"
              value={form.image}
              onChange={(e) =>
                setForm({
                  ...form,
                  image: e.target.value,
                })
              }
              className="form-input"
            />
            <input
              placeholder="Caption (optional)"
              value={form.caption || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  caption: e.target.value,
                })
              }
              className="form-input"
            />
            <button
              onClick={handleAdd}
              className="bg-amber-500 text-black font-bold px-6 py-2 rounded-lg hover:bg-amber-400"
            >
              <i className="fas fa-plus mr-2" />
              Add Image
            </button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {gallery.map((item) => (
          <div
            key={item.id}
            className="glass rounded-xl border border-gray-800 overflow-hidden"
          >
            <img
              src={item.image}
              alt={item.caption}
              className="w-full aspect-square object-cover"
              onError={(e) =>
                (e.currentTarget.src =
                  "https://placehold.co/300x300/202020/white?text=NTA")
              }
            />
            <div className="p-3">
              {item.caption && (
                <p className="text-xs text-gray-400 mb-2">{item.caption}</p>
              )}
              {isSuperAdmin && (
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  <i className="fas fa-trash mr-1" />
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
        {gallery.length === 0 && (
          <p className="text-gray-500 col-span-full text-sm">
            No gallery images.
          </p>
        )}
      </div>
    </div>
  );
}
