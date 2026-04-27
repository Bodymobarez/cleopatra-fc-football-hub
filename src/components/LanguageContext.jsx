import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  };

  const t = (key, fallback) => {
    return translations[language]?.[key] || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, isArabic: language === 'ar' }}>
      {children}
    </LanguageContext.Provider>
  );
};

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.club': 'Club',
    'nav.about': 'About',
    'nav.squad': 'Squad',
    'nav.academy': 'Academy',
    'nav.matches': 'Matches',
    'nav.news': 'News',
    'nav.global_football': 'Global Football',
    'nav.all_news': 'All News',
    'nav.premier_league': 'Premier League',
    'nav.la_liga': 'La Liga',
    'nav.champions_league': 'Champions League',
    'nav.world_cup': 'World Cup',
    'nav.standings': 'Standings',
    'nav.media': 'Media',
    'nav.fan_zone': 'Fan Zone',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    'nav.admin': 'Admin Dashboard',
    
    // Common
    'common.view_all': 'View All',
    'common.read_more': 'Read More',
    'common.loading': 'Loading...',
    'common.no_data': 'No data available',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.all': 'All',
    'common.recent': 'Recent',
    'common.featured': 'Featured',
    'common.views': 'views',
    'common.share': 'Share',
    
    // Home Page
    'home.hero.welcome': 'Welcome to',
    'home.hero.club_name': 'Ceramica Cleopatra FC',
    'home.hero.tagline': 'Egyptian Premier League',
    'home.hero.view_squad': 'View Squad',
    'home.hero.latest_matches': 'Latest Matches',
    'home.hero.next_match': 'Next Match',
    'home.hero.countdown': 'Match Countdown',
    'home.latest_news': 'Latest News',
    'home.live_scores': 'Live Scores',
    'home.match_center': 'Match Center',
    'home.featured_videos': 'Featured Videos',
    
    // Matches
    'matches.title': 'Matches',
    'matches.subtitle': 'Fixtures and Results',
    'matches.upcoming': 'Upcoming Matches',
    'matches.recent': 'Recent Results',
    'matches.all_matches': 'All Matches',
    'matches.ceramica_only': 'Ceramica FC',
    'matches.global': 'Global',
    'matches.live': 'Live',
    'matches.finished': 'Finished',
    'matches.scheduled': 'Scheduled',
    'matches.vs': 'vs',
    'matches.venue': 'Venue',
    'matches.competition': 'Competition',
    
    // News
    'news.title': 'Club News',
    'news.subtitle': 'Latest updates from Ceramica Cleopatra FC',
    'news.featured': 'Featured Stories',
    'news.latest': 'Latest Articles',
    'news.category.club_news': 'Club News',
    'news.category.match_report': 'Match Reports',
    'news.category.transfers': 'Transfers',
    'news.category.injuries': 'Injuries',
    'news.category.analysis': 'Analysis',
    'news.back': 'Back to News',
    
    // Squad
    'squad.title': 'Squad',
    'squad.subtitle': 'Meet Our Players',
    'squad.all_players': 'All Players',
    'squad.goalkeepers': 'Goalkeepers',
    'squad.defenders': 'Defenders',
    'squad.midfielders': 'Midfielders',
    'squad.forwards': 'Forwards',
    'squad.captain': 'Captain',
    'squad.injured': 'Injured',
    'squad.stats.appearances': 'Appearances',
    'squad.stats.goals': 'Goals',
    'squad.stats.assists': 'Assists',
    
    // Fan Zone
    'fanzone.title': 'Fan Zone',
    'fanzone.subtitle': 'Connect with Fellow Supporters',
    'fanzone.polls': 'Fan Polls',
    'fanzone.vote': 'Vote',
    'fanzone.results': 'Results',
    'fanzone.comments': 'Fan Comments',
    'fanzone.share_opinion': 'Share Your Opinion',
    'fanzone.total_votes': 'Total Votes',
    
    // About
    'about.title': 'About Our Club',
    'about.subtitle': 'A Rising Force in Egyptian Football',
    'about.history': 'Our History',
    'about.vision': 'Our Vision',
    'about.mission': 'Our Mission',
    'about.values': 'Our Values',
    
    // Academy
    'academy.title': 'Youth Academy',
    'academy.subtitle': 'Developing the next generation of Egyptian football stars',
    'academy.philosophy': 'Training Philosophy',
    'academy.age_groups': 'Age Groups',
    'academy.benefits': 'Program Benefits',
    
    // Admin
    'admin.title': 'Admin Dashboard',
    'admin.subtitle': 'Import real-time data from the internet to populate your football platform',
    'admin.import': 'Import Data',
    'admin.importing': 'Importing...',
    'admin.success': 'Successfully imported',
    'admin.failed': 'Import failed',
    
    // Media
    'media.title': 'Media',
    'media.subtitle': 'Photos and Videos',
    'media.photos': 'Photos',
    'media.videos': 'Videos',
    'media.highlights': 'Highlights',
    
    // Footer
    'footer.about': 'Official website of Ceramica Cleopatra Football Club',
    'footer.quick_links': 'Quick Links',
    'footer.leagues': 'Leagues',
    'footer.contact': 'Contact',
    'footer.email': 'Email',
    'footer.phone': 'Phone',
    'footer.location': 'Cairo, Egypt',
    'footer.rights': 'All rights reserved',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
  },
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.club': 'النادي',
    'nav.about': 'عن النادي',
    'nav.squad': 'الفريق',
    'nav.academy': 'الأكاديمية',
    'nav.matches': 'المباريات',
    'nav.news': 'الأخبار',
    'nav.global_football': 'كرة القدم العالمية',
    'nav.all_news': 'جميع الأخبار',
    'nav.premier_league': 'الدوري الإنجليزي',
    'nav.la_liga': 'الدوري الإسباني',
    'nav.champions_league': 'دوري الأبطال',
    'nav.world_cup': 'كأس العالم',
    'nav.standings': 'الترتيب',
    'nav.media': 'الوسائط',
    'nav.fan_zone': 'منطقة الجماهير',
    'nav.login': 'تسجيل الدخول',
    'nav.logout': 'تسجيل الخروج',
    'nav.admin': 'لوحة الإدارة',
    
    // Common
    'common.view_all': 'عرض الكل',
    'common.read_more': 'اقرأ المزيد',
    'common.loading': 'جاري التحميل...',
    'common.no_data': 'لا توجد بيانات',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.all': 'الكل',
    'common.recent': 'الأحدث',
    'common.featured': 'مميز',
    'common.views': 'مشاهدة',
    'common.share': 'مشاركة',
    
    // Home Page
    'home.hero.welcome': 'مرحباً بكم في',
    'home.hero.club_name': 'نادي سيراميكا كليوباترا',
    'home.hero.tagline': 'الدوري المصري الممتاز',
    'home.hero.view_squad': 'عرض الفريق',
    'home.hero.latest_matches': 'آخر المباريات',
    'home.hero.next_match': 'المباراة القادمة',
    'home.hero.countdown': 'العد التنازلي للمباراة',
    'home.latest_news': 'آخر الأخبار',
    'home.live_scores': 'النتائج المباشرة',
    'home.match_center': 'مركز المباريات',
    'home.featured_videos': 'الفيديوهات المميزة',
    
    // Matches
    'matches.title': 'المباريات',
    'matches.subtitle': 'المواعيد والنتائج',
    'matches.upcoming': 'المباريات القادمة',
    'matches.recent': 'النتائج الأخيرة',
    'matches.all_matches': 'جميع المباريات',
    'matches.ceramica_only': 'سيراميكا',
    'matches.global': 'عالمي',
    'matches.live': 'مباشر',
    'matches.finished': 'انتهت',
    'matches.scheduled': 'مجدولة',
    'matches.vs': 'ضد',
    'matches.venue': 'الملعب',
    'matches.competition': 'البطولة',
    
    // News
    'news.title': 'أخبار النادي',
    'news.subtitle': 'آخر الأخبار من نادي سيراميكا كليوباترا',
    'news.featured': 'الأخبار المميزة',
    'news.latest': 'آخر الأخبار',
    'news.category.club_news': 'أخبار النادي',
    'news.category.match_report': 'تقارير المباريات',
    'news.category.transfers': 'الانتقالات',
    'news.category.injuries': 'الإصابات',
    'news.category.analysis': 'التحليلات',
    'news.back': 'العودة للأخبار',
    
    // Squad
    'squad.title': 'الفريق',
    'squad.subtitle': 'تعرف على لاعبينا',
    'squad.all_players': 'جميع اللاعبين',
    'squad.goalkeepers': 'حراس المرمى',
    'squad.defenders': 'المدافعون',
    'squad.midfielders': 'لاعبو الوسط',
    'squad.forwards': 'المهاجمون',
    'squad.captain': 'القائد',
    'squad.injured': 'مصاب',
    'squad.stats.appearances': 'المشاركات',
    'squad.stats.goals': 'الأهداف',
    'squad.stats.assists': 'التمريرات الحاسمة',
    
    // Fan Zone
    'fanzone.title': 'منطقة الجماهير',
    'fanzone.subtitle': 'تواصل مع المشجعين',
    'fanzone.polls': 'استطلاعات الرأي',
    'fanzone.vote': 'صوّت',
    'fanzone.results': 'النتائج',
    'fanzone.comments': 'تعليقات الجماهير',
    'fanzone.share_opinion': 'شارك برأيك',
    'fanzone.total_votes': 'إجمالي الأصوات',
    
    // About
    'about.title': 'عن النادي',
    'about.subtitle': 'قوة صاعدة في الكرة المصرية',
    'about.history': 'تاريخنا',
    'about.vision': 'رؤيتنا',
    'about.mission': 'مهمتنا',
    'about.values': 'قيمنا',
    
    // Academy
    'academy.title': 'أكاديمية الناشئين',
    'academy.subtitle': 'تطوير الجيل القادم من نجوم الكرة المصرية',
    'academy.philosophy': 'فلسفة التدريب',
    'academy.age_groups': 'الفئات العمرية',
    'academy.benefits': 'مميزات البرنامج',
    
    // Admin
    'admin.title': 'لوحة الإدارة',
    'admin.subtitle': 'استيراد البيانات الحية من الإنترنت',
    'admin.import': 'استيراد البيانات',
    'admin.importing': 'جاري الاستيراد...',
    'admin.success': 'تم الاستيراد بنجاح',
    'admin.failed': 'فشل الاستيراد',
    
    // Media
    'media.title': 'الوسائط',
    'media.subtitle': 'الصور والفيديوهات',
    'media.photos': 'الصور',
    'media.videos': 'الفيديوهات',
    'media.highlights': 'أبرز اللقطات',
    
    // Footer
    'footer.about': 'الموقع الرسمي لنادي سيراميكا كليوباترا لكرة القدم',
    'footer.quick_links': 'روابط سريعة',
    'footer.leagues': 'الدوريات',
    'footer.contact': 'اتصل بنا',
    'footer.email': 'البريد الإلكتروني',
    'footer.phone': 'الهاتف',
    'footer.location': 'القاهرة، مصر',
    'footer.rights': 'جميع الحقوق محفوظة',
    'footer.privacy': 'سياسة الخصوصية',
    'footer.terms': 'شروط الخدمة',
  }
};