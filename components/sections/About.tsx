'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { HiCheckCircle } from 'react-icons/hi';

const highlights = [
  'Self-taught Automation Engineer with 5+ years of experience',
  'Expert in Selenium and Playwright test automation frameworks',
  'Strong API testing experience across multiple industries',
  'Proficient in Python and JavaScript programming',
  'Experience in Media, Financial, and Gaming industries',
  'Passionate about quality-driven development and continuous learning',
];

export default function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      id="about"
      ref={ref}
      className="relative py-24 md:py-32 bg-slate-900 overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            About <span className="text-emerald-400">Me</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-emerald-400 to-cyan-400 mx-auto rounded-full" />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Image placeholder */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 backdrop-blur-sm border border-emerald-500/20">
              {/* Professional photo */}
              <img 
                src="/robert-serban-photo.jpg" 
                alt="Robert Serban - Senior QA Engineer"
                className="w-full h-full object-cover object-center"
              />

              {/* Decorative elements */}
              <motion.div
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute -top-4 -right-4 w-24 h-24 border-4 border-emerald-400/30 rounded-full"
              />
              <motion.div
                animate={{
                  rotate: [360, 0],
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute -bottom-4 -left-4 w-32 h-32 border-4 border-cyan-400/30 rounded-full"
              />
            </div>
          </motion.div>

          {/* Right side - Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
              Robert Serban - Self-Taught Automation Engineer
            </h3>
            <div className="space-y-4 text-slate-300 text-lg leading-relaxed mb-8">
              <p>
                As a self-taught Automation Engineer, I've built my expertise through 
                hands-on experience and continuous learning. With over 5 years of 
                experience in software testing and automation, I specialize in creating 
                robust test automation solutions using Selenium and Playwright frameworks.
              </p>
              <p>
                My journey spans across diverse industries including Media, Financial, 
                and Gaming sectors, where I've developed strong API testing capabilities 
                and automated testing strategies. I'm passionate about leveraging Python 
                and JavaScript to build efficient automation frameworks that ensure 
                software quality and reliability.
              </p>
            </div>

            {/* Highlights */}
            <div className="space-y-3">
              {highlights.map((highlight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <HiCheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">{highlight}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
