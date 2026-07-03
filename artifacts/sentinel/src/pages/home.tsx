import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-foreground selection:bg-primary/30">
      <header className="fixed top-0 w-full border-b border-white/5 bg-[#0a0a0b]/80 backdrop-blur-md z-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Sentinel Logo" className="h-8 w-8" />
            <span className="font-light tracking-widest text-lg uppercase text-white">Sentinel</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/sign-up" className="inline-flex h-9 items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-white/90">
              Request Access
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center text-center mt-20 mb-32">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-8"
            >
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              Secure Intel Systems Online
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="max-w-4xl text-5xl font-light tracking-tight sm:text-7xl mb-6 text-white"
            >
              Every day begins with <span className="font-medium text-white/90">intelligence.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="max-w-2xl text-lg text-muted-foreground mb-10 font-light leading-relaxed"
            >
              Your daily executive briefing. One signal, no noise.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="flex items-center gap-4"
            >
              <Link href="/sign-up" className="inline-flex h-12 items-center justify-center rounded-md bg-white px-8 text-sm font-medium text-black transition-colors hover:bg-white/90">
                Initialize Instance
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
            {[
              {
                title: "Daily Briefings",
                description: "Wake up to a synthesized overview of your priorities, meetings, and critical intelligence.",
              },
              {
                title: "Deep Analytics",
                description: "Track focus hours, deep work, and operational tempo across your entire toolchain.",
              },
              {
                title: "AI Analyst",
                description: "Converse with a dedicated intelligence agent trained on your live data context.",
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="rounded-2xl border border-white/5 bg-[#16161A] p-8"
              >
                <div className="h-10 w-10 rounded-full border border-primary/20 bg-primary/10 flex items-center justify-center mb-6">
                  <div className="h-4 w-4 bg-primary rounded-sm"></div>
                </div>
                <h3 className="text-xl font-medium text-white mb-3">{feature.title}</h3>
                <p className="text-muted-foreground font-light leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      
      <footer className="border-t border-white/5 bg-[#0a0a0b] py-12">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <img src="/logo.svg" alt="Sentinel Logo" className="h-6 w-6 grayscale opacity-50" />
            <span className="text-sm font-light uppercase tracking-widest">Sentinel EIS</span>
          </div>
          <p className="text-sm text-muted-foreground/50 font-light">Classified Systems © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}