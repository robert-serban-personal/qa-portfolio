'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  SiSelenium,
  SiCypress,
  SiPython,
  SiJavascript,
  SiTypescript,
  SiJenkins,
  SiDocker,
  SiGit,
  SiPostman,
  SiJira,
  SiPytest,
  SiGithubactions,
  SiTestinglibrary,
  SiTestng,
} from 'react-icons/si';
import { DiJava } from 'react-icons/di';
import { VscJson, VscCode } from 'react-icons/vsc';

const skillCategories = [
  {
    name: 'Test Automation Frameworks',
    skills: [
      { name: 'Selenium', icon: SiSelenium, color: '#43B02A' },
      { name: 'Cypress', icon: SiCypress, color: '#17202C' },
      { name: 'Playwright', icon: VscCode, color: '#2EAD33' },
      { name: 'Pytest', icon: SiPytest, color: '#0A9EDC' },
      { name: 'TestNG', icon: SiTestng, color: '#FF6C37' },
      { name: 'Testing Library', icon: SiTestinglibrary, color: '#E33332' },
    ],
  },
  {
    name: 'Programming Languages',
    skills: [
      { name: 'Python', icon: SiPython, color: '#3776AB' },
      { name: 'JavaScript', icon: SiJavascript, color: '#F7DF1E' },
      { name: 'TypeScript', icon: SiTypescript, color: '#3178C6' },
      { name: 'Java', icon: DiJava, color: '#007396' },
    ],
  },
  {
    name: 'DevOps & CI/CD',
    skills: [
      { name: 'Jenkins', icon: SiJenkins, color: '#D24939' },
      { name: 'GitHub Actions', icon: SiGithubactions, color: '#2088FF' },
      { name: 'Docker', icon: SiDocker, color: '#2496ED' },
      { name: 'Git', icon: SiGit, color: '#F05032' },
    ],
  },
  {
    name: 'Testing Tools & Platforms',
    skills: [
      { name: 'Postman', icon: SiPostman, color: '#FF6C37' },
      { name: 'Jira', icon: SiJira, color: '#0052CC' },
      { name: 'REST API', icon: VscJson, color: '#10B981' },
    ],
  },
];

export default function Skills() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      id="skills"
      ref={ref}
      className="relative py-24 md:py-32 bg-gradient-to-b from-slate-900 to-slate-800 overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Technical <span className="text-emerald-400">Skills</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-emerald-400 to-cyan-400 mx-auto rounded-full" />
          <p className="text-slate-400 text-lg mt-6 max-w-2xl mx-auto">
            Proficient in modern testing frameworks, automation tools, and
            quality engineering practices
          </p>
        </motion.div>

        <div className="space-y-12">
          {skillCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: categoryIndex * 0.2 }}
            >
              <h3 className="text-2xl font-semibold text-white mb-6 text-center md:text-left">
                {category.name}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {category.skills.map((skill, skillIndex) => {
                  const Icon = skill.icon;
                  return (
                    <motion.div
                      key={skill.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={isInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{
                        duration: 0.4,
                        delay: categoryIndex * 0.2 + skillIndex * 0.1,
                      }}
                      whileHover={{ scale: 1.1, y: -5 }}
                      className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:border-emerald-400/50 transition-all duration-300 cursor-pointer"
                    >
                      {/* Glow effect on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 to-cyan-500/0 group-hover:from-emerald-500/10 group-hover:to-cyan-500/10 rounded-xl transition-all duration-300" />

                      <Icon
                        className="w-12 h-12 transition-all duration-300"
                        style={{ color: skill.color }}
                      />
                      <span className="text-slate-300 text-sm font-medium text-center group-hover:text-white transition-colors">
                        {skill.name}
                      </span>

                      {/* Animated border on hover */}
                      <motion.div
                        className="absolute inset-0 rounded-xl border-2 border-emerald-400/0 group-hover:border-emerald-400/50"
                        initial={false}
                        animate={{
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional stats section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { label: 'Years Experience', value: '5+' },
            { label: 'Projects Completed', value: '50+' },
            { label: 'Tests Automated', value: '1000+' },
            { label: 'Quality Metrics Improved', value: '90%' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: 1 + index * 0.1 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-center hover:border-emerald-400/50 transition-all duration-300"
            >
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-slate-400 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
