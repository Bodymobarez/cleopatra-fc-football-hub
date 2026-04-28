import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { ceramicaCleopatra } from '@/api/ceramicaCleopatraClient';
import { useQuery } from '@tanstack/react-query';
import { ensureArray } from '@/utils';
import { useLanguage } from '@/components/LanguageContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { User, Crown, Calendar, Newspaper, Trophy, LogOut, Edit2, Save, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

function RequireAuth({ children }) {
  const { user, isLoadingAuth } = useAuth();
  if (isLoadingAuth) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#FFB81C] border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <p className="text-white mb-4">Please sign in to access your dashboard.</p>
        <Link to="/Login"><Button className="bg-[#FFB81C] text-[#1B2852] font-bold rounded-xl">Sign In</Button></Link>
      </div>
    </div>
  );
  return children;
}

const PLAN_GRADIENT = { '#FFB81C': 'from-yellow-600 to-yellow-400', '#C8102E': 'from-red-700 to-red-500', '#9CA3AF': 'from-gray-500 to-gray-400', '#6B7280': 'from-gray-600 to-gray-500' };

export default function Dashboard() {
  return <RequireAuth><DashboardContent /></RequireAuth>;
}

function DashboardContent() {
  const { user, subscription, logout, loadMe } = useAuth();
  const { isArabic } = useLanguage();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm]         = useState({ full_name: user?.full_name || '', phone: user?.phone || '' });
  const [pwForm, setPwForm]     = useState({ current_password:'', new_password:'' });
  const [saving, setSaving]     = useState(false);

  const { data: nextMatch } = useQuery({
    queryKey: ['nextMatch'],
    queryFn: () => ceramicaCleopatra.entities.Match.filter({ is_ceramica_match: 'true', status: 'scheduled' }, 'date', 1).then(d => (Array.isArray(d) ? d : d.data ?? [])[0]),
  });
  const { data: latestNews = [] } = useQuery({
    queryKey: ['dashNews'],
    queryFn: () => ceramicaCleopatra.entities.News.list('-published_at', 3),
    select: ensureArray,
  });

  const saveProfile = async () => {
    setSaving(true);
    try {
      await ceramicaCleopatra.auth.updateProfile(form);
      await loadMe();
      setEditMode(false);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update'); }
    setSaving(false);
  };

  const changePassword = async () => {
    if (!pwForm.new_password || pwForm.new_password.length < 6) { toast.error('New password too short'); return; }
    setSaving(true);
    try {
      await ceramicaCleopatra.auth.changePassword(pwForm);
      setPwForm({ current_password:'', new_password:'' });
      toast.success('Password changed!');
    } catch { toast.error('Current password is wrong'); }
    setSaving(false);
  };

  const planColor = subscription?.badge_color || '#6B7280';
  const planGrad  = PLAN_GRADIENT[planColor] || 'from-gray-600 to-gray-500';
  const expiresAt = subscription?.expires_at ? new Date(subscription.expires_at) : null;

  return (
    <div className="min-h-screen bg-gray-950 py-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1B2852] to-[#C8102E] flex items-center justify-center text-3xl font-black text-white">
              {user?.full_name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">{user?.full_name}</h1>
              <p className="text-white/40 text-sm">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFB81C]/20 text-[#FFB81C] font-semibold capitalize">{user?.role}</span>
              </div>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm bg-red-500/10 hover:bg-red-500/20 px-4 py-2 rounded-xl transition-colors">
            <LogOut className="w-4 h-4" /> {isArabic ? 'خروج' : 'Sign Out'}
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Membership Card */}
            <div className={`bg-gradient-to-br ${planGrad} rounded-2xl p-6 relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
              <Crown className="w-6 h-6 text-white/60 mb-3" />
              <div className="text-white/70 text-sm mb-1">{isArabic ? 'العضوية الحالية' : 'Current Membership'}</div>
              <div className="text-white font-black text-2xl mb-1">
                {isArabic ? (subscription?.name_ar || 'مشجع مجاني') : (subscription?.plan_name || 'Free Fan')}
              </div>
              <div className="text-white/60 text-sm">
                {isArabic ? (subscription?.plan_name || 'Free Fan') : (subscription?.name_ar || 'مشجع مجاني')}
              </div>
              {expiresAt && (
                <div className="mt-3 text-white/60 text-xs">
                  {isArabic ? 'ينتهي:' : 'Expires:'} <strong className="text-white">{expiresAt.toLocaleDateString()}</strong>
                </div>
              )}
              {!subscription && (
                <Link to="/Register" className="mt-4 inline-block">
                  <Button className="bg-white text-gray-800 font-bold rounded-xl text-sm px-4 py-2 h-auto">Upgrade Plan →</Button>
                </Link>
              )}
            </div>

            {/* Latest News */}
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-black mb-4 flex items-center gap-2"><Newspaper className="w-4 h-4 text-[#FFB81C]" /> {isArabic ? 'آخر الأخبار' : 'Latest News'}</h3>
              <div className="space-y-3">
                {latestNews.map(n => (
                  <div key={n.id} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/8 transition-colors">
                    {n.featured_image && <img src={n.featured_image} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />}
                    <div>
                      <div className="text-white text-sm font-semibold line-clamp-2">{n.title}</div>
                      <div className="text-white/40 text-xs mt-1">{n.published_at ? new Date(n.published_at).toLocaleDateString() : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/News" className="mt-4 block text-center text-[#FFB81C] text-sm hover:underline">View all news →</Link>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Next Match */}
            {nextMatch && (
              <div className="bg-gray-900 border border-white/10 rounded-2xl p-5">
                <h3 className="text-white font-black mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-[#FFB81C]" /> {isArabic ? 'المباراة القادمة' : 'Next Match'}</h3>
                <div className="text-center">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-center">
                      {nextMatch.home_team_logo && <img src={nextMatch.home_team_logo} alt="" className="w-10 h-10 object-contain mx-auto mb-1" />}
                      <div className="text-white text-xs font-bold">{nextMatch.home_team}</div>
                    </div>
                    <div className="text-[#FFB81C] font-black text-lg">VS</div>
                    <div className="text-center">
                      {nextMatch.away_team_logo && <img src={nextMatch.away_team_logo} alt="" className="w-10 h-10 object-contain mx-auto mb-1" />}
                      <div className="text-white text-xs font-bold">{nextMatch.away_team}</div>
                    </div>
                  </div>
                  <div className="text-white/50 text-xs">{nextMatch.competition}</div>
                  <div className="text-white/70 text-sm mt-1">{new Date(nextMatch.date).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}</div>
                </div>
              </div>
            )}

            {/* Edit Profile */}
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-black flex items-center gap-2"><User className="w-4 h-4 text-[#FFB81C]" /> {isArabic ? 'الملف الشخصي' : 'Profile'}</h3>
                <button onClick={() => setEditMode(!editMode)} className="text-white/40 hover:text-white">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              {editMode ? (
                <div className="space-y-3">
                  <Input value={form.full_name} onChange={e => setForm(p => ({...p, full_name: e.target.value}))} placeholder={isArabic ? 'الاسم الكامل' : 'Full name'}
                    className="bg-white/5 border-white/10 text-white rounded-xl text-sm" />
                  <Input value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} placeholder={isArabic ? 'الهاتف' : 'Phone'}
                    className="bg-white/5 border-white/10 text-white rounded-xl text-sm" />
                  <div className="flex gap-2">
                    <Button onClick={() => setEditMode(false)} variant="outline" className="flex-1 border-white/10 text-white/50 rounded-xl text-sm h-9">{isArabic ? 'إلغاء' : 'Cancel'}</Button>
                    <Button onClick={saveProfile} disabled={saving} className="flex-1 bg-[#FFB81C] text-[#1B2852] font-bold rounded-xl text-sm h-9">
                      {saving ? '…' : <><Save className="w-3 h-3 mr-1" />{isArabic ? 'حفظ' : 'Save'}</>}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-sm text-white/60">
                  <div><span className="text-white/30">{isArabic ? 'الاسم: ' : 'Name: '}</span>{user?.full_name}</div>
                  <div><span className="text-white/30">{isArabic ? 'البريد: ' : 'Email: '}</span>{user?.email}</div>
                  <div><span className="text-white/30">{isArabic ? 'الهاتف: ' : 'Phone: '}</span>{user?.phone || (isArabic ? 'غير محدد' : 'Not set')}</div>
                  <div><span className="text-white/30">{isArabic ? 'عضو منذ: ' : 'Member since: '}</span>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : ''}</div>
                </div>
              )}
            </div>

            {/* Change Password */}
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-5">
              <h3 className="text-white font-black mb-4 flex items-center gap-2"><Lock className="w-4 h-4 text-[#FFB81C]" /> {isArabic ? 'تغيير كلمة المرور' : 'Change Password'}</h3>
              <div className="space-y-3">
                <Input type="password" placeholder={isArabic ? 'كلمة المرور الحالية' : 'Current password'} value={pwForm.current_password}
                  autoComplete="current-password"
                  onChange={e => setPwForm(p => ({...p, current_password: e.target.value}))}
                  className="bg-white/5 border-white/10 text-white rounded-xl text-sm" />
                <Input type="password" placeholder={isArabic ? 'كلمة المرور الجديدة (٦+ حروف)' : 'New password (6+ chars)'} value={pwForm.new_password}
                  autoComplete="new-password"
                  onChange={e => setPwForm(p => ({...p, new_password: e.target.value}))}
                  className="bg-white/5 border-white/10 text-white rounded-xl text-sm" />
                <Button onClick={changePassword} disabled={saving} className="w-full bg-gradient-to-r from-[#1B2852] to-[#C8102E] text-white font-bold rounded-xl text-sm h-9">
                  {isArabic ? 'تحديث كلمة المرور' : 'Update Password'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
