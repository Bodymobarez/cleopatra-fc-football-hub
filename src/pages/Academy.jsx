import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Users, Target, Award, Calendar, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/components/LanguageContext';

export default function Academy() {
  const { isArabic } = useLanguage();

  const ageGroups = [
    { age: 'U-10', description: isArabic ? 'تأسيس وتطوير' : 'Foundation Development', color: 'from-blue-500 to-blue-600' },
    { age: 'U-12', description: isArabic ? 'المهارات التقنية' : 'Technical Skills', color: 'from-green-500 to-green-600' },
    { age: 'U-14', description: isArabic ? 'الوعي التكتيكي' : 'Tactical Awareness', color: 'from-yellow-500 to-yellow-600' },
    { age: 'U-16', description: isArabic ? 'تدريب متقدم' : 'Advanced Training', color: 'from-orange-500 to-orange-600' },
    { age: 'U-18', description: isArabic ? 'ما قبل الاحتراف' : 'Pre-Professional', color: 'from-red-500 to-red-600' },
  ];

  const benefits = isArabic ? [
    'طاقم تدريبي محترف',
    'منشآت تدريب حديثة',
    'مسار تطويري منظم',
    'مباريات تنافسية منتظمة',
    'تكييف بدني وذهني',
    'برامج دعم تعليمي',
  ] : [
    'Professional coaching staff',
    'Modern training facilities',
    'Structured development pathway',
    'Regular competitive matches',
    'Physical and mental conditioning',
    'Education support programs',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#1B2852] via-[#C8102E] to-[#1B2852] py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <GraduationCap className="w-16 h-16 text-[#FFB81C] mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
              {isArabic ? 'أكاديمية' : 'Youth'} <span className="text-[#FFB81C]">{isArabic ? 'الناشئين' : 'Academy'}</span>
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto mb-8">
              {isArabic
                ? 'تطوير الجيل القادم من نجوم الكرة المصرية'
                : 'Developing the next generation of Egyptian football stars'}
            </p>
            <Button className="bg-[#FFB81C] text-[#1B2852] hover:bg-[#f5a815] font-bold text-lg px-8 py-6">
              <Calendar className="w-5 h-5 mr-2" />
              {isArabic ? 'التسجيل في الاختبارات' : 'Register for Trials'}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-4xl font-black text-[#1B2852] mb-6 flex items-center gap-3">
                <div className="w-1.5 h-12 bg-[#FFB81C] rounded-full" />
                {isArabic ? 'فلسفة التدريب' : 'Training Philosophy'}
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                {isArabic ? (
                  <>
                    <p>أكاديمية سيراميكا كليوباترا ملتزمة برعاية المواهب الشابة من خلال تعليم كروي شامل. تتمحور فلسفتنا حول تطوير لاعبين متكاملين يتميزون داخل الملعب وخارجه.</p>
                    <p>نركز على تطوير المهارات التقنية، والفهم التكتيكي، واللياقة البدنية، والقوة الذهنية. يقدم طاقمنا التدريبي المتمرس اهتماماً شخصياً لمساعدة كل لاعب على الوصول لإمكاناته الكاملة.</p>
                    <p>كثير من لاعبي الفريق الأول بدأوا رحلتهم في أكاديميتنا، ونواصل إنتاج لاعبين موهوبين يفخروننا في جميع مستويات اللعبة.</p>
                  </>
                ) : (
                  <>
                    <p>The Ceramica Cleopatra Academy is committed to nurturing young talent through comprehensive football education. Our philosophy centers on developing well-rounded players who excel both on and off the pitch.</p>
                    <p>We focus on technical skill development, tactical understanding, physical conditioning, and mental strength. Our experienced coaching staff provides personalized attention to help each player reach their full potential.</p>
                    <p>Many of our first-team players started their journey in our academy, and we continue to produce talented footballers who make us proud at all levels of the game.</p>
                  </>
                )}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-[#1B2852] to-[#C8102E] rounded-2xl p-6 text-white">
                  <Target className="w-8 h-8 text-[#FFB81C] mb-3" />
                  <h4 className="font-bold text-lg mb-2">{isArabic ? 'التميز التقني' : 'Technical Excellence'}</h4>
                  <p className="text-sm text-white/80">{isArabic ? 'إتقان التحكم بالكرة والتمرير والتسديد' : 'Master ball control, passing, and shooting'}</p>
                </div>
                <div className="bg-gradient-to-br from-[#FFB81C] to-[#f5a815] rounded-2xl p-6 text-[#1B2852]">
                  <Users className="w-8 h-8 mb-3" />
                  <h4 className="font-bold text-lg mb-2">{isArabic ? 'روح الفريق' : 'Team Spirit'}</h4>
                  <p className="text-sm opacity-90">{isArabic ? 'بناء التعاون والقيادة' : 'Building collaboration and leadership'}</p>
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
                  <Award className="w-8 h-8 mb-3" />
                  <h4 className="font-bold text-lg mb-2">{isArabic ? 'بناء الشخصية' : 'Character Building'}</h4>
                  <p className="text-sm text-white/80">{isArabic ? 'الانضباط والاحترام والروح الرياضية' : 'Discipline, respect, and sportsmanship'}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                  <CheckCircle className="w-8 h-8 mb-3" />
                  <h4 className="font-bold text-lg mb-2">{isArabic ? 'طريق الاحتراف' : 'Pathway to Pro'}</h4>
                  <p className="text-sm text-white/80">{isArabic ? 'طريق واضح للفريق الأول' : 'Clear route to first team'}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Age Groups */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl font-black text-[#1B2852] mb-4">{isArabic ? 'الفئات العمرية' : 'Age Groups'}</h2>
            <p className="text-gray-600 text-lg">{isArabic ? 'برامج منظمة لكل مرحلة تطورية' : 'Structured programs for every development stage'}</p>
          </motion.div>
          <div className="grid md:grid-cols-5 gap-4">
            {ageGroups.map((group, index) => (
              <motion.div
                key={group.age}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gradient-to-br ${group.color} rounded-2xl p-6 text-white text-center hover:scale-105 transition-transform`}
              >
                <h3 className="text-3xl font-black mb-2">{group.age}</h3>
                <p className="text-sm text-white/90">{group.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl font-black text-[#1B2852] mb-4">{isArabic ? 'مميزات البرنامج' : 'Program Benefits'}</h2>
            <p className="text-gray-600 text-lg">{isArabic ? 'ما يجعل أكاديميتنا مميزة' : 'What makes our academy special'}</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 bg-gray-50 rounded-xl p-6 border border-gray-100"
              >
                <CheckCircle className="w-6 h-6 text-[#FFB81C] flex-shrink-0" />
                <span className="font-medium text-[#1B2852]">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-br from-[#1B2852] to-[#C8102E]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-black text-white mb-4">
              {isArabic ? 'هل أنت مستعد لبدء رحلتك؟' : 'Ready to Start Your Journey?'}
            </h2>
            <p className="text-white/80 text-lg mb-8">
              {isArabic
                ? 'انضم لأكاديمية سيراميكا كليوباترا وطوّر مهاراتك الكروية تحت إشراف محترفين'
                : 'Join Ceramica Cleopatra Academy and develop your football skills with professional guidance'}
            </p>
            <Button className="bg-[#FFB81C] text-[#1B2852] hover:bg-[#f5a815] font-bold text-lg px-8 py-6">
              {isArabic ? 'سجّل الآن' : 'Apply Now'}
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
