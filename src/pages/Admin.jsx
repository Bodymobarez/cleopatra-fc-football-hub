import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  RefreshCw, Newspaper, Users, Calendar, Trophy,
  Download, CheckCircle, AlertCircle, Loader2, Globe,
  Zap, Activity, Database, Shield
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const API_BASE = '/api';

async function callSync(endpoint) {
  const res = await fetch(`${API_BASE}/sync/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

const SYNC_TASKS = [
  {
    id: 'standings',
    title: 'جدول الدوري المصري',
    titleEn: 'Egyptian League Standings',
    description: 'ترتيب الدوري المصري الممتاز 2024/25 – مباشر من API-Football',
    icon: Trophy,
    color: 'from-[#FFB81C] to-yellow-600',
    badge: 'Live Data',
    endpoint: 'standings',
    resultKey: 'teams',
  },
  {
    id: 'squad',
    title: 'قائمة لاعبي سيراميكا',
    titleEn: 'Ceramica Cleopatra Squad',
    description: 'استيراد قائمة اللاعبين الرسمية من API-Football (team ID: 14651)',
    icon: Users,
    color: 'from-[#1B2852] to-blue-900',
    badge: 'Live Data',
    endpoint: 'squad',
    resultKey: 'players',
  },
  {
    id: 'matches',
    title: 'المباريات والنتائج',
    titleEn: 'Fixtures & Results',
    description: 'كل مباريات سيراميكا + أحدث مباريات الدوري المصري',
    icon: Calendar,
    color: 'from-green-600 to-emerald-700',
    badge: 'Live Data',
    endpoint: 'matches',
    resultKey: 'matches',
  },
  {
    id: 'topscorers',
    title: 'هدافو الدوري المصري',
    titleEn: 'Top Scorers',
    description: 'قائمة أفضل الهدافين في الدوري المصري الممتاز هذا الموسم',
    icon: Activity,
    color: 'from-[#C8102E] to-red-700',
    badge: 'Live Data',
    endpoint: 'topscorers',
    resultKey: 'topScorers',
  },
  {
    id: 'all',
    title: 'مزامنة كل شيء',
    titleEn: 'Sync All',
    description: 'تحديث جميع البيانات دفعة واحدة: ترتيب + لاعبون + مباريات + هدافون',
    icon: Zap,
    color: 'from-purple-600 to-purple-800',
    badge: 'Full Sync',
    endpoint: 'all',
    resultKey: null,
  },
];

const STATS_ITEMS = [
  { label: 'League ID', value: '233', sub: 'Egyptian Premier League' },
  { label: 'Team ID', value: '14651', sub: 'Ceramica Cleopatra FC' },
  { label: 'Season', value: '2024/25', sub: 'Current Season' },
  { label: 'API', value: 'api-sports.io', sub: 'v3 Football API' },
];

export default function Admin() {
  const [loading, setLoading] = useState({});
  const [results, setResults]  = useState({});
  const queryClient = useQueryClient();

  const runSync = async (task) => {
    setLoading(p => ({ ...p, [task.id]: true }));
    setResults(p => ({ ...p, [task.id]: null }));
    try {
      const data = await callSync(task.endpoint);
      setResults(p => ({
        ...p,
        [task.id]: {
          success: true,
          count: task.resultKey ? (data[task.resultKey] ?? 0) : 'Done',
          updatedAt: data.updatedAt,
          details: data.results, // for 'all'
        },
      }));
      toast.success(`✅ ${task.titleEn} synced successfully!`);
      queryClient.invalidateQueries();
    } catch (err) {
      setResults(p => ({ ...p, [task.id]: { success: false, error: err.message } }));
      toast.error(`❌ ${task.titleEn}: ${err.message}`);
    } finally {
      setLoading(p => ({ ...p, [task.id]: false }));
    }
  };

  const anyLoading = Object.values(loading).some(Boolean);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#1B2852] to-[#C8102E]/40" />
        <div className="relative max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#FFB81C] rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#1B2852]" />
              </div>
              <Badge className="bg-[#FFB81C]/20 text-[#FFB81C] border-[#FFB81C]/30">
                Admin Dashboard
              </Badge>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
              Data <span className="text-[#FFB81C]">Sync Center</span>
            </h1>
            <p className="text-white/60 text-lg max-w-2xl">
              استيراد بيانات حقيقية من API-Football مباشرةً إلى قاعدة البيانات
              — ترتيب الدوري المصري، قائمة اللاعبين، المباريات، الهدافون.
            </p>
          </motion.div>

          {/* API Info Cards */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS_ITEMS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-xl p-4"
              >
                <div className="text-[#FFB81C] font-black text-xl">{s.value}</div>
                <div className="text-white text-sm font-semibold">{s.label}</div>
                <div className="text-white/40 text-xs mt-0.5">{s.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sync Cards */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SYNC_TASKS.map((task, index) => {
              const res = results[task.id];
              const isLoading = loading[task.id];
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                >
                  <Card className="relative overflow-hidden bg-gray-900 border-white/10 hover:border-[#FFB81C]/40 transition-all h-full">
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${task.color} opacity-10 rounded-full transform translate-x-8 -translate-y-8`} />

                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${task.color} flex items-center justify-center`}>
                          <task.icon className="w-6 h-6 text-white" />
                        </div>
                        <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                          {task.badge}
                        </Badge>
                      </div>
                      <CardTitle className="text-white text-lg mt-3">{task.title}</CardTitle>
                      <p className="text-[#FFB81C] text-sm font-medium">{task.titleEn}</p>
                      <CardDescription className="text-white/50 text-sm">{task.description}</CardDescription>
                    </CardHeader>

                    <CardContent>
                      <Button
                        onClick={() => runSync(task)}
                        disabled={isLoading || anyLoading}
                        className={`w-full bg-gradient-to-r ${task.color} hover:opacity-90 text-white font-bold`}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Syncing…
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Sync Now
                          </>
                        )}
                      </Button>

                      {/* Result */}
                      {res && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`mt-4 p-3 rounded-xl border text-sm ${
                            res.success
                              ? 'bg-green-500/10 border-green-500/30 text-green-400'
                              : 'bg-red-500/10 border-red-500/30 text-red-400'
                          }`}
                        >
                          {res.success ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 shrink-0" />
                              <span>
                                {typeof res.count === 'number'
                                  ? `${res.count} records synced`
                                  : res.count}
                                {res.details && (
                                  <span className="text-white/40 ml-1">
                                    ({Object.keys(res.details).filter(k => !res.details[k]?.error).length}/{Object.keys(res.details).length} tasks)
                                  </span>
                                )}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                              <span className="break-all">{res.error}</span>
                            </div>
                          )}
                          {res.updatedAt && (
                            <div className="text-white/30 text-xs mt-1">
                              {new Date(res.updatedAt).toLocaleTimeString()}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Info Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-10 bg-gray-900 border border-white/10 rounded-2xl p-8"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-[#FFB81C]" />
              How the Sync Works
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-white/60">
              <div className="space-y-2">
                <p className="flex items-start gap-2">
                  <span className="text-[#FFB81C] mt-0.5">▸</span>
                  <span>البيانات تأتي مباشرة من <strong className="text-white">api-sports.io</strong> (v3 Football API)</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-[#FFB81C] mt-0.5">▸</span>
                  <span>جدول الترتيب يُحدَّث من League 233 (Eg. Premier League)</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-[#FFB81C] mt-0.5">▸</span>
                  <span>قائمة اللاعبين تُستورد من Team 14651 (Ceramica Cleopatra)</span>
                </p>
              </div>
              <div className="space-y-2">
                <p className="flex items-start gap-2">
                  <span className="text-[#FFB81C] mt-0.5">▸</span>
                  <span>المباريات: fixtures للموسم 2024 كاملة + آخر 30 مباراة في الدوري</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-[#FFB81C] mt-0.5">▸</span>
                  <span>البيانات تُحفظ في Neon PostgreSQL وتظهر فوراً في الموقع</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-[#FFB81C] mt-0.5">▸</span>
                  <span>Sync كل شيء في ضغطة واحدة على "مزامنة كل شيء"</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
