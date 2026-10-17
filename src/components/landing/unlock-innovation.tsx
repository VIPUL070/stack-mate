"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { data } from "@/constants/innovation";

const EASING_EDITORIAL = [0.22, 1, 0.36, 1] as const;

export default function UnlockInnovation() {
  const [activeItem, setActiveItem] = useState<string>("ask");
  const prefersReduced = useReducedMotion();
 
  return (
    <section
      id="innovation"
      className="relative w-full bg-[#EEF1F6] text-[#11141A] py-20 md:py-28 lg:py-32 overflow-hidden selection:bg-[#203770] selection:text-white"
    >
      <div className="max-w-362.5 mx-auto px-5 sm:px-8 md:px-14 lg:px-24">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end mb-16 lg:mb-24">
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: EASING_EDITORIAL }}
            className="lg:col-span-7"
          >
            <h2 className="  text-[42px] sm:text-[54px] md:text-[64px] lg:text-7xl font-normal leading-[1.08] tracking-tight text-[#0C0E14]">
              <span className="block">{data.header.titleLine1}</span>
              <span className="block">{data.header.titleLine2}</span>
            </h2>
          </motion.div>
 
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.12, ease: EASING_EDITORIAL }}
            className="lg:col-span-5 lg:pl-6 pb-2"
          >
          </motion.div>
        </div>
 
  
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-20 items-start">
          
          <div className="lg:col-span-5 flex flex-col w-full">
            <div className="border-t border-[#11141A]/15" />
 
            {data.accordionItems.map((item, index) => {
              const isOpen = activeItem === item.id;
 
              return (
                <motion.div
                  key={item.id}
                  initial={prefersReduced ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.08,
                    ease: EASING_EDITORIAL,
                  }}
                  className="border-b border-[#11141A]/15"
                >
                  <button
                    type="button"
                    onClick={() => setActiveItem(item.id)}
                    aria-expanded={isOpen}
                    className="w-full text-left py-6 sm:py-8 flex items-baseline gap-4 sm:gap-6 group transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-900 focus-visible:ring-offset-4 rounded-sm"
                  >
                  
                    <span
                      className={` text-[14px] sm:text-[15px] font-normal tracking-wide transition-opacity duration-300 w-8 sm:w-12 shrink-0 ${
                        isOpen
                          ? "text-[#11141A] opacity-100"
                          : "text-[#5E6472] opacity-75 group-hover:opacity-100"
                      }`}
                    >
                      {item.number}
                    </span>
 
                    <div className="flex-1">
                      <h3
                        className={`  text-[16px] sm:text-[24px] lg:text-[32px] leading-[1.14] tracking-[-0.02em] whitespace-pre-line transition-all duration-300 ${
                          isOpen
                            ? "text-[#0F1117] opacity-100 font-normal"
                            : "text-[#20232B] opacity-70 group-hover:opacity-95 font-normal"
                        }`}
                      >
                        {item.title}
                      </h3>
                    </div>
                  </button>
 
              
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key={`content-${item.id}`}
                        initial={
                          prefersReduced
                            ? { opacity: 1, height: "auto" }
                            : { opacity: 0, height: 0 }
                        }
                        animate={{ opacity: 1, height: "auto" }}
                        exit={
                          prefersReduced
                            ? { opacity: 0, height: "auto" }
                            : { opacity: 0, height: 0 }
                        }
                        transition={{ duration: 0.45, ease: EASING_EDITORIAL }}
                        className="overflow-hidden"
                      >
                        <div className="pl-8 sm:pl-12 pb-8 sm:pb-10 pt-1 pr-2">
                          <p className="  text-[13px] sm:text-[14px] leading-[1.62] text-[#282C35] mb-5 max-w-107.5">
                            {item.content.paragraph}
                          </p>
 
                          <ul className="space-y-2   text-[16px] sm:text-[17px] text-[#282C35] pl-1">
                            {item.content.bullets.map((bullet, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2.5 leading-snug"
                              >
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#20232B] mt-2 shrink-0" />
                                <span>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
 
        
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.85, ease: EASING_EDITORIAL }}
            className="lg:col-span-7 w-full"
          >
            <div
              className="relative w-full aspect-4/3 sm:aspect-[1.35] lg:aspect-[1.45] min-h-110 sm:min-h-125 lg:min-h-145 rounded-[32px] sm:rounded-[44px] lg:rounded-[48px] overflow-hidden shadow-2xl flex items-center justify-center p-4 sm:p-8"
              style={{
                background: `
                  radial-gradient(circle at 18% 12%, rgba(205, 68, 77, 0.92) 0%, rgba(184, 58, 76, 0.65) 26%, rgba(110, 40, 95, 0.15) 52%, transparent 72%),
                  radial-gradient(circle at 82% 16%, rgba(195, 62, 78, 0.88) 0%, rgba(165, 52, 78, 0.52) 28%, rgba(68, 38, 90, 0.15) 54%, transparent 70%),
                  radial-gradient(circle at 50% 95%, rgba(20, 52, 142, 0.95) 0%, rgba(15, 36, 105, 0.7) 40%, transparent 75%),
                  radial-gradient(circle at 10% 80%, rgba(18, 48, 130, 0.8) 0%, transparent 55%),
                  radial-gradient(circle at 92% 75%, rgba(16, 42, 120, 0.85) 0%, transparent 60%),
                  linear-gradient(180deg, #1A1832 0%, #11142B 45%, #0B0E20 100%)
                `,
              }}
            >
             
              <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-20 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent" />
 
           
              <div className="relative w-full h-full max-w-205 max-h-130 flex items-center justify-center">
                <DiagramSVG />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
 

const PILL_HEIGHT = 24;
const getPillWidth = (text: string) => Math.max(76, text.length * 7.4 + 22);
 
function DiagramSVG() {
  const prefersReduced = useReducedMotion();
 
  const root = { cx: 80, cy: 260, r: 24 };
 
 
  const curve = (x1: number, y1: number, x2: number, y2: number) => {
    const mx = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
  };
 
  return (
    <svg
      viewBox="0 0 780 520"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full overflow-visible select-none"
    >
      <defs>
        <marker
          id="arrow-tree"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto"
        >
          <path
            d="M 1 2 L 6 5 L 1 8"
            stroke="white"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </marker>
      </defs>
 
      
      {data.diagram.branches.map((branch, bi) => {
        const bw = getPillWidth(branch.text);
        return (
          <g key={`edges-${branch.text}`}>
            <TreeEdge
              id={`root-${bi}`}
              d={curve(
                root.cx + root.r,
                root.cy,
                branch.x - bw / 2 - 6,
                branch.y
              )}
              delay={0.3 + bi * 0.25}
              duration={0.9}
              prefersReduced={prefersReduced}
            />
            {branch.children.map((leaf, li) => {
              const lw = getPillWidth(leaf.text);
              return (
                <TreeEdge
                  key={leaf.text}
                  id={`leaf-${bi}-${li}`}
                  d={curve(
                    branch.x + bw / 2,
                    branch.y,
                    leaf.x - lw / 2 - 6,
                    leaf.y
                  )}
                  delay={leaf.delay - 0.55}
                  duration={0.8}
                  dashed
                  prefersReduced={prefersReduced}
                />
              );
            })}
          </g>
        );
      })}
 
   
      {data.diagram.branches.map((branch, bi) => (
        <g key={`pills-${branch.text}`}>
          <DiagramPill
            text={branch.text}
            x={branch.x}
            y={branch.y}
            delay={branch.delay}
            index={bi}
            prefersReduced={prefersReduced}
          />
          {branch.children.map((leaf, li) => (
            <DiagramPill
              key={leaf.text}
              text={leaf.text}
              x={leaf.x}
              y={leaf.y}
              delay={leaf.delay}
              index={bi * 2 + li + 1}
              prefersReduced={prefersReduced}
            />
          ))}
        </g>
      ))}
 
  
      <motion.g
        initial={prefersReduced ? false : { scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{
          type: "spring",
          stiffness: 380,
          damping: 24,
          delay: 0.1,
        }}
        style={{ transformOrigin: `${root.cx}px ${root.cy}px` }}
      >
        <circle
          cx={root.cx}
          cy={root.cy}
          r={root.r}
          fill="white"
          className="drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]"
        />
        <text
          x={root.cx}
          y={root.cy + 5}
          textAnchor="middle"
          fill="#10121A"
          className="font-sans font-bold text-[14px]"
        >
          {data.diagram.root}
        </text>
      </motion.g>
    </svg>
  );
}

interface TreeEdgeProps {
  id: string;
  d: string;
  delay: number;
  duration: number;
  dashed?: boolean;
  prefersReduced: boolean | null;
}
 
function TreeEdge({
  id,
  d,
  delay,
  duration,
  dashed,
  prefersReduced,
}: TreeEdgeProps) {
  if (!dashed) {
    return (
      <motion.path
        d={d}
        stroke="white"
        strokeWidth="1.3"
        strokeOpacity="0.8"
        fill="none"
        markerEnd="url(#arrow-tree)"
        initial={prefersReduced ? false : { pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 0.8 }}
        viewport={{ once: true }}
        transition={{ duration, ease: EASING_EDITORIAL, delay }}
      />
    );
  }
 
  const maskId = `edge-mask-${id}`;
  return (
    <>
      <mask id={maskId}>
        <motion.path
          d={d}
          fill="none"
          stroke="white"
          strokeWidth="12"
          strokeLinecap="round"
          initial={prefersReduced ? { pathLength: 1 } : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{
            duration: prefersReduced ? 0 : duration,
            ease: "easeInOut",
            delay,
          }}
        />
      </mask>
      <path
        d={d}
        fill="none"
        stroke="white"
        strokeWidth="1.2"
        strokeDasharray="3 4"
        strokeOpacity="0.75"
        mask={`url(#${maskId})`}
        markerEnd="url(#arrow-tree)"
      />
    </>
  );
}
 

interface DiagramPillProps {
  text: string;
  x: number;
  y: number;
  delay: number;
  index: number;
  prefersReduced: boolean | null;
}
 
function DiagramPill({
  text,
  x,
  y,
  delay,
  index,
  prefersReduced,
}: DiagramPillProps) {
  const pillWidth = getPillWidth(text);
  const pillHeight = PILL_HEIGHT;
 
  return (
    <motion.g
      initial={prefersReduced ? false : { opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.5,
        delay,
        ease: EASING_EDITORIAL,
      }}
      style={{ transformOrigin: `${x}px ${y}px` }}
    >

      <motion.g
        animate={
          prefersReduced
            ? undefined
            : {
                y: [0, index % 2 === 0 ? -3.5 : 3.5, 0],
              }
        }
        transition={{
          duration: 4.5 + index * 0.6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <rect
          x={x - pillWidth / 2}
          y={y - pillHeight / 2}
          width={pillWidth}
          height={pillHeight}
          rx={pillHeight / 2}
          fill="rgba(14, 18, 36, 0.45)"
          stroke="rgba(255, 255, 255, 0.38)"
          strokeWidth="1"
          className="backdrop-blur-[2px]"
        />
 
        <text
          x={x}
          y={y + 3.8}
          textAnchor="middle"
          fill="rgba(255, 255, 255, 0.72)"
          className="  text-[11px] font-normal tracking-wider"
        >
          {text}
        </text>
      </motion.g>
    </motion.g>
  );
}