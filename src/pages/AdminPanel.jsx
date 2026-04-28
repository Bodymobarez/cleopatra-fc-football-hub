import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { ceramicaCleopatra } from '@/api/ceramicaCleopatraClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';
import {
  LayoutDashboard, Users, Calendar, Newspaper, Trophy, Film,
  MessageSquare, Settings, RefreshCw, LogOut, Shield, TrendingUp,
  Plus, Edit2, Trash2, Save, X, Search, ChevronDown, Eye,
  Star, Crown, Zap, Database, BarChart3, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// ─── Redirect if not admin ─────────────────────────────────────────────────
function RequireAdmin({ children }) {
  const { user, isAdmin, isLoadingAuth } = useAuth();
  const { isArabic } = useLanguage();
  if (isLoadingAuth) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#FFB81C] border-t-transparent rounded-full animate-spin" /></div>;
  if (!user)    return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">{isArabic ? 'يرجى' : 'Please'} <a href="/Login" className="text-[#FFB81C] mx-1 underline">{isArabic ? 'تسجيل الدخول' : 'login'}</a> {isArabic ? 'أولاً.' : 'first.'}</div>;
  if (!isAdmin) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">{isArabic ? 'مطلوب صلاحيات الأدمن.' : 'Admin access required.'}</div>;
  return children;
}

// ─── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <Card className="bg-gray-900 border-white/10">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="text-3xl font-black text-white">{value ?? '—'}</div>
        <div className="text-white/50 text-sm mt-1">{label}</div>
        {sub && <div className="text-white/30 text-xs mt-0.5">{sub}</div>}
      </CardContent>
    </Card>
  );
}

// ─── Generic Table CRUD ─────────────────────────────────────────────────────
function CRUDTable({ title, queryKey, fetchFn, columns, renderForm, emptyMsg }) {
  const { isArabic } = useLanguage();
  const defaultEmpty = isArabic ? 'لا توجد بيانات' : 'No data';
  const resolvedEmpty = emptyMsg || defaultEmpty;
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const { data: res = { data: [], total: 0 }, isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: fetchFn,
  });
  const rows = Array.isArray(res) ? res : (res.data ?? []);

  const filtered = rows.filter(r =>
    !search || columns.some(c => String(r[c.key] ?? '').toLowerCase().includes(search.toLowerCase()))
  );

  const deleteMut = useMutation({
    mutationFn: (id) => ceramicaCleopatra.entities[queryKey]?.delete(id) || fetch(`/api/${queryKey}/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('cc_token')}` } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [queryKey] }); toast.success(isArabic ? 'تم الحذف' : 'Deleted'); },
    onError: () => toast.error(isArabic ? 'فشل الحذف' : 'Delete failed'),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-white">{title}</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={isArabic ? 'بحث…' : 'Search…'}
              className="pl-9 bg-white/5 border-white/10 text-white w-48 rounded-xl" />
          </div>
          {renderForm && (
            <Button onClick={() => { setEditing(null); setShowForm(true); }}
              className="bg-[#FFB81C] text-[#1B2852] font-bold rounded-xl">
              <Plus className="w-4 h-4 mr-1" /> {isArabic ? 'إضافة جديد' : 'Add New'}
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_,i) => <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-white/30">{resolvedEmpty}</div>
      ) : (
        <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-[#1B2852]/40">
                  {columns.map(c => (
                    <th key={c.key} className="text-left px-4 py-3 text-[#FFB81C] font-bold">{c.label}</th>
                  ))}
                  {renderForm && <th className="px-4 py-3 text-[#FFB81C] font-bold text-right">{isArabic ? 'إجراءات' : 'Actions'}</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={row.id || i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    {columns.map(c => (
                      <td key={c.key} className="px-4 py-3 text-white/80">
                        {c.render ? c.render(row[c.key], row) : String(row[c.key] ?? '—').slice(0, 60)}
                      </td>
                    ))}
                    {renderForm && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => { setEditing(row); setShowForm(true); }}
                            className="text-blue-400 hover:text-blue-300 p-1.5 rounded-lg hover:bg-blue-500/10">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => { if (confirm(isArabic ? 'تأكيد الحذف؟' : 'Delete?')) deleteMut.mutate(row.id); }}
                            className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && renderForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-white">{editing ? (isArabic ? 'تعديل' : 'Edit') : (isArabic ? 'إضافة' : 'Add')} {title.slice(0,-1)}</h3>
                <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {renderForm({
                data: editing,
                onSave: () => { setShowForm(false); qc.invalidateQueries({ queryKey: [queryKey] }); },
                onClose: () => setShowForm(false),
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── News Form ─────────────────────────────────────────────────────────────
function NewsForm({ data, onSave, onClose }) {
  const { isArabic } = useLanguage();
  const [form, setForm] = useState(data || { title:'', excerpt:'', content:'', category:'club_news', status:'published', featured_image:'', is_featured:false, is_breaking:false, is_club_news:true });
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: (f) => data ? ceramicaCleopatra.entities.News.update(data.id, f) : ceramicaCleopatra.entities.News.create({ ...f, published_at: new Date().toISOString(), views: 0 }),
    onSuccess: () => { toast.success(isArabic ? 'تم الحفظ!' : 'Saved!'); onSave(); },
    onError: () => toast.error(isArabic ? 'فشل الحفظ' : 'Save failed'),
  });
  const fields = isArabic
    ? [['title','العنوان','text'],['excerpt','المقتطف','text'],['featured_image','رابط الصورة','text'],['category','الفئة','text']]
    : [['title','Title','text'],['excerpt','Excerpt','text'],['featured_image','Image URL','text'],['category','Category','text']];
  const checkLabels = isArabic
    ? [['is_featured','مميز'],['is_breaking','عاجل'],['is_club_news','أخبار النادي']]
    : [['is_featured','Featured'],['is_breaking','Breaking'],['is_club_news','Club News']];
  return (
    <div className="space-y-4">
      {fields.map(([k,l,t]) => (
        <div key={k}>
          <label className="block text-white/60 text-sm mb-1">{l}</label>
          <Input type={t} value={form[k] || ''} onChange={e => setForm(p => ({...p,[k]:e.target.value}))}
            className="bg-white/5 border-white/10 text-white rounded-xl" />
        </div>
      ))}
      <div>
        <label className="block text-white/60 text-sm mb-1">{isArabic ? 'المحتوى' : 'Content'}</label>
        <textarea value={form.content || ''} onChange={e => setForm(p => ({...p, content: e.target.value}))}
          rows={6} className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-[#FFB81C]" />
      </div>
      <div className="flex flex-wrap gap-4">
        {checkLabels.map(([k,l]) => (
          <label key={k} className="flex items-center gap-2 text-white/70 text-sm cursor-pointer">
            <input type="checkbox" checked={!!form[k]} onChange={e => setForm(p => ({...p,[k]:e.target.checked}))}
              className="w-4 h-4 accent-[#FFB81C]" />
            {l}
          </label>
        ))}
      </div>
      <div className="flex gap-3 pt-2">
        <Button onClick={onClose} variant="outline" className="flex-1 border-white/10 text-white/60 rounded-xl">{isArabic ? 'إلغاء' : 'Cancel'}</Button>
        <Button onClick={() => mut.mutate(form)} disabled={mut.isPending} className="flex-1 bg-[#FFB81C] text-[#1B2852] font-bold rounded-xl">
          {mut.isPending ? (isArabic ? 'جاري الحفظ…' : 'Saving…') : <><Save className="w-4 h-4 mr-1" />{isArabic ? 'حفظ' : 'Save'}</>}
        </Button>
      </div>
    </div>
  );
}

// ─── Match Form ────────────────────────────────────────────────────────────
function MatchForm({ data, onSave, onClose }) {
  const { isArabic } = useLanguage();
  const [form, setForm] = useState(data || { home_team:'', away_team:'', date:'', venue:'', status:'scheduled', home_score:0, away_score:0, competition:'Egyptian Premier League', is_ceramica_match:true });
  const mut = useMutation({
    mutationFn: (f) => data ? ceramicaCleopatra.entities.Match.update(data.id, f) : ceramicaCleopatra.entities.Match.create(f),
    onSuccess: () => { toast.success(isArabic ? 'تم الحفظ!' : 'Saved!'); onSave(); },
    onError: () => toast.error(isArabic ? 'فشل الحفظ' : 'Save failed'),
  });
  const matchFields = isArabic
    ? [['home_team','الفريق المضيف'],['away_team','الفريق الضيف'],['competition','البطولة'],['venue','الملعب']]
    : [['home_team','Home Team'],['away_team','Away Team'],['competition','Competition'],['venue','Venue']];
  const statusOptions = isArabic
    ? [{v:'scheduled',l:'مجدولة'},{v:'finished',l:'انتهت'},{v:'live',l:'مباشر'},{v:'postponed',l:'مؤجلة'},{v:'cancelled',l:'ملغاة'}]
    : [{v:'scheduled',l:'scheduled'},{v:'finished',l:'finished'},{v:'live',l:'live'},{v:'postponed',l:'postponed'},{v:'cancelled',l:'cancelled'}];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {matchFields.map(([k,l]) => (
          <div key={k}>
            <label className="block text-white/60 text-sm mb-1">{l}</label>
            <Input value={form[k] || ''} onChange={e => setForm(p => ({...p,[k]:e.target.value}))}
              className="bg-white/5 border-white/10 text-white rounded-xl" />
          </div>
        ))}
        <div>
          <label className="block text-white/60 text-sm mb-1">{isArabic ? 'التاريخ والوقت' : 'Date & Time'}</label>
          <Input type="datetime-local" value={form.date?.slice(0,16) || ''} onChange={e => setForm(p => ({...p, date: new Date(e.target.value).toISOString()}))}
            className="bg-white/5 border-white/10 text-white rounded-xl" />
        </div>
        <div>
          <label className="block text-white/60 text-sm mb-1">{isArabic ? 'الحالة' : 'Status'}</label>
          <select value={form.status} onChange={e => setForm(p => ({...p, status: e.target.value}))}
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm">
            {statusOptions.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}
          </select>
        </div>
        {form.status === 'finished' && <>
          <div><label className="block text-white/60 text-sm mb-1">{isArabic ? 'أهداف المضيف' : 'Home Score'}</label>
            <Input type="number" min="0" value={form.home_score ?? 0} onChange={e => setForm(p => ({...p, home_score: parseInt(e.target.value)||0}))} className="bg-white/5 border-white/10 text-white rounded-xl" /></div>
          <div><label className="block text-white/60 text-sm mb-1">{isArabic ? 'أهداف الضيف' : 'Away Score'}</label>
            <Input type="number" min="0" value={form.away_score ?? 0} onChange={e => setForm(p => ({...p, away_score: parseInt(e.target.value)||0}))} className="bg-white/5 border-white/10 text-white rounded-xl" /></div>
        </>}
      </div>
      <label className="flex items-center gap-2 text-white/70 text-sm cursor-pointer">
        <input type="checkbox" checked={!!form.is_ceramica_match} onChange={e => setForm(p => ({...p, is_ceramica_match: e.target.checked}))} className="w-4 h-4 accent-[#FFB81C]" />
        {isArabic ? 'مباراة سيراميكا' : 'Ceramica Match'}
      </label>
      <div className="flex gap-3 pt-2">
        <Button onClick={onClose} variant="outline" className="flex-1 border-white/10 text-white/60 rounded-xl">{isArabic ? 'إلغاء' : 'Cancel'}</Button>
        <Button onClick={() => mut.mutate(form)} disabled={mut.isPending} className="flex-1 bg-[#FFB81C] text-[#1B2852] font-bold rounded-xl">
          {mut.isPending ? (isArabic ? 'جاري الحفظ…' : 'Saving…') : <><Save className="w-4 h-4 mr-1" />{isArabic ? 'حفظ' : 'Save'}</>}
        </Button>
      </div>
    </div>
  );
}

// ─── Player Form ───────────────────────────────────────────────────────────
function PlayerForm({ data, onSave, onClose }) {
  const { isArabic } = useLanguage();
  const [form, setForm] = useState(data || { name:'', number:'', position:'Midfielder', position_detail:'', nationality:'Egyptian', photo_url:'', status:'available', is_captain:false });
  const mut = useMutation({
    mutationFn: (f) => data ? ceramicaCleopatra.entities.Player.update(data.id, f) : ceramicaCleopatra.entities.Player.create(f),
    onSuccess: () => { toast.success(isArabic ? 'تم الحفظ!' : 'Saved!'); onSave(); },
    onError: () => toast.error(isArabic ? 'فشل الحفظ' : 'Save failed'),
  });
  const playerFields = isArabic
    ? [['name','الاسم الكامل'],['number','رقم القميص'],['position_detail','تفاصيل المركز'],['nationality','الجنسية'],['photo_url','رابط الصورة']]
    : [['name','Full Name'],['number','Jersey #'],['position_detail','Position Detail'],['nationality','Nationality'],['photo_url','Photo URL']];
  const positions = isArabic
    ? [{v:'Goalkeeper',l:'حارس مرمى'},{v:'Defender',l:'مدافع'},{v:'Midfielder',l:'لاعب وسط'},{v:'Forward',l:'مهاجم'}]
    : [{v:'Goalkeeper',l:'Goalkeeper'},{v:'Defender',l:'Defender'},{v:'Midfielder',l:'Midfielder'},{v:'Forward',l:'Forward'}];
  const statuses = isArabic
    ? [{v:'available',l:'متاح'},{v:'injured',l:'مصاب'},{v:'suspended',l:'موقوف'}]
    : [{v:'available',l:'available'},{v:'injured',l:'injured'},{v:'suspended',l:'suspended'}];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {playerFields.map(([k,l]) => (
          <div key={k} className={k === 'photo_url' ? 'col-span-2' : ''}>
            <label className="block text-white/60 text-sm mb-1">{l}</label>
            <Input value={form[k] || ''} onChange={e => setForm(p => ({...p,[k]:e.target.value}))} className="bg-white/5 border-white/10 text-white rounded-xl" />
          </div>
        ))}
        <div>
          <label className="block text-white/60 text-sm mb-1">{isArabic ? 'المركز' : 'Position'}</label>
          <select value={form.position} onChange={e => setForm(p => ({...p, position: e.target.value}))} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm">
            {positions.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-white/60 text-sm mb-1">{isArabic ? 'الحالة' : 'Status'}</label>
          <select value={form.status} onChange={e => setForm(p => ({...p, status: e.target.value}))} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm">
            {statuses.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}
          </select>
        </div>
      </div>
      <label className="flex items-center gap-2 text-white/70 text-sm cursor-pointer">
        <input type="checkbox" checked={!!form.is_captain} onChange={e => setForm(p => ({...p, is_captain: e.target.checked}))} className="w-4 h-4 accent-[#FFB81C]" />
        {isArabic ? 'قائد الفريق' : 'Club Captain'}
      </label>
      <div className="flex gap-3 pt-2">
        <Button onClick={onClose} variant="outline" className="flex-1 border-white/10 text-white/60 rounded-xl">{isArabic ? 'إلغاء' : 'Cancel'}</Button>
        <Button onClick={() => mut.mutate(form)} disabled={mut.isPending} className="flex-1 bg-[#FFB81C] text-[#1B2852] font-bold rounded-xl">
          {mut.isPending ? (isArabic ? 'جاري الحفظ…' : 'Saving…') : <><Save className="w-4 h-4 mr-1" />{isArabic ? 'حفظ' : 'Save'}</>}
        </Button>
      </div>
    </div>
  );
}

// ─── Members Tab ────────────────────────────────────────────────────────────
function MembersTab() {
  const { isArabic } = useLanguage();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [assignUser, setAssignUser] = useState(null);
  const [selPlan, setSelPlan] = useState('');

  const { data: res = { data: [], total: 0 } } = useQuery({
    queryKey: ['adminUsers', search],
    queryFn: () => ceramicaCleopatra.admin.getUsers({ search, limit: 100 }),
  });
  const { data: plansRes = { data: [] } } = useQuery({
    queryKey: ['subscription_plans'],
    queryFn: () => ceramicaCleopatra.entities.SubscriptionPlan.list('sort_order'),
  });
  const plans = Array.isArray(plansRes) ? plansRes : (plansRes.data ?? []);

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => ceramicaCleopatra.admin.updateUser(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adminUsers'] }); toast.success(isArabic ? 'تم التحديث!' : 'Updated!'); },
  });
  const assignMut = useMutation({
    mutationFn: ({ id, plan_id }) => ceramicaCleopatra.admin.assignSub(id, { plan_id }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adminUsers'] }); toast.success(isArabic ? 'تم تعيين الاشتراك!' : 'Subscription assigned!'); setAssignUser(null); },
  });
  const deleteMut = useMutation({
    mutationFn: (id) => ceramicaCleopatra.admin.deleteUser(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adminUsers'] }); toast.success(isArabic ? 'تم الحذف' : 'Deleted'); },
  });

  const users = Array.isArray(res) ? res : (res.data ?? []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-white">{isArabic ? 'الأعضاء' : 'Members'} <span className="text-white/30 font-normal text-base">({res.total ?? users.length})</span></h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={isArabic ? 'ابحث عن عضو…' : 'Search members…'}
            className="pl-9 bg-white/5 border-white/10 text-white w-56 rounded-xl" />
        </div>
      </div>

      <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-[#1B2852]/40">
                {(isArabic ? ['العضو','الدور','الحالة','الخطة','تاريخ الانضمام','إجراءات'] : ['Member','Role','Status','Plan','Joined','Actions']).map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[#FFB81C] font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white">{u.full_name}</div>
                    <div className="text-white/40 text-xs">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <select value={u.role} onChange={e => updateMut.mutate({ id: u.id, data: { role: e.target.value } })}
                      className="bg-white/5 border border-white/10 text-white rounded-lg px-2 py-1 text-xs">
                      {['member','admin','moderator'].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.plan_name
                      ? <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: `${u.badge_color}20`, color: u.badge_color }}>{u.plan_name}</span>
                      : <span className="text-white/30 text-xs">{isArabic ? 'بلا خطة' : 'No plan'}</span>}
                  </td>
                  <td className="px-4 py-3 text-white/40 text-xs">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setAssignUser(u)} className="text-[#FFB81C] hover:opacity-80 p-1.5 rounded-lg hover:bg-[#FFB81C]/10 text-xs font-semibold">
                        {isArabic ? 'تعيين خطة' : 'Assign Plan'}
                      </button>
                      <button onClick={() => { if (confirm(isArabic ? `حظر ${u.full_name}؟` : `Ban ${u.full_name}?`)) updateMut.mutate({ id: u.id, data: { status: u.status === 'active' ? 'banned' : 'active' } }); }}
                        className={`p-1.5 rounded-lg text-xs ${u.status === 'active' ? 'text-red-400 hover:bg-red-500/10' : 'text-green-400 hover:bg-green-500/10'}`}>
                        {u.status === 'active' ? (isArabic ? 'حظر' : 'Ban') : (isArabic ? 'رفع الحظر' : 'Unban')}
                      </button>
                      <button onClick={() => { if (confirm(isArabic ? 'حذف المستخدم؟' : 'Delete user?')) deleteMut.mutate(u.id); }}
                        className="text-red-400 p-1.5 rounded-lg hover:bg-red-500/10">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Plan Modal */}
      <AnimatePresence>
        {assignUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setAssignUser(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-lg font-black text-white mb-4">{isArabic ? 'تعيين خطة —' : 'Assign Plan —'} {assignUser.full_name}</h3>
              <div className="space-y-2 mb-6">
                {plans.map(p => (
                  <button key={p.id} onClick={() => setSelPlan(p.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${selPlan === p.id ? 'border-[#FFB81C] bg-[#FFB81C]/10' : 'border-white/10 hover:border-white/30'}`}>
                    <span className="text-white font-semibold">{p.name}</span>
                    <span className="text-white/40 text-sm ml-2">— {p.price === 0 ? (isArabic ? 'مجاني' : 'Free') : `${p.price} ${isArabic ? 'جنيه' : 'EGP'}`}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setAssignUser(null)} variant="outline" className="flex-1 border-white/10 text-white/60 rounded-xl">{isArabic ? 'إلغاء' : 'Cancel'}</Button>
                <Button onClick={() => assignMut.mutate({ id: assignUser.id, plan_id: selPlan })}
                  disabled={!selPlan || assignMut.isPending}
                  className="flex-1 bg-[#FFB81C] text-[#1B2852] font-bold rounded-xl">
                  {assignMut.isPending ? (isArabic ? 'جاري التعيين…' : 'Assigning…') : (isArabic ? 'تعيين الخطة' : 'Assign Plan')}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Settings Tab ───────────────────────────────────────────────────────────
function SettingsTab() {
  const { isArabic } = useLanguage();
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    ceramicaCleopatra.settings.get().then(setSettings).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await ceramicaCleopatra.settings.save(settings);
      toast.success(isArabic ? 'تم حفظ الإعدادات!' : 'Settings saved!');
    } catch { toast.error(isArabic ? 'فشل الحفظ' : 'Save failed'); }
    setSaving(false);
  };

  if (!settings) return <div className="text-white/40 text-center py-12">{isArabic ? 'جاري تحميل الإعدادات…' : 'Loading settings…'}</div>;

  const fields = isArabic ? [
    ['site_name', 'اسم الموقع', 'text'],
    ['hero_title', 'عنوان الصفحة الرئيسية', 'text'],
    ['hero_subtitle', 'العنوان الفرعي', 'text'],
    ['contact_email', 'البريد الإلكتروني للتواصل', 'email'],
    ['social_facebook', 'رابط فيسبوك', 'url'],
    ['social_twitter', 'رابط تويتر', 'url'],
    ['social_instagram', 'رابط انستغرام', 'url'],
    ['social_youtube', 'رابط يوتيوب', 'url'],
  ] : [
    ['site_name', 'Site Name', 'text'],
    ['hero_title', 'Hero Title', 'text'],
    ['hero_subtitle', 'Hero Subtitle', 'text'],
    ['contact_email', 'Contact Email', 'email'],
    ['social_facebook', 'Facebook URL', 'url'],
    ['social_twitter', 'Twitter URL', 'url'],
    ['social_instagram', 'Instagram URL', 'url'],
    ['social_youtube', 'YouTube URL', 'url'],
  ];

  const toggles = isArabic
    ? [['registration_enabled','السماح بالتسجيل'],['maintenance_mode','وضع الصيانة']]
    : [['registration_enabled','Allow Registrations'],['maintenance_mode','Maintenance Mode']];

  return (
    <div className="max-w-2xl space-y-5">
      <h2 className="text-xl font-black text-white mb-6">{isArabic ? 'إعدادات الموقع' : 'Site Settings'}</h2>
      {fields.map(([k, l]) => (
        <div key={k}>
          <label className="block text-white/60 text-sm mb-2">{l}</label>
          <Input
            value={settings[k] ?? ''}
            onChange={e => setSettings(p => ({ ...p, [k]: e.target.value }))}
            className="bg-white/5 border-white/10 text-white rounded-xl"
          />
        </div>
      ))}
      <div className="flex gap-4">
        {toggles.map(([k,l]) => (
          <label key={k} className="flex items-center gap-2 text-white/70 text-sm cursor-pointer">
            <input type="checkbox" checked={!!settings[k]} onChange={e => setSettings(p => ({...p,[k]:e.target.checked}))} className="w-4 h-4 accent-[#FFB81C]" />
            {l}
          </label>
        ))}
      </div>
      <Button onClick={save} disabled={saving} className="bg-[#FFB81C] text-[#1B2852] font-bold rounded-xl px-8">
        {saving ? (isArabic ? 'جاري الحفظ…' : 'Saving…') : <><Save className="w-4 h-4 mr-2" />{isArabic ? 'حفظ الإعدادات' : 'Save Settings'}</>}
      </Button>
    </div>
  );
}

// ─── Sync Tab ────────────────────────────────────────────────────────────────
function SyncTab() {
  const { isArabic } = useLanguage();
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  const run = async (name, fn) => {
    setLoading(p => ({...p, [name]: true}));
    setResults(p => ({...p, [name]: null}));
    try {
      const r = await fn();
      setResults(p => ({...p, [name]: { ok: true, ...r }}));
      toast.success(isArabic ? `تمت المزامنة!` : `${name} synced!`);
    } catch (err) {
      setResults(p => ({...p, [name]: { ok: false, error: err.message }}));
      toast.error(isArabic ? 'فشلت المزامنة' : `${name} failed`);
    }
    setLoading(p => ({...p, [name]: false}));
  };

  const syncs = [
    { id:'standings',  label:'جدول الترتيب',        sub:'Egyptian Premier League 2025-26',      icon:Trophy,     color:'from-[#FFB81C] to-yellow-600',   fn: ceramicaCleopatra.admin.syncStandings },
    { id:'squad',      label:'قائمة اللاعبين',      sub:'مع صور حقيقية من Flashscore',           icon:Users,      color:'from-[#1B2852] to-blue-900',     fn: ceramicaCleopatra.admin.syncSquad },
    { id:'matches',    label:'النتائج الكاملة',     sub:'كل نتائج الدوري 2025-26',               icon:Calendar,   color:'from-green-600 to-emerald-700',  fn: ceramicaCleopatra.admin.syncMatches },
    { id:'fixtures',   label:'المباريات القادمة',   sub:'مع الملاعب والمعاينات + Preview News',  icon:Zap,        color:'from-orange-500 to-orange-700',  fn: ceramicaCleopatra.admin.syncFixtures },
    { id:'news',       label:'أخبار المباريات',     sub:'تقارير حقيقية من مباريات سيراميكا',     icon:Newspaper,  color:'from-purple-600 to-purple-800',  fn: ceramicaCleopatra.admin.syncNews },
    { id:'topscorers', label:'ترتيب الدوري',        sub:'مقال عن الترتيب الحالي',                icon:TrendingUp, color:'from-[#C8102E] to-red-700',      fn: ceramicaCleopatra.admin.syncTopScorers },
  ];

  return (
    <div>
      <h2 className="text-xl font-black text-white mb-6">{isArabic ? 'مزامنة البيانات' : 'API-Football Sync'}</h2>
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {syncs.map(s => (
          <div key={s.id} className="bg-gray-900 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-white font-bold">{s.label}</div>
                <div className="text-white/40 text-xs">{s.sub}</div>
              </div>
            </div>
            <Button onClick={() => run(s.id, s.fn)} disabled={loading[s.id]}
              className={`w-full bg-gradient-to-r ${s.color} text-white font-bold rounded-xl`}>
              {loading[s.id]
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                : <Download className="w-4 h-4 mr-2" />}
              {loading[s.id] ? (isArabic ? 'جاري المزامنة…' : 'Syncing…') : (isArabic ? 'مزامنة الآن' : 'Sync Now')}
            </Button>
            {results[s.id] && (
              <div className={`mt-3 text-xs rounded-lg px-3 py-2 ${results[s.id].ok ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {results[s.id].ok
                  ? `✓ ${isArabic ? 'تمت المزامنة —' : 'Synced —'} ${results[s.id].teams || results[s.id].players || results[s.id].matches || results[s.id].fixtures || results[s.id].articles || results[s.id].topScorers || (isArabic ? 'تم' : 'done')} ${isArabic ? 'سجل' : 'records'}`
                  : `✗ ${results[s.id].error}`}
              </div>
            )}
          </div>
        ))}
      </div>
      <Button onClick={() => run('all', ceramicaCleopatra.admin.syncAll)} disabled={Object.values(loading).some(Boolean)}
        className="bg-purple-700 hover:bg-purple-600 text-white font-bold rounded-xl px-8">
        <Zap className="w-4 h-4 mr-2" /> Sync Everything
      </Button>
    </div>
  );
}

// ─── Main Admin Panel ────────────────────────────────────────────────────────

export default function AdminPanel() {
  return (
    <RequireAdmin>
      <AdminPanelContent />
    </RequireAdmin>
  );
}

function AdminPanelContent() {
  const { user, logout } = useAuth();
  const { isArabic } = useLanguage();
  const [tab, setTab] = useState('dashboard');

  const TABS = [
    { id:'dashboard', label: isArabic ? 'لوحة التحكم' : 'Dashboard', icon:LayoutDashboard },
    { id:'news',      label: isArabic ? 'الأخبار'      : 'News',      icon:Newspaper },
    { id:'matches',   label: isArabic ? 'المباريات'    : 'Matches',   icon:Calendar },
    { id:'players',   label: isArabic ? 'اللاعبون'     : 'Players',   icon:Users },
    { id:'members',   label: isArabic ? 'الأعضاء'      : 'Members',   icon:Crown },
    { id:'sync',      label: isArabic ? 'مزامنة API'   : 'API Sync',  icon:Database },
    { id:'settings',  label: isArabic ? 'الإعدادات'    : 'Settings',  icon:Settings },
  ];

  const { data: stats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: ceramicaCleopatra.admin.getStats,
    enabled: tab === 'dashboard',
  });

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-white/10 flex flex-col fixed inset-y-0 left-0 z-40">
        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695e73c9350940eda2779d4d/62a3057fb_Ceramica_Cleopatra_FC_logo.png"
              alt="Logo" className="h-10 w-auto" />
            <div>
              <div className="text-white font-black text-sm leading-none">{isArabic ? 'لوحة الإدارة' : 'Admin Panel'}</div>
              <div className="text-[#FFB81C] text-xs mt-0.5">Ceramica Cleopatra FC</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t.id
                  ? 'bg-[#FFB81C] text-[#1B2852]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}>
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-[#FFB81C] rounded-full flex items-center justify-center text-[#1B2852] font-black text-sm">
              {user?.full_name?.[0] || 'A'}
            </div>
            <div>
              <div className="text-white text-sm font-semibold truncate max-w-32">{user?.full_name}</div>
              <div className="text-white/30 text-xs">{isArabic ? 'مدير النظام' : 'Administrator'}</div>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-2 text-red-400 hover:text-red-300 text-sm px-3 py-2 rounded-xl hover:bg-red-500/10 transition-colors">
            <LogOut className="w-4 h-4" /> {isArabic ? 'تسجيل الخروج' : 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64 p-8">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

            {/* Dashboard */}
            {tab === 'dashboard' && (
              <div>
                <h1 className="text-3xl font-black text-white mb-2">{isArabic ? 'لوحة التحكم' : 'Dashboard'}</h1>
                <p className="text-white/40 mb-8">{isArabic ? `مرحباً، ${user?.full_name} 👋` : `Welcome back, ${user?.full_name} 👋`}</p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  <StatCard icon={Users}     label={isArabic ? 'إجمالي الأعضاء' : 'Total Members'}   value={stats?.total_users}    color="from-blue-500 to-blue-700" />
                  <StatCard icon={Crown}     label={isArabic ? 'اشتراكات فعّالة' : 'Active Subs'}     value={stats?.active_members} color="from-[#FFB81C] to-yellow-600" />
                  <StatCard icon={TrendingUp} label={isArabic ? 'الإيرادات (جنيه)' : 'Revenue (EGP)'} value={stats?.total_revenue ? `${Number(stats.total_revenue).toLocaleString()} ${isArabic ? 'جنيه' : 'LE'}` : `0 ${isArabic ? 'جنيه' : 'LE'}`} color="from-green-500 to-green-700" />
                  <StatCard icon={Newspaper} label={isArabic ? 'مقالات الأخبار' : 'News Articles'}   value={stats?.total_news}     color="from-[#C8102E] to-red-700" />
                  <StatCard icon={Calendar}  label={isArabic ? 'المباريات' : 'Matches'}              value={stats?.total_matches}  color="from-purple-500 to-purple-700" />
                  <StatCard icon={Shield}    label={isArabic ? 'اللاعبون' : 'Players'}               value={stats?.total_players}  color="from-[#1B2852] to-blue-900" />
                </div>
                <div className="bg-gray-900 border border-white/10 rounded-2xl p-6">
                  <h3 className="text-white font-bold mb-4">{isArabic ? 'إجراءات سريعة' : 'Quick Actions'}</h3>
                  <div className="flex flex-wrap gap-3">
                    {([
                      [isArabic ? 'إضافة خبر'   : 'Add News',       'news',    'bg-purple-600 hover:bg-purple-500',          Newspaper],
                      [isArabic ? 'إضافة مباراة' : 'Add Match',      'matches', 'bg-green-700 hover:bg-green-600',             Calendar],
                      [isArabic ? 'إضافة لاعب'   : 'Add Player',     'players', 'bg-[#1B2852] hover:bg-[#243570]',             Users],
                      [isArabic ? 'إدارة الأعضاء': 'Manage Members', 'members', 'bg-[#FFB81C] hover:bg-yellow-400 text-[#1B2852]', Crown],
                      [isArabic ? 'مزامنة API'   : 'API Sync',       'sync',    'bg-[#C8102E] hover:bg-red-600',               Database],
                    ]).map(([l, t, cls, Icon]) => (
                      <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all ${cls}`}
                      >
                        <Icon className="w-4 h-4" />
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* News */}
            {tab === 'news' && (
              <CRUDTable
                title={isArabic ? 'مقالات الأخبار' : 'News Articles'}
                queryKey="news"
                fetchFn={() => ceramicaCleopatra.entities.News.list('-published_at', 100)}
                columns={[
                  { key:'title', label: isArabic ? 'العنوان' : 'Title', render: v => <span className="font-semibold text-white">{v?.slice(0,50)}</span> },
                  { key:'category', label: isArabic ? 'الفئة' : 'Category', render: v => <Badge className="text-xs">{v}</Badge> },
                  { key:'status', label: isArabic ? 'الحالة' : 'Status', render: v => <span className={`text-xs px-2 py-1 rounded-full ${v==='published'?'bg-green-500/20 text-green-400':'bg-yellow-500/20 text-yellow-400'}`}>{isArabic ? (v === 'published' ? 'منشور' : 'مسودة') : v}</span> },
                  { key:'published_at', label: isArabic ? 'تاريخ النشر' : 'Published', render: v => v ? new Date(v).toLocaleDateString() : '—' },
                  { key:'views', label: isArabic ? 'المشاهدات' : 'Views' },
                ]}
                renderForm={(props) => <NewsForm {...props} />}
              />
            )}

            {/* Matches */}
            {tab === 'matches' && (
              <CRUDTable
                title={isArabic ? 'المباريات' : 'Matches'}
                queryKey="matches"
                fetchFn={() => ceramicaCleopatra.entities.Match.list('-date', 200)}
                columns={[
                  { key:'home_team', label: isArabic ? 'المباراة' : 'Home', render: (_,r) => <span className="font-semibold text-white">{r.home_team} {isArabic ? 'ضد' : 'vs'} {r.away_team}</span> },
                  { key:'date', label: isArabic ? 'التاريخ' : 'Date', render: v => v ? new Date(v).toLocaleDateString() : '—' },
                  { key:'status', label: isArabic ? 'الحالة' : 'Status', render: v => <span className={`text-xs px-2 py-1 rounded-full ${v==='finished'?'bg-blue-500/20 text-blue-400':v==='live'?'bg-green-500/20 text-green-400':'bg-gray-500/20 text-gray-400'}`}>{isArabic ? {scheduled:'مجدولة',finished:'انتهت',live:'مباشر',postponed:'مؤجلة',cancelled:'ملغاة'}[v] || v : v}</span> },
                  { key:'home_score', label: isArabic ? 'النتيجة' : 'Score', render: (_,r) => r.status==='finished' ? `${r.home_score} - ${r.away_score}` : '—' },
                  { key:'competition', label: isArabic ? 'البطولة' : 'Competition' },
                ]}
                renderForm={(props) => <MatchForm {...props} />}
              />
            )}

            {/* Players */}
            {tab === 'players' && (
              <CRUDTable
                title={isArabic ? 'اللاعبون' : 'Players'}
                queryKey="players"
                fetchFn={() => ceramicaCleopatra.entities.Player.list('number', 100)}
                columns={[
                  { key:'name', label: isArabic ? 'اللاعب' : 'Player', render: (_,r) => (
                    <div className="flex items-center gap-2">
                      <img src={r.photo_url} alt="" className="w-7 h-7 rounded-full bg-white/10 object-cover" onError={e=>e.target.style.display='none'} />
                      <span className="font-semibold text-white">{r.name}</span>
                      {r.is_captain && <Crown className="w-3 h-3 text-[#FFB81C]" />}
                    </div>
                  )},
                  { key:'number', label:'#', render: v => <span className="font-bold text-[#FFB81C]">#{v}</span> },
                  { key:'position', label: isArabic ? 'المركز' : 'Position' },
                  { key:'nationality', label: isArabic ? 'الجنسية' : 'Nationality' },
                  { key:'status', label: isArabic ? 'الحالة' : 'Status', render: v => <span className={`text-xs px-2 py-1 rounded-full ${v==='available'?'bg-green-500/20 text-green-400':'bg-red-500/20 text-red-400'}`}>{isArabic ? {available:'متاح',injured:'مصاب',suspended:'موقوف'}[v] || v : v}</span> },
                ]}
                renderForm={(props) => <PlayerForm {...props} />}
              />
            )}

            {/* Members */}
            {tab === 'members' && <MembersTab />}

            {/* Sync */}
            {tab === 'sync' && <SyncTab />}

            {/* Settings */}
            {tab === 'settings' && <SettingsTab />}

          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
