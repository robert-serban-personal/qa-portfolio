'use client';

import { motion } from 'framer-motion';
import { SiLinkedin, SiGithub, SiX } from 'react-icons/si';
import { HiHeart } from 'react-icons/hi';

const socialLinks = [
  { icon: SiLinkedin, url: 'https://linkedin.com/in/yourprofile', label: 'LinkedIn' },
  { icon: SiGithub, url: 'https://github.com/yourusername', label: 'GitHub' },
  { icon: SiX, url: 'https://twitter.com/yourhandle', label: 'X' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center justify-center space-y-6">
          {/* Social links */}
          <div className="flex gap-4">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <motion.a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -3 }}
                  className="w-12 h-12 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center hover:border-emerald-400/50 transition-all duration-300 group"
                >
                  <Icon className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                </motion.a>
              );
            })}
          </div>

          {/* Copyright */}
          <div className="text-center">
            <p className="text-slate-400 flex items-center gap-2 justify-center">
              Made with <HiHeart className="w-4 h-4 text-emerald-400" /> by QA
              Portfolio
            </p>
            <p className="text-slate-500 text-sm mt-2">
              © {currentYear} All rights reserved
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
