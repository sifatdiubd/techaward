import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { motion } from "framer-motion";
import { Award, Eye, Info, Target } from "lucide-react";
import FlashbackSection from "@/components/FlashbackSection";
import Layout from "@/components/Layout";
import { WINNER_PRIZE_IMAGES } from "@/data/constants";
import { db } from "@/lib/firebase";

const DEFAULT_ABOUT = {
  title: "About Us",
  body: `National Tech Award (NTA), organized by One Way School, is a prestigious annual celebration honouring the best achievements in Bangladesh's technology and innovation ecosystem. From technology and startups to freelancing, digital content, and EdTech — we recognize those who bring innovation, skill, and impact.

Since launching in 2023, NTA has quickly become one of the country's most popular and trusted tech platforms. We are now in our 4th season, where young innovators, freelancers, entrepreneurs, and tech professionals from across the country come together to showcase their work.

National Tech Award is more than an award programme — it is a complete tech-carnival experience. We host innovation and entrepreneurship sessions, career guidance, investment and startup discussions, live networking, and interactive activities — creating new opportunities for every participant.

The entire selection journey runs through a structured and transparent system: nomination, documentation, public voting, and jury board evaluation together determine the final winners. This ensures fairness, quality, and recognition of true talent.

Our goal is not only to reward the best — but to push Bangladesh's tech sector forward, inspire the next generation, and bring local talent to the international stage.`,
  mission:
    "Recognise Bangladesh's tech talent and inspire the next generation.",
  vision: "Bring local talent to the global stage.",
};

function useAboutContent() {
  const [about, setAbout] = useState(DEFAULT_ABOUT);
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "settings", "about"), (snap) => {
      if (snap.exists()) {
        setAbout({
          ...DEFAULT_ABOUT,
          ...snap.data(),
        });
      }
    });
    return () => unsubscribe();
  }, []);
  return about;
}

export default function About() {
  const about = useAboutContent();
  const paragraphs = about.body.split(/\n\n+/);
  return (
    <Layout>
      <div className="bg-[#050505] min-h-screen py-16 animate-fade-in">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="text-center mb-14"
          >
            <p className="text-xs uppercase tracking-[0.4em] text-amber-500/70 font-bold mb-3">
              About Us
            </p>
            <h1 className="text-4xl md:text-6xl font-bold text-gradient-gold mb-4">
              <Info
                className="inline-block mr-3 mb-2 text-amber-500"
                size={44}
              />{" "}
              {about.title}
            </h1>
          </motion.div>
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.1,
            }}
            className="bg-gradient-to-br from-[#0f0f0f] to-[#050505] border border-white/5 rounded-3xl p-8 md:p-12 mb-10 relative overflow-hidden"
          >
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
            <div className="grid md:grid-cols-3 gap-8 relative items-center">
              <div className="md:col-span-2 space-y-5 text-gray-300 leading-relaxed text-base md:text-lg">
                {paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              <div className="flex justify-center md:justify-end">
                <div className="relative group">
                  <div className="absolute -inset-6 bg-gradient-to-br from-amber-500/30 via-amber-700/20 to-transparent blur-3xl rounded-full" />
                  <div className="relative p-[3px] rounded-[2rem] bg-gradient-to-br from-amber-300 via-amber-600 to-amber-900 shadow-[0_25px_60px_-15px_rgba(245,158,11,0.55)]">
                    <div className="rounded-[1.85rem] bg-gradient-to-br from-[#1a1208] via-black to-[#0a0604] p-6 relative overflow-hidden">
                      <span className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-amber-400/60 rounded-tl-2xl" />
                      <span className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-amber-400/60 rounded-tr-2xl" />
                      <span className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-amber-400/60 rounded-bl-2xl" />
                      <span className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-amber-400/60 rounded-br-2xl" />
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.18),transparent_65%)]" />
                      <img
                        src={WINNER_PRIZE_IMAGES.trophy}
                        alt="National Tech Award Crest"
                        className="relative max-w-[260px] w-full h-auto object-contain drop-shadow-[0_15px_30px_rgba(245,158,11,0.5)] group-hover:scale-105 transition duration-700"
                      />
                    </div>
                  </div>
                  <div className="relative mt-4 text-center">
                    <p className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] uppercase tracking-[0.3em] font-bold">
                      The Official Crest
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{
                opacity: 0,
                x: -20,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
              }}
              className="relative rounded-2xl bg-gradient-to-br from-amber-900/20 via-black to-black border border-amber-500/30 p-8 group hover:-translate-y-1 transition"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-700 p-[2px] mb-5 group-hover:rotate-6 transition">
                <div className="w-full h-full rounded-2xl bg-black flex items-center justify-center">
                  <Target
                    className="text-amber-400"
                    size={26}
                    strokeWidth={1.5}
                  />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Our Mission</h3>
              <p className="text-gray-300 leading-relaxed">{about.mission}</p>
            </motion.div>
            <motion.div
              initial={{
                opacity: 0,
                x: 20,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
              }}
              className="relative rounded-2xl bg-gradient-to-br from-blue-900/20 via-black to-black border border-blue-500/30 p-8 group hover:-translate-y-1 transition"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-700 p-[2px] mb-5 group-hover:rotate-6 transition">
                <div className="w-full h-full rounded-2xl bg-black flex items-center justify-center">
                  <Eye className="text-blue-400" size={26} strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Our Vision</h3>
              <p className="text-gray-300 leading-relaxed">{about.vision}</p>
            </motion.div>
          </div>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
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
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: index * 0.1,
                }}
                viewport={{
                  once: true,
                }}
                className="text-center p-6 rounded-2xl bg-white/[0.03] border border-white/10"
              >
                <Award className="text-amber-500 mx-auto mb-2" size={20} />
                <div className="font-['Oswald'] text-3xl md:text-4xl font-bold text-gradient-gold">
                  {item.num}
                </div>
                <div className="text-xs uppercase tracking-widest text-gray-500 mt-1">
                  {item.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <FlashbackSection />
    </Layout>
  );
}
