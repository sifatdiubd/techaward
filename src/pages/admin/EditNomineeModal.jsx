import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function EditNomineeModal({ nominee, onClose }) {
  const [form, setForm] = useState(nominee);
  const handleSave = async () => {
    if (!form.id) {
      return;
    }
    const { id, ...rest } = form;
    const notices = form._noticesString
      ? form._noticesString
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : form.notices || [];
    await updateDoc(doc(db, "nominations", id), {
      ...rest,
      notices: notices,
    });
    alert("Updated");
    onClose();
  };
  const fields = [
    {
      k: "name",
      label: "Name",
    },
    {
      k: "email",
      label: "Email",
    },
    {
      k: "mobile",
      label: "Mobile",
    },
    {
      k: "whatsapp",
      label: "WhatsApp",
    },
    {
      k: "gender",
      label: "Gender",
    },
    {
      k: "division",
      label: "Division",
    },
    {
      k: "district",
      label: "District",
    },
    {
      k: "mainCategory",
      label: "Main Category",
    },
    {
      k: "category",
      label: "Sub-Category",
    },
    {
      k: "fbProfile",
      label: "FB Profile",
    },
    {
      k: "fbPage",
      label: "FB Page",
    },
    {
      k: "paymentMethod",
      label: "Payment Method",
    },
    {
      k: "paymentNumber",
      label: "Payment Number",
    },
    {
      k: "trxId",
      label: "Transaction ID",
    },
    {
      k: "paymentAmount",
      label: "Payment Amount",
      type: "number",
    },
    {
      k: "voteCount",
      label: "Vote Count",
      type: "number",
    },
    {
      k: "deadlineExtHours",
      label: "Deadline Extension (Hours)",
      type: "number",
    },
  ];
  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4"
      onMouseDown={onClose}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="bg-[#0a0a0a] border border-blue-500/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-black border-b border-blue-500/20 p-4 flex justify-between">
          <h3 className="text-xl font-bold text-blue-400">
            {"Edit: "}
            {nominee.name}
          </h3>
          <button onClick={onClose} className="text-gray-400">
            <i className="fas fa-times" />
          </button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-3">
          {fields.map((field) => (
            <div key={field.k}>
              <label className="text-[10px] uppercase text-gray-500 font-bold">
                {field.label}
              </label>
              <input
                type={field.type || "text"}
                value={form[field.k] ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    [field.k]:
                      field.type === "number"
                        ? Number(e.target.value)
                        : e.target.value,
                  })
                }
                className="form-input"
              />
            </div>
          ))}
          <div className="col-span-2">
            <label className="text-[10px] uppercase text-gray-500 font-bold">
              About
            </label>
            <textarea
              value={form.about || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  about: e.target.value,
                })
              }
              rows={3}
              className="form-input"
            />
          </div>
          <div className="col-span-2">
            <label className="text-[10px] uppercase text-gray-500 font-bold">
              Notices (Comma-separated)
            </label>
            <textarea
              value={form._noticesString ?? (form.notices?.join(", ") || "")}
              onChange={(e) =>
                setForm({
                  ...form,
                  _noticesString: e.target.value,
                })
              }
              rows={2}
              className="form-input"
              placeholder="Notice 1, Notice 2"
            />
          </div>
        </div>
        <div className="p-4 border-t border-gray-800 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-gray-400">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white font-bold px-6 py-2 rounded-lg hover:bg-blue-400"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
