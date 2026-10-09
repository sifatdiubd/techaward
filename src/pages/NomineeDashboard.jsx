import { useEffect, useRef, useState } from "react";
import { signInAnonymously } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/lib/firebase";
import {
  createCheckout,
  getInvoiceIdFromQuery,
  verifyPayment,
} from "@/lib/paymently";

const getNomineeImageUrl = (url) => {
  if (!url) {
    return "https://placehold.co/150x150/1a1a1a/e0e0e0?text=No+Img";
  }
  if (url.includes("drive.google.com") || url.includes("docs.google.com")) {
    const match = url.match(/[-\w]{25,}/);
    if (match) {
      return `https://lh3.googleusercontent.com/d/${match[0]}`;
    }
  }
  return url;
};

function getDeadline(createdAt, extHours = 0, override) {
  if (override) {
    return override.toDate
      ? override.toDate()
      : override.seconds
        ? new Date(override.seconds * 1000)
        : new Date(override);
  }
  if (!createdAt) {
    return null;
  }
  let created = null;
  if (createdAt.toDate) {
    created = createdAt.toDate();
  } else if (createdAt.seconds) {
    created = new Date(createdAt.seconds * 1000);
  } else if (typeof createdAt == "string" || typeof createdAt == "number") {
    created = new Date(createdAt);
  }
  if (!created) {
    return null;
  }
  const deadline = new Date(created);
  deadline.setHours(deadline.getHours() + 72 + Number(extHours || 0));
  return deadline;
}

function formatCountdown(ms) {
  if (ms <= 0) {
    return "00:00:00";
  }
  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function NomineeDashboard() {
  const [nominee, setNominee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [docId, setDocId] = useState("");
  const [fbVideoLink, setFbVideoLink] = useState("");
  const [driveVideoLink, setDriveVideoLink] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [docLink, setDocLink] = useState("");
  const [presLink, setPresLink] = useState("");
  const [countdown, setCountdown] = useState("--:--:--");
  const [deadlinePassed, setDeadlinePassed] = useState(false);
  const [deadline, setDeadline] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    signInAnonymously(auth).catch(console.error);
    const stored = localStorage.getItem("activeNomineeId");
    if (!stored) {
      navigate("/login");
      return;
    }
    const nomineeQuery = query(
      collection(db, "nominations"),
      where("nominationId", "==", stored),
    );
    let isFirstLoad = true;
    const unsubscribe = onSnapshot(
      nomineeQuery,
      (snapshot) => {
        if (snapshot.empty) {
          localStorage.removeItem("activeNomineeId");
          navigate("/login");
          return;
        }
        const docSnap = snapshot.docs[0];
        const data = {
          id: docSnap.id,
          ...docSnap.data(),
        };
        setNominee(data);
        setDocId(docSnap.id);
        const deadlineDate = getDeadline(
          data.createdAt,
          data.deadlineExtHours || 0,
          data.deadlineOverride,
        );
        setDeadline(deadlineDate);
        if (isFirstLoad) {
          setFbVideoLink(data.facebookVideoLink || data.fbLink || "");
          setDriveVideoLink(data.googleDriveVideoLink || data.videoLink || "");
          setDocLink(data.docLink || "");
          setPresLink(data.presLink || "");
          isFirstLoad = false;
          setLoading(false);
        }
      },
      (err) => {
        console.error(err);
        setLoading(false);
      },
    );
    const messagesQuery = query(
      collection(db, "support_messages"),
      where("nominationId", "==", stored),
    );
    const unsubscribe2 = onSnapshot(messagesQuery, (snapshot) => {
      const items = [];
      snapshot.forEach((docSnap) =>
        items.push({
          id: docSnap.id,
          ...docSnap.data(),
        }),
      );
      setMessages(items);
    });
    return () => {
      unsubscribe();
      unsubscribe2();
    };
  }, [navigate]);
  useEffect(() => {
    if (!deadline) {
      return;
    }
    const tick = () => {
      const remaining = deadline.getTime() - Date.now();
      if (remaining <= 0) {
        setCountdown("00:00:00");
        setDeadlinePassed(true);
      } else {
        setCountdown(formatCountdown(remaining));
        setDeadlinePassed(false);
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [deadline]);
  const handlePenaltyPayment = async () => {
    if (nominee) {
      try {
        const baseUrl = `${window.location.origin}/nominee`;
        const checkout = await createCheckout({
          amount: 500,
          email: nominee.email,
          fullName: nominee.name,
          mobile: nominee.mobile,
          redirectUrl: `${baseUrl}?pay=penalty_success`,
          cancelUrl: `${baseUrl}?pay=cancel`,
          metadata: {
            penalty: "1",
            nomination_id: nominee.nominationId,
            doc_id: docId,
          },
        });
        if (!checkout.status || !checkout.payment_url) {
          alert(checkout.message || "Failed to start penalty payment.");
          return;
        }
        localStorage.setItem("nta_penalty_doc", docId);
        window.location.href = checkout.payment_url;
      } catch {
        alert("Something went wrong.");
      }
    }
  };
  const penaltyHandledRef = useRef(false);
  const [verifyingPenalty, setVerifyingPenalty] = useState(false);
  useEffect(() => {
    if (
      new URLSearchParams(window.location.search).get("pay") !==
        "penalty_success" ||
      penaltyHandledRef.current
    ) {
      return;
    }
    penaltyHandledRef.current = true;
    const stored = localStorage.getItem("nta_penalty_doc");
    const invoiceId = getInvoiceIdFromQuery(window.location.search);
    if (nominee) {
      (async () => {
        setVerifyingPenalty(true);
        try {
          if (!stored || !invoiceId) {
            alert("Invalid penalty payment return.");
            return;
          }
          const verification = await verifyPayment(invoiceId);
          if (
            verification?.status === true ||
            verification?.status === "COMPLETED"
          ) {
            const date = new Date(Date.now() + 259200000);
            await updateDoc(doc(db, "nominations", stored), {
              deadlineExtHours: (nominee?.deadlineExtHours || 0) + 72,
              deadlineOverride: date,
            });
            alert("Penalty payment successful! You have 72 more hours.");
            window.location.href = "/nominee";
          } else {
            alert("Penalty payment verification failed.");
          }
        } catch {
          alert("Error verifying payment.");
        } finally {
          localStorage.removeItem("nta_penalty_doc");
          setVerifyingPenalty(false);
          window.history.replaceState({}, "", "/nominee");
        }
      })();
    }
  }, [nominee, docId]);
  const handleSaveLinks = async () => {
    if (docId) {
      setSaving(true);
      try {
        await updateDoc(doc(db, "nominations", docId), {
          facebookVideoLink: fbVideoLink,
          googleDriveVideoLink: driveVideoLink,
          docLink: docLink,
          presLink: presLink,
          linksSubmittedAt: serverTimestamp(),
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } catch (err) {
        console.error(err);
        alert("সেভ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      } finally {
        setSaving(false);
      }
    }
  };
  const handleSendMessage = async () => {
    if (newMessage.trim() && nominee) {
      setSending(true);
      try {
        await addDoc(collection(db, "support_messages"), {
          nominationId: nominee.nominationId,
          name: nominee.name,
          message: newMessage,
          timestamp: serverTimestamp(),
        });
        setNewMessage("");
      } catch {
        alert("পাঠাতে সমস্যা হয়েছে।");
      } finally {
        setSending(false);
      }
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("activeNomineeId");
    navigate("/login");
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-amber-500">
        <i className="fas fa-spinner fa-spin text-3xl" />
      </div>
    );
  }
  if (!nominee) {
    return null;
  }
  const STATUS_BADGES = {
    approved: {
      label: "✓ Approved",
      cls: "bg-green-500/20 text-green-400 border-green-500/30",
    },
    winner: {
      label: "🏆 Winner",
      cls: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    },
    declined: {
      label: "✗ Declined",
      cls: "bg-red-500/20 text-red-400 border-red-500/30",
    },
    pending: {
      label: "⏳ Pending",
      cls: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    },
  };
  const statusBadge = STATUS_BADGES[nominee.status] ?? STATUS_BADGES.pending;
  const hasVideo = !!(
    nominee.facebookVideoLink ||
    nominee.fbLink ||
    nominee.googleDriveVideoLink ||
    nominee.videoLink
  );
  return (
    <div className="min-h-screen bg-[#050505] py-10 animate-fade-in">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gradient-gold">
              নমিনি ড্যাশবোর্ড
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              National Tech Award 2026
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs bg-red-600/20 text-red-400 border border-red-600/30 px-4 py-2 rounded-full hover:bg-red-600 hover:text-white transition"
          >
            <i className="fas fa-sign-out-alt mr-1" />
            {" Logout"}
          </button>
        </div>
        <div className="glass rounded-2xl p-6 md:p-8 mb-6 border border-amber-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
          <div className="flex flex-col md:flex-row gap-6 items-center relative">
            <img
              src={getNomineeImageUrl(nominee.photo)}
              alt={nominee.name}
              className="w-32 h-32 rounded-full border-4 border-amber-500 object-cover shadow-lg shadow-amber-500/20"
            />
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-white">{nominee.name}</h2>
              <p className="text-amber-400 font-bold">
                {nominee.mainCategory}
                {" > "}
                {nominee.category}
              </p>
              <p className="text-xs text-gray-400 font-mono mt-1">
                {"ID: "}
                {nominee.nominationId}
              </p>
              <span
                className={`inline-block mt-3 px-4 py-1.5 rounded-full text-xs font-bold uppercase border ${statusBadge.cls}`}
              >
                {statusBadge.label}
              </span>
            </div>
            <div className="text-center shrink-0">
              <div className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">
                Total Votes
              </div>
              <div className="text-5xl font-bold text-amber-500 font-['Oswald']">
                {nominee.voteCount || 0}
              </div>
              <button
                onClick={() => {
                  const link = `${window.location.origin}/voting?highlight=${nominee.nominationId}`;
                  navigator.clipboard.writeText(link);
                  alert("Voting Link Copied: " + link);
                }}
                className="mt-4 w-full bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-widest py-2 px-3 rounded-lg transition flex items-center justify-center gap-1.5"
              >
                <i className="fas fa-share-alt" />
                {" Share Voting Link"}
              </button>
            </div>
          </div>
        </div>
        <div
          className={`rounded-2xl p-6 md:p-8 mb-6 border relative overflow-hidden ${hasVideo ? "bg-green-900/10 border-green-500/30" : deadlinePassed ? "bg-red-900/10 border-red-500/30" : "bg-amber-900/10 border-amber-500/30"}`}
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-[10px] uppercase tracking-[3px] text-amber-500/70 font-bold mb-1">
                ভিডিও সাবমিশন নির্দেশিকা
              </p>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <i className="fas fa-video text-amber-500" />
                ভিডিও জমা দিন ও ভোট সংগ্রহ করুন
              </h3>
            </div>
            {deadline && (
              <div
                className={`text-center rounded-xl px-5 py-3 border shrink-0 ${deadlinePassed ? "bg-red-900/30 border-red-500/50" : "bg-black/40 border-amber-500/30"}`}
              >
                <p className="text-[10px] uppercase tracking-widest font-bold mb-1 text-gray-400">
                  {deadlinePassed ? "⚠ সময় শেষ" : "⏱ বাকি সময়"}
                </p>
                <p
                  className={`text-2xl font-mono font-bold tracking-wider ${deadlinePassed ? "text-red-400" : "text-amber-400"}`}
                >
                  {deadlinePassed ? "EXPIRED" : countdown}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {deadline.toLocaleString("bn-BD", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-black/30 border border-amber-500/20 rounded-xl p-4">
              <p className="text-xs font-bold text-amber-400 mb-3 flex items-center gap-1">
                <i className="fas fa-list-ul" />
                {" নির্দেশনা"}
              </p>
              <ul className="space-y-2 text-xs text-gray-300 leading-relaxed">
                <li>
                  • আপনাকে প্রথম একটি ভিডিও তৈরি করতে হবে, যেখানে আপনি আপনার নাম
                  এবং কোন ক্যাটাগরিতে nomination পেয়েছেন তা বলবেন।
                </li>
                <li>
                  • ভিডিওটি আপনার Facebook page-এ পোস্ট করে সেই পোস্টের link
                  নিচে দিতে হবে।
                </li>
                <li>
                  • একই ভিডিও Google Drive-এ upload করে তার link-টিও নিচের ফিল্ড
                  যুক্ত করতে হবে।
                </li>
                <li>
                  {"• ভিডিও সময়: "}
                  <span className="text-amber-400 font-semibold">
                    ৪৫ সেকেন্ড – ১ মিনিট
                  </span>
                  {" (manual verification হবে)"}
                </li>
                <li className="text-red-400">
                  • সাবমিশন ৭২ ঘন্টার পর disabled হবে। ৭২ ঘন্টার সময় শেষ হলে
                  আপনাকে 500 BDT পেনাল্টি ফি দিয়ে আবার ৭২ ঘন্টা সময় বাড়িয়ে নিতে
                  হবে।
                </li>
                <li className="text-red-400">
                  • আপনি ৭২ ঘন্টার মধ্যে বারবার edit করতে পারবেন।
                </li>
                <li className="text-amber-400 font-bold">
                  {
                    "• Documentation & Presentation দিতে হবে ভোট কার্যক্রম শেষ হওয়ার পর।"
                  }
                </li>
              </ul>
            </div>
            <div className="bg-black/30 border border-amber-500/20 rounded-xl p-4 flex flex-col justify-center">
              <p className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-1">
                <i className="fas fa-clock" />
                {" সময় বাকি"}
              </p>
              {deadline ? (
                <div>
                  <p
                    className={`text-3xl font-mono font-bold ${deadlinePassed ? "text-red-400" : "text-white"}`}
                  >
                    {deadlinePassed
                      ? "00h 00m"
                      : (() => {
                          const remaining = Math.max(
                            0,
                            deadline.getTime() - Date.now(),
                          );
                          const hours = Math.floor(remaining / 3600000);
                          const minutes = Math.floor(
                            (remaining % 3600000) / 60000,
                          );
                          return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`;
                        })()}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Submission deadline: within 72 hours after registration or
                    admin-defined deadline.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  Deadline info loading...
                </p>
              )}
            </div>
          </div>
          {deadlinePassed && !hasVideo ? (
            <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-5 text-center">
              <p className="text-red-400 font-bold text-sm mb-3">
                ⚠ ৭২ ঘন্টার সময়সীমা পেরিয়ে গেছে।
              </p>
              <p className="text-gray-300 text-xs mb-4">
                ভিডিও জমা দেওয়ার সময় শেষ। আপনি 500 BDT পেনাল্টি ফি প্রদান করে
                সময়সীমা আরও ৭২ ঘন্টা বৃদ্ধি করতে পারেন।
              </p>
              <button
                onClick={handlePenaltyPayment}
                disabled={verifyingPenalty}
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-2.5 rounded-lg text-sm transition shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {verifyingPenalty ? "Verifying..." : "Pay Penalty (500 BDT)"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {hasVideo && (
                <div className="flex items-center gap-2 bg-green-900/20 border border-green-500/30 rounded-lg px-4 py-2.5">
                  <i className="fas fa-check-circle text-green-400" />
                  <p className="text-xs text-green-400 font-medium">
                    আগেই সাবমিট করা হয়েছে। ৭২ ঘন্টার মধ্যে আপডেট করতে পারবেন।
                  </p>
                </div>
              )}
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-widest mb-2">
                  <i className="fab fa-facebook text-blue-400" />
                  {"Facebook Video Link "}
                  <span className="text-red-400">(Required)</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={fbVideoLink}
                    onChange={(e) => setFbVideoLink(e.target.value)}
                    disabled={deadlinePassed}
                    className="form-input w-full pl-10 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="https://www.facebook.com/share/v/..."
                  />
                  <i className="fab fa-facebook-f absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 text-sm pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-widest mb-2">
                  <i className="fab fa-google-drive text-green-400" />
                  {"Google Drive Video Link "}
                  <span className="text-red-400">(Required)</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={driveVideoLink}
                    onChange={(e) => setDriveVideoLink(e.target.value)}
                    disabled={deadlinePassed}
                    className="form-input w-full pl-10 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="https://drive.google.com/drive/folders/..."
                  />
                  <i className="fab fa-google-drive absolute left-3 top-1/2 -translate-y-1/2 text-green-500 text-sm pointer-events-none" />
                </div>
              </div>
              <button
                onClick={handleSaveLinks}
                disabled={
                  saving || deadlinePassed || (!fbVideoLink && !driveVideoLink)
                }
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold py-3 rounded-xl transition transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                {saving ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin" />
                    {" সেভ হচ্ছে..."}
                  </>
                ) : saved ? (
                  <>
                    <i className="fas fa-check-circle" />
                    {" সফলভাবে সেভ হয়েছে!"}
                  </>
                ) : (
                  <>
                    <i className="fas fa-save" />
                    {" লিংক সাবমিট করুন"}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="glass rounded-2xl p-6 border border-gray-800">
            <h3 className="text-lg font-bold text-amber-500 mb-4">
              <i className="fas fa-link mr-2" />
              {" পোর্টফোলিও লিংক"}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">
                  Document Link
                </label>
                <input
                  type="url"
                  value={docLink}
                  onChange={(e) => setDocLink(e.target.value)}
                  disabled={deadlinePassed}
                  className="form-input disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="https://docs.google.com/..."
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">
                  Presentation Link
                </label>
                <input
                  type="url"
                  value={presLink}
                  onChange={(e) => setPresLink(e.target.value)}
                  disabled={deadlinePassed}
                  className="form-input disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="https://docs.google.com/..."
                />
              </div>
              <button
                onClick={handleSaveLinks}
                disabled={saving || deadlinePassed}
                className="w-full bg-amber-500 text-black font-bold py-2 rounded-lg hover:bg-amber-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                সেভ করুন
              </button>
            </div>
          </div>
          <div className="glass rounded-2xl p-6 border border-gray-800">
            <h3 className="text-lg font-bold text-amber-500 mb-4">
              <i className="fas fa-bell mr-2" />
              {" নোটিশসমূহ"}
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {nominee.notices && nominee.notices.length > 0 ? (
                nominee.notices.map((notice, index) => (
                  <div
                    key={index}
                    className="bg-gray-800 p-3 rounded text-sm text-gray-200 border-l-2 border-amber-500"
                  >
                    {notice}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">কোনো নোটিশ নেই।</p>
              )}
            </div>
          </div>
        </div>
        <div className="glass rounded-2xl p-6 border border-gray-800">
          <h3 className="text-lg font-bold text-amber-500 mb-4">
            <i className="fas fa-headset mr-2" />
            {" সাপোর্ট"}
          </h3>
          <div className="space-y-3 max-h-60 overflow-y-auto mb-4 pr-1">
            {messages.map((message) => (
              <div key={message.id} className="bg-gray-800 p-3 rounded-lg">
                <p className="text-sm text-white">
                  <b>আপনি:</b> {message.message}
                </p>
                {message.reply && (
                  <div className="mt-2 pl-3 border-l-2 border-amber-500">
                    <p className="text-sm text-amber-400">
                      <b>রিপ্লাই:</b> {message.reply}
                    </p>
                  </div>
                )}
              </div>
            ))}
            {messages.length === 0 && (
              <p className="text-gray-500 text-sm">কোনো মেসেজ নেই।</p>
            )}
          </div>
          <div className="flex gap-2">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage();
                }
              }}
              className="form-input flex-1"
              placeholder="আপনার প্রশ্ন লিখুন..."
            />
            <button
              onClick={handleSendMessage}
              disabled={sending || !newMessage.trim()}
              className="bg-amber-500 text-black font-bold px-6 rounded-lg hover:bg-amber-400 transition disabled:opacity-50"
            >
              {sending ? (
                <i className="fas fa-circle-notch fa-spin" />
              ) : (
                "পাঠান"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
