import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  doc,
  getCountFromServer,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { DEFAULT_APPS_SCRIPT_URL, sendEmail } from "@/lib/email";
import { SUPER_ADMIN_EMAIL, auth, db } from "@/lib/firebase";
import AdminUsersTab from "@/pages/admin/AdminUsersTab";
import DeadlinesTab from "@/pages/admin/DeadlinesTab";
import GalleryTab from "@/pages/admin/GalleryTab";
import NomineesTab from "@/pages/admin/NomineesTab";
import OverviewTab from "@/pages/admin/OverviewTab";
import SettingsTab from "@/pages/admin/SettingsTab";
import SponsorsTab from "@/pages/admin/SponsorsTab";
import SupportTab from "@/pages/admin/SupportTab";
import WinnersTab from "@/pages/admin/WinnersTab";

export const ADMIN_TABS = [
  {
    key: "overview",
    label: "Overview",
    icon: "fa-chart-line",
  },
  {
    key: "nominees",
    label: "Nominees",
    icon: "fa-users",
  },
  {
    key: "deadlines",
    label: "Deadlines",
    icon: "fa-clock",
  },
  {
    key: "winners",
    label: "Winners",
    icon: "fa-trophy",
  },
  {
    key: "sponsors",
    label: "Sponsors",
    icon: "fa-handshake",
  },
  {
    key: "gallery",
    label: "Gallery",
    icon: "fa-images",
  },
  {
    key: "support",
    label: "Support",
    icon: "fa-headset",
  },
  {
    key: "settings",
    label: "Settings",
    icon: "fa-cog",
  },
];

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [nominations, setNominations] = useState([]);
  const [votes, setVotes] = useState([]);
  const [settings, setSettings] = useState({
    dateStr: "",
    timeStr: "",
    venueStr: "",
    nominationOpen: true,
    appsScriptUrl: DEFAULT_APPS_SCRIPT_URL,
    eventDateTime: "",
  });
  const [messages, setMessages] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [winners, setWinners] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [adminUsers, setAdminUsers] = useState([]);
  const [allowedTabs, setAllowedTabs] = useState(null);
  const [userRole, setUserRole] = useState("viewer");
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser || !currentUser.email) {
        setUser(null);
        navigate("/login");
        setLoading(false);
        return;
      }
      const lower = currentUser.email.toLowerCase();
      const isSuper = lower === SUPER_ADMIN_EMAIL.toLowerCase();
      let tabs = null;
      let role = "viewer";
      if (isSuper) {
        tabs = null;
        role = "superadmin";
      } else {
        try {
          const snapshot = await getDocs(
            query(collection(db, "adminUsers"), where("email", "==", lower)),
          );
          if (snapshot.empty) {
            alert("Access denied. You are not authorized as an admin.");
            await signOut(auth);
            navigate("/login");
            setLoading(false);
            return;
          }
          const data = snapshot.docs[0].data();
          tabs = data.tabs && data.tabs.length > 0 ? data.tabs : ["overview"];
          role = data.role || "viewer";
        } catch (err) {
          console.error(err);
          await signOut(auth);
          navigate("/login");
          setLoading(false);
          return;
        }
      }
      setAllowedTabs(tabs);
      setUserRole(role);
      setUser(currentUser);
      onSnapshot(
        query(collection(db, "nominations"), orderBy("createdAt", "desc")),
        (snapshot) => {
          const items = [];
          snapshot.forEach((docSnap) =>
            items.push({
              id: docSnap.id,
              ...docSnap.data(),
            }),
          );
          setNominations(items);
        },
      );
      getCountFromServer(collection(db, "votes")).then((result) => {
        setVotes((prev) => {
          const next = [...prev];
          next.length = result.data().count;
          return next;
        });
      });
      onSnapshot(doc(db, "settings", "general"), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (!data.appsScriptUrl) {
            data.appsScriptUrl = DEFAULT_APPS_SCRIPT_URL;
          }
          setSettings(data);
        }
      });
      onSnapshot(
        query(collection(db, "support_messages"), orderBy("timestamp", "desc")),
        (snapshot) => {
          const items = [];
          snapshot.forEach((docSnap) =>
            items.push({
              id: docSnap.id,
              ...docSnap.data(),
            }),
          );
          setMessages(items);
        },
      );
      onSnapshot(collection(db, "sponsors"), (snapshot) => {
        const items = [];
        snapshot.forEach((docSnap) =>
          items.push({
            id: docSnap.id,
            ...docSnap.data(),
          }),
        );
        setSponsors(items);
      });
      onSnapshot(collection(db, "gallery"), (snapshot) => {
        const items = [];
        snapshot.forEach((docSnap) =>
          items.push({
            id: docSnap.id,
            ...docSnap.data(),
          }),
        );
        setGallery(items);
      });
      onSnapshot(collection(db, "winners"), (snapshot) => {
        const items = [];
        snapshot.forEach((docSnap) =>
          items.push({
            id: docSnap.id,
            ...docSnap.data(),
          }),
        );
        setWinners(items);
      });
      if (isSuper) {
        onSnapshot(collection(db, "adminUsers"), (snapshot) => {
          const items = [];
          snapshot.forEach((docSnap) =>
            items.push({
              id: docSnap.id,
              ...docSnap.data(),
            }),
          );
          setAdminUsers(items);
        });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);
  const isSuperAdmin =
    !!user?.email &&
    user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
  const stats = useMemo(() => {
    const counts = {
      total: 0,
      approved: 0,
      winner: 0,
      pending: 0,
      declined: 0,
      votes: votes.length,
    };
    nominations.forEach((nomination) => {
      counts.total++;
      if (nomination.status === "approved") {
        counts.approved++;
      }
      if (nomination.status === "winner") {
        counts.winner++;
      }
      if (nomination.status === "pending") {
        counts.pending++;
      }
      if (nomination.status === "declined") {
        counts.declined++;
      }
    });
    return counts;
  }, [nominations, votes]);
  const handleStatusChange = async (id, status) => {
    if (!id) {
      return;
    }
    const nominee = nominations.find((nomination) => nomination.id === id);
    if (nominee) {
      await updateDoc(doc(db, "nominations", id), {
        status: status,
      });
      if (status === "approved" && nominee.email) {
        const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #e0e0e0; border-radius: 12px; overflow: hidden; border: 1px solid #2a2a2a;">
  <div style="background: linear-gradient(135deg, #1a1200, #2d1f00); padding: 32px 32px 24px; text-align: center; border-bottom: 2px solid #f5bf42;">
    <img src="https://iili.io/KqpV6Fe.png" alt="National Tech Award" style="height: 60px; margin-bottom: 16px;" />
    <h1 style="color: #f5bf42; font-size: 22px; margin: 0; letter-spacing: 2px; text-transform: uppercase;">Nomination Success!</h1>
    <p style="color: #d4a017; font-size: 13px; margin-top: 8px;">National Tech Award 2026</p>
  </div>
  <div style="padding: 32px;">
    <p style="font-size: 15px; margin-bottom: 20px;">Dear <strong style="color: #f5bf42;">${nominee.name}</strong>,</p>
    <p style="font-size: 14px; line-height: 1.7; color: #c0c0c0; margin-bottom: 24px;">
      Congratulations! Your nomination for National Tech Award 2026 has been <strong style="color: #22c55e;">Success</strong>.
      Your success story has inspired us.
    </p>
    <div style="background: #111; border: 1px solid #2a2a2a; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
      <h3 style="color: #f5bf42; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 14px;">Your Details</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr style="border-bottom: 1px solid #1e1e1e;"><td style="padding: 8px 0; color: #888; width: 40%;">Nomination ID</td><td style="padding: 8px 0; color: #f5bf42; font-family: monospace; font-weight: bold;">${nominee.nominationId}</td></tr>
        <tr style="border-bottom: 1px solid #1e1e1e;"><td style="padding: 8px 0; color: #888;">Name</td><td style="padding: 8px 0; color: #fff;">${nominee.name}</td></tr>
        <tr style="border-bottom: 1px solid #1e1e1e;"><td style="padding: 8px 0; color: #888;">Category</td><td style="padding: 8px 0; color: #fff;">${nominee.mainCategory} &gt; ${nominee.category}</td></tr>
        <tr style="border-bottom: 1px solid #1e1e1e;"><td style="padding: 8px 0; color: #888;">Email</td><td style="padding: 8px 0; color: #fff;">${nominee.email}</td></tr>
        <tr style="border-bottom: 1px solid #1e1e1e;"><td style="padding: 8px 0; color: #888;">Mobile</td><td style="padding: 8px 0; color: #fff;">${nominee.mobile}</td></tr>
        <tr><td style="padding: 8px 0; color: #888;">Status</td><td style="padding: 8px 0;"><span style="background: #14532d; color: #22c55e; padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: bold;">&#10003; Success</span></td></tr>
      </table>
    </div>
    <div style="background: #0d1f0d; border: 1px solid #14532d; border-radius: 10px; padding: 16px; margin-bottom: 24px;">
      <p style="color: #22c55e; font-size: 13px; font-weight: bold; margin: 0 0 8px;">&#128274; Dashboard Login</p>
      <p style="font-size: 13px; color: #c0c0c0; margin: 4px 0;">Login ID: <strong style="color: #f5bf42;">${nominee.nominationId}</strong></p>
      <p style="font-size: 13px; color: #c0c0c0; margin: 4px 0;">Password: Your mobile number</p>
      <p style="margin-top: 10px;"><a href="${window.location.origin}/login" style="background: #f5bf42; color: #000; padding: 8px 18px; border-radius: 6px; font-weight: bold; text-decoration: none; font-size: 13px;">Login to Dashboard &rarr;</a></p>
    </div>
    <div style="background: #1a1000; border: 1px solid #92400e; border-radius: 10px; padding: 14px; margin-bottom: 24px;">
      <p style="color: #fbbf24; font-size: 13px; font-weight: bold; margin: 0 0 6px;">&#9888; Important &mdash; Do within 72 Hours</p>
      <p style="color: #c0c0c0; font-size: 12px; line-height: 1.6; margin: 0;">
        Within <strong>72 hours</strong> of registration, log into your dashboard and submit your
        <strong>Facebook video link</strong> and <strong>Google Drive video link</strong>.
      </p>
    </div>
    <p style="font-size: 13px; color: #888; line-height: 1.6;">Best regards,<br/><strong style="color: #f5bf42;">NTA Authority</strong><br/>National Tech Award 2026</p>
  </div>
  <div style="background: #050505; padding: 16px; text-align: center; border-top: 1px solid #1a1a1a;">
    <p style="color: #555; font-size: 11px; margin: 0;">ntechaward@gmail.com | +880 1581-805305</p>
    <p style="color: #444; font-size: 10px; margin: 4px 0 0;">Gazi Tower, Level 7, Kazipara, Mirpur, Dhaka 1216</p>
  </div>
</div>`;
        await sendEmail(
          nominee.email,
          "✅ Nomination Success — National Tech Award 2026",
          html,
          settings.appsScriptUrl,
        );
      }
      if (status === "declined" && nominee.email) {
        const payLink = `https://techawardbd.com/nomination?repay=${nominee.nominationId}`;
        const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #e0e0e0; border-radius: 12px; overflow: hidden; border: 1px solid #2a2a2a;">
  <div style="background: linear-gradient(135deg, #1a0000, #2d0000); padding: 32px 32px 24px; text-align: center; border-bottom: 2px solid #ef4444;">
    <img src="https://iili.io/KqpV6Fe.png" alt="National Tech Award" style="height: 60px; margin-bottom: 16px;" />
    <h1 style="color: #ef4444; font-size: 22px; margin: 0; letter-spacing: 2px; text-transform: uppercase;">Nomination Declined</h1>
    <p style="color: #f87171; font-size: 13px; margin-top: 8px;">National Tech Award 2026 &mdash; Action Required</p>
  </div>
  <div style="padding: 32px;">
    <p style="font-size: 15px; margin-bottom: 20px;">Dear <strong style="color: #f87171;">${nominee.name}</strong>,</p>
    <p style="font-size: 14px; line-height: 1.7; color: #c0c0c0; margin-bottom: 24px;">
      We regret to inform you that your nomination for National Tech Award 2026 has been <strong style="color: #ef4444;">Declined</strong>.
      This may be due to an incomplete or unverified payment. You can complete your payment to get automatically Success.
    </p>
    <div style="background: #111; border: 1px solid #2a2a2a; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
      <h3 style="color: #ef4444; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 14px;">Your Details</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr style="border-bottom: 1px solid #1e1e1e;"><td style="padding: 8px 0; color: #888; width: 40%;">Nomination ID</td><td style="padding: 8px 0; color: #fbbf24; font-family: monospace; font-weight: bold;">${nominee.nominationId}</td></tr>
        <tr style="border-bottom: 1px solid #1e1e1e;"><td style="padding: 8px 0; color: #888;">Name</td><td style="padding: 8px 0; color: #fff;">${nominee.name}</td></tr>
        <tr style="border-bottom: 1px solid #1e1e1e;"><td style="padding: 8px 0; color: #888;">Category</td><td style="padding: 8px 0; color: #fff;">${nominee.mainCategory} &gt; ${nominee.category}</td></tr>
        <tr><td style="padding: 8px 0; color: #888;">Status</td><td style="padding: 8px 0;"><span style="background: #450a0a; color: #ef4444; padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: bold;">&#10007; Declined</span></td></tr>
      </table>
    </div>
    <!-- Pay Now Box -->
    <div style="background: #0a1a0a; border: 2px solid #22c55e; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
      <p style="color: #22c55e; font-size: 15px; font-weight: bold; margin: 0 0 8px;">&#128176; Complete Payment &mdash; Get Auto Success!</p>
      <p style="color: #c0c0c0; font-size: 13px; margin: 0 0 16px; line-height: 1.6;">
        Once payment is verified, your nomination will be <strong style="color: #22c55e;">automatically Success</strong>
        and a confirmation email will be sent to you.
      </p>
      <a href="${payLink}" style="display: inline-block; background: linear-gradient(135deg, #22c55e, #16a34a); color: #000; font-size: 15px; font-weight: bold; padding: 14px 32px; border-radius: 8px; text-decoration: none; letter-spacing: 0.5px;">&#128179; Pay Now &rarr;</a>
      <p style="color: #555; font-size: 11px; margin: 12px 0 0;">or visit: ${payLink}</p>
    </div>
    <p style="font-size: 13px; color: #888; line-height: 1.6;">Best regards,<br/><strong style="color: #f5bf42;">NTA Authority</strong><br/>National Tech Award 2026</p>
  </div>
  <div style="background: #050505; padding: 16px; text-align: center; border-top: 1px solid #1a1a1a;">
    <p style="color: #555; font-size: 11px; margin: 0;">ntechaward@gmail.com | +880 1581-805305</p>
    <p style="color: #444; font-size: 10px; margin: 4px 0 0;">Gazi Tower, Level 7, Kazipara, Mirpur, Dhaka 1216</p>
  </div>
</div>`;
        await sendEmail(
          nominee.email,
          "❌ Nomination Declined — Complete Payment to Get Success | National Tech Award 2026",
          html,
          settings.appsScriptUrl,
        );
      }
    }
  };
  const sendPaymentReminder = async (nominee) => {
    console.log("[Remind] nominee:", nominee);
    console.log("[Remind] email:", nominee.email);
    console.log("[Remind] nominationId:", nominee.nominationId);
    console.log("[Remind] appsScriptUrl:", settings.appsScriptUrl);
    if (!nominee.email || nominee.email.trim() === "") {
      alert(
        "⚠️ No email address found for this nominee. Cannot send reminder.",
      );
      return;
    }
    if (!nominee.nominationId) {
      alert("⚠️ No nomination ID found. Cannot send reminder.");
      return;
    }
    const scriptUrl =
      settings.appsScriptUrl && settings.appsScriptUrl.trim() !== ""
        ? settings.appsScriptUrl
        : DEFAULT_APPS_SCRIPT_URL;
    const payLink = `https://techawardbd.com/nomination?repay=${nominee.nominationId}`;
    const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fafafa; color: #333333; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0;">
  <div style="background: #ffffff; padding: 24px; text-align: center; border-bottom: 3px solid #f5bf42;">
    <h1 style="color: #333333; font-size: 20px; margin: 0;">Payment Reminder</h1>
    <p style="color: #666666; font-size: 13px; margin-top: 4px;">National Tech Award</p>
  </div>
  <div style="padding: 24px;">
    <p style="font-size: 15px; margin-bottom: 16px;">Dear <strong>${nominee.name}</strong>,</p>
    <p style="font-size: 14px; line-height: 1.6; color: #444444; margin-bottom: 20px;">
      We noticed your payment for the National Tech Award registration is still Declined.
      Please complete your payment to secure your nomination.
    </p>
    <div style="background: #ffffff; border: 1px solid #e0e0e0; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
      <p style="margin: 4px 0; font-size: 14px;"><strong>Nomination ID:</strong> ${nominee.nominationId}</p>
      <p style="margin: 4px 0; font-size: 14px;"><strong>Category:</strong> ${nominee.mainCategory} &gt; ${nominee.category}</p>
      <p style="margin: 4px 0; font-size: 14px;"><strong>Amount Due:</strong> ${nominee.paymentAmount || 1550} BDT</p>
    </div>
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${payLink}" style="display: inline-block; background: #22c55e; color: #ffffff; font-size: 15px; font-weight: bold; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Complete Payment</a>
      <p style="color: #888888; font-size: 12px; margin: 12px 0 0;">Or visit: ${payLink}</p>
    </div>
    <p style="font-size: 13px; color: #666666; line-height: 1.5;">Thank you,<br/><strong>NTA Authority</strong></p>
  </div>
</div>`;
    try {
      console.log("[Remind] Sending to:", nominee.email, "via:", scriptUrl);
      const result = await sendEmail(
        nominee.email.trim(),
        "Action Required: Complete Your NTA Nomination Payment",
        html,
        scriptUrl,
      );
      console.log("[Remind] sendEmail result:", result);
      alert(`✅ Payment reminder sent to: ${nominee.email}`);
    } catch (err) {
      console.error("[Remind] Error:", err);
      alert("❌ Failed to send reminder email. Check console for details.");
    }
  };
  const saveSettings = async () => {
    await setDoc(doc(db, "settings", "general"), settings);
    alert("Settings saved");
  };
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-amber-500">
        <i className="fas fa-spinner fa-spin text-3xl" />
      </div>
    );
  }
  if (!user) {
    return null;
  }
  const permittedTabs = ADMIN_TABS.filter(
    (item) => allowedTabs === null || allowedTabs.includes(item.key),
  );
  const visibleTabs = isSuperAdmin
    ? [
        ...permittedTabs,
        {
          key: "adminUsers",
          label: "Admin Users",
          icon: "fa-user-shield",
        },
      ]
    : permittedTabs;
  const currentTab = visibleTabs.some(
    (visibleTab) => visibleTab.key === activeTab,
  )
    ? activeTab
    : visibleTabs[0]?.key || "overview";
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col md:flex-row">
      <aside className="md:w-64 bg-black border-r border-amber-500/10 p-6 md:min-h-screen">
        <h1 className="text-xl font-bold text-gradient-gold mb-2">NTA Admin</h1>
        <p
          className="text-[10px] text-gray-500 uppercase tracking-widest mb-6 truncate"
          title={user.email}
        >
          {isSuperAdmin ? "Super Admin" : "Admin"}
          {" · "}
          {user.email}
        </p>
        <nav className="space-y-1">
          {visibleTabs.map((visibleTab) => (
            <button
              key={visibleTab.key}
              onClick={() => setActiveTab(visibleTab.key)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-bold uppercase transition flex items-center gap-3 ${currentTab === visibleTab.key ? "bg-amber-500 text-black" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}
            >
              <i className={`fas ${visibleTab.icon} w-4 text-center`} />{" "}
              {visibleTab.label}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-bold text-red-400 hover:bg-red-500/10 transition mt-8 flex items-center gap-3"
          >
            <i className="fas fa-sign-out-alt" />
            {" Logout"}
          </button>
        </nav>
      </aside>
      <main className="flex-1 p-6 md:p-10 overflow-auto">
        {currentTab === "overview" && (
          <OverviewTab nominations={nominations} votes={votes} stats={stats} />
        )}
        {currentTab === "nominees" && (
          <NomineesTab
            nominations={nominations}
            handleStatusChange={handleStatusChange}
            sendPaymentReminder={sendPaymentReminder}
            isSuperAdmin={isSuperAdmin}
            userRole={userRole}
          />
        )}
        {currentTab === "deadlines" && (
          <DeadlinesTab nominations={nominations} userRole={userRole} />
        )}
        {currentTab === "winners" && (
          <WinnersTab
            winners={winners}
            nominations={nominations}
            isSuperAdmin={isSuperAdmin}
          />
        )}
        {currentTab === "sponsors" && (
          <SponsorsTab sponsors={sponsors} isSuperAdmin={isSuperAdmin} />
        )}
        {currentTab === "gallery" && (
          <GalleryTab gallery={gallery} isSuperAdmin={isSuperAdmin} />
        )}
        {currentTab === "support" && (
          <SupportTab messages={messages} isSuperAdmin={isSuperAdmin} />
        )}
        {currentTab === "settings" && (
          <SettingsTab
            settings={settings}
            setSettings={setSettings}
            onSave={saveSettings}
            isSuperAdmin={isSuperAdmin}
          />
        )}
        {currentTab === "adminUsers" && isSuperAdmin && (
          <AdminUsersTab adminUsers={adminUsers} />
        )}
      </main>
    </div>
  );
}
