import { useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const SPONSOR_TIERS = [
  "Title Sponsor",
  "Powered By",
  "Co-Sponsor",
  "Partner",
  "Strategic Partner",
  "Media Partner",
];

export default function SponsorsTab({ sponsors, isSuperAdmin }) {
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const handleDelete = async (id) => {
    if (id && confirm("Delete this sponsor?")) {
      await deleteDoc(doc(db, "sponsors", id));
    }
  };
  const sorted = [...sponsors].sort(
    (a, b) => (a.order ?? 999) - (b.order ?? 999),
  );
  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
        <h2 className="text-2xl font-bold text-white">
          Sponsors ({sponsors.length})
        </h2>
        {isSuperAdmin && (
          <button
            onClick={() => setAdding(true)}
            className="bg-amber-500 text-black font-bold px-4 py-2 rounded-lg text-sm"
          >
            <i className="fas fa-plus mr-2" />
            Add Sponsor
          </button>
        )}
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((item) => (
          <div
            key={item.id}
            className="glass p-4 rounded-xl border border-gray-800"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-white rounded-lg w-20 h-20 flex items-center justify-center shrink-0">
                <img
                  src={item.logo}
                  alt={item.name}
                  className="max-h-full max-w-full object-contain p-2"
                  onError={(e) =>
                    (e.currentTarget.src =
                      "https://placehold.co/200x100/ffffff/333?text=" +
                      item.name)
                  }
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold truncate">{item.name}</p>
                <p className="text-xs text-amber-500">{item.tier}</p>
                <p className="text-[10px] text-gray-500">
                  {"Order: "}
                  {item.order ?? "-"}
                </p>
                {item.website && (
                  <a
                    href={item.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-blue-400 hover:underline truncate block"
                  >
                    {item.website}
                  </a>
                )}
              </div>
            </div>
            {isSuperAdmin && (
              <div className="flex gap-2">
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
        {sponsors.length === 0 && (
          <p className="text-gray-500 text-sm col-span-full">
            No sponsors yet.
          </p>
        )}
      </div>
      {adding && <SponsorModal onClose={() => setAdding(false)} />}
      {editing && (
        <SponsorModal sponsor={editing} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

function SponsorModal({ sponsor, onClose }) {
  const [form, setForm] = useState(
    sponsor ?? {
      name: "",
      logo: "",
      website: "",
      tier: "Co-Sponsor",
      order: 0,
    },
  );
  const [customTier, setCustomTier] = useState(
    sponsor && !SPONSOR_TIERS.includes(sponsor.tier),
  );
  const handleSave = async () => {
    if (!form.name || !form.logo) {
      return alert("Name & Logo required");
    }
    if (sponsor?.id) {
      const { id, ...rest } = form;
      await updateDoc(doc(db, "sponsors", sponsor.id), rest);
    } else {
      await addDoc(collection(db, "sponsors"), {
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
          {sponsor ? "Edit Sponsor" : "Add Sponsor"}
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] uppercase text-gray-500 font-bold">
              Sponsor Name
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
              Tier / Category
            </label>
            <div className="flex gap-2">
              {customTier ? (
                <input
                  value={form.tier}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tier: e.target.value,
                    })
                  }
                  className="form-input flex-1"
                  placeholder="Custom tier name"
                />
              ) : (
                <select
                  value={form.tier}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tier: e.target.value,
                    })
                  }
                  className="form-input flex-1"
                >
                  {SPONSOR_TIERS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              )}
              <button
                onClick={() => setCustomTier(!customTier)}
                className="bg-gray-800 text-amber-500 px-3 rounded-lg text-xs font-bold hover:bg-gray-700"
              >
                {customTier ? "Preset" : "Custom"}
              </button>
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase text-gray-500 font-bold">
              Logo URL
            </label>
            <input
              value={form.logo}
              onChange={(e) =>
                setForm({
                  ...form,
                  logo: e.target.value,
                })
              }
              className="form-input"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase text-gray-500 font-bold">
              Website (optional)
            </label>
            <input
              value={form.website || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  website: e.target.value,
                })
              }
              className="form-input"
            />
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
