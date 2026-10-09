import { motion } from "framer-motion";
import SectionTitle from "@/components/SectionTitle";

export default function FlashbackSection() {
  const images = [
    "https://iili.io/KowcUtn.md.jpg",
    "https://iili.io/Kowoc2s.md.jpg",
    "https://iili.io/Kowcrns.md.jpg",
    "https://iili.io/KowGCep.md.jpg",
    "https://iili.io/KxJvPl2.md.jpg",
    "https://iili.io/CrgWdvt.jpg",
    "https://iili.io/KowGnmN.md.jpg",
    "https://iili.io/KowzCOv.md.jpg",
    "https://iili.io/KxJviSS.md.jpg",
    "https://iili.io/CrgNqrv.jpg",
  ];
  return (
    <section className="py-20 bg-[#050505] border-t border-amber-500/10 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 blur-[150px] pointer-events-none" />
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <SectionTitle
          eyebrow="Flashback"
          title="Moments Through the Years"
          subtitle="Glimpses of excellence and celebration from our journey"
        />
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {images.map((image, index) => (
            <motion.div
              key={index}
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
              className="break-inside-avoid relative rounded-2xl overflow-hidden group border border-white/5 hover:border-amber-500/30 transition-colors"
            >
              <img
                src={image}
                alt={`NTA Moment ${index + 1}`}
                className="w-full h-auto object-cover transform group-hover:scale-105 transition duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
