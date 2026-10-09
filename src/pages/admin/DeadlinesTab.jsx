import { useMemo, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function DeadlinesTab({ nominations, userRole }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(new Set());
  const canEdit = userRole === "superadmin" || userRole === "editor";
  const filtered = useMemo(
    () =>
      nominations.filter((nomination) => {
        return (
          nomination.name?.toLowerCase().includes(search.toLowerCase()) ||
          nomination.nominationId
            ?.toLowerCase()
            .includes(search.toLowerCase()) ||
          nomination.mobile?.includes(search)
        );
      }),
    [nominations, search],
  );
  const toggleSelect = (id) => {
    const h = new Set(selected);
    if (h.has(id)) {
      h.delete(id);
    } else {
      h.add(id);
    }
    setSelected(h);
  };
  const toggleSelectAll = () => {
    if (selected.size === filtered.length && filtered.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((item) => item.id)));
    }
  };
  const bulkExtend = async () => {
    if (selected.size === 0) {
      return alert("Select at least one nominee to update deadline.");
    }
    const input = prompt(
      "Enter the NEW total extension hours to apply to all selected (e.g., 0 to reset, 72 to give 72 hours from now):",
    );
    if (input === null) {
      return;
    }
    const hours = parseInt(input);
    if (isNaN(hours) || hours < 0) {
      return alert("Please enter a valid positive number of hours.");
    }
    if (
      confirm(
        `Are you sure you want to grant ${hours} hours to ${selected.size} selected nominees?`,
      )
    ) {
      try {
        for (const item of Array.from(selected)) {
          if (hours === 0) {
            await updateDoc(doc(db, "nominations", item), {
              deadlineExtHours: 0,
              deadlineOverride: null,
            });
          } else {
            const date = new Date(Date.now() + hours * 60 * 60 * 1000);
            await updateDoc(doc(db, "nominations", item), {
              deadlineExtHours: hours,
              deadlineOverride: date,
            });
          }
        }
        alert("Deadlines updated successfully.");
        setSelected(new Set());
      } catch (err) {
        console.error(err);
        alert("Failed to update deadlines.");
      }
    }
  };
  const extendOne = async (id, currentHours) => {
    const input = prompt(
      "Enter the new total extension hours (e.g., 0 to reset, 72 to give exactly 72 hours from now):",
      currentHours.toString(),
    );
    if (input === null) {
      return;
    }
    const hours = parseInt(input);
    if (isNaN(hours) || hours < 0) {
      return alert("Please enter a valid positive number of hours.");
    }
    try {
      if (hours === 0) {
        await updateDoc(doc(db, "nominations", id), {
          deadlineExtHours: 0,
          deadlineOverride: null,
        });
      } else {
        const date = new Date(Date.now() + hours * 60 * 60 * 1000);
        await updateDoc(doc(db, "nominations", id), {
          deadlineExtHours: hours,
          deadlineOverride: date,
        });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update deadline.");
    }
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-2xl font-bold text-white">Deadline Extensions</h2>
        {canEdit && (
          <button
            onClick={bulkExtend}
            disabled={selected.size === 0}
            className="bg-blue-500 text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-400 text-sm disabled:opacity-50 transition shadow-lg shadow-blue-500/20"
          >
            <i className="fas fa-clock mr-2" />
            Apply Bulk Extension
          </button>
        )}
      </div>
      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, ID, or mobile..."
          className="form-input w-full md:w-80"
        />
      </div>
      <div className="glass rounded-xl border border-gray-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-amber-500 text-xs uppercase">
            <tr>
              {canEdit && (
                <th className="p-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={
                      filtered.length > 0 && selected.size === filtered.length
                    }
                    onChange={toggleSelectAll}
                    className="accent-amber-500 w-4 h-4"
                  />
                </th>
              )}
              <th className="p-3 text-left">Nominee ID</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Reg Date</th>
              <th className="p-3 text-left">Extension (Hours)</th>
              {canEdit && <th className="p-3 text-left">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              return (
                <tr
                  key={item.id}
                  className="border-t border-gray-800 hover:bg-gray-900/50"
                >
                  {canEdit && (
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selected.has(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="accent-amber-500 w-4 h-4"
                      />
                    </td>
                  )}
                  <td className="p-3 font-mono text-xs text-gray-400">
                    {item.nominationId}
                  </td>
                  <td className="p-3 text-white">{item.name}</td>
                  <td className="p-3 text-gray-400 text-xs">
                    {item.mainCategory}
                    <br />
                    <span className="text-amber-500/60">{item.category}</span>
                  </td>
                  <td className="p-3 text-xs text-gray-400">
                    {item.createdAt?.toDate
                      ? item.createdAt.toDate().toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${item.deadlineExtHours ? "bg-green-500/20 text-green-400" : "bg-gray-800 text-gray-400"}`}
                    >
                      +{item.deadlineExtHours || 0}
                      {" Hrs"}
                    </span>
                  </td>
                  {canEdit && (
                    <td className="p-3">
                      <button
                        onClick={() =>
                          extendOne(item.id, item.deadlineExtHours || 0)
                        }
                        className="text-blue-400 hover:text-blue-300 transition"
                        title="Edit Extension"
                      >
                        <i className="fas fa-pencil-alt" />
                        {" Edit"}
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  No nominees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
