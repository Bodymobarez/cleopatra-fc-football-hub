import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Users, Calendar, Newspaper, GraduationCap, Globe, Trophy, Play, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

export default function QuickLinks() {
  const { isArabic } = useLanguage();

  const links = [
    { icon: Users,         title: isArabic ? 'الفريق الأول' : 'First Team',      description: isArabic ? 'تعرف على لاعبينا' : 'Meet our squad',         href: 'Squad',      color: 'from-[#1B2852] to-[#0f1a3a]' },
    { icon: Calendar,      title: isArabic ? 'المباريات' : 'Matches',             description: isArabic ? 'المواعيد والنتائج' : 'Fixtures & Results',     href: 'Matches',    color: 'from-[#FFB81C] to-[#f5a815]' },
    { icon: Newspaper,     title: isArabic ? 'الأخبار' : 'News',                  description: isArabic ? 'آخر التحديثات' : 'Latest updates',            href: 'News',       color: 'from-green-600 to-green-700' },
    { icon: GraduationCap, title: isArabic ? 'الأكاديمية' : 'Academy',            description: isArabic ? 'تطوير الناشئين' : 'Youth development',         href: 'Academy',    color: 'from-purple-600 to-purple-700' },
    { icon: Globe,         title: isArabic ? 'كرة عالمية' : 'Global Football',    description: isArabic ? 'أخبار عالمية' : 'World news',                  href: 'GlobalNews', color: 'from-cyan-600 to-cyan-700' },
    { icon: Trophy,        title: isArabic ? 'الترتيب' : 'Standings',             description: isArabic ? 'جداول الدوري' : 'League tables',               href: 'Standings',  color: 'from-orange-500 to-orange-600' },
    { icon: Play,          title: isArabic ? 'الوسائط' : 'Media',                 description: isArabic ? 'صور وفيديوهات' : 'Videos & Photos',            href: 'Media',      color: 'from-red-500 to-red-600' },
    { icon: MessageCircle, title: isArabic ? 'منطقة الجماهير' : 'Fan Zone',       description: isArabic ? 'انضم للمجتمع' : 'Join the community',          href: 'FanZone',    color: 'from-pink-500 to-pink-600' },
  ];

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
              <Link to={createPageUrl(link.href)} className="block group">
                <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${link.color} p-6 h-full min-h-[140px]`}>
                  <motion.div
                    className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10"
                    whileHover={{ scale: 1.2 }}
                    transition={{ type: 'spring' }}
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
