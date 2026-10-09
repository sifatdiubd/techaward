import { useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { jsPDF } from "jspdf";
import { db } from "@/lib/firebase";

export default function WinnersTab({ winners, nominations, isSuperAdmin }) {
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const handleDelete = async (id) => {
    if (id && confirm("Delete this winner?")) {
      await deleteDoc(doc(db, "winners", id));
    }
  };
  const winnerNominees = nominations.filter(
    (nomination) => nomination.status === "winner",
  );
  const sorted = [...winners].sort(
    (a, b) => (a.order ?? 999) - (b.order ?? 999),
  );
  const exportPdf = () => {
    const pdf = new jsPDF();
    pdf.setFontSize(18);
    pdf.text("National Tech Award — Winners", 14, 20);
    pdf.setFontSize(10);
    let y = 32;
    sorted.forEach((item, index) => {
      pdf.text(
        `${index + 1}. ${item.name} — ${item.designation}${item.category ? ` (${item.category})` : ""}${item.year ? ` [${item.year}]` : ""}`,
        14,
        y,
      );
      y += 7;
      if (y > 280) {
        pdf.addPage();
        y = 20;
      }
    });
    pdf.save("winners.pdf");
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h2 className="text-2xl font-bold text-white">
          Winners ({winners.length}
          {" published · "}
          {winnerNominees.length}
          {" nominee winners)"}
        </h2>
        <div className="flex gap-2">
          {isSuperAdmin && (
            <button
              onClick={() => setAdding(true)}
              className="bg-amber-500 text-black font-bold px-4 py-2 rounded-lg text-sm"
            >
              <i className="fas fa-plus mr-2" />
              Add Winner
            </button>
          )}
          <button
            onClick={exportPdf}
            className="bg-gray-800 text-amber-400 font-bold px-4 py-2 rounded-lg text-sm"
          >
            <i className="fas fa-file-pdf mr-2" />
            PDF
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Only winners added here are shown on the public NTA Winners page.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sorted.map((item) => (
          <div
            key={item.id}
            className="glass p-4 rounded-xl border border-gray-800 text-center"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-full aspect-square object-cover rounded-lg mb-3"
              onError={(e) =>
                (e.currentTarget.src =
                  "https://placehold.co/200x200/1a1a1a/e0e0e0?text=NTA")
              }
            />
            <p className="font-bold text-white text-sm">{item.name}</p>
            <p className="text-xs text-amber-500">{item.designation}</p>
            {item.category && (
              <p className="text-[10px] text-gray-500 mt-1 uppercase">
                {item.category}
              </p>
            )}
            <p className="text-[10px] text-gray-500 mt-1">
              {"Order: "}
              {item.order ?? "-"}
              {item.year ? ` · ${item.year}` : ""}
            </p>
            {isSuperAdmin && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setEditing(item)}
                  className="flex-1 text-xs bg-blue-500/20 text-blue-400 px-2 py-1.5 rounded hover:bg-blue-500/30"
                >
                  <i className="fas fa-edit mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-xs bg-red-500/20 text-red-400 px-3 py-1.5 rounded hover:bg-red-500/30"
                >
                  <i className="fas fa-trash" />
                </button>
              </div>
            )}
          </div>
        ))}
        {winners.length === 0 && (
          <p className="text-gray-500 col-span-full text-sm">
            No winners added yet.
          </p>
        )}
      </div>
      {adding && <WinnerModal onClose={() => setAdding(false)} />}
      {editing && (
        <WinnerModal winner={editing} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

function WinnerModal({ winner, onClose }) {
  const [form, setForm] = useState(
    winner ?? {
      name: "",
      designation: "",
      image: "",
      category: "",
      year: "",
      order: 0,
    },
  );
  const handleSave = async () => {
    if (!form.name || !form.image) {
      return alert("Name & Image required");
    }
    if (winner?.id) {
      const { id, ...a } = form;
      await updateDoc(doc(db, "winners", winner.id), a);
    } else {
      await addDoc(collection(db, "winners"), {
        ...form,
        createdAt: serverTimestamp(),
      });
    }
    onClose();
  };
  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4"
      onMouseDown={onClose}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="bg-[#0a0a0a] border border-amber-500/30 rounded-2xl max-w-lg w-full p-6"
      >
        <h3 className="text-xl font-bold text-amber-500 mb-4">
          {winner ? "Edit Winner" : "Add Winner"}
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] uppercase text-gray-500 font-bold">
              Full Name
            </label>
            <input
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              className="form-input"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase text-gray-500 font-bold">
              Designation
            </label>
            <input
              value={form.designation}
              onChange={(e) =>
                setForm({
                  ...form,
                  designation: e.target.value,
                })
              }
              className="form-input"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase text-gray-500 font-bold">
              Image URL
            </label>
            <input
              value={form.image}
              onChange={(e) =>
                setForm({
                  ...form,
                  image: e.target.value,
                })
              }
              className="form-input"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase text-gray-500 font-bold">
                Category
              </label>
              <input
                value={form.category || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value,
                  })
                }
                className="form-input"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase text-gray-500 font-bold">
                Year
              </label>
              <input
                value={form.year || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    year: e.target.value,
                  })
                }
                className="form-input"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase text-gray-500 font-bold">
              Display Order (lower shows first)
            </label>
            <input
              type="number"
              value={form.order ?? 0}
              onChange={(e) =>
                setForm({
                  ...form,
                  order: Number(e.target.value),
                })
              }
              className="form-input"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 text-gray-400">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-amber-500 text-black font-bold px-6 py-2 rounded-lg hover:bg-amber-400"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
