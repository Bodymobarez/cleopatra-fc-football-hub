import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Heart, Users, MapPin, Calendar } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

export default function About() {
  const { t, isArabic } = useLanguage();
  const stats = [
    { icon: Calendar, label: isArabic ? 'التأسيس' : 'Founded', value: '2006' },
    { icon: MapPin, label: isArabic ? 'المقر' : 'Location', value: isArabic ? 'السويس، مصر' : 'Suez, Egypt' },
    { icon: Trophy, label: isArabic ? 'ألقاب الدوري' : 'League Titles', value: '0' },
    { icon: Users, label: isArabic ? 'عدد اللاعبين' : 'Squad Size', value: '25+' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1508768787810-6adc1f613514?w=1920"
            alt="Stadium"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#1B2852]/95 via-[#C8102E]/90 to-[#1B2852]/95" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 text-center z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695e73c9350940eda2779d4d/62a3057fb_Ceramica_Cleopatra_FC_logo.png"
              alt="Ceramica Cleopatra FC"
              className="h-32 w-auto mx-auto mb-8"
            />
            <h1 className="text-5xl md:text-7xl font-black text-white mb-4">
              {isArabic ? 'عن' : 'About'} <span className="text-[#FFB81C]">{isArabic ? 'ناديناً' : 'Our Club'}</span>
            </h1>
            <p className="text-white/80 text-xl max-w-3xl mx-auto">
              {isArabic ? 'سيراميكا كليوباترا - قوة صاعدة في كرة القدم المصرية' : 'Ceramica Cleopatra FC - A Rising Force in Egyptian Football'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[#1B2852] to-[#C8102E] flex items-center justify-center">
                  <stat.icon className="w-8 h-8 text-[#FFB81C]" />
                </div>
                <h3 className="text-3xl font-black text-[#1B2852] mb-2">{stat.value}</h3>
                <p className="text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* History */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-black text-[#1B2852] mb-6 flex items-center gap-3">
                <div className="w-1.5 h-12 bg-[#FFB81C] rounded-full" />
                {t('about.history','Our History')}
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  {isArabic
                    ? 'تأسس نادي سيراميكا كليوباترا عام 2006 في السويس، مصر. نما النادي ليصبح قوة تنافسية في كرة القدم المصرية يشارك في الدوري المصري الممتاز.'
                    : 'Ceramica Cleopatra FC was founded in 2006 in Suez, Egypt. The club has grown to become a competitive force in Egyptian football, competing in the Egyptian Premier League.'}
                </p>
                <p>
                  {isArabic
                    ? 'سُمّي النادي نسبةً لمصنع سيراميكا كليوباترا، ويمثّل مدينة السويس بفخر وشغف. بنى النادي على مر السنين سمعة طيبة في تطوير اللاعبين الموهوبين ولعب كرة القدم الهجومية الجذابة.'
                    : 'Named after the Cleopatra Ceramics factory, the club represents Suez with pride and passion. Ceramica Cleopatra has built a reputation for developing talented players and playing attractive football.'}
                </p>
                <p>
                  {isArabic
                    ? 'يلعب النادي مبارياته الرسمية في ملعب السويس، حيث يخلق الجماهير المتحمسة أجواءً كهربائية تلهم الفريق لتحقيق أداءات رائعة.'
                    : 'The club plays its home matches at Suez Stadium, where passionate supporters create an electric atmosphere that inspires the team to achieve great performances.'}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-[400px] rounded-2xl overflow-hidden"
            >
              <img 
                src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800"
                alt="Team"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#1B2852] to-[#C8102E] rounded-2xl p-8 text-white"
            >
              <Target className="w-12 h-12 text-[#FFB81C] mb-6" />
              <h3 className="text-3xl font-bold mb-4">{t('about.vision','Our Vision')}</h3>
              <p className="text-white/80 leading-relaxed">
                {isArabic
                  ? 'أن نصبح أحد أبرز أندية كرة القدم في مصر، المنافسة على أعلى المستويات محلياً وقارياً، مع تطوير المواهب وتعزيز الروابط المجتمعية.'
                  : "To become one of Egypt's leading football clubs, competing at the highest level domestically and continentally, while developing world-class talent and maintaining strong community connections."}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-[#FFB81C] to-[#f5a815] rounded-2xl p-8 text-[#1B2852]"
            >
              <Heart className="w-12 h-12 mb-6" />
              <h3 className="text-3xl font-bold mb-4">{t('about.mission','Our Mission')}</h3>
              <p className="opacity-90 leading-relaxed">
                {isArabic
                  ? 'إلهام مجتمعنا من خلال كرة القدم الهجومية المشبعة بالشغف، وتنمية المواهب الشابة، والتمسك بأعلى القيم الرياضية، وتمثيل السويس بفخر في كل ملعب نلعب فيه.'
                  : 'To inspire our community through passionate, attacking football, nurture young talent, uphold the highest sporting values, and represent Suez with pride on every pitch we play.'}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-black text-[#1B2852] mb-4">{t('about.values','Our Values')}</h2>
            <p className="text-gray-600 text-lg">{isArabic ? 'المبادئ التي تقود كل ما نفعله' : 'The principles that guide everything we do'}</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: isArabic ? 'التميز' : 'Excellence', description: isArabic ? 'السعي نحو أعلى المستويات في كل جانب' : 'Striving for the highest standards in every aspect' },
              { title: isArabic ? 'الوحدة' : 'Unity', description: isArabic ? 'بناء فريق متماسك داخل الملعب وخارجه' : 'Building a strong, cohesive team on and off the pitch' },
              { title: isArabic ? 'الشغف' : 'Passion', description: isArabic ? 'اللعب بقلب وعزيمة في كل مباراة' : 'Playing with heart and determination in every match' },
              { title: isArabic ? 'النزاهة' : 'Integrity', description: isArabic ? 'الالتزام باللعب النظيف والأخلاق الرياضية' : 'Upholding fair play and sporting ethics' },
              { title: isArabic ? 'التطوير' : 'Development', description: isArabic ? 'رعاية المواهب والتحسين المستمر' : 'Nurturing talent and continuous improvement' },
              { title: isArabic ? 'المجتمع' : 'Community', description: isArabic ? 'التواصل مع جماهيرنا وإلهامهم' : 'Connecting with and inspiring our supporters' }
            ].map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all"
              >
                <h4 className="text-xl font-bold text-[#1B2852] mb-2">{value.title}</h4>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}