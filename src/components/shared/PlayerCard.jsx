import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Flag, Star, AlertCircle } from 'lucide-react';

const positionColors = {
  Goalkeeper: 'from-yellow-500 to-yellow-600',
  Defender: 'from-blue-500 to-blue-600',
  Midfielder: 'from-green-500 to-green-600',
  Forward: 'from-red-500 to-red-600'
};

export default function PlayerCard({ player, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <Link 
        to={createPageUrl('PlayerProfile') + `?id=${player.id}`}
        className="block group"
      >
        <div className="relative bg-gradient-to-br from-[#0a1628] to-[#1e3a5f] rounded-2xl overflow-hidden">
          {/* Player Image */}
          <div className="relative h-64 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-transparent z-10" />
            <img 
              src={player.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&size=400&background=1e3a5f&color=fff`}
              alt={player.name}
              className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700"
            />
            
            {/* Number Badge */}
            <div className="absolute top-4 right-4 z-20">
              <span className="text-5xl font-black text-white/20 group-hover:text-[#d4af37]/30 transition-colors">
                {player.number}
              </span>
            </div>

            {/* Status Badges */}
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
              {player.is_captain && (
                <span className="flex items-center gap-1 px-2 py-1 bg-[#d4af37] text-[#0a1628] text-xs font-bold rounded">
                  <Star className="w-3 h-3" /> Captain
                </span>
              )}
              {player.status === 'injured' && (
                <span className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                  <AlertCircle className="w-3 h-3" /> Injured
                </span>
              )}
            </div>
          </div>

          {/* Player Info */}
          <div className="relative z-10 p-5 -mt-8">
            <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${positionColors[player.position] || 'from-gray-500 to-gray-600'} text-white text-xs font-bold mb-3`}>
              {player.position_detail || player.position}
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-[#d4af37] transition-colors">
              {player.name}
            </h3>
            <div className="flex items-center gap-2 text-white/50 text-sm mt-2">
              <Flag className="w-3 h-3" />
              <span>{player.nationality || 'Egypt'}</span>
            </div>

            {/* Stats */}
            {player.stats && (
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/10">
                <div className="text-center">
                  <span className="block text-xl font-bold text-white">{player.stats.appearances || 0}</span>
                  <span className="text-xs text-white/50">Apps</span>
                </div>
                <div className="text-center">
                  <span className="block text-xl font-bold text-[#d4af37]">{player.stats.goals || 0}</span>
                  <span className="text-xs text-white/50">Goals</span>
                </div>
                <div className="text-center">
                  <span className="block text-xl font-bold text-white">{player.stats.assists || 0}</span>
                  <span className="text-xs text-white/50">Assists</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}