import { useEffect, useState } from "react";
import {
  getRedirectResult,
  signInWithEmailAndPassword,
  signInWithRedirect,
} from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { motion } from "framer-motion";
import {
  ArrowRight,
  House,
  Lock,
  LogIn,
  ShieldCheck,
  User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { HERO_IMAGE_DESKTOP } from "@/data/constants";
import { auth, db, googleProvider } from "@/lib/firebase";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (localStorage.getItem("activeNomineeId")) {
      navigate("/nominee");
      return;
    }
    const stored = localStorage.getItem("savedUser");
    if (stored) {
      setIdentifier(stored);
      setRememberMe(true);
    }
    getRedirectResult(auth)
      .then(async (result) => {
        if (!result?.user) {
          return;
        }
        const user = result.user;
        if (
          user.email === "onewayschool.bd@gmail.com" ||
          user.email?.includes("admin")
        ) {
          navigate("/admin");
          return;
        }
        if (user.email) {
          const colRef = collection(db, "nominations");
          const q = query(colRef, where("email", "==", user.email));
          const snapshot = await getDocs(q);
          if (snapshot.empty) {
            alert("This Google account is not registered as a Nominee.");
            await auth.signOut();
          } else {
            const data = snapshot.docs[0].data();
            localStorage.setItem("activeNomineeId", data.nominationId);
            navigate("/nominee");
          }
        }
      })
      .catch(() => {});
  }, [navigate]);
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithRedirect(auth, googleProvider);
    } catch (err) {
      setLoading(false);
      alert(`Google Login Failed: ${err.message || "Unknown Error"}`);
    }
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const trimmed = identifier.trim();
    const pass = password.trim();
    if (trimmed.includes("@")) {
      try {
        await signInWithEmailAndPassword(auth, trimmed, pass);
        navigate("/admin");
        setLoading(false);
        return;
      } catch (err) {
        console.log("Admin auth failed, checking nominee...", err.message);
      }
    }
    try {
      const colRef = collection(db, "nominations");
      let q = query(colRef, where("nominationId", "==", trimmed.toUpperCase()));
      let snapshot = await getDocs(q);
      if (snapshot.empty) {
        q = query(colRef, where("email", "==", trimmed));
        snapshot = await getDocs(q);
      }
      if (snapshot.empty) {
        alert("No account found with this ID/Email.");
      } else {
        const data = snapshot.docs[0].data();
        const expectedPassword = data.password || data.mobile;
        if (pass === expectedPassword) {
          localStorage.setItem("activeNomineeId", data.nominationId);
          if (rememberMe) {
            localStorage.setItem("savedUser", trimmed);
          } else {
            localStorage.removeItem("savedUser");
          }
          navigate("/nominee");
        } else {
          alert("Invalid password.");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden bg-[#050505]">
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-no-repeat bg-center bg-cover opacity-30"
          style={{
            backgroundImage: `url(${HERO_IMAGE_DESKTOP})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black/85 to-amber-950/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(245,158,11,0.18),transparent_60%)]" />
        <motion.div
          animate={{
            y: [0, -25, 0],
          }}
          transition={{
            duration: 9,
            repeat: 1 / 0,
          }}
          className="absolute top-20 -right-20 w-96 h-96 bg-amber-500/15 blur-[120px] rounded-full"
        />
        <motion.div
          animate={{
            y: [0, 25, 0],
          }}
          transition={{
            duration: 11,
            repeat: 1 / 0,
          }}
          className="absolute bottom-0 -left-20 w-96 h-96 bg-yellow-700/10 blur-[120px] rounded-full"
        />
      </div>
      <div className="relative z-20 p-5 md:p-7 flex justify-between items-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur text-gray-200 text-sm font-medium hover:bg-amber-500/10 hover:border-amber-500/40 hover:text-amber-400 transition"
        >
          <House size={16} />
          {" Back to Home"}
        </Link>
        <Link to="/" className="inline-block">
          <img
            src="https://iili.io/KqpV6Fe.png"
            alt="National Tech Award"
            className="h-9 md:h-11 w-auto"
          />
        </Link>
      </div>
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 pb-10">
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="w-full max-w-md"
        >
          <div className="relative rounded-3xl bg-gradient-to-b from-[#0d0d0d]/95 to-black/95 backdrop-blur-2xl border border-amber-500/25 p-6 md:p-8 shadow-[0_30px_80px_-20px_rgba(245,158,11,0.25)]">
            <div className="absolute -top-px left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-amber-400/80 to-transparent" />
            <div className="text-center mb-6">
              <div className="inline-flex w-12 h-12 mb-3 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-700 p-[2px] shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                <div className="w-full h-full rounded-2xl bg-black flex items-center justify-center">
                  <ShieldCheck
                    className="text-amber-400"
                    size={24}
                    strokeWidth={1.5}
                  />
                </div>
              </div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-amber-500/80 font-bold mb-1">
                Secure Access
              </p>
              <h2 className="text-2xl font-bold text-gradient-gold tracking-widest font-['Oswald']">
                LOGIN
              </h2>
              <p className="text-[10px] text-gray-500 mt-1">
                Welcome back to National Tech Award
              </p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-amber-500 uppercase tracking-widest ml-1">
                  User ID / Email
                </label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full bg-black/60 border border-gray-800 text-white text-sm rounded-xl py-3 pl-11 pr-4 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition placeholder-gray-600"
                    placeholder="NTA-XXXXXX or your email"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-amber-500 uppercase tracking-widest ml-1">
                  Password / Mobile
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/60 border border-gray-800 text-white text-sm rounded-xl py-3 pl-11 pr-4 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition placeholder-gray-600"
                    placeholder="Use your mobile number"
                    required
                  />
                </div>
                <p className="text-[10px] text-gray-500 text-right px-1">
                  * Use your mobile number as password
                </p>
              </div>
              <div className="flex items-center justify-between text-[10px] text-gray-400 px-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="accent-amber-500"
                  />
                  Remember me
                </label>
                <a href="#" className="hover:text-amber-500">
                  Forgot Password?
                </a>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-bold py-3 rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2 shadow-[0_10px_30px_-10px_rgba(245,158,11,0.5)]"
              >
                {loading ? (
                  <i className="fas fa-circle-notch fa-spin" />
                ) : (
                  <>
                    <LogIn size={18} />
                    {" Login "}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                <span className="px-3 bg-[#0a0a0a] text-gray-600">
                  or continue with
                </span>
              </div>
            </div>
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white hover:bg-gray-100 text-gray-900 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-3 border border-white/10"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                className="w-5 h-5"
                alt="G"
              />
              Login with Google
            </button>
            <div className="text-center text-xs text-gray-400 mt-6">
              Don't have an account?{" "}
              <Link
                to="/nomination"
                className="text-amber-500 font-bold hover:underline"
              >
                Register Now
              </Link>
            </div>
          </div>
          <p className="text-center text-[10px] text-gray-600 mt-6 uppercase tracking-widest">
            {"© "}
            {new Date().getFullYear()}
            {" National Tech Award"}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
