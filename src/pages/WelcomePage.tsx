import { motion, useScroll, useTransform } from "framer-motion";
import { CalendarDays, Users, Star, MessageCircle, Camera, Heart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";



import heroBanner from "../../assets/banner/hero_banner.png";
import artNight from "../../assets/highlights/art_night.jpg";
import pizzaMixer from "../../assets/highlights/pizza_mixer.png";
import summerParty from "../../assets/highlights/summer_party.png";
import sundayBrunch from "../../assets/highlights/sunday_brunch.jpg";

import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { LOGO } from "@/utils/constants";
import ScrollStack, { ScrollStackItem } from "@/components/ScrollStack";
import BlurText from "@/components/BlurText";
import Folder from "@/components/Folder";

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


export default function WelcomePage() {
  const heroRef = useRef<HTMLElement | null>(null);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handle = () => setIsMobile(mq.matches);
    handle();
    mq.addEventListener("change", handle);
    return () => mq.removeEventListener("change", handle);
  }, []);

  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });

  const bannerScale = useTransform(heroProgress, [0, 0.6], [1, 0.78]);
  const bannerOpacity = useTransform(heroProgress, [0, 0.7], [1, 0]);
  const bannerY = useTransform(heroProgress, [0, 0.6], [0, -30]);


  return (
    <div className="relative isolate flex min-h-screen flex-col bg-[var(--color-bg-main)] text-[var(--color-text-primary)]">

      {/* GLOBAL GRADIENT */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10
        bg-[radial-gradient(circle_at_20%_20%,rgba(30,215,96,0.12),transparent_35%),
            radial-gradient(circle_at_80%_25%,rgba(30,215,96,0.07),transparent_35%),
            radial-gradient(circle_at_50%_80%,rgba(30,215,96,0.05),transparent_40%)]"
      />

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-main)]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img src={LOGO} className="h-10 w-10 rounded-xl" />
            <span className="text-xl font-bold">Add <span className="text-[var(--color-spotify-green)]">Me</span></span>
          </div>

          <div className="flex items-center gap-3">
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

          <div>

            {/* TAG */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[var(--color-spotify-green)]" />
              Now in your city
            </div>

            {/* TITLE */}
            <h1 className="text-7xl font-extrabold tracking-tight text-white drop-shadow-lg sm:text-8xl md:text-[7.5rem] lg:text-[9rem] justify-center leading-none">
              <BlurText
                text="Find Events. Meet People. Share Moments."
                delay={90}
                animateBy="words"
                direction="bottom"
                className="text-7xl font-extrabold tracking-tight text-white drop-shadow-lg sm:text-8xl md:text-[7.5rem] lg:text-[9rem] justify-center leading-none"
              />
            </h1>

            {/* DESCRIPTION */}
            <div className="mx-auto mt-6 max-w-2xl">
              <BlurText
                text="Join thousands discovering local happenings and building real-world connections."
                delay={55}
                animateBy="words"
                direction="bottom"
                className="text-lg text-white/90 sm:text-xl justify-center"
              />
            </div>

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

          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-28">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-4xl font-bold">Features made for <span className="text-[var(--color-spotify-green)]">you</span></h2>

          <div className="mx-auto mt-16 max-w-4xl text-left relative z-20">
            <ScrollStack
              itemDistance={isMobile ? 120 : 180}
              baseScale={0.9}
              itemScale={0.03}
            >
              {features.map((f) => (
                <ScrollStackItem
                  key={f.title}
                  itemClassName="border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-card-hover)] flex flex-col justify-center p-8 md:p-12 shadow-xl transition-colors duration-300 rounded-[2rem] h-64 md:h-72"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-spotify-green)]/15 text-[var(--color-spotify-green)] shrink-0">
                      <f.icon className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-extrabold tracking-tight md:text-3xl">{f.title}</h3>
                      <p className="text-[var(--color-text-secondary)] text-sm md:text-base max-w-2xl leading-relaxed">{f.description}</p>
                    </div>
                  </div>
                </ScrollStackItem>
              ))}
            </ScrollStack>
          </div>
        </div>
      </section>

      {/* COMMUNITY */}
      <section id="community" className="py-28">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col md:flex-row items-start gap-16">

            {/* Folder — pinned left */}
            <div className="flex flex-col items-start pl-4 md:pl-32 shrink-0" style={{ minHeight: '320px' }}>
              <Folder
                color="#1ED760"
                size={isMobile ? 2.4 : 3.5}
                items={highlights.map((item) => (
                  <div key={item.title} className="relative w-full h-full">
                    <img src={item.image} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
                      <p className="text-white text-[8px] font-bold leading-tight truncate">{item.title}</p>
                      <p className="text-white/70 text-[6px] truncate">{item.user}</p>
                    </div>
                  </div>
                ))}
              />
              <p className="mt-32 text-sm text-[var(--color-text-secondary)] font-medium pl-2">
                {highlights.length} community moments inside
              </p>
            </div>

            {/* Text — right side */}
            <div className="flex flex-col justify-center py-8">
              <h2 className="text-4xl font-bold mb-4 text-left">
                Community <span className="text-[var(--color-spotify-green)]">Highlights</span>
              </h2>
              <p className="text-[var(--color-text-secondary)] text-base text-left">Click the folder to reveal community moments.</p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="py-28 text-center">
        <h2 className="text-4xl font-bold justify-center">
          <BlurText
            text="Ready to meet your city?"
            delay={100}
            animateBy="words"
            direction="bottom"
            className="text-4xl font-bold justify-center"
          />
        </h2>
        <div className="mt-4">
          <BlurText
            text="Join the Add Me community today and start making memories."
            delay={60}
            animateBy="words"
            direction="bottom"
            className="text-base text-[var(--color-text-secondary)] justify-center"
          />
        </div>

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
