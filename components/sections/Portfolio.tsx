'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { HiExternalLink, HiCode } from 'react-icons/hi';
import { SiGithub } from 'react-icons/si';

const projects = [
  {
    title: 'Playwright JavaScript Automation Framework',
    description:
      'Built comprehensive end-to-end testing framework using Playwright and JavaScript. Implemented automated test cases covering user journeys, cross-browser testing, and API validation with detailed reporting and CI/CD integration.',
    technologies: ['Playwright', 'JavaScript', 'GitHub Actions', 'Postman'],
    githubUrl: 'https://github.com/robertserban/playwright-automation',
    liveUrl: '#',
    image: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    title: 'Tickets App Testing Framework',
    description:
      'Comprehensive automated testing framework with 88+ tests covering API, Database, UI, E2E, and Smoke testing. Features Page Object Model pattern, auto-cleanup, detailed HTML reporting, boundary value analysis, state transition testing, and security validation. Includes pytest-based test suites with PostgreSQL integration.',
    technologies: ['Python', 'Selenium', 'pytest', 'PostgreSQL', 'pytest-html', 'requests'],
    githubUrl: 'https://github.com/robert-serban-personal/tickets-testing-framework',
    liveUrl: '#',
    image: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
];

export default function Portfolio() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      id="portfolio"
      ref={ref}
      className="relative py-24 md:py-32 bg-slate-900 overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Featured <span className="text-emerald-400">Projects</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-emerald-400 to-cyan-400 mx-auto rounded-full" />
          <p className="text-slate-400 text-lg mt-6 max-w-2xl mx-auto">
            Explore my automation testing projects and frameworks that ensure
            quality and reliability
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl overflow-hidden hover:border-emerald-400/50 transition-all duration-300"
            >
              {/* Project image/gradient */}
              <div
                className="h-48 relative overflow-hidden"
                style={{ background: project.image }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-slate-800 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <HiCode className="w-20 h-20 text-white/80 group-hover:scale-110 transition-transform" />
                </div>
              </div>

              {/* Project content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                  {project.title}
                </h3>
                <p className="text-slate-400 text-sm mb-4 line-clamp-3">
                  {project.description}
                </p>

                {/* Technologies */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-slate-700/50 text-emerald-400 text-xs rounded-full border border-emerald-400/30"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Links */}
                <div className="flex gap-4">
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all duration-300 text-sm font-medium"
                  >
                    <SiGithub className="w-4 h-4" />
                    Code
                  </a>
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-all duration-300 text-sm font-medium border border-emerald-400/30"
                  >
                    <HiExternalLink className="w-4 h-4" />
                    Details
                  </a>
                </div>
              </div>

              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </motion.div>
          ))}
        </div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-slate-400 mb-6">
            Want to see more of my work? Check out my GitHub profile
          </p>
          <a
            href="https://github.com/robertserban"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-full font-semibold hover:shadow-xl hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105"
          >
            <SiGithub className="w-5 h-5" />
            Visit GitHub
          </a>
        </motion.div>
      </div>
    </section>
  );
}
