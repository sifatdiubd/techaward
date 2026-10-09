import { useEffect, useState } from "react";
import {
  House,
  Info,
  LayoutGrid,
  Mail,
  Menu,
  Phone,
  Trophy,
  User,
  Vote,
  X,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { CONTACT_EMAIL, WHATSAPP_NUMBER } from "@/data/constants";
import useSiteSettings from "@/hooks/useSiteSettings";

const NAV_LINKS = [
  {
    to: "/",
    label: "Home",
    icon: House,
  },
  {
    to: "/about",
    label: "About",
    icon: Info,
  },
  {
    to: "/categories",
    label: "Categories",
    icon: LayoutGrid,
  },
  {
    to: "/winners",
    label: "NTA Winners",
    icon: Trophy,
  },
  {
    to: "/voting",
    label: "Voting",
    icon: Vote,
  },
  {
    to: "/contact",
    label: "Contact Us",
    icon: Mail,
  },
];

const QUICK_LINKS = [
  {
    to: "/",
    label: "Home",
  },
  {
    to: "/categories",
    label: "Categories",
  },
  {
    to: "/voting",
    label: "Voting",
  },
  {
    to: "/nomination",
    label: "Nominate Now",
  },
];

const FacebookIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M22 12.07C22 6.51 17.52 2 12 2S2 6.51 2 12.07c0 5 3.66 9.15 8.44 9.93v-7.02H7.9v-2.91h2.54V9.84c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.91h-2.33V22c4.78-.78 8.44-4.93 8.44-9.93z" />
  </svg>
);

const LinkedinIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M19 3A2 2 0 0 1 21 5v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.34 18.34V10.67H5.67v7.67h2.67zM7 9.33a1.55 1.55 0 1 0 0-3.1 1.55 1.55 0 0 0 0 3.1zm11.34 9.01v-4.2c0-2.27-1.21-3.32-2.83-3.32-1.31 0-1.9.72-2.22 1.23v-1.06h-2.67v7.35h2.67v-4.1c0-1.08.72-1.6 1.5-1.6.83 0 1.36.55 1.36 1.6v4.1h2.19z" />
  </svg>
);

const YoutubeIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" />
  </svg>
);

const SOCIAL_LINKS = [
  {
    Icon: FacebookIcon,
    href: "https://facebook.com/nationaltechaward",
    color: "hover:text-blue-500",
    label: "Facebook",
  },
  {
    Icon: LinkedinIcon,
    href: "https://linkedin.com/company/nationaltechaward",
    color: "hover:text-blue-400",
    label: "LinkedIn",
  },
  {
    Icon: YoutubeIcon,
    href: "https://youtube.com/@nationaltechaward",
    color: "hover:text-red-500",
    label: "YouTube",
  },
];

export default function Layout({ children }) {
  const settings = useSiteSettings();
  const [menuOpen, setMenuOpen] = useState(false);
  const location2 = useLocation();
  useEffect(() => {
    setMenuOpen(false);
  }, [location2.pathname]);
  const navLinkClass = (a) =>
    location2.pathname === a
      ? "text-amber-400 font-bold bg-amber-500/10 rounded-lg px-3 py-1.5 border border-amber-500/30"
      : "hover:text-amber-400 transition px-3 py-1.5 text-gray-300 rounded-lg hover:bg-white/5";
  return (
    <div className="flex flex-col min-h-screen">
      <div className="fixed top-0 w-full bg-black/95 border-b border-amber-500/10 z-50 backdrop-blur-xl">
        <div className="bg-gradient-to-r from-amber-900/40 via-black to-amber-900/40 py-1.5 text-center text-[10px] md:text-xs">
          <span className="text-amber-400 inline-flex items-center gap-2">
            <Mail size={12} /> {CONTACT_EMAIL}
            <span className="text-gray-600 mx-2">|</span>
            <Phone size={12} />
            {" +88 01965-848607"}
          </span>
        </div>
        <nav className="relative">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <Link
              to="/"
              className="flex items-center gap-2 font-bold text-xl text-amber-500 shrink-0"
            >
              <img
                src="https://iili.io/KqpV6Fe.png"
                alt="National Tech Award"
                className="h-8 md:h-10 w-auto"
                onError={(e) =>
                  (e.currentTarget.src =
                    "https://placehold.co/40x40/gold/black?text=NTA")
                }
              />
            </Link>
            <div className="hidden lg:flex items-center gap-1 text-sm font-medium">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={navLinkClass(item.to)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/nomination"
                className={`bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold px-5 py-2 rounded-full hover:scale-105 transition shadow-lg shadow-amber-500/30 ml-3 ${settings.nominationOpen ? "" : "opacity-50 cursor-not-allowed"}`}
              >
                {settings.nominationOpen
                  ? "Nominate Now"
                  : "Nominations Closed"}
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-xs border border-gray-600 text-gray-300 hover:border-amber-500 hover:text-white px-3 py-1.5 rounded-full transition flex items-center gap-2"
              >
                <User size={14} />{" "}
                <span className="hidden sm:inline">Login</span>
              </Link>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden text-amber-500 focus:outline-none w-9 h-9 flex items-center justify-center rounded hover:bg-gray-800"
                aria-label="Menu"
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
          {menuOpen && (
            <div className="lg:hidden absolute top-full left-0 w-full bg-[#0a0a0a] border-b border-amber-500/20 shadow-2xl animate-fade-in z-40">
              <div className="flex flex-col p-4 gap-1.5 max-h-[80vh] overflow-y-auto">
                {NAV_LINKS.map((item) => {
                  const Icon = item.icon;
                  const color = location2.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={
                        color
                          ? "flex items-center gap-3 text-amber-400 font-bold bg-amber-500/10 border border-amber-500/30 px-4 py-3 rounded-lg"
                          : "flex items-center gap-3 text-gray-300 hover:text-white hover:bg-gray-800 px-4 py-3 rounded-lg transition"
                      }
                    >
                      <Icon size={18} /> {item.label}
                    </Link>
                  );
                })}
                <Link
                  to="/nomination"
                  className={`block text-center bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold px-4 py-3 rounded-lg mt-2 ${settings.nominationOpen ? "" : "opacity-50 cursor-not-allowed"}`}
                >
                  {settings.nominationOpen
                    ? "Nominate Now"
                    : "Nominations Closed"}
                </Link>
              </div>
            </div>
          )}
        </nav>
      </div>
      <main className="relative w-full overflow-hidden flex-1 pt-24 md:pt-28">
        {children}
      </main>
      <footer className="relative bg-gradient-to-b from-[#050505] via-black to-[#0a0a0a] border-t border-amber-500/20 mt-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-amber-600/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="container mx-auto px-4 pt-16 pb-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start">
              <Link to="/" className="inline-block mb-5">
                <img
                  src="https://iili.io/KqpV6Fe.png"
                  alt="National Tech Award"
                  className="h-16 w-auto"
                />
              </Link>
              <p className="text-sm text-gray-400 leading-relaxed max-w-md mb-5">
                Bangladesh's most prestigious annual tech recognition platform.
              </p>
              <div className="flex gap-3 justify-center md:justify-start">
                {SOCIAL_LINKS.map(({ Icon, href, color, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 ${color} hover:border-amber-500/50 hover:bg-amber-500/10 transition-all hover:-translate-y-0.5`}
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>
            <div className="hidden md:flex flex-col items-center md:items-start">
              <h4 className="text-amber-500 font-bold mb-4 uppercase tracking-widest text-xs">
                Quick Links
              </h4>
              <ul className="space-y-2.5 text-sm">
                {QUICK_LINKS.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="text-gray-400 hover:text-amber-400 transition inline-flex items-center gap-2"
                    >
                      <span className="w-1 h-1 rounded-full bg-amber-500/50" />{" "}
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col items-center md:items-start">
              <h4 className="text-amber-500 font-bold mb-4 uppercase tracking-widest text-xs">
                Contact
              </h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-center gap-2 justify-center md:justify-start">
                  <Phone size={16} className="text-amber-500 shrink-0" />
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    className="hover:text-amber-400 transition"
                  >
                    +88 01965-848607 (WhatsApp)
                  </a>
                </li>
                <li className="flex items-center gap-2 justify-center md:justify-start">
                  <Mail size={16} className="text-amber-500 shrink-0" />
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="hover:text-amber-400 transition break-all"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-center text-xs text-gray-500">
            <p>
              {"© "}
              {new Date().getFullYear()}
              {" National Tech Award. All rights reserved."}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
