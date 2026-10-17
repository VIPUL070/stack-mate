'use client'
import { features } from "@/constants/platform";
import { Container } from "../ui/container";
import { motion } from "motion/react";
import { fadeUp, viewport } from "@/lib/motion";

const Platform = () => {
  return (
    <section
      id="platform"
      className="border-b border-line bg-paper py-24 sm:py-32"
    >
      <Container>
        <div className="mb-12 flex items-end justify-between gap-8">
          <div>
            <p className="eyebrow mb-4">Built for teams</p>
            <h2 className="display-type max-w-2xl text-5xl leading-[0.92] text-ink sm:text-7xl">
              A shared memory for your codebase.
            </h2>
          </div>
          <p className="hidden max-w-xs text-sm leading-6 text-mist md:block">
            One system for catching up on commits, asking questions about your
            code, and turning meetings into issues.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.article
                key={feature.label}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={viewport}
                transition={{ delay: index * 0.08 }}
                className="group overflow-hidden rounded-[1.4rem] border border-line bg-cloud"
              >
                <div className="relative aspect-[1.04] overflow-hidden bg-[#cbd8d7]">
                  <img
                    src={feature.imgUrl}
                    alt={`StackMate: ${feature.label}`}
                    className="h-full w-full object-contain transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-ink/20 to-transparent" />
                  <div className="absolute bottom-5 left-5 grid size-11 place-items-center rounded-full bg-paper text-ink shadow-soft">
                    <Icon aria-hidden="true" className="size-5" />
                  </div>
                </div>
                <div className="p-6 sm:p-7">
                  <h3 className="text-xl font-medium tracking-tight text-ink">
                    {feature.label}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-mist">
                    {feature.text}
                  </p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </Container>
    </section>
  );
};

export default Platform;