"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Play } from "lucide-react";
import { Container } from "@/components/ui/container";
import { fadeUp, stagger, viewport } from "@/lib/motion";
import Image from "next/image";

import { Layers, ShieldCheck, Rocket, LogIn, HelpCircle } from "lucide-react";

export const navItems = [
  {
    label: "Platform",
    href: "/platform",
    icon: <Layers size={20} className="text-zinc-800" />,
  },
  {
    label: "Proof",
    href: "/proof",
    icon: <ShieldCheck size={20} className="text-zinc-800" />,
  },
  {
    label: "Get Started",
    href: "/get-started",
    icon: <Rocket size={20} className="text-zinc-800" />,
  },
  {
    label: "Sign In",
    href: "/sign-in",
    icon: <LogIn size={20} className="text-zinc-800" />,
  },
  {
    label: "FAQ",
    href: "/faq",
    icon: <HelpCircle size={20} className="text-zinc-800" />,
  },
];

export function Hero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden border-b border-line bg-cloud bg-[url('/landing.jpg')] bg-cover bg-center bg-no-repeat min-h-screen"
    >
      <Container className="relative pt-32 sm:pt-28 lg:pt-32">

        <motion.div
          id="top"
          className="mx-auto flex max-w-5xl flex-col items-center pb-12 pt-20 text-center sm:pb-16 sm:pt-28 lg:pt-36"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <motion.p variants={fadeUp} className="eyebrow mb-6">
            Content intelligence, made human
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="display-type max-w-4xl text-[clamp(3.7rem,9vw,8.6rem)] leading-[0.86] text-ink"
          >
            Make every commit
            <br />
            <span className="italic">findable.</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mt-8 max-w-xl text-base leading-7 text-mist sm:text-lg"
          >
            Turn the questions your audience is already asking into clear,
            credible content that shows up everywhere it matters.
          </motion.p>
          <motion.div
            variants={fadeUp}
            className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-paper px-6 py-3.5 text-sm font-medium text-ink transition-colors hover:bg-cloud"
            >
              <Play aria-hidden="true" className="size-4 fill-current" /> See
              how it works
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="relative mx-auto max-w-6xl pb-20 sm:pb-28"
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="overflow-hidden rounded-[1.5rem] border border-ink/15 bg-ink p-1.5 shadow-float sm:rounded-[2rem] sm:p-2">
            <div className="flex h-9 items-center gap-1.5 rounded-t-[1.1rem] bg-[#151515] px-4 sm:h-11 sm:rounded-t-[1.5rem] sm:px-5">
              <span className="size-2.5 rounded-full bg-[#ff6257]" />
              <span className="size-2.5 rounded-full bg-[#ffbd2e]" />
              <span className="size-2.5 rounded-full bg-[#28c840]" />
              <div className="mx-auto hidden h-5 w-1/2 items-center justify-center rounded-full bg-white/5 text-[10px] text-white/40 sm:flex">
                StackMate
              </div>
            </div>
            <Image
              src="/dashboard.png"
              width={1790}
              height={1008}
              alt="intelligence dashboard"
              quality={100}
              priority
              sizes="(min-width: 1280px) 1152px, 100vw"
              className="block h-auto w-full rounded-b-[1rem] object-cover object-top sm:rounded-b-[1.4rem]"
            />
          </div>
        </motion.div>
      </Container>
    </section>
  );
}