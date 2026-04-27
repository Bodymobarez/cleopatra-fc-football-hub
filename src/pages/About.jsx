import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Heart, Users, MapPin, Calendar } from 'lucide-react';

export default function About() {
  const stats = [
    { icon: Calendar, label: 'Founded', value: '2006' },
    { icon: MapPin, label: 'Location', value: 'Suez, Egypt' },
    { icon: Trophy, label: 'League Titles', value: '0' },
    { icon: Users, label: 'Squad Size', value: '25+' }
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
              About <span className="text-[#FFB81C]">Our Club</span>
            </h1>
            <p className="text-white/80 text-xl max-w-3xl mx-auto">
              Ceramica Cleopatra FC - A Rising Force in Egyptian Football
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
                Our History
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Ceramica Cleopatra FC was founded in 2006 in Suez, Egypt. The club has grown to become a competitive force in Egyptian football, competing in the Egyptian Premier League, the top tier of Egyptian football.
                </p>
                <p>
                  Named after the Cleopatra Ceramics factory, the club represents the city of Suez with pride and passion. Over the years, Ceramica Cleopatra has built a reputation for developing talented players and playing attractive, attacking football.
                </p>
                <p>
                  The club plays its home matches at Suez Stadium, where passionate supporters create an electric atmosphere that inspires the team to achieve great performances.
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
              <h3 className="text-3xl font-bold mb-4">Our Vision</h3>
              <p className="text-white/80 leading-relaxed">
                To become one of Egypt's leading football clubs, competing at the highest level domestically and continentally, while developing world-class talent and maintaining strong community connections.
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
              <h3 className="text-3xl font-bold mb-4">Our Mission</h3>
              <p className="opacity-90 leading-relaxed">
                To inspire our community through passionate, attacking football, nurture young talent, uphold the highest sporting values, and represent Suez with pride on every pitch we play.
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
            <h2 className="text-4xl font-black text-[#1B2852] mb-4">Our Values</h2>
            <p className="text-gray-600 text-lg">The principles that guide everything we do</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Excellence', description: 'Striving for the highest standards in every aspect' },
              { title: 'Unity', description: 'Building a strong, cohesive team on and off the pitch' },
              { title: 'Passion', description: 'Playing with heart and determination in every match' },
              { title: 'Integrity', description: 'Upholding fair play and sporting ethics' },
              { title: 'Development', description: 'Nurturing talent and continuous improvement' },
              { title: 'Community', description: 'Connecting with and inspiring our supporters' }
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