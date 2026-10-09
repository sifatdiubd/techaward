import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Award, CalendarDays, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import useCollection from "@/hooks/useCollection";

const seasonLabel = (year) =>
  year === "2023"
    ? "1st Season"
    : year === "2024"
      ? "2nd Season"
      : year === "2025"
        ? "3rd Season"
        : year === "2026"
          ? "4th Season"
          : `${year} Season`;

const FALLBACK_LOGO = "https://iili.io/KqpV6Fe.png";

export default function Winners() {
  const { data: winners, loading } = useCollection("winners");
  const sorted = [...winners].sort(
    (a, b) => (a.order ?? 999) - (b.order ?? 999),
  );
  const byYear = useMemo(() => {
    const groups = {};
    sorted.forEach((item) => {
      const year = item.year || "2026";
      if (!groups[year]) {
        groups[year] = [];
      }
      groups[year].push(item);
    });
    return groups;
  }, [sorted]);
  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));
  const [activeYear, setActiveYear] = useState(
    years.length > 0 ? years[0] : null,
  );
  return (
    <Layout>
      <div className="bg-[#050505] min-h-screen py-16 animate-fade-in">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.4em] text-amber-500/70 font-bold mb-3">
              Hall of Fame
            </p>
            <h1 className="text-4xl md:text-6xl font-bold text-gradient-gold mb-4">
              <Trophy
                className="inline-block mr-3 mb-2 text-amber-500"
                size={48}
              />
              {" NTA Winners"}
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              National Tech Award-এর সম্মানিত বিজয়ীরা — যারা প্রযুক্তি জগতে
              অবদান রেখে চলেছেন।
            </p>
          </div>
          {loading ? (
            <div className="text-center text-amber-500 py-20">
              <i className="fas fa-spinner fa-spin text-3xl" />
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-20">
              <Award
                className="mx-auto text-gray-600 mb-4"
                size={64}
                strokeWidth={1}
              />
              <p className="text-gray-400 text-lg mb-2">
                এখনও কোনো বিজয়ী যুক্ত করা হয়নি।
              </p>
              <p className="text-gray-600 text-sm mb-6">
                Admin Panel থেকে শীঘ্রই বিজয়ীদের তালিকা প্রকাশ করা হবে।
              </p>
              <Link
                to="/nomination"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold px-6 py-3 rounded-xl hover:scale-105 transition"
              >
                নমিনেশন জমা দিন
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-16">
                {sorted.slice(0, 8).map((item, index) => (
                  <motion.div
                    key={item.id}
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
                      delay: index * 0.04,
                    }}
                    className="group relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#0f0f0f] to-black border border-white/5 hover:border-amber-500/40 hover:-translate-y-1 transition duration-500"
                  >
                    <div className="aspect-square overflow-hidden relative">
                      <img
                        src={item.image || FALLBACK_LOGO}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                        onError={(e) => (e.currentTarget.src = FALLBACK_LOGO)}
                      />
                      <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-amber-500/90 flex items-center justify-center shadow-lg">
                        <Trophy className="text-black" size={18} />
                      </div>
                    </div>
                    <div className="p-5 text-center">
                      <h3 className="font-bold text-white text-base group-hover:text-amber-400 transition">
                        {item.name}
                      </h3>
                      <p className="text-xs text-amber-500 mt-1">
                        {item.designation}
                      </p>
                      {item.category && (
                        <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest">
                          {item.category}
                        </p>
                      )}
                      {item.year && (
                        <p className="text-[10px] text-gray-600 mt-1">
                          {item.year}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
              {years.length > 0 && (
                <div className="mt-8 max-w-6xl mx-auto">
                  <div className="text-center mb-8 flex items-center justify-center gap-3">
                    <div className="h-px w-16 bg-gradient-to-r from-transparent to-white/20" />
                    <CalendarDays className="text-amber-500" size={20} />
                    <h2 className="text-2xl font-bold text-white uppercase tracking-wider">
                      Season Wise Winners
                    </h2>
                    <div className="h-px w-16 bg-gradient-to-l from-transparent to-white/20" />
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 mb-10">
                    {years.map((year) => (
                      <button
                        key={year}
                        onClick={() => setActiveYear(year)}
                        className={`px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-widest transition-all duration-300 border ${activeYear === year ? "bg-amber-500 text-black border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-105" : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"}`}
                      >
                        {seasonLabel(year)}
                      </button>
                    ))}
                  </div>
                  <AnimatePresence mode="wait">
                    {activeYear && (
                      <motion.div
                        key={activeYear}
                        initial={{
                          opacity: 0,
                          y: 10,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                          y: -10,
                        }}
                        transition={{
                          duration: 0.3,
                        }}
                      >
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                          {byYear[activeYear].map((item, index) => (
                            <motion.div
                              key={item.id}
                              initial={{
                                opacity: 0,
                                scale: 0.95,
                              }}
                              animate={{
                                opacity: 1,
                                scale: 1,
                              }}
                              transition={{
                                delay: index * 0.03,
                              }}
                              className="group bg-[#0a0a0a] rounded-xl border border-white/5 overflow-hidden hover:border-amber-500/30 transition duration-300"
                            >
                              <div className="aspect-square overflow-hidden relative">
                                <img
                                  src={item.image || FALLBACK_LOGO}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) =>
                                    (e.currentTarget.src = FALLBACK_LOGO)
                                  }
                                />
                              </div>
                              <div className="p-3 text-center">
                                <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition line-clamp-1">
                                  {item.name}
                                </h4>
                                <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">
                                  {item.designation}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
