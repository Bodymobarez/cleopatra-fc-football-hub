import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { ceramicaCleopatra } from '@/api/ceramicaCleopatraClient';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, Eye, EyeOff, CheckCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const PLAN_ICONS = { 0: '🆓', 99: '🥈', 249: '🥇', 799: '💎' };

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step,    setStep]    = useState(1); // 1=details, 2=plan
  const [form,    setForm]    = useState({ full_name:'', email:'', password:'', phone:'' });
  const [planId,  setPlanId]  = useState(null);
  const [show,    setShow]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const { data: plans = [] } = useQuery({
    queryKey: ['plans'],
    queryFn: () => ceramicaCleopatra.entities.SubscriptionPlan.list('sort_order', 10),
  });

  const handleStep1 = (e) => {
    e.preventDefault();
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError('');
    setStep(2);
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await register({ ...form, plan_id: planId });
      toast.success('Welcome to Ceramica Cleopatra FC! 🔴⚫');
      navigate('/Dashboard');
    } catch (err) {
      const msg = err.message?.includes('409') ? 'Email already registered'
                : 'Registration failed. Please try again.';
      setError(msg);
      setStep(1);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1920')] opacity-5 bg-cover bg-center" />

      <div className="relative max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695e73c9350940eda2779d4d/62a3057fb_Ceramica_Cleopatra_FC_logo.png"
            alt="Logo" className="h-16 mx-auto mb-4"
          />
          <h1 className="text-3xl font-black text-white">Join Ceramica Cleopatra FC</h1>
          <p className="text-white/40 mt-1">Become a member of our football family</p>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1,2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${step >= s ? 'bg-[#FFB81C] text-[#1B2852]' : 'bg-white/10 text-white/40'}`}>
                {step > s ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              <span className={`text-sm ${step >= s ? 'text-white' : 'text-white/30'}`}>
                {s === 1 ? 'Your Details' : 'Choose Plan'}
              </span>
              {s < 2 && <div className={`w-12 h-0.5 ${step > s ? 'bg-[#FFB81C]' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Step 1: Details */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-900 border border-white/10 rounded-3xl p-8"
          >
            <form onSubmit={handleStep1} className="space-y-5">
              <div>
                <label className="block text-white/60 text-sm mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input placeholder="Your full name" value={form.full_name}
                    onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} required
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#FFB81C] rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input type="email" placeholder="your@email.com" value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#FFB81C] rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-2">Phone (optional)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input placeholder="+20 1xx xxx xxxx" value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#FFB81C] rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input type={show ? 'text' : 'password'} placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required
                    className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#FFB81C] rounded-xl" />
                  <button type="button" onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-[#1B2852] to-[#C8102E] text-white font-bold rounded-xl h-12">
                Continue →
              </Button>
            </form>
            <p className="text-center text-sm text-white/40 mt-4">
              Already a member?{' '}
              <Link to="/Login" className="text-[#FFB81C] hover:underline">Sign in</Link>
            </p>
          </motion.div>
        )}

        {/* Step 2: Choose Plan */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="grid grid-cols-1 gap-4 mb-6">
              {plans.map(plan => {
                const isSelected = planId === plan.id;
                const isFree = plan.price === 0;
                const feats = Array.isArray(plan.features) ? plan.features : JSON.parse(plan.features || '[]');
                return (
                  <motion.button
                    key={plan.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setPlanId(plan.id)}
                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                      isSelected
                        ? 'border-[#FFB81C] bg-[#FFB81C]/10'
                        : 'border-white/10 bg-gray-900 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{PLAN_ICONS[plan.price] || '🎯'}</span>
                        <div>
                          <div className="font-black text-white">{plan.name}</div>
                          <div className="text-white/50 text-xs">{plan.name_ar}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-xl" style={{ color: plan.badge_color || '#FFB81C' }}>
                          {isFree ? 'Free' : `${plan.price} EGP`}
                        </div>
                        {!isFree && <div className="text-white/30 text-xs">{plan.duration_days} days</div>}
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {feats.slice(0, 4).map((f, i) => (
                        <span key={i} className="text-xs bg-white/5 text-white/50 px-2 py-0.5 rounded-full">
                          ✓ {f}
                        </span>
                      ))}
                    </div>
                    {isSelected && (
                      <div className="mt-2 flex items-center gap-1.5 text-[#FFB81C] text-sm font-semibold">
                        <CheckCircle className="w-4 h-4" /> Selected
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)}
                className="flex-1 border-white/10 text-white/60 hover:bg-white/5 rounded-xl h-12">
                ← Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || !planId}
                className="flex-2 flex-grow bg-gradient-to-r from-[#1B2852] to-[#C8102E] text-white font-bold rounded-xl h-12"
              >
                {loading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : '🎉 Complete Registration'}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
