import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Users, Calendar, Newspaper, GraduationCap, Globe, Trophy, Play, MessageCircle } from 'lucide-react';

const links = [
  {
    icon: Users,
    title: 'First Team',
    description: 'Meet our squad',
    href: 'Squad',
    color: 'from-[#1B2852] to-[#0f1a3a]'
  },
  {
    icon: Calendar,
    title: 'Matches',
    description: 'Fixtures & Results',
    href: 'Matches',
    color: 'from-[#FFB81C] to-[#f5a815]'
  },
  {
    icon: Newspaper,
    title: 'News',
    description: 'Latest updates',
    href: 'News',
    color: 'from-green-600 to-green-700'
  },
  {
    icon: GraduationCap,
    title: 'Academy',
    description: 'Youth development',
    href: 'Academy',
    color: 'from-purple-600 to-purple-700'
  },
  {
    icon: Globe,
    title: 'Global Football',
    description: 'World news',
    href: 'GlobalNews',
    color: 'from-cyan-600 to-cyan-700'
  },
  {
    icon: Trophy,
    title: 'Standings',
    description: 'League tables',
    href: 'Standings',
    color: 'from-orange-500 to-orange-600'
  },
  {
    icon: Play,
    title: 'Media',
    description: 'Videos & Photos',
    href: 'Media',
    color: 'from-red-500 to-red-600'
  },
  {
    icon: MessageCircle,
    title: 'Fan Zone',
    description: 'Join the community',
    href: 'FanZone',
    color: 'from-pink-500 to-pink-600'
  }
];

export default function QuickLinks() {
  return (
    <section className="py-16 bg-[#1B2852]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {links.map((link, index) => (
            <motion.div
              key={link.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Link 
                to={createPageUrl(link.href)}
                className="block group"
              >
                <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${link.color} p-6 h-full min-h-[140px]`}>
                  <motion.div 
                    className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10"
                    whileHover={{ scale: 1.2 }}
                    transition={{ type: "spring" }}
                  />
                  <link.icon className="w-8 h-8 text-white mb-4 relative z-10" />
                  <h3 className="text-white font-bold text-lg relative z-10">{link.title}</h3>
                  <p className="text-white/60 text-sm relative z-10">{link.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}