import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function LiveScores({ matches = [] }) {
  const liveMatches = matches.filter(m => m.status === 'live' || m.status === 'halftime');

  return (
    <div className="bg-[#1B2852] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-500" />
            <span className="text-white font-semibold">Live Scores</span>
            {liveMatches.length > 0 && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                {liveMatches.length} LIVE
              </span>
            )}
          </div>
          <Link 
            to={createPageUrl('MatchCenter')}
            className="text-[#FFB81C] text-sm flex items-center gap-1 hover:gap-2 transition-all"
          >
            Match Center <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {matches.slice(0, 8).map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0 bg-white/5 rounded-xl p-4 min-w-[280px] border border-white/10 hover:border-[#FFB81C]/50 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-white/50">{match.competition}</span>
                {(match.status === 'live' || match.status === 'halftime') ? (
                  <span className="flex items-center gap-1.5 text-xs">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-red-400 font-medium">
                      {match.status === 'halftime' ? 'HT' : `${match.minute}'`}
                    </span>
                  </span>
                ) : match.status === 'finished' ? (
                  <span className="text-xs text-white/50">FT</span>
                ) : (
                  <span className="text-xs text-white/50">
                    {new Date(match.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center">
                      {match.home_logo ? (
                        <img src={match.home_logo} alt="" className="w-4 h-4 object-contain" />
                      ) : (
                        <span className="text-[8px] font-bold text-white">{match.home_team?.slice(0, 2)}</span>
                      )}
                    </div>
                    <span className="text-white text-sm font-medium truncate max-w-[140px]">{match.home_team}</span>
                  </div>
                  <span className="text-white font-bold">{match.home_score ?? '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center">
                      {match.away_logo ? (
                        <img src={match.away_logo} alt="" className="w-4 h-4 object-contain" />
                      ) : (
                        <span className="text-[8px] font-bold text-white">{match.away_team?.slice(0, 2)}</span>
                      )}
                    </div>
                    <span className="text-white text-sm font-medium truncate max-w-[140px]">{match.away_team}</span>
                  </div>
                  <span className="text-white font-bold">{match.away_score ?? '-'}</span>
                </div>
              </div>
            </motion.div>
          ))}

          {matches.length === 0 && (
            <div className="text-white/50 text-sm py-4">No matches today</div>
          )}
        </div>
      </div>
    </div>
  );
}