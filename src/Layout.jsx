import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Home, Users, Calendar, Newspaper, Trophy, 
  Globe, Play, MessageCircle, GraduationCap, ChevronDown,
  Search, Bell, User, LogOut, Settings, Shield
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

const navigation = [
  { name: 'Home', href: 'Home', icon: Home },
  { 
    name: 'Club', 
    icon: Shield,
    children: [
      { name: 'About', href: 'About' },
      { name: 'Squad', href: 'Squad' },
      { name: 'Academy', href: 'Academy' },
    ]
  },
  { name: 'Matches', href: 'Matches', icon: Calendar },
  { name: 'News', href: 'News', icon: Newspaper },
  { 
    name: 'Global Football', 
    icon: Globe,
    children: [
      { name: 'All News', href: 'GlobalNews' },
      { name: 'Premier League', href: 'LeagueNews?league=premier_league' },
      { name: 'La Liga', href: 'LeagueNews?league=la_liga' },
      { name: 'Champions League', href: 'LeagueNews?league=champions_league' },
      { name: 'World Cup', href: 'LeagueNews?league=world_cup' },
    ]
  },
  { name: 'Standings', href: 'Standings', icon: Trophy },
  { name: 'Media', href: 'Media', icon: Play },
  { name: 'Fan Zone', href: 'FanZone', icon: MessageCircle },
];

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const userData = await base44.auth.me();
          setUser(userData);
        }
      } catch (e) {}
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const isHome = currentPageName === 'Home';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || !isHome ? 'bg-[#1B2852] shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-3">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695e73c9350940eda2779d4d/62a3057fb_Ceramica_Cleopatra_FC_logo.png"
                alt="Ceramica Cleopatra FC"
                className="h-14 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => (
                item.children ? (
                  <DropdownMenu key={item.name}>
                    <DropdownMenuTrigger className="flex items-center gap-1 px-4 py-2 text-white/80 hover:text-white font-medium transition-colors">
                      {item.name}
                      <ChevronDown className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[#0a1628] border-white/10">
                      {item.children.map((child) => (
                        <DropdownMenuItem key={child.name} asChild>
                          <Link 
                            to={createPageUrl(child.href.split('?')[0]) + (child.href.includes('?') ? child.href.substring(child.href.indexOf('?')) : '')}
                            className="text-white/80 hover:text-white hover:bg-white/10"
                          >
                            {child.name}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.href)}
                    className={`px-4 py-2 font-medium transition-colors ${
                      currentPageName === item.href 
                        ? 'text-[#FFB81C]' 
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <button className="p-2 text-white/60 hover:text-white transition-colors">
                <Search className="w-5 h-5" />
              </button>
              
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-[#FFB81C] flex items-center justify-center">
                      <span className="text-[#1B2852] font-bold text-sm">
                        {user.full_name?.[0] || user.email?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-[#1B2852] border-white/10">
                    <DropdownMenuItem className="text-white/60 pointer-events-none">
                      {user.email}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/10" />
                    {user.role === 'admin' && (
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('Admin')} className="text-white/80 hover:text-white hover:bg-white/10">
                          <Settings className="w-4 h-4 mr-2" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={() => base44.auth.logout()}
                      className="text-red-400 hover:text-red-300 hover:bg-white/10 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button 
                  onClick={() => base44.auth.redirectToLogin()}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#FFB81C] text-[#1B2852] font-bold rounded-lg hover:bg-[#f5a815] transition-colors"
                >
                  <User className="w-4 h-4" />
                  Login
                </button>
              )}

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween' }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-[#1B2852] pt-24 px-6 overflow-y-auto">
              <nav className="space-y-2">
                {navigation.map((item) => (
                  item.children ? (
                    <div key={item.name} className="space-y-1">
                      <span className="block px-4 py-2 text-white/50 font-medium text-sm">
                        {item.name}
                      </span>
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          to={createPageUrl(child.href.split('?')[0]) + (child.href.includes('?') ? child.href.substring(child.href.indexOf('?')) : '')}
                          className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg pl-8"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      key={item.name}
                      to={createPageUrl(item.href)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        currentPageName === item.href 
                          ? 'bg-[#FFB81C] text-[#1B2852]' 
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  )
                ))}
              </nav>

              {!user && (
                <button 
                  onClick={() => base44.auth.redirectToLogin()}
                  className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-[#FFB81C] text-[#1B2852] font-bold rounded-lg"
                >
                  <User className="w-5 h-5" />
                  Login
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={isHome ? '' : 'pt-20'}>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#1B2852] text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="md:col-span-1">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695e73c9350940eda2779d4d/62a3057fb_Ceramica_Cleopatra_FC_logo.png"
                alt="Ceramica Cleopatra FC"
                className="h-20 w-auto mb-6"
              />
              <p className="text-white/50 text-sm leading-relaxed">
                Official website of Ceramica Cleopatra Football Club. Your source for club news, fixtures, and global football coverage.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {['Home', 'Squad', 'Matches', 'News', 'Media'].map((item) => (
                  <li key={item}>
                    <Link to={createPageUrl(item)} className="text-white/60 hover:text-[#FFB81C] transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Leagues */}
            <div>
              <h4 className="font-bold text-lg mb-4">Leagues</h4>
              <ul className="space-y-2">
                {['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Egyptian League'].map((item) => (
                  <li key={item}>
                    <Link to={createPageUrl('GlobalNews')} className="text-white/60 hover:text-[#FFB81C] transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-lg mb-4">Contact</h4>
              <ul className="space-y-2 text-white/60 text-sm">
                <li>Email: info@ceramicacleopatrafc.com</li>
                <li>Phone: +20 2 1234 5678</li>
                <li>Cairo, Egypt</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-sm">
              © 2024 Ceramica Cleopatra FC. All rights reserved.
            </p>
            <div className="flex gap-6 text-white/40 text-sm">
              <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="#" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}