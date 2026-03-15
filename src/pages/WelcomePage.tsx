import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { CalendarDays, Users, Star, MessageCircle, Camera, Heart, Sun, Moon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";



import heroBanner from "../../assets/banner/hero_banner.png";
import artNight from "../../assets/highlights/art_night.jpg";
import pizzaMixer from "../../assets/highlights/pizza_mixer.png";
import summerParty from "../../assets/highlights/summer_party.png";
import sundayBrunch from "../../assets/highlights/sunday_brunch.jpg";

import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useThemeStore } from "@/store/themeStore";
import { LOGO } from "@/utils/constants";

const features = [
  { icon: CalendarDays, title: "Discover Events", description: "Browse curated local happenings based on your interests and location." },
  { icon: Heart, title: "RSVP Instantly", description: "Secure your spot with one tap and get reminders so you never miss a beat." },
  { icon: Star, title: "Review Hosts", description: "Keep the community safe and high-quality by rating your event experiences." },
  { icon: Users, title: "Connect", description: "Meet like-minded people at events and keep the conversation going online." },
  { icon: Camera, title: "Share Moments", description: "Post photos and stories from the events you attend to inspire others." },
  { icon: MessageCircle, title: "Like & Comment", description: "Engage with user-generated content and build your social following." },
];

const highlights = [
  { title: "Summer Festival", user: "@alex_vibe", image: summerParty },
  { title: "Art Night", user: "@creative_mind", image: artNight },
  { title: "Pizza Mixer", user: "@jordan_k", image: pizzaMixer },
  { title: "Sunday Brunch", user: "@foodie_life", image: sundayBrunch },
];

function getDeckCardMotion(index: number, activeIndex: number, isMobile: boolean) {
  const dist = index - activeIndex;
  const x = isMobile ? 10 : 18;
  const y = isMobile ? 12 : 22;

  if (dist < 0) return { opacity: 0, scale: 0.95, x: -24, y: -32, zIndex: 0 };
  if (dist === 0) return { opacity: 1, scale: 1, x: 0, y: 0, zIndex: 40 };
  if (dist === 1) return { opacity: 0.92, scale: 0.98, x: x, y: y, zIndex: 30 };
  if (dist === 2) return { opacity: 0.85, scale: 0.96, x: x * 2, y: y * 2, zIndex: 20 };

  return { opacity: 0, scale: 0.95, x: x * 2.5, y: y * 2.5, zIndex: 10 };
}

export default function WelcomePage() {
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  const heroRef = useRef<HTMLElement | null>(null);
  const featureDeckRef = useRef<HTMLDivElement | null>(null);
  const highlightDeckRef = useRef<HTMLDivElement | null>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const [activeHighlightIndex, setActiveHighlightIndex] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handle = () => setIsMobile(mq.matches);
    handle();
    mq.addEventListener("change", handle);
    return () => mq.removeEventListener("change", handle);
  }, []);

  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const { scrollYProgress: featureProgress } = useScroll({ target: featureDeckRef, offset: ["start center", "end end"] });
  const { scrollYProgress: highlightProgress } = useScroll({ target: highlightDeckRef, offset: ["start center", "end end"] });

  useMotionValueEvent(featureProgress, "change", v => {
    const next = Math.min(features.length - 1, Math.floor(v * features.length));
    setActiveFeatureIndex(next);
  });

  useMotionValueEvent(highlightProgress, "change", v => {
    const next = Math.min(highlights.length - 1, Math.floor(v * highlights.length));
    setActiveHighlightIndex(next);
  });

  const bannerScale = useTransform(heroProgress, [0, 0.6], [1, 0.78]);
  const bannerOpacity = useTransform(heroProgress, [0, 0.7], [1, 0]);
  const bannerY = useTransform(heroProgress, [0, 0.6], [0, -30]);

  const textOpacity = useTransform(heroProgress, [0.1, 0.55], [0, 1]);
  const textY = useTransform(heroProgress, [0.1, 0.55], [40, 0]);
  const featureDeckStep = isMobile ? 340 : 520;
  const featureDeckHeight = isMobile ? 380 : 600;
  const highlightDeckStep = isMobile ? 240 : 366;
  const highlightDeckHeight = isMobile ? 264 : 434;

  return (
    <div className="relative isolate flex min-h-screen flex-col bg-[#fff3a6] text-foreground dark:bg-black">

      {/* GLOBAL GRADIENT */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 
        bg-[radial-gradient(circle_at_20%_20%,rgba(255,240,120,0.45),transparent_35%),
            radial-gradient(circle_at_80%_25%,rgba(255,220,60,0.35),transparent_35%),
            radial-gradient(circle_at_50%_80%,rgba(255,200,20,0.25),transparent_40%)]
        dark:bg-[radial-gradient(circle_at_25%_25%,rgba(255,200,0,0.18),transparent_40%)]"
      />

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img src={LOGO} className="h-10 w-10 rounded-xl" />
            <span className="text-xl font-bold">Add <span className="text-primary">Me</span></span>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleDarkMode}>
              {isDarkMode ? <Sun /> : <Moon />}
            </button>

            <Link to="/login"><Button variant="ghost">Log in</Button></Link>
            <Link to="/signup"><Button>Sign up</Button></Link>
          </div>
        </div>
      </header>

      {/* HERO */}
<section ref={heroRef} className="relative min-h-[130vh] pt-20 overflow-hidden">

  {/* HERO IMAGE */}
  <motion.img
    src={heroBanner}
    alt="hero banner"
    className="absolute inset-0 h-full w-full object-cover -z-10"
    style={{
      scale: bannerScale,
      opacity: bannerOpacity,
      y: bannerY
    }}
  />

  {/* DARK GRADIENT FOR TEXT READABILITY */}
  <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/60 via-black/35 to-transparent" />

 {/* HERO CONTENT */}
<div className="absolute bottom-16 left-1/2 w-full max-w-5xl -translate-x-1/2 px-4 text-center">

  <motion.div style={{ opacity: textOpacity, y: textY }}>

    {/* TAG */}
    <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur">
      <span className="h-2 w-2 rounded-full bg-primary" />
      Now in your city
    </div>

    {/* TITLE */}
    <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-lg sm:text-5xl md:text-6xl lg:text-7xl">
      Find Events.{" "}
      <span className="text-primary">Meet People.</span>{" "}
      Share Moments.
    </h1>

    {/* DESCRIPTION */}
    <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90 sm:text-xl">
      Join thousands discovering local happenings and building real-world connections.
    </p>

    {/* CTA */}
    <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">

      <Link to="/signup">
        <Button size="lg" className="rounded-full px-8 py-6 text-lg font-semibold">
          Get Started Free
        </Button>
      </Link>

      <a href="#features">
        <Button variant="outline" size="lg" className="rounded-full px-8 py-6">
          Learn More
        </Button>
      </a>

    </div>

  </motion.div>
</div>
</section>

      {/* FEATURES */}
      <section id="features" className="py-28">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-4xl font-bold">Features made for <span className="text-primary">you</span></h2>

          <div
            ref={featureDeckRef}
            className="relative mx-auto mt-16 max-w-6xl"
            style={{ height: `${features.length * featureDeckStep}px` }}
          >
            <div className="sticky top-24" style={{ height: `${featureDeckHeight}px` }}>

              {features.map((f, i) => {
                const m = getDeckCardMotion(i, activeFeatureIndex, isMobile);

                return (
                  <motion.div
                    key={f.title}
                    animate={{ opacity: m.opacity, scale: m.scale, x: m.x, y: m.y }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="absolute inset-0"
                    style={{ zIndex: m.zIndex }}
                  >
                    <motion.div whileHover={{ y: -6, scale: 1.02 }} className="flex h-full flex-col justify-center rounded-[2rem] border bg-card p-8 shadow-lg sm:p-14">
                      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:h-20 sm:w-20">
                        <f.icon className="h-8 w-8 sm:h-10 sm:w-10" />
                      </div>
                      <h3 className="text-2xl font-bold sm:text-4xl">{f.title}</h3>
                      <p className="mt-3 max-w-3xl text-base text-muted-foreground sm:text-xl">{f.description}</p>
                    </motion.div>
                  </motion.div>
                );
              })}

            </div>
          </div>
        </div>
      </section>

      {/* COMMUNITY */}
      <section id="community" className="py-28">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-4xl font-bold mb-12">
            Community <span className="text-primary">Highlights</span>
          </h2>

          <div
            ref={highlightDeckRef}
            className="relative mx-auto max-w-[46rem]"
            style={{ height: `${highlights.length * highlightDeckStep}px` }}
          >
            <div className="sticky top-24" style={{ height: `${highlightDeckHeight}px` }}>

              {highlights.map((item, i) => {
                const m = getDeckCardMotion(i, activeHighlightIndex, isMobile);

                return (
                  <motion.div
                    key={item.title}
                    animate={{ opacity: m.opacity, scale: m.scale, x: m.x, y: m.y }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="absolute inset-0"
                    style={{ zIndex: m.zIndex }}
                  >
                    <motion.div whileHover={{ y: -6, scale: 1.02 }} className="relative h-full overflow-hidden rounded-[2rem] border bg-card shadow-lg">
                      <img src={item.image} className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-6 left-6 text-white sm:bottom-10 sm:left-10">
                        <h3 className="text-2xl font-bold sm:text-4xl">{item.title}</h3>
                        <p className="mt-2 text-base sm:text-xl">{item.user}</p>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}

            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="py-28 text-center">
        <h2 className="text-4xl font-bold">Ready to meet your <span className="text-primary">city</span>?</h2>
        <p className="mt-4 text-muted-foreground">
          Join the Add Me community today and start making memories.
        </p>

        <div className="mt-10">
          <Link to="/signup">
            <Button size="lg">Join Add Me — It's Free</Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
