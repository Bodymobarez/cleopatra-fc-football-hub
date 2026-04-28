import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/components/LanguageContext';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const { isArabic } = useLanguage();
  const [form, setForm]   = useState({ email: '', password: '' });
  const [show, setShow]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(isArabic ? `أهلاً بعودتك، ${data.user.full_name}!` : `Welcome back, ${data.user.full_name}! 👋`);
      navigate(data.user.role === 'admin' ? '/AdminPanel' : '/Dashboard');
    } catch (err) {
      const msg = err.message?.includes('401')
        ? (isArabic ? 'بيانات الدخول غير صحيحة' : 'Invalid email or password')
        : err.message?.includes('403')
        ? (isArabic ? 'الحساب موقوف' : 'Account suspended')
        : (isArabic ? 'فشل تسجيل الدخول، حاول مرة أخرى' : 'Login failed. Please try again.');
      setError(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1508768787810-6adc1f613514?w=1920')] opacity-5 bg-cover bg-center" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695e73c9350940eda2779d4d/62a3057fb_Ceramica_Cleopatra_FC_logo.png"
              alt="Logo"
              className="h-20 mx-auto mb-4"
            />
            <h1 className="text-2xl font-black text-white">
              {isArabic ? 'تسجيل دخول الأعضاء' : 'Member Login'}
            </h1>
            <p className="text-white/40 text-sm mt-1">
              {isArabic ? 'ادخل على حسابك' : 'Sign in to your account'}
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-6 text-red-400 text-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-white/60 text-sm mb-2">
                {isArabic ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  autoComplete="email"
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  required
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#FFB81C] rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">
                {isArabic ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  type={show ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  autoComplete="current-password"
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                  className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#FFB81C] rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#1B2852] to-[#C8102E] hover:opacity-90 text-white font-bold rounded-xl h-12 text-base"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><LogIn className="w-4 h-4 mr-2" /> {isArabic ? 'دخول' : 'Sign In'}</>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-white/40">
            {isArabic ? 'ليس لديك حساب؟ ' : "Don't have an account? "}
            <Link to="/Register" className="text-[#FFB81C] hover:underline font-semibold">
              {isArabic ? 'انضم الآن' : 'Join Now'}
            </Link>
          </div>

          <div className="mt-2 text-center text-xs text-white/20">
            <Link to="/" className="hover:text-white/40">
              {isArabic ? '← العودة للموقع' : '← Back to website'}
            </Link>
          </div>
        </div>

        <p className="text-center text-white/20 text-xs mt-4">
          Admin: admin@ceramicacleopatra.com
        </p>
      </motion.div>
    </div>
  );
}
