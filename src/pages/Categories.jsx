import { useState } from "react";
import { motion } from "framer-motion";
import {
  Award,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Crown,
  Laptop,
  Search,
  Sparkles,
  Target,
  Video,
} from "lucide-react";
import Layout from "@/components/Layout";
import { CATEGORIES, CATEGORY_META } from "@/data/constants";

const CATEGORY_ICONS = {
  freelancer: Laptop,
  business: Briefcase,
  corporate: Crown,
  women: Sparkles,
  content: Video,
};

const SUBS_PREVIEW_COUNT = 12;

export default function Categories() {
  const [search, setSearch] = useState("");
  const filtered = Object.entries(CATEGORIES).filter(([key, value]) => {
    if (!search) {
      return true;
    }
    const lower = search.toLowerCase();
    return !!(
      key.toLowerCase().includes(lower) ||
      value.subs.some((item) => item.toLowerCase().includes(lower)) ||
      value.target.toLowerCase().includes(lower) ||
      value.why.toLowerCase().includes(lower)
    );
  });
  return (
    <Layout>
      <div className="bg-[#050505] min-h-screen py-16 animate-fade-in">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.4em] text-amber-500/70 font-bold mb-3">
              {"Award Categories & Eligibility"}
            </p>
            <h1 className="text-4xl md:text-6xl font-bold text-gradient-gold mb-4">
              <Award
                className="inline-block mr-3 mb-2 text-amber-500"
                size={48}
              />
              {" Award Categories"}
            </h1>
            <p className="text-gray-400 max-w-3xl mx-auto leading-relaxed mb-8">
              Choose the right category based on your skills, achievements and
              contribution, and submit your application.
            </p>
            <div className="max-w-2xl mx-auto relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-amber-500">
                <Search size={20} />
              </div>
              <input
                type="text"
                placeholder="Search by your profession, skills, or category (e.g. Video Editor, CEO)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-black/40 border border-amber-500/30 focus:border-amber-500 rounded-full py-4 pl-12 pr-6 text-white outline-none transition shadow-[0_0_15px_rgba(245,158,11,0.1)] focus:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
              />
            </div>
          </div>
          <div className="space-y-8">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Search size={48} className="mx-auto mb-4 opacity-20" />
                <p>
                  {'No categories found for "'}
                  {search}
                  {'". Try a different keyword.'}
                </p>
              </div>
            ) : (
              filtered.map(([name, category], index) => {
                const a = CATEGORY_ICONS[category.iconKey] || Award;
                const meta = CATEGORY_META[name] || {
                  emoji: "⚪",
                  color: "from-gray-500/20 to-gray-900/10",
                  dot: "bg-gray-500",
                };
                return (
                  <CategoryCard
                    key={name}
                    catKey={name}
                    data={category}
                    idx={index}
                    Icon={a}
                    meta={meta}
                    searchQuery={search}
                  />
                );
              })
            )}
          </div>
          <div className="mt-16 rounded-3xl bg-gradient-to-br from-amber-900/20 via-black to-black border border-amber-500/30 p-8 md:p-10 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-gradient-gold mb-6">
              Selection Criteria
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {["Performance", "Impact", "Creativity", "Contribution"].map(
                (item) => (
                  <div
                    key={item}
                    className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-amber-400 font-bold"
                  >
                    {item}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function CategoryCard({ catKey, data, idx, Icon, meta, searchQuery }) {
  const [expanded, setExpanded] = useState(false);
  const isSearching = !!searchQuery;
  const visibleSubs =
    expanded || isSearching
      ? data.subs
      : data.subs.slice(0, SUBS_PREVIEW_COUNT);
  const canExpand = data.subs.length > SUBS_PREVIEW_COUNT && !isSearching;
  return (
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
      transition={{
        delay: idx * 0.05,
      }}
      className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${meta.color} border border-white/5 hover:border-amber-500/30 transition-all duration-500 group shadow-lg`}
    >
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.03),transparent_50%)] pointer-events-none" />
      <div className="grid lg:grid-cols-12 gap-0 relative">
        <div className="lg:col-span-5 p-8 md:p-10 border-b lg:border-b-0 lg:border-r border-white/5 bg-black/20 backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-900/40 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
              <Icon className="text-amber-400" size={32} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold mb-1">
                Category 0{idx + 1}
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
                {catKey}
              </h2>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-white/[0.02] hover:bg-white/[0.04] transition rounded-2xl p-5 border border-white/5">
              <p className="text-xs uppercase tracking-widest text-amber-500/80 font-bold mb-2 flex items-center gap-2">
                <Target size={14} />
                {" Who Can Apply?"}
              </p>
              <p className="text-sm text-gray-300 leading-relaxed">
                {data.target}
              </p>
            </div>
            <div className="bg-white/[0.02] hover:bg-white/[0.04] transition rounded-2xl p-5 border border-white/5">
              <p className="text-xs uppercase tracking-widest text-amber-500/80 font-bold mb-2 flex items-center gap-2">
                <Award size={14} />
                {" Why Apply?"}
              </p>
              <p className="text-sm text-gray-300 leading-relaxed">
                {data.why}
              </p>
            </div>
          </div>
        </div>
        <div className="lg:col-span-7 p-8 md:p-10 bg-black/40">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <span className="text-amber-500 font-bold text-sm">
                  {data.subs.length}
                </span>
              </div>
              <h3 className="text-sm uppercase tracking-widest text-gray-400 font-bold">
                Sub-Categories
              </h3>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {visibleSubs.map((visibleSub, index) => {
              const h =
                searchQuery &&
                visibleSub.toLowerCase().includes(searchQuery.toLowerCase());
              return (
                <motion.div
                  key={visibleSub}
                  initial={{
                    opacity: 0,
                    x: -10,
                  }}
                  whileInView={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay: index * 0.02,
                  }}
                  className={`relative overflow-hidden p-4 rounded-xl transition-all group/sub cursor-default border ${h ? "bg-amber-500/20 border-amber-500/50" : "bg-gradient-to-r from-white/[0.03] to-transparent border-white/5 hover:border-amber-500/40 hover:from-amber-500/10"}`}
                >
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 transition-colors ${h ? "bg-amber-400" : "bg-amber-500/20 group-hover/sub:bg-amber-400"}`}
                  />
                  <span
                    className={`text-sm font-medium transition-colors relative z-10 block pl-2 ${h ? "text-amber-300" : "text-gray-300 group-hover/sub:text-amber-300"}`}
                  >
                    {visibleSub}
                  </span>
                </motion.div>
              );
            })}
          </div>
          {canExpand && (
            <div className="text-center md:text-left">
              <button
                onClick={() => setExpanded(!expanded)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/30 text-amber-400 text-sm font-bold transition group/btn"
              >
                {expanded ? (
                  <>
                    <ChevronUp
                      size={16}
                      className="group-hover/btn:-translate-y-0.5 transition"
                    />
                    {" Show Less Sub-Categories"}
                  </>
                ) : (
                  <>
                    <ChevronDown
                      size={16}
                      className="group-hover/btn:translate-y-0.5 transition"
                    />
                    {" View All "}
                    {data.subs.length}
                    {" Sub-Categories"}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
