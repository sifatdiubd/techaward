import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  Briefcase,
  Calendar,
  ChevronRight,
  Clock,
  Crown,
  FileText,
  Handshake,
  Info,
  Laptop,
  List,
  Lock,
  MapPin,
  Sparkles,
  Video,
  Vote,
} from "lucide-react";
import { Link } from "react-router-dom";
import FlashbackSection from "@/components/FlashbackSection";
import Layout from "@/components/Layout";
import SectionTitle from "@/components/SectionTitle";
import {
  CATEGORIES,
  CATEGORY_META,
  HERO_IMAGE_DESKTOP,
  HERO_IMAGE_MOBILE,
  NOMINEE_PRIZE_IMAGES,
  WHATSAPP_NUMBER,
  WINNER_PRIZE_IMAGES,
} from "@/data/constants";
import useCollection from "@/hooks/useCollection";
import useImageTone from "@/hooks/useImageTone";
import useSiteSettings from "@/hooks/useSiteSettings";

const HOME_CATEGORY_ICONS = {
  freelancer: Laptop,
  business: Briefcase,
  corporate: Crown,
  women: Sparkles,
  content: Video,
};

export default function Home() {
  return (
    <Layout>
      <HeroSection />
      <EventInfoSection />
      <CategoriesSection />
      <JudgingSection />
      <AwardsSection />
      <SelectionProcessSection />
      <PastWinnersSection />
      <FlashbackSection />
      <GallerySection />
      <SponsorsSection />
      <SponsorCtaSection />
    </Layout>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-[80vh] md:min-h-[88vh] flex items-center px-4 py-8 md:pt-12 md:pb-16 overflow-hidden bg-black">
      <div className="absolute inset-0 z-0 hidden md:block">
        <img
          src={HERO_IMAGE_DESKTOP}
          alt="National Tech Award"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      </div>
      <div className="absolute inset-0 z-0 md:hidden">
        <img
          src={HERO_IMAGE_MOBILE}
          alt="National Tech Award"
          className="w-full h-full object-cover object-center opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/90" />
      </div>
      <div className="container mx-auto px-4 sm:px-6 md:px-10 lg:px-16 relative z-10">
        <motion.div
          initial={{
            opacity: 0,
            x: -30,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.7,
          }}
          className="max-w-2xl mr-auto text-center md:text-left md:pl-4 lg:pl-8"
        >
          <span className="inline-flex items-center gap-2 py-2 px-5 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-400 text-xs font-bold mb-8 uppercase tracking-[0.25em] backdrop-blur">
            Excellence • Innovation • Recognition
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-[1.05]">
            <span className="text-gradient-gold block">
              National Tech Award
            </span>
            <span className="text-white/90 text-xl md:text-2xl font-light tracking-[0.3em] uppercase mt-4 block">
              Honouring the Best in Tech
            </span>
          </h1>
          <p className="text-gray-200 max-w-xl mx-auto md:mx-0 text-base md:text-lg leading-relaxed mb-10">
            A national stage for technologists, entrepreneurs, and creators —
            get the recognition your achievements deserve.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto md:mx-0">
            {[
              {
                num: "4th",
                label: "Season",
              },
              {
                num: "1000+",
                label: "Nominees",
              },
              {
                num: "50+",
                label: "Categories",
              },
              {
                num: "2022",
                label: "Founded",
              },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.5 + index * 0.1,
                }}
                className="text-center p-3 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm shadow-xl"
              >
                <div className="font-['Oswald'] text-2xl md:text-3xl font-bold text-gradient-gold">
                  {item.num}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-gray-500 mt-1 font-bold">
                  {item.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function EventInfoSection() {
  const settings = useSiteSettings();
  const [countdown, setCountdown] = useState({
    d: "00",
    h: "00",
    m: "00",
    s: "00",
  });
  const [hasEventDate, setHasEventDate] = useState(false);
  useEffect(() => {
    const eventStr = settings.eventDateTime?.trim();
    if (!eventStr) {
      setHasEventDate(false);
      return;
    }
    const target = new Date(eventStr).getTime();
    if (isNaN(target)) {
      setHasEventDate(false);
      return;
    }
    setHasEventDate(true);
    const pad = (diff) => (diff < 10 ? "0" + diff : diff.toString());
    const tick = () => {
      const diff = target - Date.now();
      if (diff < 0) {
        setCountdown({
          d: "00",
          h: "00",
          m: "00",
          s: "00",
        });
        return;
      }
      setCountdown({
        d: pad(Math.floor(diff / 86400000)),
        h: pad(Math.floor((diff % 86400000) / 3600000)),
        m: pad(Math.floor((diff % 3600000) / 60000)),
        s: pad(Math.floor((diff % 60000) / 1000)),
      });
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [settings.eventDateTime]);
  return (
    <section className="py-16 bg-gradient-to-b from-black via-[#0a0a0a] to-black border-t border-amber-500/10">
      <div className="container mx-auto px-4">
        {hasEventDate && <Countdown t={countdown} />}
        <div className="flex flex-wrap gap-3 justify-center items-center text-sm text-gray-300 mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur">
            <Calendar size={14} className="text-amber-500" />{" "}
            {settings.dateStr?.trim() || "To Be Unlocked"}
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur">
            <Clock size={14} className="text-amber-500" />{" "}
            {settings.timeStr?.trim() || "To Be Unlocked"}
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur">
            <MapPin size={14} className="text-amber-500" />{" "}
            {settings.venueStr?.trim() || "To Be Unlocked"}
          </span>
        </div>
        <div className="max-w-6xl mx-auto mb-10 mt-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-3 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30">
              <Lock size={12} className="text-amber-400" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-amber-300 font-bold">
                Reserve Your Spot
              </span>
            </div>
            <h3 className="text-2xl md:text-4xl font-bold text-white leading-tight">
              {"Why you should "}
              <span className="text-gradient-gold">act early</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {[
              {
                icon: Lock,
                title: "Nominations Close First",
                desc: "Event Date, Time & Venue will be announced only after nominations close.",
              },
              {
                icon: Vote,
                title: "Early Advantage",
                desc: "Early nominees will get priority access to voting facilities from the start.",
              },
              {
                icon: Award,
                title: "Limited Seats",
                desc: "Seats are limited and confirmed on a first-come basis.",
              },
            ].map((eventStr, target) => (
              <div
                key={target}
                className="group relative rounded-2xl p-6 bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 hover:border-amber-500/40 transition overflow-hidden"
              >
                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-amber-500/10 blur-3xl group-hover:bg-amber-500/20 transition" />
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 text-black mb-4 shadow-[0_0_24px_rgba(245,158,11,0.4)]">
                    <eventStr.icon size={22} />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">
                    {eventStr.title}
                  </h4>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {eventStr.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/nomination"
            className="group bg-gradient-to-r from-amber-500 to-yellow-600 text-black text-lg font-bold px-8 py-4 rounded-xl hover:scale-105 transition shadow-[0_0_40px_rgba(245,158,11,0.5)] inline-flex items-center justify-center gap-2"
          >
            Nominate Now
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition"
            />
          </Link>
          <Link
            to="/voting"
            className="group bg-white/5 backdrop-blur border border-white/20 text-white text-lg font-bold px-8 py-4 rounded-xl hover:bg-white/10 hover:border-amber-500/50 transition inline-flex items-center justify-center gap-2"
          >
            <List size={20} />
            {" View Nominees"}
          </Link>
        </div>
      </div>
    </section>
  );
}

function Countdown({ t }) {
  const units = [
    {
      label: "Days",
      value: t.d,
    },
    {
      label: "Hours",
      value: t.h,
    },
    {
      label: "Mins",
      value: t.m,
    },
    {
      label: "Secs",
      value: t.s,
    },
  ];
  return (
    <div className="mb-10 text-center">
      <p className="text-[10px] text-amber-500/80 uppercase tracking-[0.4em] mb-4 font-bold">
        Event Starts In
      </p>
      <div className="flex justify-center gap-2 md:gap-4">
        {units.map((unit, index) => (
          <motion.div
            key={unit.label}
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.1 * index,
            }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/40 to-amber-700/20 rounded-2xl blur-xl group-hover:blur-2xl transition" />
            <div className="relative bg-gradient-to-br from-[#1a1a1a]/90 to-black/90 border border-amber-500/40 rounded-2xl p-3 md:p-5 min-w-[70px] md:min-w-[110px] backdrop-blur-sm">
              <div
                className="font-['Oswald'] text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-700 leading-none"
                style={{
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {unit.value}
              </div>
              <div className="text-[9px] md:text-[10px] uppercase tracking-[0.25em] text-amber-500/60 mt-2 font-bold">
                {unit.label}
              </div>
              <div className="absolute -bottom-px left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function CategoriesSection() {
  return (
    <section className="py-20 bg-black relative border-t border-amber-500/10">
      <div className="container mx-auto px-4">
        <SectionTitle
          eyebrow="Award Categories"
          title="Award Categories"
          subtitle="Choose the right category for your skills and achievements"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(CATEGORIES).map(([key, value], index) => {
            const Icon = HOME_CATEGORY_ICONS[value.iconKey] || Award;
            const meta = CATEGORY_META[key] || {
              emoji: "⚪",
              color: "from-gray-500/20 to-gray-900/10",
              dot: "bg-gray-500",
            };
            return (
              <motion.div
                key={key}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay: index * 0.05,
                }}
                className={`group relative rounded-2xl overflow-hidden bg-gradient-to-br ${meta.color} border border-white/5 hover:border-white/20 transition-all duration-500 hover:-translate-y-1`}
              >
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition" />
                <div className="p-6 relative">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{meta.emoji}</span>
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${meta.dot} shadow-lg`}
                    />
                    <div className="w-14 h-14 ml-auto rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center group-hover:rotate-6 transition-transform duration-500">
                      <Icon
                        className="text-white/70"
                        size={24}
                        strokeWidth={1.5}
                      />
                    </div>
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold mb-1">
                    {"Category "}
                    {index + 1}
                  </p>
                  <h3 className="text-xl font-bold text-white group-hover:text-white transition mb-2">
                    {key}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-4 line-clamp-2">
                    {value.target}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {value.subs.slice(0, 5).map((item) => (
                      <span
                        key={item}
                        className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400"
                      >
                        {item}
                      </span>
                    ))}
                    {value.subs.length > 5 && (
                      <span className="text-[10px] px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold">
                        +{value.subs.length - 5}
                        {" more"}
                      </span>
                    )}
                  </div>
                  <Link
                    to="/categories"
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-400 hover:text-amber-300 hover:gap-2.5 transition-all"
                  >
                    {"View All Sub-Categories "}
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
        <div className="text-center mt-10">
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold px-8 py-3.5 rounded-full hover:scale-105 transition shadow-lg shadow-amber-500/20"
          >
            <List size={18} />
            {" View All Categories"}
          </Link>
        </div>
      </div>
    </section>
  );
}

function JudgingSection() {
  const criteria = [
    {
      Icon: FileText,
      title: "Documentation & Presentation",
      pct: 35,
      desc: "Quality of submitted documents, portfolio, and presentation.",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      textColor: "text-blue-400",
    },
    {
      Icon: Vote,
      title: "Public Voting",
      pct: 35,
      desc: "Score from public online votes — your community matters.",
      color: "from-amber-500 to-yellow-600",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
      textColor: "text-amber-400",
    },
    {
      Icon: Handshake,
      title: "Behaviour Evaluation",
      pct: 30,
      desc: "Professional conduct and communication skills of nominees.",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
      textColor: "text-green-400",
    },
  ];
  return (
    <section className="py-20 bg-[#080808] border-t border-amber-500/10">
      <div className="container mx-auto px-4">
        <SectionTitle
          eyebrow="Voting & Judging"
          title="Voting & Judging Process"
          subtitle="A transparent and fair evaluation framework"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {criteria.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                delay: index * 0.1,
              }}
              className={`relative p-8 rounded-3xl bg-gradient-to-b from-white/5 to-transparent border ${item.borderColor} backdrop-blur hover:-translate-y-2 transition duration-500 group overflow-hidden`}
            >
              <div
                className={`absolute -top-10 -right-10 w-32 h-32 ${item.bgColor} blur-3xl rounded-full`}
              />
              <div
                className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition`}
              >
                <item.Icon className="text-white" size={28} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {item.title}
              </h3>
              <div className="flex items-baseline gap-2 mb-3">
                <span
                  className={`text-6xl font-bold font-['Oswald'] ${item.textColor} bg-clip-text`}
                  style={{
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {item.pct}
                </span>
                <span className={`text-2xl font-bold ${item.textColor}`}>
                  %
                </span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AwardsSection() {
  const winnerRewards = [
    {
      image: WINNER_PRIZE_IMAGES.trophy,
      title: "Award Metal Trophy",
      desc: "Premium metal trophy for top winners.",
    },
    {
      image: WINNER_PRIZE_IMAGES.medal,
      title: "Medal",
      desc: "Exclusive commemorative medal.",
    },
    {
      image: WINNER_PRIZE_IMAGES.certificate,
      title: "Framed Certificate",
      desc: "Official winner certificate with frame.",
    },
  ];
  const nomineeRewards = [
    {
      image: NOMINEE_PRIZE_IMAGES.crest,
      title: "Honorary Crest",
      desc: "Official NTA participation crest for all nominees.",
    },
    {
      image: NOMINEE_PRIZE_IMAGES.certificate,
      title: "Certificate",
      desc: "Hard-copy participation certificate with official seal.",
    },
    {
      image: NOMINEE_PRIZE_IMAGES.digital,
      title: "Digital Recognition",
      desc: "Featured on NTA website and social media channels.",
    },
  ];
  return (
    <section className="py-20 bg-black border-t border-amber-500/10">
      <div className="container mx-auto px-4">
        <SectionTitle
          eyebrow="Awards & Honours"
          title="Awards & Honours"
          subtitle="Special recognition for winners and nominees alike"
        />
        <div className="mb-16">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-[0.4em] text-amber-500 font-bold mb-2">
              Exclusive Rewards for Winners
            </p>
            <h3 className="text-2xl md:text-3xl font-bold text-white">
              What Winners Receive
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {winnerRewards.map((winnerReward, index) => (
              <motion.div
                key={winnerReward.title}
                initial={{
                  opacity: 0,
                  y: 30,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay: index * 0.1,
                }}
                className="group relative rounded-3xl overflow-hidden border border-amber-500/30 bg-gradient-to-b from-amber-900/15 via-[#0a0a0a] to-black hover:-translate-y-2 hover:border-amber-500/60 transition duration-500"
              >
                <div className="absolute -top-32 -right-32 w-72 h-72 bg-amber-500/15 blur-3xl rounded-full" />
                <div className="relative aspect-square bg-gradient-to-br from-amber-950/30 via-black to-black flex items-center justify-center p-8">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.15),transparent_70%)]" />
                  <img
                    src={winnerReward.image}
                    alt={winnerReward.title}
                    className="relative max-h-full max-w-full object-contain drop-shadow-[0_20px_40px_rgba(245,158,11,0.4)] group-hover:scale-105 transition duration-700"
                  />
                </div>
                <div className="relative p-6 text-center border-t border-amber-500/20 bg-gradient-to-b from-transparent to-amber-950/10">
                  <h4 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition">
                    {winnerReward.title}
                  </h4>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {winnerReward.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-[0.4em] text-blue-400 font-bold mb-2">
              Rewards for All Nominees
            </p>
            <h3 className="text-2xl md:text-3xl font-bold text-white">
              What Nominees Receive
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {nomineeRewards.map((nomineeReward, index) => (
              <motion.div
                key={nomineeReward.title}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay: index * 0.1,
                }}
                className="group relative rounded-3xl overflow-hidden border border-blue-500/30 bg-gradient-to-b from-blue-900/10 via-[#0a0a0a] to-black hover:-translate-y-2 hover:border-blue-500/50 transition duration-500"
              >
                <div className="relative aspect-[4/3] bg-black flex items-center justify-center p-6">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_70%)]" />
                  <img
                    src={nomineeReward.image}
                    alt={nomineeReward.title}
                    className="relative max-h-full max-w-full object-contain drop-shadow-[0_10px_30px_rgba(59,130,246,0.3)] group-hover:scale-105 transition duration-700"
                    onError={(e) =>
                      (e.currentTarget.src =
                        "https://placehold.co/400x300/0a0a0a/4b82f5?text=" +
                        nomineeReward.title)
                    }
                  />
                </div>
                <div className="relative p-5 text-center border-t border-blue-500/20">
                  <h4 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition">
                    {nomineeReward.title}
                  </h4>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {nomineeReward.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            className="max-w-4xl mx-auto mt-10"
          >
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-amber-500/10 to-red-500/5 border border-amber-500/30 p-5 md:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-5 hover:border-amber-500/50 transition">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-2xl rounded-full pointer-events-none" />
              <div className="w-12 h-12 shrink-0 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <Info className="text-amber-500" size={24} />
              </div>
              <div className="text-center sm:text-left relative z-10">
                <h4 className="text-amber-500 font-bold text-base md:text-lg mb-1.5 uppercase tracking-wider">
                  Important Note
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {
                    "If a participant is absent on the event day, their gift, crest, and certificate "
                  }
                  <strong className="text-amber-100">
                    will not be available for collection later
                  </strong>
                  {
                    " either from the office or via courier. These items are strictly distributed only during the event."
                  }
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function SelectionProcessSection() {
  const steps = [
    {
      title: "Registration",
      desc: "Complete registration and submit your nomination.",
    },
    {
      title: "Documentation",
      desc: "Log into your dashboard and upload presentation and supporting documents.",
    },
    {
      title: "Public Voting Shortlist",
      desc: "Nominees are shortlisted from the public voting round.",
    },
    {
      title: "Final Jury Selection",
      desc: "The jury board reviews each shortlisted candidate's presentation and documentation to make the final selection.",
    },
  ];
  return (
    <section className="py-20 bg-[#080808] border-t border-amber-500/10">
      <div className="container mx-auto px-4">
        <SectionTitle
          eyebrow="Selection Process"
          title="Selection Process"
          subtitle="Four transparent steps from nomination to final jury decision"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto relative">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                delay: index * 0.1,
              }}
              className="relative bg-gradient-to-br from-[#0f0f0f] to-black border border-white/5 hover:border-amber-500/40 rounded-2xl p-6 transition group"
            >
              <div className="absolute -top-4 left-6 w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-700 rounded-xl flex items-center justify-center font-bold text-black text-xl shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                {index + 1}
              </div>
              <div className="pt-6">
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PastWinnersSection() {
  const { data: winners } = useCollection("winners");
  const sorted = [...winners].sort(
    (a, b) => (a.order ?? 999) - (b.order ?? 999),
  );
  if (sorted.length === 0) {
    return null;
  }
  const withImages = sorted.filter(
    (item) => item.image && item.image.length > 5,
  );
  return (
    <section className="py-20 bg-black border-t border-amber-500/10">
      <div className="container mx-auto px-4">
        <SectionTitle
          eyebrow="Hall of Fame"
          title="Past Award Winners"
          subtitle="Whose remarkable contributions inspire us"
        />
        {withImages.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-10 max-w-6xl mx-auto">
            {withImages.slice(0, 8).map((withImage, index) => (
              <motion.div
                key={withImage.id}
                initial={{
                  opacity: 0,
                  scale: 0.9,
                }}
                whileInView={{
                  opacity: 1,
                  scale: 1,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay: index * 0.05,
                }}
                className="group relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#0f0f0f] to-black border border-white/5 hover:border-amber-500/40 hover:-translate-y-1 transition duration-500"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={withImage.image}
                    alt={withImage.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                    onError={(e) =>
                      (e.currentTarget.src =
                        "https://placehold.co/300x300/1a1a1a/e0e0e0?text=NTA")
                    }
                  />
                </div>
                <div className="p-4 text-center">
                  <h4 className="font-bold text-white text-sm group-hover:text-amber-400 transition">
                    {withImage.name}
                  </h4>
                  <p className="text-xs text-amber-500 mt-1">
                    {withImage.designation}
                  </p>
                  {withImage.category && (
                    <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">
                      {withImage.category}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
        <div className="text-center mt-6">
          <Link
            to="/winners"
            className="inline-flex items-center gap-2 text-black bg-gradient-to-r from-amber-500 to-yellow-600 px-6 py-3 rounded-full font-bold text-sm hover:scale-105 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition"
          >
            {"View All Winners "}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function GallerySection() {
  const { data: gallery } = useCollection("gallery");
  if (gallery.length === 0) {
    return null;
  }
  const half = Math.ceil(gallery.length / 2);
  const firstRow = gallery.slice(0, half);
  const secondRow =
    gallery.slice(half).length > 0 ? gallery.slice(half) : gallery;
  const Item = ({ g, i }) => (
    <div className="shrink-0 w-[260px] md:w-[320px] aspect-[4/3] rounded-2xl overflow-hidden bg-[#0a0a0a] border border-white/5 hover:border-amber-500/50 transition-all duration-500 hover:shadow-[0_15px_40px_-10px_rgba(245,158,11,0.4)] group relative">
      <img
        src={g.image}
        alt={g.caption || `Gallery ${i}`}
        className="w-full h-full object-cover object-top group-hover:scale-110 transition duration-700"
        onError={(e) =>
          (e.currentTarget.src =
            "https://placehold.co/600x450/202020/white?text=NTA")
        }
      />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
      {g.caption && (
        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="text-white text-xs font-medium leading-snug line-clamp-2">
            {g.caption}
          </p>
        </div>
      )}
    </div>
  );
  return (
    <section className="py-20 bg-gradient-to-b from-[#080808] via-black to-[#080808] border-t border-amber-500/10 relative overflow-hidden">
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-700/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="container mx-auto px-4 relative mb-10">
        <SectionTitle
          eyebrow="Event Gallery"
          title="Moments to Remember"
          subtitle="A glimpse from our previous editions"
        />
      </div>
      <div className="relative overflow-hidden mb-5">
        <div className="flex gap-4 w-max animate-marquee-rtl hover:[animation-play-state:paused]">
          {[...firstRow, ...firstRow].map((item, index) => (
            <Item key={`a-${item.id}-${index}`} g={item} i={index} />
          ))}
        </div>
      </div>
      <div className="relative overflow-hidden">
        <div className="flex gap-4 w-max animate-marquee-ltr hover:[animation-play-state:paused]">
          {[...secondRow, ...secondRow].map((item, index) => (
            <Item key={`b-${item.id}-${index}`} g={item} i={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SponsorsSection() {
  const { data: sponsors } = useCollection("sponsors");
  if (sponsors.length === 0) {
    return null;
  }
  const tierRank = (tier) => {
    const lower = tier.toLowerCase();
    return lower.includes("title")
      ? 0
      : lower.includes("powered")
        ? 1
        : lower.includes("co-sponsor") || lower === "co sponsor"
          ? 2
          : lower.includes("strategic")
            ? 3
            : lower.includes("partner")
              ? 4
              : 5;
  };
  const sorted = [...sponsors].sort(
    (a, b) =>
      (a.order ?? 999) - (b.order ?? 999) ||
      tierRank(a.tier) - tierRank(b.tier),
  );
  return (
    <section className="py-20 bg-black border-t border-amber-500/10">
      <div className="container mx-auto px-4">
        <SectionTitle
          eyebrow="Our Partners"
          title="Our Sponsors"
          subtitle="Whose support makes this celebration possible"
        />
        <div className="grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-6xl mx-auto">
          {sorted.map((item) => (
            <SponsorCard key={item.id} sponsor={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SponsorCard({ sponsor }) {
  const tone = useImageTone(sponsor.logo);
  const logoBg =
    tone === "dark"
      ? "bg-[#0a0a0a] border-white/10"
      : tone === "light"
        ? "bg-white border-white/20"
        : "bg-neutral-200 border-white/10";
  return (
    <a
      href={sponsor.website || "#"}
      target="_blank"
      rel="noreferrer"
      className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-amber-500/40 transition hover:-translate-y-1 p-5 flex flex-col items-center"
    >
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 mb-4 rounded border border-amber-500/40 text-amber-400 bg-amber-500/10">
        {sponsor.tier}
      </span>
      <div
        className={`w-full rounded-xl flex items-center justify-center h-28 mb-3 border ${logoBg} transition`}
      >
        <img
          src={sponsor.logo}
          alt={sponsor.name}
          className="max-h-full max-w-full object-contain p-3"
          onError={(e) =>
            (e.currentTarget.src =
              "https://placehold.co/200x100/ffffff/333?text=" + sponsor.name)
          }
        />
      </div>
      <p className="text-center text-sm font-bold text-white group-hover:text-amber-400 transition">
        {sponsor.name}
      </p>
    </a>
  );
}

function SponsorCtaSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-[#080808] via-black to-[#080808] border-t border-amber-500/10">
      <div className="container mx-auto px-4">
        <div className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden border border-amber-500/30 bg-gradient-to-br from-amber-900/20 via-black to-black p-10 md:p-14 text-center">
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-amber-500/20 blur-[100px] rounded-full" />
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-yellow-600/20 blur-[100px] rounded-full" />
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.4em] text-amber-500 font-bold mb-4">
              Become a Partner
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-gradient-gold mb-5">
              Join Us as a Sponsor
            </h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              Title Sponsor, Powered By, or Co-Sponsor — partner with us and put
              your brand in front of one of the country's biggest tech events.
            </p>
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              {["Title Sponsor", "Powered By", "Co-Sponsor", "Partner"].map(
                (item) => (
                  <span
                    key={item}
                    className="px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-bold"
                  >
                    {item}
                  </span>
                ),
              )}
            </div>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("I'm interested in becoming a sponsor for the National Tech Award.")}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 px-5 sm:py-4 sm:px-8 rounded-full text-sm sm:text-lg transition transform hover:scale-105 shadow-[0_0_30px_rgba(37,211,102,0.4)] max-w-full"
            >
              <i className="fab fa-whatsapp text-xl sm:text-2xl" />
              {" Contact on WhatsApp"}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
