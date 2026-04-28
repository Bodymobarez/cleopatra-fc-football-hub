import React from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { ceramicaCleopatra } from '@/api/ceramicaCleopatraClient';
import { useQuery } from '@tanstack/react-query';
import { ensureArray } from '@/utils';
import { motion } from 'framer-motion';
import { Trophy, Crown, RefreshCw, ShieldAlert } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from 'react-router-dom';

const FORM_COLORS = { W: 'bg-green-500', D: 'bg-yellow-500', L: 'bg-red-500' };

function FormBadge({ form }) {
  if (!form) return null;
  return (
    <div className="flex gap-0.5">
      {String(form).slice(-5).split('').map((r, i) => (
        <span key={i} className={`w-4 h-4 rounded-sm text-white text-[9px] font-bold flex items-center justify-center ${FORM_COLORS[r] || 'bg-gray-400'}`}>
          {r}
        </span>
      ))}
    </div>
  );
}

/* ── Shared standings table ───────────────────────────────── */
function StandingsTable({ teams, isArabic, isRelGroup = false }) {
  const totalTeams = teams.length;
  const cols = [
    { key: 'pos',   label: '#',                              ar: '#'       },
    { key: 'club',  label: 'Club',                           ar: 'النادي'  },
    { key: 'P',     label: 'P',   title: 'Played',           ar: 'ل'       },
    { key: 'W',     label: 'W',   title: 'Won',              ar: 'ف'       },
    { key: 'D',     label: 'D',   title: 'Drawn',            ar: 'ت'       },
    { key: 'L',     label: 'L',   title: 'Lost',             ar: 'خ'       },
    { key: 'GF',    label: 'GF',  title: 'Goals For',        ar: 'له'      },
    { key: 'GA',    label: 'GA',  title: 'Goals Against',    ar: 'عليه'    },
    { key: 'GD',    label: 'GD',  title: 'Goal Difference',  ar: 'ف.أ'    },
    { key: 'form',  label: 'Form',                           ar: 'الشكل'   },
    { key: 'pts',   label: 'Pts',                            ar: 'نقاط'    },
  ];

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#1B2852]/80 border-white/10 hover:bg-[#1B2852]/80">
            {cols.map(c => (
              <TableHead key={c.key}
                className={`text-[#FFB81C] font-bold ${['P','W','D','L','GF','GA','GD','pts'].includes(c.key) ? 'text-center' : ''} ${c.key === 'form' ? 'hidden md:table-cell' : ''}`}
                title={c.title}
              >
                {isArabic ? c.ar : c.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team, index) => {
            const isCeramica = (team.team || '').toLowerCase().includes('ceramica');
            const isTop3     = !isRelGroup && team.position <= 3;
            const isBottom2  = !isRelGroup && team.position >= totalTeams - 1;
            const isRelTop   =  isRelGroup && team.position <= 1;
            const isRelBot   =  isRelGroup && team.position >= totalTeams;

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
                <TableCell className="font-bold text-white">
                  <div className="flex items-center gap-1">
                    {(isTop3 || isRelTop) && (
                      <span className={`w-1.5 h-8 rounded-full mr-1 ${
                        team.position === 1 ? 'bg-[#FFB81C]' :
                        team.position === 2 ? 'bg-gray-400' : 'bg-amber-700'
                      }`} />
                    )}
                    {(isBottom2 || isRelBot) && (
                      <span className="w-1.5 h-8 rounded-full mr-1 bg-red-500" />
                    )}
                    <span className={isCeramica ? 'text-[#FFB81C]' : 'text-white/70'}>{team.position}</span>
                    {team.position === 1 && !isRelGroup && <Crown className="w-3.5 h-3.5 text-[#FFB81C]" />}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-3">
                    {team.team_logo ? (
                      <img src={team.team_logo} alt={team.team} className="w-8 h-8 object-contain"
                        onError={e => { e.target.style.display = 'none'; }} />
                    ) : (
                      <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-white/60 text-xs font-bold">
                        {(team.team || '?').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className={`font-semibold ${isCeramica ? 'text-[#FFB81C]' : 'text-white'}`}>
                      {team.team}
                      {isCeramica && (
                        <span className="ml-2 text-[10px] bg-[#FFB81C] text-[#1B2852] px-1.5 py-0.5 rounded font-black uppercase">
                          {isArabic ? 'ناديك' : 'Our Club'}
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
                <TableCell className="hidden md:table-cell"><FormBadge form={team.form} /></TableCell>
                <TableCell className="text-center">
                  <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-black text-sm
                    ${isCeramica ? 'bg-[#FFB81C] text-[#1B2852]'
                      : isTop3 || isRelTop ? 'bg-[#1B2852] text-[#FFB81C] border border-[#FFB81C]/30'
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
  );
}

export default function Standings() {
  const { isArabic } = useLanguage();

  const { data: standings = [], isLoading: loadingChamp, refetch: refetchChamp } = useQuery({
    queryKey: ['standings'],
    queryFn: () => ceramicaCleopatra.entities.Standing.list('-created_date', 1),
    select: ensureArray,
  });

  const { data: relData, isLoading: loadingRel, refetch: refetchRel } = useQuery({
    queryKey: ['relegation-standings'],
    queryFn: () => ceramicaCleopatra.relegationStandings(),
    staleTime: 5 * 60 * 1000,
  });

  const current = standings[0];
  const champTeams = Array.isArray(current?.teams) ? current.teams
    : (typeof current?.teams === 'string' ? JSON.parse(current.teams) : []);
  const relTeams = relData?.teams || [];

  const isLoading = loadingChamp;
  const refetch = () => { refetchChamp(); refetchRel(); };

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

      {/* Tables */}
      <section className="py-12 px-4 space-y-12">
        <div className="max-w-7xl mx-auto space-y-12">

          {/* ── Championship Group ── */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-[#FFB81C]/20 rounded-xl">
                <Trophy className="w-5 h-5 text-[#FFB81C]" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">{isArabic ? 'مجموعة البطل' : 'Championship Group'}</h2>
                <p className="text-white/40 text-sm">{isArabic ? 'أفضل 8 أندية' : 'Top 8 clubs'}</p>
              </div>
            </div>

            {isLoading ? (
              <div className="bg-gray-900 rounded-2xl p-8 space-y-3">
                {[...Array(8)].map((_, i) => <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />)}
              </div>
            ) : champTeams.length === 0 ? (
              <div className="text-center py-16 bg-gray-900 rounded-2xl">
                <Trophy className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/40 mb-2">{isArabic ? 'لا تتوفر بيانات' : 'No data available'}</p>
                <p className="text-white/30 text-sm">
                  <Link to="/AdminPanel" className="text-[#FFB81C] underline">{isArabic ? 'الأدمن' : 'Admin'}</Link>
                  {' → '}{isArabic ? 'مزامنة جدول الدوري' : 'Sync Standings'}
                </p>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <StandingsTable teams={champTeams} isArabic={isArabic} isRelGroup={false} />
                <div className="p-4 bg-black/20 border-t border-white/10 flex flex-wrap gap-5 text-xs text-white/50">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-5 bg-[#FFB81C] rounded-full inline-block" />{isArabic ? 'صاعد للبطل' : 'Champion'}</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-5 bg-red-500 rounded-full inline-block" />{isArabic ? 'منطقة الهبوط' : 'Relegation'}</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#FFB81C]/20 rounded border border-[#FFB81C]/40 inline-block" />Ceramica Cleopatra</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* ── Relegation Group ── */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-red-500/20 rounded-xl">
                <ShieldAlert className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">{isArabic ? 'مجموعة الهبوط' : 'Relegation Group'}</h2>
                <p className="text-white/40 text-sm">
                  {isArabic ? 'محسوب من نتائج المباريات' : 'Computed from match results'}
                  {relData?.fromMatches ? ` · ${relData.fromMatches} ${isArabic ? 'مباراة' : 'matches'}` : ''}
                </p>
              </div>
            </div>

            {loadingRel ? (
              <div className="bg-gray-900 rounded-2xl p-8 space-y-3">
                {[...Array(6)].map((_, i) => <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />)}
              </div>
            ) : relTeams.length === 0 ? (
              <div className="text-center py-16 bg-gray-900 rounded-2xl">
                <ShieldAlert className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/40 mb-2">{isArabic ? 'لا تتوفر نتائج مباريات مجموعة الهبوط' : 'No relegation group match results yet'}</p>
                <p className="text-white/30 text-sm">
                  <Link to="/AdminPanel" className="text-[#FFB81C] underline">{isArabic ? 'الأدمن' : 'Admin'}</Link>
                  {' → '}{isArabic ? 'مزامنة المباريات' : 'Sync Matches'}
                </p>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="bg-gray-900 border border-red-500/20 rounded-2xl overflow-hidden shadow-2xl">
                <StandingsTable teams={relTeams} isArabic={isArabic} isRelGroup={true} />
                <div className="p-4 bg-black/20 border-t border-white/10 flex flex-wrap gap-5 text-xs text-white/50">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-5 bg-[#FFB81C] rounded-full inline-block" />{isArabic ? 'أعلى ترتيب' : 'Top ranked'}</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-5 bg-red-500 rounded-full inline-block" />{isArabic ? 'هابط' : 'Relegated'}</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Source / refresh footer */}
          <div className="flex items-center justify-between text-white/30 text-xs pt-2">
            <div className="flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              {isArabic ? 'المصدر: Flashscore API' : 'Source: Flashscore API (sportdb.dev)'}
            </div>
            <button onClick={refetch} className="flex items-center gap-1 hover:text-white/60 transition-colors">
              <RefreshCw className="w-3 h-3" />
              {isArabic ? 'تحديث' : 'Refresh'}
            </button>
          </div>

        </div>
      </section>
    </div>
  );
}
