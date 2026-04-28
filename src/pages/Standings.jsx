import React from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { ceramicaCleopatra } from '@/api/ceramicaCleopatraClient';
import { useQuery } from '@tanstack/react-query';
import { ensureArray } from '@/utils';
import { motion } from 'framer-motion';
import { Trophy, Crown, RefreshCw, ArrowUpRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from 'react-router-dom';

const FORM_COLORS = { W: 'bg-green-500', D: 'bg-yellow-500', L: 'bg-red-500' };

function FormBadge({ form }) {
  if (!form) return null;
  return (
    <div className="flex gap-0.5">
      {form.slice(-5).split('').map((r, i) => (
        <span
          key={i}
          className={`w-4 h-4 rounded-sm text-white text-[9px] font-bold flex items-center justify-center ${FORM_COLORS[r] || 'bg-gray-400'}`}
        >
          {r}
        </span>
      ))}
    </div>
  );
}

export default function Standings() {
  const { t, isArabic } = useLanguage();
  const { data: standings = [], isLoading, refetch } = useQuery({
    queryKey: ['standings'],
    queryFn: () => ceramicaCleopatra.entities.Standing.list('-created_date', 1),
    select: ensureArray,
  });

  const current = standings[0];
  const teams   = Array.isArray(current?.teams) ? current.teams : (
    typeof current?.teams === 'string' ? JSON.parse(current.teams) : []
  );
  const totalTeams = teams.length;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#1B2852] to-[#C8102E]/30" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1920')] opacity-10 bg-cover bg-center" />
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-[#FFB81C]/20 border border-[#FFB81C]/30 rounded-full px-5 py-2 mb-6">
              <Trophy className="w-4 h-4 text-[#FFB81C]" />
              <span className="text-[#FFB81C] text-sm font-bold uppercase tracking-wider">
                {isArabic ? 'الدوري المصري الممتاز' : 'Egyptian Premier League'}
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-4">
              {isArabic ? 'جدول' : 'League'} <span className="text-[#FFB81C]">{isArabic ? 'الترتيب' : 'Standings'}</span>
            </h1>
            <p className="text-white/50 text-lg">
              {current?.competition || (isArabic ? 'الدوري المصري الممتاز' : 'Egyptian Premier League')} &mdash; {current?.season || '2025/26 Season'}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {isArabic ? 'تحديث' : 'Refresh'}
            </button>
          </motion.div>
        </div>
      </section>

      {/* Table */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="bg-gray-900 rounded-2xl p-8">
              <div className="space-y-3">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          ) : teams.length === 0 ? (
            <div className="text-center py-24">
              <Trophy className="w-20 h-20 text-white/20 mx-auto mb-6" />
              <p className="text-white/40 text-xl mb-4">{isArabic ? 'لا تتوفر بيانات الترتيب' : 'No standings data available'}</p>
              <p className="text-white/30 text-sm">
                Go to <Link to="/Admin" className="text-[#FFB81C] underline">Admin</Link> → "جدول الدوري" → Sync Now
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#1B2852]/80 border-white/10 hover:bg-[#1B2852]/80">
                      <TableHead className="text-[#FFB81C] font-bold w-12">#</TableHead>
                      <TableHead className="text-[#FFB81C] font-bold">{isArabic ? 'النادي' : 'Club'}</TableHead>
                      <TableHead className="text-white/70 font-semibold text-center" title={isArabic ? 'لعب' : 'Played'}>{isArabic ? 'ل' : 'P'}</TableHead>
                      <TableHead className="text-white/70 font-semibold text-center" title={isArabic ? 'فاز' : 'Won'}>{isArabic ? 'ف' : 'W'}</TableHead>
                      <TableHead className="text-white/70 font-semibold text-center" title={isArabic ? 'تعادل' : 'Drawn'}>{isArabic ? 'ت' : 'D'}</TableHead>
                      <TableHead className="text-white/70 font-semibold text-center" title={isArabic ? 'خسر' : 'Lost'}>{isArabic ? 'خ' : 'L'}</TableHead>
                      <TableHead className="text-white/70 font-semibold text-center" title={isArabic ? 'أهداف له' : 'Goals For'}>{isArabic ? 'له' : 'GF'}</TableHead>
                      <TableHead className="text-white/70 font-semibold text-center" title={isArabic ? 'أهداف عليه' : 'Goals Against'}>{isArabic ? 'عليه' : 'GA'}</TableHead>
                      <TableHead className="text-white/70 font-semibold text-center" title={isArabic ? 'الفارق' : 'Goal Diff'}>{isArabic ? 'ف.أ' : 'GD'}</TableHead>
                      <TableHead className="text-white/70 font-semibold text-center hidden md:table-cell">{isArabic ? 'الشكل' : 'Form'}</TableHead>
                      <TableHead className="text-[#FFB81C] font-bold text-center">{isArabic ? 'نقاط' : 'Pts'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teams.map((team, index) => {
                      const isCeramica = team.team?.toLowerCase().includes('ceramica');
                      const isTop3     = team.position <= 3;
                      const isBottom2  = team.position >= totalTeams - 1;

                      return (
                        <motion.tr
                          key={team.team || index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className={`border-b border-white/5 transition-colors
                            ${isCeramica ? 'bg-[#FFB81C]/10 hover:bg-[#FFB81C]/15' : 'hover:bg-white/5'}
                          `}
                        >
                          {/* Position */}
                          <TableCell className="font-bold text-white">
                            <div className="flex items-center gap-1">
                              {isTop3 && (
                                <span className={`w-1.5 h-8 rounded-full mr-1 ${
                                  team.position === 1 ? 'bg-[#FFB81C]' :
                                  team.position === 2 ? 'bg-gray-400' : 'bg-amber-700'
                                }`} />
                              )}
                              {isBottom2 && (
                                <span className="w-1.5 h-8 rounded-full mr-1 bg-red-500" />
                              )}
                              <span className={isCeramica ? 'text-[#FFB81C]' : 'text-white/70'}>
                                {team.position}
                              </span>
                              {team.position === 1 && <Crown className="w-3.5 h-3.5 text-[#FFB81C]" />}
                            </div>
                          </TableCell>

                          {/* Club */}
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {team.team_logo ? (
                                <img
                                  src={team.team_logo}
                                  alt={team.team}
                                  className="w-8 h-8 object-contain"
                                  onError={e => { e.target.style.display = 'none'; }}
                                />
                              ) : (
                                <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-white/60 text-xs font-bold">
                                  {(team.team || '?').slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <span className={`font-semibold ${isCeramica ? 'text-[#FFB81C]' : 'text-white'}`}>
                                {team.team}
                                {isCeramica && (
                                  <span className="ml-2 text-[10px] bg-[#FFB81C] text-[#1B2852] px-1.5 py-0.5 rounded font-black uppercase">
                                    Our Club
                                  </span>
                                )}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="text-center text-white/80">{team.played}</TableCell>
                          <TableCell className="text-center text-green-400 font-semibold">{team.won}</TableCell>
                          <TableCell className="text-center text-yellow-400">{team.drawn}</TableCell>
                          <TableCell className="text-center text-red-400">{team.lost}</TableCell>
                          <TableCell className="text-center text-white/70">{team.goals_for}</TableCell>
                          <TableCell className="text-center text-white/70">{team.goals_against}</TableCell>
                          <TableCell className={`text-center font-semibold ${
                            team.goal_difference > 0 ? 'text-green-400' :
                            team.goal_difference < 0 ? 'text-red-400' : 'text-white/50'
                          }`}>
                            {team.goal_difference > 0 ? '+' : ''}{team.goal_difference}
                          </TableCell>

                          {/* Form */}
                          <TableCell className="hidden md:table-cell">
                            <FormBadge form={team.form} />
                          </TableCell>

                          {/* Points */}
                          <TableCell className="text-center">
                            <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-black text-sm
                              ${isCeramica
                                ? 'bg-[#FFB81C] text-[#1B2852]'
                                : isTop3
                                ? 'bg-[#1B2852] text-[#FFB81C] border border-[#FFB81C]/30'
                                : 'bg-white/10 text-white'}
                            `}>
                              {team.points}
                            </span>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Legend */}
              <div className="p-5 bg-black/20 border-t border-white/10 flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-8 bg-[#FFB81C] rounded-full" />
                  <span className="text-white/60">Top 3 / Champions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-8 bg-red-500 rounded-full" />
                  <span className="text-white/60">Relegation Zone</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#FFB81C]/20 rounded border border-[#FFB81C]/40" />
                  <span className="text-white/60">Ceramica Cleopatra</span>
                </div>
                <div className="ml-auto flex items-center gap-1 text-white/30 text-xs">
                  <RefreshCw className="w-3 h-3" />
                  Source: API-Football (api-sports.io)
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
