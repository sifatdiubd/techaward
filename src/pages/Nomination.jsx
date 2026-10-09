import { useEffect, useRef, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { Link, useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import {
  CATEGORIES,
  DISTRICTS,
  NOMINATION_FEE,
  PRIVACY_TEXT,
  TERMS_TEXT,
} from "@/data/constants";
import useSiteSettings from "@/hooks/useSiteSettings";
import { sendEmail } from "@/lib/email";
import { db } from "@/lib/firebase";
import { trackPixelEvent } from "@/lib/metaPixel";
import {
  createCheckout,
  getInvoiceIdFromQuery,
  getTransactionId,
  verifyPayment,
} from "@/lib/paymently";

const PENDING_PAYMENT_KEY = "nta_pending_payment";

export default function Nomination() {
  const [searchParams] = useSearchParams();
  const repayId = searchParams.get("repay");
  return repayId && !searchParams.get("pay") ? (
    <Layout>
      <RepayNomination nominationId={repayId} />
    </Layout>
  ) : (
    <Layout>
      <NominationForm />
    </Layout>
  );
}

function RepayNomination({ nominationId }) {
  useSiteSettings();
  const [nomination, setNomination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    (async () => {
      try {
        const q = query(
          collection(db, "nominations"),
          where("nominationId", "==", nominationId),
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
          setError("Nomination not found.");
          setLoading(false);
          return;
        }
        const x = snapshot.docs[0];
        setNomination({
          id: x.id,
          ...x.data(),
        });
      } catch {
        setError("Failed to load nomination.");
      } finally {
        setLoading(false);
      }
    })();
  }, [nominationId]);
  const handlePay = async () => {
    if (nomination) {
      setPaying(true);
      try {
        const baseUrl = `${window.location.origin}/nomination`;
        const res = await createCheckout({
          amount: NOMINATION_FEE,
          email: nomination.email,
          fullName: nomination.name,
          mobile: nomination.mobile,
          redirectUrl: `${baseUrl}?pay=success&repay=${nominationId}`,
          cancelUrl: `${baseUrl}?pay=cancel&repay=${nominationId}`,
          metadata: {
            nomination_id: nomination.nominationId,
            doc_id: nomination.id,
            repay: "1",
          },
        });
        if (!res.status || !res.payment_url) {
          alert(res.message || "Payment could not be started. Try again.");
          setPaying(false);
          return;
        }
        localStorage.setItem(
          "nta_pending_payment",
          JSON.stringify({
            docId: nomination.id,
            nominationId: nomination.nominationId,
            name: nomination.name,
            email: nomination.email,
            mobile: nomination.mobile,
            mainCategory: nomination.mainCategory,
            category: nomination.category,
            division: nomination.division,
            district: nomination.district,
            paymentMethod: nomination.paymentMethod || "Online Payment",
            paymentAmount: NOMINATION_FEE,
            photo: nomination.photo || "",
            isRepay: true,
          }),
        );
        window.location.href = res.payment_url;
      } catch {
        alert("Something went wrong. Please try again.");
        setPaying(false);
      }
    }
  };
  const downloadInvoice = async () => {
    if (!nomination) {
      return;
    }
    const { jsPDF: JsPDF } = await import("jspdf");
    const pdf = new JsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const pageW = 210;
    const margin = 14;
    pdf.setFillColor(8, 8, 8);
    pdf.rect(0, 0, pageW, 297, "F");
    pdf.setFillColor(50, 0, 0);
    pdf.rect(0, 0, pageW, 48, "F");
    pdf.setDrawColor(239, 68, 68);
    pdf.setLineWidth(1);
    pdf.line(0, 48, pageW, 48);
    pdf.setTextColor(239, 68, 68);
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text("NATIONAL TECH AWARD 2026", pageW / 2, 20, {
      align: "center",
    });
    pdf.setFontSize(10);
    pdf.setTextColor(200, 80, 80);
    pdf.text("Payment Invoice — Action Required", pageW / 2, 30, {
      align: "center",
    });
    pdf.setFontSize(8);
    pdf.setTextColor(150, 60, 60);
    pdf.text("ntechaward.com  |  ntechaward@gmail.com", pageW / 2, 40, {
      align: "center",
    });
    let y = 60;
    pdf.setFillColor(20, 10, 10);
    pdf.roundedRect(margin, y, pageW - margin * 2, 28, 3, 3, "F");
    pdf.setDrawColor(239, 68, 68);
    pdf.setLineWidth(0.4);
    pdf.roundedRect(margin, y, pageW - margin * 2, 28, 3, 3, "S");
    pdf.setTextColor(150, 80, 80);
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "bold");
    pdf.text("NOMINATION ID / INVOICE REF", margin + 4, y + 8);
    pdf.setFontSize(15);
    pdf.setTextColor(245, 191, 66);
    pdf.setFont("courier", "bold");
    pdf.text(nomination.nominationId, margin + 4, y + 20);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(239, 68, 68);
    pdf.text("STATUS: PAYMENT REQUIRED", pageW - margin - 4, y + 20, {
      align: "right",
    });
    y += 36;
    const row = (label, value) => {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.setTextColor(120, 120, 120);
      pdf.text(label, margin + 2, y);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(220, 220, 220);
      pdf.text(String(value || "-").substring(0, 90), 70, y);
      y += 6;
    };
    const section = (title) => {
      pdf.setFillColor(25, 10, 10);
      pdf.rect(margin, y, pageW - margin * 2, 7, "F");
      pdf.setTextColor(239, 68, 68);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.text(title.toUpperCase(), margin + 3, y + 5);
      y += 10;
    };
    section("Nominee Information");
    row("Full Name", nomination.name);
    row("Email", nomination.email);
    row("Mobile", nomination.mobile);
    row("Category", `${nomination.mainCategory} > ${nomination.category}`);
    row(
      "Division / District",
      `${nomination.division} / ${nomination.district}`,
    );
    y += 3;
    section("Invoice Details");
    row("Registration Fee", `${NOMINATION_FEE} BDT`);
    row("Payment Status", "UNPAID — ACTION REQUIRED");
    row(
      "Invoice Date",
      new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    );
    y += 3;
    pdf.setFillColor(20, 14, 0);
    pdf.rect(margin, y, pageW - margin * 2, 20, "F");
    pdf.setDrawColor(245, 191, 66);
    pdf.setLineWidth(0.4);
    pdf.rect(margin, y, pageW - margin * 2, 20, "S");
    pdf.setTextColor(245, 191, 66);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text("PAY NOW:", margin + 4, y + 8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(220, 200, 100);
    pdf.setFontSize(8);
    pdf.text(
      `${window.location.origin}/nomination?repay=${nomination.nominationId}`,
      margin + 4,
      y + 16,
    );
    y += 28;
    pdf.setFillColor(15, 10, 0);
    pdf.rect(0, 282, pageW, 15, "F");
    pdf.setDrawColor(60, 40, 0);
    pdf.setLineWidth(0.3);
    pdf.line(0, 282, pageW, 282);
    pdf.setTextColor(245, 191, 66);
    pdf.setFontSize(7.5);
    pdf.text(
      "ntechaward@gmail.com  |  +880 1581-805305  |  Gazi Tower, Level 7, Kazipara, Mirpur, Dhaka 1216",
      pageW / 2,
      289,
      {
        align: "center",
      },
    );
    pdf.save(`NTA_Invoice_${nomination.nominationId}.pdf`);
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }
  if (error || !nomination) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-400 text-center text-xl">
          {error || "Nomination not found."}
        </div>
      </div>
    );
  }
  const repayLink = `${window.location.origin}/nomination?repay=${nomination.nominationId}`;
  return (
    <div className="min-h-screen bg-[#050505] py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden border border-red-500/30 bg-gradient-to-b from-[#0d0303] to-black shadow-[0_0_60px_rgba(239,68,68,0.15)]">
          <div className="bg-gradient-to-r from-red-950/80 to-transparent px-8 py-6 border-b border-red-500/20">
            <div className="flex items-center gap-4">
              <img
                src="https://iili.io/KqpV6Fe.png"
                alt="NTA"
                className="h-10 w-10 object-contain"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-red-400/60 font-bold">
                  Payment Invoice
                </p>
                <h1 className="text-xl font-bold text-white">
                  National Tech Award 2026
                </h1>
              </div>
              <div className="ml-auto text-right">
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">
                  Invoice Ref
                </p>
                <p className="text-amber-400 font-mono font-bold text-lg">
                  {nomination.nominationId}
                </p>
              </div>
            </div>
          </div>
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Payment Required
              </span>
              {nomination.status === "declined" && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800 border border-gray-700 text-gray-400 text-xs font-bold uppercase tracking-widest">
                  Declined
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                ["Name", nomination.name],
                ["Mobile", nomination.mobile],
                ["Category", nomination.mainCategory],
                ["Sub-Category", nomination.category],
                ["Email", nomination.email],
                ["Division", nomination.division],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="bg-white/[0.03] border border-white/5 rounded-xl p-3"
                >
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">
                    {label}
                  </p>
                  <p className="text-sm text-white font-medium truncate">
                    {value || "—"}
                  </p>
                </div>
              ))}
            </div>
            <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-5 mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-amber-500/60 font-bold mb-1">
                  Registration Fee
                </p>
                <p className="text-3xl font-bold text-amber-400 font-['Oswald']">
                  {NOMINATION_FEE} <span className="text-lg">BDT</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">
                  Status
                </p>
                <p className="text-red-400 font-bold text-sm">UNPAID</p>
              </div>
            </div>
            <div className="bg-blue-950/20 border border-blue-500/20 rounded-xl p-4 mb-6">
              <p className="text-xs text-blue-400 font-bold mb-1">
                ℹ️ Auto-Approval
              </p>
              <p className="text-xs text-gray-400 leading-relaxed">
                {"After successful payment, your nomination will be "}
                <strong className="text-green-400">
                  automatically approved
                </strong>
                {" and a confirmation email will be sent to "}
                <strong className="text-white">{nomination.email}</strong>.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handlePay}
                disabled={paying}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 disabled:opacity-60 text-lg"
              >
                {paying ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {" Processing…"}
                  </>
                ) : (
                  <>
                    <i className="fas fa-credit-card" />
                    {" Pay Now "}
                    {NOMINATION_FEE}
                    {" BDT"}
                  </>
                )}
              </button>
              <button
                onClick={downloadInvoice}
                className="flex items-center justify-center gap-2 bg-white/[0.05] border border-white/10 text-gray-300 font-bold px-5 py-4 rounded-2xl hover:bg-white/[0.08] transition"
                title="Download Invoice PDF"
              >
                <i className="fas fa-download" />
              </button>
            </div>
            <p className="text-center text-xs text-gray-600 mt-4">
              {"Or visit: "}
              <span className="text-amber-500/60 font-mono text-[10px] break-all">
                {repayLink}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function NominationForm() {
  const settings = useSiteSettings();
  const [view, setView] = useState("form");
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [showNotice, setShowNotice] = useState(true);
  const [formData, setFormData] = useState({
    paymentMethod: "Online Payment",
    paymentNumber: "",
    trxId: "",
    name: "",
    email: "",
    mobile: "",
    whatsapp: "",
    gender: "Male",
    division: "",
    district: "",
    mainCategory: "",
    category: "",
    fbProfile: "",
    fbPage: "",
    about: "",
  });
  const [districts, setDistricts] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const [failureData, setFailureData] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [formStarted, setFormStarted] = useState(false);
  const [utm, setUtm] = useState({});
  useEffect(() => {
    trackPixelEvent("ViewContent");
    const params = new URLSearchParams(window.location.search);
    setUtm({
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
      utm_content: params.get("utm_content") || "",
      utm_term: params.get("utm_term") || "",
      fbclid: params.get("fbclid") || "",
      referrer: document.referrer || "",
    });
  }, []);
  const handleFormStart = () => {
    if (!formStarted) {
      trackPixelEvent("FormStart");
      setFormStarted(true);
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "division") {
      setDistricts(DISTRICTS[value] || []);
      setFormData((prev) => ({
        ...prev,
        district: "",
      }));
    }
    if (name === "mainCategory") {
      setSubCategories(CATEGORIES[value]?.subs || []);
      setFormData((prev) => ({
        ...prev,
        category: "",
      }));
    }
  };
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const maxSize = 400;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
            }
          } else if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          setPhoto(canvas.toDataURL("image/jpeg", 0.7));
        };
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  };
  const goToStep = async (nextStep) => {
    if (nextStep === 1 && (!formData.mainCategory || !formData.category)) {
      alert("Please select both Main Category and Sub Category.");
      return;
    }
    if (nextStep === 3) {
      if (
        !formData.name ||
        !formData.email ||
        !formData.mobile ||
        !formData.division
      ) {
        alert("Please fill in all required fields.");
        return;
      }
      setSubmitting(true);
      try {
        const [byMobile, byEmail] = await Promise.all([
          getDocs(
            query(
              collection(db, "nominations"),
              where("mobile", "==", formData.mobile),
            ),
          ),
          getDocs(
            query(
              collection(db, "nominations"),
              where("email", "==", formData.email),
            ),
          ),
        ]);
        let existing = null;
        if (byMobile.empty) {
          if (!byEmail.empty) {
            existing = byEmail.docs[0];
          }
        } else {
          existing = byMobile.docs[0];
        }
        if (existing) {
          const existingData = existing.data();
          if (
            existingData.status === "approved" ||
            existingData.status === "winner" ||
            existingData.status === "not-winner"
          ) {
            alert(
              "This mobile number or email is already registered and approved.",
            );
            setSubmitting(false);
            return;
          } else {
            alert(
              "You have an incomplete registration. Redirecting to payment page to complete your payment.",
            );
            window.location.href = `/nomination?repay=${existingData.nominationId}`;
            setSubmitting(false);
            return;
          }
        }
      } catch (err) {
        console.error(err);
        alert("Failed to verify existing registration. Please try again.");
        setSubmitting(false);
        return;
      }
      setSubmitting(false);
    }
    if (nextStep === 4 && !formData.fbProfile) {
      alert("Facebook profile link is required.");
      return;
    }
    setStep(nextStep + 1);
    window.scrollTo(0, 0);
  };
  const handleSubmit = async () => {
    if (!photo) {
      alert("Please upload your photo.");
      return;
    }
    if (!formData.email) {
      alert("A valid email address is required for payment.");
      return;
    }
    if (!agreed) {
      alert(
        "Please read and agree to the Terms & Conditions and Privacy Policy.",
      );
      return;
    }
    setSubmitting(true);
    try {
      const [byMobile, byEmail] = await Promise.all([
        getDocs(
          query(
            collection(db, "nominations"),
            where("mobile", "==", formData.mobile),
          ),
        ),
        getDocs(
          query(
            collection(db, "nominations"),
            where("email", "==", formData.email),
          ),
        ),
      ]);
      let existing = null;
      if (byMobile.empty) {
        if (!byEmail.empty) {
          existing = byEmail.docs[0];
        }
      } else {
        existing = byMobile.docs[0];
      }
      if (existing) {
        const existingData = existing.data();
        if (
          existingData.status === "approved" ||
          existingData.status === "winner" ||
          existingData.status === "not-winner"
        ) {
          alert(
            "This mobile number or email is already registered and approved.",
          );
          setSubmitting(false);
          return;
        } else {
          alert(
            "You have an incomplete registration. Redirecting to payment page to complete your payment.",
          );
          window.location.href = `/nomination?repay=${existingData.nominationId}`;
          return;
        }
      }
      const nominationId = "NTA-" + Math.floor(100000 + Math.random() * 900000);
      const payload = {
        ...formData,
        nominationId: nominationId,
        createdAt: serverTimestamp(),
        status: "pending",
        paymentStatus: "initiated",
        voteCount: 0,
        photo: photo,
        paymentAmount: NOMINATION_FEE,
        utm_source: utm.utm_source,
        utm_medium: utm.utm_medium,
        utm_campaign: utm.utm_campaign,
        utm_content: utm.utm_content,
        utm_term: utm.utm_term,
        fbclid: utm.fbclid,
        referrer: utm.referrer,
      };
      const docRef = await addDoc(collection(db, "nominations"), payload);
      trackPixelEvent("CompleteRegistration");
      const baseUrl = `${window.location.origin}/nomination`;
      const checkout = await createCheckout({
        amount: NOMINATION_FEE,
        email: formData.email,
        fullName: formData.name,
        mobile: formData.mobile,
        redirectUrl: `${baseUrl}?pay=success`,
        cancelUrl: `${baseUrl}?pay=cancel`,
        metadata: {
          nomination_id: nominationId,
          doc_id: docRef.id,
        },
      });
      if (!checkout.status || !checkout.payment_url) {
        await updateDoc(doc(db, "nominations", docRef.id), {
          status: "declined",
          paymentStatus: "failed",
        });
        alert(
          checkout.message || "Could not start the payment. Please try again.",
        );
        setSubmitting(false);
        return;
      }
      localStorage.setItem(
        PENDING_PAYMENT_KEY,
        JSON.stringify({
          docId: docRef.id,
          nominationId: nominationId,
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          mainCategory: formData.mainCategory,
          category: formData.category,
          division: formData.division,
          district: formData.district,
          paymentMethod: "Online Payment",
          paymentAmount: NOMINATION_FEE,
          photo: photo,
        }),
      );
      window.location.href = checkout.payment_url;
    } catch (byMobile) {
      console.error(byMobile);
      alert("Submission failed. Please try again.");
      setSubmitting(false);
    }
  };
  const paymentHandledRef = useRef(false);
  useEffect(() => {
    const payStatus = new URLSearchParams(window.location.search).get("pay");
    if (!payStatus || paymentHandledRef.current) {
      return;
    }
    paymentHandledRef.current = true;
    const stored = localStorage.getItem(PENDING_PAYMENT_KEY);
    const pending = stored ? JSON.parse(stored) : null;
    const invoiceId = getInvoiceIdFromQuery(window.location.search);
    (async () => {
      setVerifying(true);
      try {
        if (!pending?.docId) {
          setFailureData({
            reason: "We could not match this payment to a registration.",
          });
          return;
        }
        const nominationRef = doc(db, "nominations", pending.docId);
        let paid = false;
        let trxId = invoiceId || "";
        if (payStatus === "success" && invoiceId) {
          const verification = await verifyPayment(invoiceId);
          paid =
            verification?.status === true ||
            verification?.status === "COMPLETED";
          trxId = getTransactionId(verification, invoiceId);
        } else {
          if (payStatus === "success" && !invoiceId) {
            paid = false;
          }
        }
        if (paid) {
          await updateDoc(nominationRef, {
            status: "approved",
            paymentStatus: "paid",
            trxId: trxId,
            paymentNumber: pending.mobile || "",
            paidAt: serverTimestamp(),
          });
          const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #e0e0e0; border-radius: 12px; overflow: hidden; border: 1px solid #2a2a2a;">
  <div style="background: linear-gradient(135deg, #1a1200, #2d1f00); padding: 32px 32px 24px; text-align: center; border-bottom: 2px solid #f5bf42;">
    <img src="https://iili.io/KqpV6Fe.png" alt="National Tech Award" style="height: 60px; margin-bottom: 16px;" />
    <h1 style="color: #f5bf42; font-size: 22px; margin: 0; letter-spacing: 2px; text-transform: uppercase;">Payment Confirmed & Nomination Approved!</h1>
    <p style="color: #d4a017; font-size: 13px; margin-top: 8px;">National Tech Award 2026</p>
  </div>
  <div style="padding: 32px;">
    <p style="font-size: 15px; margin-bottom: 20px;">Dear <strong style="color: #f5bf42;">${pending.name}</strong>,</p>
    <p style="font-size: 14px; line-height: 1.7; color: #c0c0c0; margin-bottom: 24px;">
      Congratulations! Your payment has been successfully received and your nomination for
      National Tech Award 2026 has been <strong style="color: #22c55e;">Approved</strong>.
    </p>
    <div style="background: #111; border: 1px solid #2a2a2a; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
      <h3 style="color: #f5bf42; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 14px;">Payment & Nomination Details</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr style="border-bottom: 1px solid #1e1e1e;"><td style="padding: 8px 0; color: #888; width: 40%;">Nomination ID</td><td style="padding: 8px 0; color: #f5bf42; font-family: monospace; font-weight: bold;">${pending.nominationId}</td></tr>
        <tr style="border-bottom: 1px solid #1e1e1e;"><td style="padding: 8px 0; color: #888;">Name</td><td style="padding: 8px 0; color: #fff;">${pending.name}</td></tr>
        <tr style="border-bottom: 1px solid #1e1e1e;"><td style="padding: 8px 0; color: #888;">Category</td><td style="padding: 8px 0; color: #fff;">${pending.mainCategory} &gt; ${pending.category}</td></tr>
        <tr style="border-bottom: 1px solid #1e1e1e;"><td style="padding: 8px 0; color: #888;">Transaction ID</td><td style="padding: 8px 0; color: #fff; font-family: monospace; font-size: 11px;">${trxId}</td></tr>
        <tr style="border-bottom: 1px solid #1e1e1e;"><td style="padding: 8px 0; color: #888;">Amount Paid</td><td style="padding: 8px 0; color: #fff;">${pending.paymentAmount} BDT</td></tr>
        <tr><td style="padding: 8px 0; color: #888;">Status</td><td style="padding: 8px 0;"><span style="background: #14532d; color: #22c55e; padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: bold;">&#10003; APPROVED</span></td></tr>
      </table>
    </div>
    <div style="background: #0d1f0d; border: 1px solid #14532d; border-radius: 10px; padding: 16px; margin-bottom: 24px;">
      <p style="color: #22c55e; font-size: 13px; font-weight: bold; margin: 0 0 8px;">&#128274; Dashboard Login Info</p>
      <p style="font-size: 13px; color: #c0c0c0; margin: 4px 0;">Login ID: <strong style="color: #f5bf42;">${pending.nominationId}</strong></p>
      <p style="font-size: 13px; color: #c0c0c0; margin: 4px 0;">Password: Your mobile number</p>
      <p style="margin-top: 10px;"><a href="https://techawardbd.com/login" style="background: #f5bf42; color: #000; padding: 8px 18px; border-radius: 6px; font-weight: bold; text-decoration: none; font-size: 13px;">Login to Dashboard &rarr;</a></p>
    </div>
    <div style="background: #1a1000; border: 1px solid #92400e; border-radius: 10px; padding: 14px; margin-bottom: 24px;">
      <p style="color: #fbbf24; font-size: 13px; font-weight: bold; margin: 0 0 6px;">&#9888; Important — Do within 72 Hours</p>
      <p style="color: #c0c0c0; font-size: 12px; line-height: 1.6; margin: 0;">
        রেজিস্ট্রেশনের <strong>৭২ ঘন্টার মধ্যে</strong> আপনার ড্যাশবোর্ডে লগইন করে
        <strong>ভিডিও আপলোড লিংক</strong> এবং <strong>ফেসবুক লিংক</strong> সাবমিট করুন।
        সময়মতো সাবমিট না করলে নমিনেশন বাতিল হতে পারে।
      </p>
    </div>
    <p style="font-size: 13px; color: #888; line-height: 1.6;">শুভকামনায়,<br/><strong style="color: #f5bf42;">NTA Authority</strong><br/>National Tech Award 2026</p>
  </div>
  <div style="background: #050505; padding: 16px; text-align: center; border-top: 1px solid #1a1a1a;">
    <p style="color: #555; font-size: 11px; margin: 0;">ntechaward@gmail.com | +880 1581-805305</p>
    <p style="color: #444; font-size: 10px; margin: 4px 0 0;">Gazi Tower, Level 7, Kazipara, Mirpur, Dhaka 1216</p>
  </div>
</div>`;
          await sendEmail(
            pending.email,
            "✅ পেমেন্ট নিশ্চিত ও নমিনেশন অনুমোদিত — National Tech Award 2026",
            html,
            settings.appsScriptUrl,
          );
          setSuccessData({
            ...pending,
            trxId: trxId,
            status: "approved",
          });
        } else {
          await updateDoc(nominationRef, {
            status: "declined",
            paymentStatus: payStatus === "cancel" ? "cancelled" : "failed",
            ...(trxId
              ? {
                  trxId: trxId,
                }
              : {}),
          });
          const payLink = `https://techawardbd.com/nomination?repay=${pending.nominationId}`;
          const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #e0e0e0; border-radius: 12px; overflow: hidden; border: 1px solid #2a2a2a;">
  <div style="background: linear-gradient(135deg, #1a0000, #2d0000); padding: 32px 32px 24px; text-align: center; border-bottom: 2px solid #ef4444;">
    <img src="https://iili.io/KqpV6Fe.png" alt="National Tech Award" style="height: 60px; margin-bottom: 16px;" />
    <h1 style="color: #ef4444; font-size: 22px; margin: 0; letter-spacing: 2px; text-transform: uppercase;">Nomination Declined</h1>
    <p style="color: #f87171; font-size: 13px; margin-top: 8px;">National Tech Award 2026 &mdash; Action Required</p>
  </div>
  <div style="padding: 32px;">
    <p style="font-size: 15px; margin-bottom: 20px;">Dear <strong style="color: #f87171;">${pending.name}</strong>,</p>
    <p style="font-size: 14px; line-height: 1.7; color: #c0c0c0; margin-bottom: 24px;">
      We regret to inform you that your nomination for National Tech Award 2026 has been <strong style="color: #ef4444;">Declined</strong>.
      This may be due to an incomplete or unverified payment. You can complete your payment to get automatically approved.
    </p>
    <div style="background: #111; border: 1px solid #2a2a2a; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
      <h3 style="color: #ef4444; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 14px;">Your Details</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr style="border-bottom: 1px solid #1e1e1e;"><td style="padding: 8px 0; color: #888; width: 40%;">Nomination ID</td><td style="padding: 8px 0; color: #fbbf24; font-family: monospace; font-weight: bold;">${pending.nominationId}</td></tr>
        <tr style="border-bottom: 1px solid #1e1e1e;"><td style="padding: 8px 0; color: #888;">Name</td><td style="padding: 8px 0; color: #fff;">${pending.name}</td></tr>
        <tr style="border-bottom: 1px solid #1e1e1e;"><td style="padding: 8px 0; color: #888;">Category</td><td style="padding: 8px 0; color: #fff;">${pending.mainCategory} &gt; ${pending.category}</td></tr>
        <tr><td style="padding: 8px 0; color: #888;">Status</td><td style="padding: 8px 0;"><span style="background: #450a0a; color: #ef4444; padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: bold;">&#10007; DECLINED</span></td></tr>
      </table>
    </div>
    <div style="background: #0a1a0a; border: 2px solid #22c55e; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
      <p style="color: #22c55e; font-size: 15px; font-weight: bold; margin: 0 0 8px;">&#128176; Complete Payment &mdash; Get Auto Approved!</p>
      <p style="color: #c0c0c0; font-size: 13px; margin: 0 0 16px; line-height: 1.6;">
        Once payment is verified, your nomination will be <strong style="color: #22c55e;">automatically approved</strong>
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
            pending.email,
            "❌ Nomination Declined — Complete Payment to Get Approved | National Tech Award 2026",
            html,
            settings.appsScriptUrl,
          );
          setFailureData({
            nominationId: pending.nominationId,
            reason:
              payStatus === "cancel"
                ? "You cancelled the payment, so the registration was declined."
                : "The payment could not be verified, so the registration was declined.",
          });
        }
      } catch (err) {
        console.error(err);
        setFailureData({
          reason: "Something went wrong while confirming your payment.",
        });
      } finally {
        localStorage.removeItem(PENDING_PAYMENT_KEY);
        setVerifying(false);
        window.history.replaceState({}, "", "/nomination");
      }
    })();
  }, []);
  const downloadConfirmation = async () => {
    if (!successData) {
      return;
    }
    const { jsPDF: JsPDF } = await import("jspdf");
    const pdf = new JsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const pageW = 210;
    const pageH = 297;
    const margin = 14;
    pdf.setFillColor(8, 8, 8);
    pdf.rect(0, 0, pageW, pageH, "F");
    pdf.setFillColor(30, 18, 0);
    pdf.rect(0, 0, pageW, 48, "F");
    pdf.setDrawColor(245, 191, 66);
    pdf.setLineWidth(1);
    pdf.line(0, 48, pageW, 48);
    pdf.setTextColor(245, 191, 66);
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text("NATIONAL TECH AWARD 2026", pageW / 2, 20, {
      align: "center",
    });
    pdf.setFontSize(10);
    pdf.setTextColor(200, 160, 60);
    pdf.text("Official Registration Confirmation Document", pageW / 2, 30, {
      align: "center",
    });
    pdf.setFontSize(8);
    pdf.setTextColor(150, 110, 40);
    pdf.text("ntechaward.com  |  ntechaward@gmail.com", pageW / 2, 40, {
      align: "center",
    });
    let photoX = margin;
    const photoY = 56;
    const photoW = 38;
    const photoH = 38;
    if (successData.photo) {
      try {
        pdf.addImage(
          successData.photo,
          "JPEG",
          photoX,
          photoY,
          photoW,
          photoH,
          undefined,
          "FAST",
        );
      } catch {}
    } else {
      pdf.setFillColor(30, 30, 30);
      pdf.rect(photoX, photoY, photoW, photoH, "F");
      pdf.setTextColor(80, 80, 80);
      pdf.setFontSize(8);
      pdf.text("NO PHOTO", photoX + photoW / 2, photoY + photoH / 2, {
        align: "center",
      });
    }
    const boxX = photoX + photoW + 8;
    const boxW = pageW - boxX - margin;
    pdf.setFillColor(18, 12, 0);
    pdf.roundedRect(boxX, photoY, boxW, photoH, 3, 3, "F");
    pdf.setDrawColor(245, 191, 66);
    pdf.setLineWidth(0.4);
    pdf.roundedRect(boxX, photoY, boxW, photoH, 3, 3, "S");
    pdf.setTextColor(140, 100, 30);
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "bold");
    pdf.text("NOMINATION ID", boxX + 6, photoY + 10);
    pdf.setFontSize(17);
    pdf.setTextColor(245, 191, 66);
    pdf.setFont("courier", "bold");
    pdf.text(successData.nominationId, boxX + 6, photoY + 22);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(34, 197, 94);
    pdf.text("STATUS: APPROVED", boxX + 6, photoY + 32);
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(7);
    pdf.text(
      `Payment: ${successData.paymentAmount || NOMINATION_FEE} BDT  |  ${new Date().toLocaleDateString("en-GB")}`,
      boxX + 6,
      photoY + 38,
    );
    let y = photoY + photoH + 10;
    pdf.setDrawColor(40, 40, 40);
    pdf.setLineWidth(0.3);
    pdf.line(margin, y, pageW - margin, y);
    y += 8;
    const section = (title) => {
      pdf.setFillColor(20, 14, 0);
      pdf.rect(margin, y, pageW - margin * 2, 7, "F");
      pdf.setTextColor(245, 191, 66);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.text(title.toUpperCase(), margin + 3, y + 5);
      y += 10;
    };
    const row = (label, value) => {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.setTextColor(120, 120, 120);
      pdf.text(label, margin + 2, y);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(220, 220, 220);
      pdf.text(String(value || "-").substring(0, 90), 70, y);
      y += 6;
    };
    section("Nominee Information");
    row("Full Name", successData.name || "-");
    row("Email", successData.email || "-");
    row("Mobile", successData.mobile || "-");
    row("WhatsApp", successData.whatsapp || "-");
    row("Gender", successData.gender || "-");
    row("Division", successData.division || "-");
    row("District", successData.district || "-");
    y += 3;
    section("Award Category");
    row("Main Category", successData.mainCategory || "-");
    row("Sub-Category", successData.category || "-");
    y += 3;
    section("Payment Information");
    row("Payment Method", successData.paymentMethod || "Online Payment");
    row("Amount Paid", `${successData.paymentAmount || NOMINATION_FEE} BDT`);
    row("Transaction ID", successData.trxId || "-");
    row("Payment Status", "PAID — VERIFIED");
    row(
      "Date",
      new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    );
    y += 3;
    section("Terms Acknowledgement");
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.setTextColor(100, 100, 100);
    const termsLines = pdf.splitTextToSize(
      "The applicant has read and agreed to the Terms & Conditions and Privacy Policy of the National Tech Award. Registration is valid only after payment verification. No refunds will be issued. Information cannot be modified after submission. Providing false information will result in cancellation. Selection is strictly merit-based and the jury's decision is final.",
      pageW - margin * 2 - 4,
    );
    pdf.text(termsLines, margin + 2, y);
    y += termsLines.length * 4 + 4;
    pdf.setFillColor(15, 10, 0);
    pdf.rect(0, 282, pageW, 15, "F");
    pdf.setDrawColor(60, 40, 0);
    pdf.setLineWidth(0.3);
    pdf.line(0, 282, pageW, 282);
    pdf.setTextColor(245, 191, 66);
    pdf.setFontSize(7.5);
    pdf.text(
      "ntechaward@gmail.com  |  +880 1581-805305  |  Gazi Tower, Level 7, Kazipara, Mirpur, Dhaka 1216",
      pageW / 2,
      289,
      {
        align: "center",
      },
    );
    pdf.setTextColor(80, 60, 20);
    pdf.setFontSize(6.5);
    pdf.text(
      `Document generated on ${new Date().toISOString()}`,
      pageW / 2,
      294,
      {
        align: "center",
      },
    );
    pdf.save(`NTA_Confirmation_${successData.nominationId}.pdf`);
  };
  return (
    <div
      className="bg-[#050505] min-h-screen py-10 animate-fade-in"
      onFocusCapture={handleFormStart}
      onClickCapture={handleFormStart}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-center mb-8">
          <div className="bg-gray-900 p-1 rounded-full border border-gray-800 flex">
            <button
              onClick={() => setView("form")}
              className={`px-6 py-2 rounded-full font-bold text-sm transition ${view === "form" ? "bg-amber-500 text-black" : "text-gray-400"}`}
            >
              New Nomination
            </button>
            <button
              onClick={() => setView("status")}
              className={`px-6 py-2 rounded-full font-bold text-sm transition ${view === "status" ? "bg-amber-500 text-black" : "text-gray-400"}`}
            >
              Status Check
            </button>
          </div>
        </div>
        {view === "form" && (
          <div className="max-w-3xl mx-auto">
            {settings.nominationOpen ? (
              <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl border border-amber-500/30 shadow-[0_0_60px_rgba(245,191,66,0.08)] overflow-hidden relative">
                {step === 2 && showNotice && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-6">
                    <div className="bg-[#150000] border-2 border-red-600 rounded-2xl p-8 max-w-md text-center shadow-[0_0_50px_rgba(220,38,38,0.3)]">
                      <h3 className="text-2xl font-bold text-red-500 mb-4 uppercase">
                        Important Notice
                      </h3>
                      <p className="text-gray-300 text-sm leading-relaxed mb-6">
                        Please fill in every detail correctly.
                        <br />
                        <br />
                        The registration fee is paid online at the end of this
                        form through our{" "}
                        <span className="text-white font-bold bg-red-600/20 px-2 py-1 rounded">
                          secure payment gateway
                        </span>
                        {". Providing "}
                        <span className="text-red-500 font-bold underline">
                          false information
                        </span>
                        {" will result in cancellation of your nomination."}
                      </p>
                      <button
                        onClick={() => setShowNotice(false)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition border border-red-500 uppercase tracking-wider"
                      >
                        I Accept
                      </button>
                    </div>
                  </div>
                )}
                <div className="bg-gray-800 h-2 w-full flex">
                  <div
                    className={`h-full transition-all duration-500 ${step >= 1 ? "bg-amber-500 w-1/5" : "bg-transparent"}`}
                  />
                  <div
                    className={`h-full transition-all duration-500 ${step >= 2 ? "bg-amber-500 w-1/5" : "bg-transparent"}`}
                  />
                  <div
                    className={`h-full transition-all duration-500 ${step >= 3 ? "bg-amber-500 w-1/5" : "bg-transparent"}`}
                  />
                  <div
                    className={`h-full transition-all duration-500 ${step >= 4 ? "bg-amber-500 w-1/5" : "bg-transparent"}`}
                  />
                  <div
                    className={`h-full transition-all duration-500 ${step >= 5 ? "bg-amber-500 w-1/5" : "bg-transparent"}`}
                  />
                </div>
                <div className="p-6 md:p-10">
                  {step === 1 && (
                    <div className="animate-fade-in">
                      <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl border-2 border-amber-500 font-bold">
                          1
                        </div>
                        <h2 className="text-2xl font-bold text-white uppercase">
                          Step 1: Category Selection
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">
                          Select your nomination category
                        </p>
                      </div>
                      <div className="grid grid-cols-1 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                            Main Category
                          </label>
                          <select
                            name="mainCategory"
                            value={formData.mainCategory}
                            onChange={handleChange}
                            className="form-input mb-3"
                          >
                            <option value="">Select</option>
                            {Object.keys(CATEGORIES).map((key) => (
                              <option key={key} value={key}>
                                {key}
                              </option>
                            ))}
                          </select>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                            Sub Category
                          </label>
                          <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            disabled={!formData.mainCategory}
                            className="form-input"
                          >
                            <option value="">Select</option>
                            {subCategories.map((subCategory) => (
                              <option key={subCategory} value={subCategory}>
                                {subCategory}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <button
                        onClick={() => goToStep(1)}
                        className="w-full mt-6 bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-lg transition transform hover:scale-[1.02]"
                      >
                        Next Step →
                      </button>
                    </div>
                  )}
                  {step === 2 && (
                    <div className="animate-fade-in">
                      <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl border-2 border-amber-500 font-bold">
                          2
                        </div>
                        <h2 className="text-2xl font-bold text-white uppercase">
                          Step 2: Registration Fee
                        </h2>
                        <p className="text-gray-400 text-sm mt-2">
                          {"Nomination Fee: "}
                          <span className="text-amber-500 font-bold">
                            {NOMINATION_FEE}
                            {" BDT"}
                          </span>
                        </p>
                      </div>
                      <div className="bg-gradient-to-r from-gray-900 to-black p-6 rounded-xl border border-amber-500/30 mb-6 text-center">
                        <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
                          Secure Online Payment
                        </p>
                        <h3 className="text-4xl font-bold text-amber-400 tracking-wider font-mono my-2">
                          {NOMINATION_FEE}{" "}
                          <span className="text-lg text-gray-400">BDT</span>
                        </h3>
                        <p className="text-sm text-gray-400 mt-3">
                          Complete the form first. On the last step you will be
                          redirected to our secure payment gateway, where you
                          can pay with bKash, Nagad, Rocket or card.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                        {[
                          "Instant confirmation",
                          "Auto approval on success",
                          "No manual TrxID needed",
                        ].map((item) => (
                          <div
                            key={item}
                            className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 text-center text-xs text-gray-300"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 bg-red-900/20 p-3 rounded border border-red-900/50">
                        <p className="text-xs text-red-400 text-center">
                          Your registration is approved automatically once the
                          payment succeeds. Failed or cancelled payments are
                          declined.
                        </p>
                      </div>
                      <div className="flex gap-4 mt-8">
                        <button
                          onClick={() => setStep(1)}
                          className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-lg border border-gray-600 hover:bg-gray-700"
                        >
                          Back
                        </button>
                        <button
                          onClick={() => goToStep(2)}
                          className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-lg"
                        >
                          Next Step
                        </button>
                      </div>
                    </div>
                  )}
                  {step === 3 && (
                    <div className="animate-fade-in">
                      <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl border-2 border-amber-500 font-bold">
                          3
                        </div>
                        <h2 className="text-2xl font-bold text-white uppercase">
                          Step 3: Personal Information
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">
                          Provide accurate information
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="form-input"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="form-input"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                            Mobile
                          </label>
                          <input
                            type="tel"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            className="form-input"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                            WhatsApp
                          </label>
                          <input
                            type="tel"
                            name="whatsapp"
                            value={formData.whatsapp}
                            onChange={handleChange}
                            className="form-input"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                            Gender
                          </label>
                          <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="form-input"
                          >
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                            Division
                          </label>
                          <select
                            name="division"
                            value={formData.division}
                            onChange={handleChange}
                            className="form-input"
                          >
                            <option value="">Select</option>
                            {Object.keys(DISTRICTS).map((key) => (
                              <option key={key} value={key}>
                                {key}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                            District
                          </label>
                          <select
                            name="district"
                            value={formData.district}
                            onChange={handleChange}
                            disabled={!formData.division}
                            className="form-input"
                          >
                            <option value="">Select</option>
                            {districts.map((district) => (
                              <option key={district} value={district}>
                                {district}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-8">
                        <button
                          onClick={() => setStep(2)}
                          className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-lg border border-gray-600 hover:bg-gray-700"
                        >
                          Back
                        </button>
                        <button
                          onClick={() => goToStep(3)}
                          className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-lg"
                        >
                          Next Step
                        </button>
                      </div>
                    </div>
                  )}
                  {step === 4 && (
                    <div className="animate-fade-in">
                      <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl border-2 border-amber-500 font-bold">
                          4
                        </div>
                        <h2 className="text-2xl font-bold text-white uppercase">
                          Step 4: Professional Details
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">
                          Tell us about your work
                        </p>
                      </div>
                      <div className="grid grid-cols-1 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                            {"Facebook Profile Link "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="url"
                            name="fbProfile"
                            value={formData.fbProfile}
                            onChange={handleChange}
                            className="form-input"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                            Facebook Page Link (optional)
                          </label>
                          <input
                            type="url"
                            name="fbPage"
                            value={formData.fbPage}
                            onChange={handleChange}
                            className="form-input"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                            About You / Achievements
                          </label>
                          <textarea
                            name="about"
                            value={formData.about}
                            onChange={handleChange}
                            rows={5}
                            className="form-input"
                            placeholder="Share your story of success..."
                          />
                        </div>
                      </div>
                      <div className="flex gap-4 mt-8">
                        <button
                          onClick={() => setStep(3)}
                          className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-lg border border-gray-600 hover:bg-gray-700"
                        >
                          Back
                        </button>
                        <button
                          onClick={() => goToStep(4)}
                          className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-lg"
                        >
                          Next Step
                        </button>
                      </div>
                    </div>
                  )}
                  {step === 5 && (
                    <div className="animate-fade-in">
                      <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl border-2 border-amber-500 font-bold">
                          5
                        </div>
                        <h2 className="text-2xl font-bold text-white uppercase">
                          {"Step 5: Photo & Confirmation"}
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">
                          Add a profile photo to complete
                        </p>
                      </div>
                      <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center relative mb-6 hover:border-amber-500 transition">
                        <input
                          type="file"
                          onChange={handlePhotoUpload}
                          accept="image/*"
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                        />
                        {photo ? (
                          <div>
                            <img
                              src={photo}
                              className="w-32 h-32 object-cover rounded-full mx-auto border-4 border-amber-500 shadow-lg"
                              alt="Preview"
                            />
                            <p className="text-xs text-green-500 font-bold mt-3">
                              Photo selected
                            </p>
                          </div>
                        ) : (
                          <div>
                            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl text-gray-400">
                              📷
                            </div>
                            <p className="text-sm font-bold text-white">
                              Click to upload photo
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Max size: 5MB
                            </p>
                          </div>
                        )}
                      </div>
                      <div
                        className={`flex items-start gap-3 p-4 rounded-lg mb-6 border ${agreed ? "bg-green-900/10 border-green-500/30" : "bg-gray-800/50 border-gray-700"}`}
                      >
                        <input
                          type="checkbox"
                          id="terms"
                          checked={agreed}
                          readOnly
                          onClick={(e) => {
                            e.preventDefault();
                            if (agreed) {
                              setAgreed(false);
                            } else {
                              setShowTerms(true);
                            }
                          }}
                          className="w-5 h-5 mt-0.5 accent-amber-500 cursor-pointer"
                        />
                        <label
                          htmlFor="terms"
                          className="text-xs text-gray-300 cursor-pointer select-none leading-relaxed"
                          onClick={(e) => {
                            e.preventDefault();
                            if (!agreed) {
                              setShowTerms(true);
                            }
                          }}
                        >
                          I have read and agree to the{" "}
                          <button
                            type="button"
                            onClick={() => setShowTerms(true)}
                            className="text-amber-400 underline font-bold"
                          >
                            {"Terms & Conditions and Privacy Policy"}
                          </button>{" "}
                          of the National Tech Award.
                        </label>
                      </div>
                      <div className="flex gap-4">
                        <button
                          onClick={() => setStep(4)}
                          className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-lg border border-gray-600 hover:bg-gray-700"
                        >
                          Back
                        </button>
                        <button
                          onClick={handleSubmit}
                          disabled={submitting || !agreed}
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3 rounded-lg hover:shadow-lg hover:scale-[1.02] transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submitting
                            ? "Redirecting to payment..."
                            : `Pay ${NOMINATION_FEE} BDT & Submit`}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-red-500 text-2xl font-bold py-10 border border-red-500/30 rounded-xl bg-red-900/20">
                Nominations are currently closed.
              </div>
            )}
          </div>
        )}
        {view === "status" && (
          <div className="max-w-xl mx-auto animate-fade-in">
            <div className="bg-gradient-to-br from-gray-900 to-black p-10 rounded-2xl text-center border border-gray-800">
              <h2 className="text-2xl font-bold mb-4 text-white">
                Check Your Status
              </h2>
              <p className="text-sm text-gray-400 mb-8">
                Log in to your dashboard to view your current status and admit
                card.
              </p>
              <Link
                to="/login"
                className="inline-block bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 py-3 rounded-lg transition transform hover:scale-105"
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </div>
      {showTerms && (
        <TermsModal
          onClose={() => setShowTerms(false)}
          onAccept={() => {
            setAgreed(true);
            setShowTerms(false);
          }}
          hasRead={hasReadTerms}
          setHasRead={setHasReadTerms}
        />
      )}
      {verifying && (
        <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md p-4">
          <div className="w-14 h-14 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-6" />
          <p className="text-amber-400 font-bold uppercase tracking-widest text-sm">
            Confirming your payment…
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Please do not close this window.
          </p>
        </div>
      )}
      {successData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/98 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-xl my-8">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-500/20 via-amber-900/10 to-transparent blur-xl" />
            <div className="relative bg-gradient-to-br from-[#0d0d0d] to-black rounded-3xl border border-amber-500/40 overflow-hidden shadow-[0_0_80px_rgba(245,158,11,0.2)]">
              <div className="bg-gradient-to-r from-amber-900/60 via-amber-800/40 to-transparent px-8 py-6 border-b border-amber-500/20">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/40 text-3xl text-black font-bold shrink-0">
                    ✓
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Payment Successful!
                    </h2>
                    <p className="text-green-400 text-sm font-medium">
                      {"Your nomination is now "}
                      <strong>Approved</strong>
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-5 mb-5 text-center">
                  <p className="text-xs uppercase tracking-[0.3em] text-amber-500/60 font-bold mb-2">
                    Your Nomination ID
                  </p>
                  <p className="text-amber-400 text-3xl font-mono font-bold tracking-wider select-all">
                    {successData.nominationId}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {"Login ID: "}
                    <span className="text-amber-400 font-mono">
                      {successData.nominationId}
                    </span>
                    {" | Password: Your mobile number"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[
                    ["Name", successData.name],
                    [
                      "Category",
                      `${successData.mainCategory} > ${successData.category}`,
                    ],
                    ["Mobile", successData.mobile],
                    [
                      "Amount Paid",
                      `${successData.paymentAmount || NOMINATION_FEE} BDT`,
                    ],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="bg-white/[0.03] border border-white/5 rounded-xl p-3"
                    >
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">
                        {label}
                      </p>
                      <p className="text-sm text-white font-medium truncate">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
                {successData.trxId && (
                  <div className="bg-gray-900/60 p-3 rounded-xl border border-gray-800 mb-5">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">
                      Transaction ID
                    </p>
                    <p className="text-gray-300 text-sm font-mono break-all select-all">
                      {successData.trxId}
                    </p>
                  </div>
                )}
                <p className="text-xs text-blue-400 bg-blue-900/20 border border-blue-900/30 p-3 rounded-lg mb-5">
                  📧 A confirmation email has been sent to your inbox.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={downloadConfirmation}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                  >
                    <i className="fas fa-download" />
                    {" Download PDF"}
                  </button>
                  <button
                    onClick={() => {
                      setSuccessData(null);
                      setView("status");
                    }}
                    className="flex-1 border border-gray-700 px-4 py-3 rounded-xl text-white hover:bg-gray-800 transition font-bold"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {failureData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/98 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
          <div className="w-full max-w-lg my-8">
            <div className="bg-gradient-to-br from-[#0d0d0d] to-black rounded-3xl border border-red-500/30 shadow-[0_0_50px_rgba(220,38,38,0.2)] overflow-hidden">
              <div className="bg-gradient-to-r from-red-950/60 to-transparent px-8 py-6 border-b border-red-500/20">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-3xl text-white font-bold shrink-0 shadow-lg shadow-red-600/40">
                    !
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Payment Failed
                    </h2>
                    <p className="text-red-400 text-sm">
                      Your registration is currently declined
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <p className="text-gray-300 text-sm mb-6 leading-relaxed bg-red-900/10 border border-red-900/30 p-4 rounded-xl">
                  {failureData.reason}
                </p>
                {failureData.nominationId && (
                  <div className="bg-[#0a0a0a] border border-amber-500/30 rounded-2xl p-6 mb-6">
                    <p className="text-xs uppercase tracking-[0.3em] text-amber-500/60 font-bold mb-3">
                      Invoice Reference
                    </p>
                    <p className="text-amber-400 text-2xl font-mono font-bold tracking-wider select-all mb-2">
                      {failureData.nominationId}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Your information has been saved securely. You can complete
                      payment below.
                    </p>
                  </div>
                )}
                <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-4 mb-6">
                  <p className="text-xs text-amber-400 font-bold mb-1">
                    💳 Complete Your Payment
                  </p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {"Your registration data is saved. Pay "}
                    {NOMINATION_FEE}
                    {
                      " BDT to complete your registration. Once payment is verified, your nomination will be automatically approved."
                    }
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setFailureData(null);
                      setStep(4);
                    }}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg"
                  >
                    <i className="fas fa-credit-card" />
                    {" Complete Payment"}
                  </button>
                  <a
                    href="/contact"
                    className="flex-1 border border-gray-700 px-4 py-3 rounded-xl text-white hover:bg-gray-800 transition font-bold flex items-center justify-center"
                  >
                    Contact Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TermsModal({ onClose, onAccept, hasRead, setHasRead }) {
  const scrollRef = useRef(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    const onScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
        setHasRead(true);
      }
    };
    el.addEventListener("scroll", onScroll);
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, [setHasRead]);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-gray-900 to-black max-w-2xl w-full rounded-2xl border border-amber-500/30 shadow-[0_0_50px_rgba(245,191,66,0.15)] flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h3 className="text-xl font-bold text-amber-400">
            {"Terms & Conditions and Privacy Policy"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <div
          ref={scrollRef}
          className="p-6 overflow-y-auto flex-1 text-sm text-gray-300 leading-relaxed whitespace-pre-line"
        >
          {TERMS_TEXT}
          {`

`}
          {PRIVACY_TEXT}
          {`

`}
          <span className="text-amber-400 font-bold">— End of document —</span>
        </div>
        <div className="p-6 border-t border-gray-800 bg-black/50">
          {!hasRead && (
            <p className="text-xs text-amber-400 mb-3 text-center">
              ⓘ Please scroll to the bottom to read the full document before
              accepting.
            </p>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-lg border border-gray-700 hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={onAccept}
              disabled={!hasRead}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {hasRead ? "I Agree" : "Scroll to read"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
