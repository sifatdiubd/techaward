import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { z } from "zod";
import Layout from "@/components/Layout";
import { CONTACT_EMAIL, WHATSAPP_NUMBER } from "@/data/constants";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  subject: z.string().trim().max(150).optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(2000),
});

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const contactItems = [
    {
      Icon: Mail,
      title: "Email",
      value: CONTACT_EMAIL,
      href: `mailto:${CONTACT_EMAIL}`,
      color: "from-blue-500 to-cyan-600",
    },
    {
      Icon: Phone,
      title: "WhatsApp",
      value: "+88 01965848607",
      href: `https://wa.me/${WHATSAPP_NUMBER}`,
      color: "from-green-500 to-emerald-600",
    },
  ];
  return (
    <Layout>
      <div className="bg-[#050505] min-h-screen py-16 animate-fade-in">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.4em] text-amber-500/70 font-bold mb-3">
              Get in Touch
            </p>
            <h1 className="text-4xl md:text-6xl font-bold text-gradient-gold mb-4">
              <MessageCircle
                className="inline-block mr-3 mb-2 text-amber-500"
                size={44}
              />
              {" Contact Us"}
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Reach out to us for any questions or collaboration opportunities.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="grid sm:grid-cols-2 gap-4">
              {contactItems.map((contactItem, index) => {
                const Wrapper = contactItem.href ? "a" : "div";
                const linkProps = contactItem.href
                  ? {
                      href: contactItem.href,
                      target: "_blank",
                      rel: "noreferrer",
                    }
                  : {};
                return (
                  <motion.div
                    key={contactItem.title}
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
                    className={
                      contactItem.title === "Office Address"
                        ? "sm:col-span-2"
                        : ""
                    }
                  >
                    <Wrapper
                      {...linkProps}
                      className="flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-br from-[#0f0f0f] to-black border border-white/5 hover:border-amber-500/40 transition group h-full"
                    >
                      <div
                        className={`w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br ${contactItem.color} p-[2px] group-hover:rotate-6 transition`}
                      >
                        <div className="w-full h-full rounded-xl bg-black flex items-center justify-center">
                          <contactItem.Icon
                            className="text-white"
                            size={20}
                            strokeWidth={1.5}
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-widest text-amber-500/70 font-bold mb-1">
                          {contactItem.title}
                        </p>
                        <p className="text-white text-sm leading-relaxed">
                          {contactItem.value}
                        </p>
                      </div>
                    </Wrapper>
                  </motion.div>
                );
              })}
              <div className="sm:col-span-2 mt-2">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-3 w-full p-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold transition transform hover:scale-[1.02] shadow-[0_0_20px_rgba(37,211,102,0.3)]"
                >
                  <i className="fab fa-whatsapp text-xl" />
                  {" WhatsApp: 01965848607"}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
