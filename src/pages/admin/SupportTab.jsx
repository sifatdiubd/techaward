import { useMemo, useState } from "react";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SupportTab({ messages, isSuperAdmin }) {
  const [activeThread, setActiveThread] = useState(null);
  const [reply, setReply] = useState("");
  const threads = useMemo(() => {
    const map = new Map();
    messages.forEach((message) => {
      const list = map.get(message.nominationId) || [];
      list.push(message);
      map.set(message.nominationId, list);
    });
    return Array.from(map.entries()).map(([nominationId, list]) => ({
      id: nominationId,
      list: list,
      latest: list[0],
    }));
  }, [messages]);
  const sendReply = async () => {
    if (activeThread?.id && reply.trim()) {
      await updateDoc(doc(db, "support_messages", activeThread.id), {
        reply: reply.trim(),
        replyTimestamp: serverTimestamp(),
      });
      setReply("");
      alert("Reply sent");
    }
  };
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">
        Support Inbox ({threads.length}
        {" threads)"}
      </h2>
      <div className="grid lg:grid-cols-3 gap-4 h-[70vh]">
        <div className="glass rounded-xl border border-gray-800 overflow-y-auto">
          {threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => setActiveThread(thread.latest)}
              className={`w-full text-left p-4 border-b border-gray-800 hover:bg-gray-900/50 ${activeThread?.nominationId === thread.id ? "bg-amber-500/10" : ""}`}
            >
              <p className="font-bold text-amber-500 text-sm">
                {thread.latest.name}
              </p>
              <p className="text-xs text-gray-500 font-mono">{thread.id}</p>
              <p className="text-xs text-gray-400 truncate mt-1">
                {thread.latest.message}
              </p>
            </button>
          ))}
          {threads.length === 0 && (
            <p className="text-gray-500 text-sm p-4">
              No support messages yet.
            </p>
          )}
        </div>
        <div className="lg:col-span-2 glass rounded-xl border border-gray-800 flex flex-col">
          {activeThread ? (
            <>
              <div className="border-b border-gray-800 p-4">
                <p className="font-bold text-amber-500">{activeThread.name}</p>
                <p className="text-xs text-gray-500 font-mono">
                  {activeThread.nominationId}
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="bg-gray-900 p-3 rounded-2xl rounded-tl-none max-w-[80%]">
                  <p className="text-sm text-white">{activeThread.message}</p>
                </div>
                {activeThread.reply && (
                  <div className="bg-amber-500/20 border border-amber-500/30 p-3 rounded-2xl rounded-tr-none max-w-[80%] ml-auto">
                    <p className="text-xs text-amber-400 font-bold mb-1">
                      Admin Reply
                    </p>
                    <p className="text-sm text-white">{activeThread.reply}</p>
                  </div>
                )}
              </div>
              {isSuperAdmin ? (
                <div className="border-t border-gray-800 p-4 flex gap-2">
                  <input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type a reply..."
                    className="form-input flex-1"
                    onKeyDown={(e) => e.key === "Enter" && sendReply()}
                  />
                  <button
                    onClick={sendReply}
                    className="bg-amber-500 text-black font-bold px-5 rounded-lg hover:bg-amber-400"
                  >
                    <i className="fas fa-paper-plane" />
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-800 p-4 text-center text-gray-500 text-sm">
                  You do not have permission to reply to support messages.
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
              Select a thread to reply
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
