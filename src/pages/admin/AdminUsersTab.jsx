import { useState } from "react";
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { SUPER_ADMIN_EMAIL, db, firebaseConfig } from "@/lib/firebase";
import { ADMIN_TABS } from "@/pages/admin/AdminDashboard";

export default function AdminUsersTab({ adminUsers }) {
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const handleDelete = async (a) => {
    if (a && confirm("Remove this admin?")) {
      await deleteDoc(doc(db, "adminUsers", a));
    }
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Admin Users</h2>
          <p className="text-sm text-gray-500">
            Grant tab-level access to other admins. Only the Super Admin can
            manage this list.
          </p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2 rounded-lg text-sm"
        >
          <i className="fas fa-plus mr-2" />
          Add Admin
        </button>
      </div>
      <div className="glass rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-amber-500 text-xs uppercase">
            <tr>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Allowed Tabs</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-gray-800 bg-amber-500/5">
              <td className="p-3 text-white font-bold">
                {SUPER_ADMIN_EMAIL}
                <span className="ml-2 text-[10px] uppercase bg-amber-500 text-black px-2 py-0.5 rounded">
                  Super Admin
                </span>
              </td>
              <td className="p-3 text-gray-400">All tabs (full access)</td>
              <td className="p-3 text-right text-gray-600 text-xs">
                — protected —
              </td>
            </tr>
            {adminUsers.map((adminUser) => (
              <tr
                key={adminUser.id}
                className="border-t border-gray-800 hover:bg-gray-900/50"
              >
                <td className="p-3 text-white">{adminUser.email}</td>
                <td className="p-3 text-gray-400 text-xs">
                  {adminUser.tabs && adminUser.tabs.length > 0 ? (
                    adminUser.tabs.join(", ")
                  ) : (
                    <span className="text-gray-600">none</span>
                  )}
                  <span
                    className={`ml-2 px-2 py-0.5 rounded capitalize ${adminUser.role === "editor" ? "bg-amber-500/20 text-amber-500" : "bg-gray-800 text-gray-300"}`}
                  >
                    {adminUser.role || "viewer"}
                  </span>
                </td>
                <td className="p-3 text-right space-x-2">
                  <button
                    onClick={() => setEditing(adminUser)}
                    className="text-xs bg-blue-500/20 text-blue-400 px-3 py-1 rounded hover:bg-blue-500/30"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(adminUser.id)}
                    className="text-xs bg-red-500/20 text-red-400 px-3 py-1 rounded hover:bg-red-500/30"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {adminUsers.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-500">
                  {'No sub-admins yet. Click "Add Admin" to invite one.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {(adding || editing) && (
        <AdminUserModal
          adminUser={editing || undefined}
          onClose={() => {
            setAdding(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function AdminUserModal({ adminUser, onClose }) {
  const [email, setEmail] = useState(adminUser?.email || "");
  const [password, setPassword] = useState("");
  const [tabs, setTabs] = useState(adminUser?.tabs || ["overview"]);
  const [role, setRole] = useState(adminUser?.role || "viewer");
  const [saving, setSaving] = useState(false);
  const toggleTab = (b) => {
    setTabs((prev) =>
      prev.includes(b) ? prev.filter((item) => item !== b) : [...prev, b],
    );
  };
  const handleSave = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      alert("Enter a valid email.");
      return;
    }
    if (normalizedEmail === SUPER_ADMIN_EMAIL.toLowerCase()) {
      alert("This is already the Super Admin.");
      return;
    }
    if (tabs.length === 0) {
      alert("Select at least one tab.");
      return;
    }
    if (!adminUser?.id && (!password || password.length < 6)) {
      alert("Enter a password with at least 6 characters.");
      return;
    }
    setSaving(true);
    try {
      if (adminUser?.id) {
        await updateDoc(doc(db, "adminUsers", adminUser.id), {
          email: normalizedEmail,
          tabs: tabs,
          role: role,
        });
      } else {
        const secondaryApp = initializeApp(
          firebaseConfig,
          "SecondaryApp" + Date.now(),
        );
        const secondaryAuth = getAuth(secondaryApp);
        await createUserWithEmailAndPassword(
          secondaryAuth,
          normalizedEmail,
          password,
        );
        await addDoc(collection(db, "adminUsers"), {
          email: normalizedEmail,
          tabs: tabs,
          role: role,
          createdAt: serverTimestamp(),
        });
      }
      onClose();
    } catch (secondaryApp) {
      alert("Failed: " + secondaryApp.message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onMouseDown={onClose}
    >
      <div
        className="bg-[#0a0a0a] border border-amber-500/30 rounded-2xl p-6 max-w-lg w-full"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-white mb-1">
          {adminUser ? "Edit Admin" : "Add New Admin"}
        </h3>
        <p className="text-xs text-gray-500 mb-5">
          The user must sign in with this exact email via Google or
          email/password.
        </p>
        <label className="text-xs text-gray-400 uppercase font-bold">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={!!adminUser}
          placeholder="admin2@example.com"
          className="form-input mb-4"
        />
        {!adminUser && (
          <>
            <label className="text-xs text-gray-400 uppercase font-bold">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="form-input mb-4"
            />
          </>
        )}
        <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">
          Allowed Tabs
        </label>
        <div className="grid grid-cols-2 gap-2 mb-5">
          {ADMIN_TABS.map((item) => (
            <label
              key={item.key}
              className="flex items-center gap-2 bg-gray-900/60 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-900"
            >
              <input
                type="checkbox"
                checked={tabs.includes(item.key)}
                onChange={() => toggleTab(item.key)}
                className="accent-amber-500 w-4 h-4"
              />
              <span className="text-sm text-white">{item.label}</span>
            </label>
          ))}
        </div>
        <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">
          Role
        </label>
        <div className="flex gap-4 mb-5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="role"
              value="viewer"
              checked={role === "viewer"}
              onChange={() => setRole("viewer")}
              className="accent-amber-500"
            />
            <span className="text-sm text-white">Viewer</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="role"
              value="editor"
              checked={role === "editor"}
              onChange={() => setRole("editor")}
              className="accent-amber-500"
            />
            <span className="text-sm text-white">Editor</span>
          </label>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-5 py-2 rounded-lg text-sm"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
