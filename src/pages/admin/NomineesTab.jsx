import { useMemo, useState } from "react";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { db } from "@/lib/firebase";
import EditNomineeModal from "@/pages/admin/EditNomineeModal";
import NomineeDetailsModal from "@/pages/admin/NomineeDetailsModal";

export default function NomineesTab({
  nominations,
  handleStatusChange,
  sendPaymentReminder,
  isSuperAdmin,
  userRole,
}) {
  const canEdit = isSuperAdmin || userRole === "editor";
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const handleDelete = async (id, name) => {
    if (
      window.confirm(
        `Are you sure you want to delete the nomination for ${name}?`,
      )
    ) {
      try {
        await deleteDoc(doc(db, "nominations", id));
      } catch (err) {
        console.error(err);
        alert("Failed to delete nomination.");
      }
    }
  };
  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          nominations
            .map((nomination) => nomination.mainCategory)
            .filter(Boolean),
        ),
      ),
    [nominations],
  );
  const filtered = nominations.filter((nomination) => {
    return (
      (statusFilter === "all" || nomination.status === statusFilter) &&
      (categoryFilter === "all" ||
        nomination.mainCategory === categoryFilter) &&
      (nomination.name?.toLowerCase().includes(search.toLowerCase()) ||
        nomination.nominationId?.toLowerCase().includes(search.toLowerCase()) ||
        nomination.mobile?.includes(search) ||
        nomination.email?.toLowerCase().includes(search.toLowerCase()))
    );
  });
  const printList = () => {
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(`
      <html><head><title>Nominees List</title>
      <style>body{font-family:Arial;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #999;padding:6px;font-size:11px;text-align:left}th{background:#f3c900}</style>
      </head><body>
      <h1>NTA Nominees (${filtered.length})</h1>
      <table><thead><tr><th>ID</th><th>Name</th><th>Mobile</th><th>Email</th><th>Category</th><th>Sub</th><th>Status</th><th>Votes</th></tr></thead><tbody>
      ${filtered.map((item) => `<tr><td>${item.nominationId}</td><td>${item.name}</td><td>${item.mobile}</td><td>${item.email || ""}</td><td>${item.mainCategory}</td><td>${item.category || ""}</td><td>${item.status}</td><td>${item.voteCount || 0}</td></tr>`).join("")}
      </tbody></table></body></html>`);
      win.document.close();
      win.print();
    }
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-2xl font-bold text-white">
          Nominees ({filtered.length})
        </h2>
        <div className="flex gap-2">
          <button
            onClick={printList}
            className="bg-amber-500 text-black font-bold px-4 py-2 rounded-lg hover:bg-amber-400 text-sm"
          >
            <i className="fas fa-print mr-2" />
            Print Full List
          </button>
        </div>
      </div>
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, ID, mobile, email..."
          className="form-input flex-1 min-w-[240px]"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-input md:w-44"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="winner">Winner</option>
          <option value="not-winner">Not Winner</option>
          <option value="declined">Declined</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="form-input md:w-56"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <div className="glass rounded-xl border border-gray-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-amber-500 text-xs uppercase">
            <tr>
              <th className="p-3 text-left">Photo</th>
              <th className="p-3 text-left">Reg Date</th>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Mobile</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Votes</th>
              <th className="p-3 text-left">Comments</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              return (
                <tr
                  key={item.id}
                  className="border-t border-gray-800 hover:bg-gray-900/50"
                >
                  <td className="p-2">
                    {item.photo ? (
                      <img
                        src={item.photo}
                        alt={item.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-500 text-xs">
                        N/A
                      </div>
                    )}
                  </td>
                  <td className="p-3 font-mono text-[10px] text-gray-400 whitespace-nowrap">
                    {item.createdAt?.toDate
                      ? item.createdAt.toDate().toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="p-3 font-mono text-xs text-gray-400">
                    {item.nominationId}
                  </td>
                  <td className="p-3 text-white">{item.name}</td>
                  <td className="p-3 text-gray-400 text-xs">
                    {item.mainCategory}
                    <br />
                    <span className="text-amber-500/60">{item.category}</span>
                  </td>
                  <td className="p-3 text-gray-400">{item.mobile}</td>
                  <td className="p-3">
                    <select
                      value={item.status}
                      onChange={(e) =>
                        handleStatusChange(item.id, e.target.value)
                      }
                      disabled={!canEdit}
                      className={`bg-gray-800 text-white text-xs px-2 py-1 rounded border ${item.status === "approved" || item.status === "winner" ? "border-green-500/50" : item.status === "declined" ? "border-red-500/50" : "border-yellow-500/50"}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="winner">Winner</option>
                      <option value="not-winner">Not Winner</option>
                      <option value="declined">Declined</option>
                    </select>
                  </td>
                  <td className="p-3 text-amber-500 font-bold">
                    {item.voteCount || 0}
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      defaultValue={item.comment || ""}
                      onBlur={async (e) => {
                        if (e.target.value !== (item.comment || "")) {
                          await updateDoc(doc(db, "nominations", item.id), {
                            comment: e.target.value,
                          });
                        }
                      }}
                      className="form-input text-xs w-32 px-2 py-1 bg-gray-800 border-gray-700 rounded"
                      placeholder="Comment..."
                    />
                  </td>
                  <td className="p-3 flex gap-2 flex-wrap">
                    <button
                      onClick={() => setViewing(item)}
                      className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1.5 rounded hover:bg-amber-500/30 inline-flex items-center justify-center"
                      title="View"
                    >
                      <Eye size={14} />
                    </button>
                    {canEdit && (
                      <>
                        <button
                          onClick={() => setEditing(item)}
                          className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1.5 rounded hover:bg-blue-500/30 inline-flex items-center justify-center"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          className="text-xs bg-red-500/20 text-red-400 px-2 py-1.5 rounded hover:bg-red-500/30 inline-flex items-center justify-center"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                        {(item.status === "pending" ||
                          item.status === "declined") && (
                          <button
                            onClick={() => sendPaymentReminder(item)}
                            className="text-xs bg-green-500/20 text-green-400 px-2 py-1.5 rounded hover:bg-green-500/30 inline-flex items-center gap-1"
                            title="Send Payment Reminder Email"
                          >
                            <i className="fas fa-paper-plane text-[10px]" />
                            {" Remind"}
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center p-8 text-gray-500">
                  No nominees match filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {viewing && (
        <NomineeDetailsModal
          nominee={viewing}
          onClose={() => setViewing(null)}
        />
      )}
      {editing && (
        <EditNomineeModal nominee={editing} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}
