import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Shield, Target, Crosshair } from 'lucide-react';
import PlayerCard from '@/components/shared/PlayerCard';

const positions = [
  { key: 'all', label: 'All Players', icon: Users },
  { key: 'Goalkeeper', label: 'Goalkeepers', icon: Shield },
  { key: 'Defender', label: 'Defenders', icon: Shield },
  { key: 'Midfielder', label: 'Midfielders', icon: Target },
  { key: 'Forward', label: 'Forwards', icon: Crosshair }
];

export default function Squad() {
  const [activePosition, setActivePosition] = useState('all');

  const { data: players = [], isLoading } = useQuery({
    queryKey: ['players'],
    queryFn: () => base44.entities.Player.list('number', 50)
  });

  const filteredPlayers = activePosition === 'all' 
    ? players 
    : players.filter(p => p.position === activePosition);

  // Group by position for display
  const groupedPlayers = {
    Goalkeeper: filteredPlayers.filter(p => p.position === 'Goalkeeper'),
    Defender: filteredPlayers.filter(p => p.position === 'Defender'),
    Midfielder: filteredPlayers.filter(p => p.position === 'Midfielder'),
    Forward: filteredPlayers.filter(p => p.position === 'Forward')
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#1e3a5f]">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1920')] bg-cover bg-center opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a1628]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-black text-white mb-4"
          >
            First Team <span className="text-[#d4af37]">Squad</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/60 text-lg max-w-2xl mx-auto"
          >
            Meet the players who represent Ceramica Cleopatra FC on the pitch
          </motion.p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="sticky top-20 z-30 bg-[#0a1628]/95 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
            {positions.map((pos) => (
              <button
                key={pos.key}
                onClick={() => setActivePosition(pos.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium whitespace-nowrap transition-all ${
                  activePosition === pos.key
                    ? 'bg-[#d4af37] text-[#0a1628]'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <pos.icon className="w-4 h-4" />
                {pos.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Players Grid */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-96 bg-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : activePosition === 'all' ? (
            // Show grouped by position
            Object.entries(groupedPlayers).map(([position, posPlayers]) => (
              posPlayers.length > 0 && (
                <div key={position} className="mb-12">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <span className="w-1.5 h-8 bg-[#d4af37] rounded-full" />
                    {position}s
                    <span className="text-white/40 text-lg font-normal">({posPlayers.length})</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {posPlayers.map((player, index) => (
                      <PlayerCard key={player.id} player={player} index={index} />
                    ))}
                  </div>
                </div>
              )
            ))
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPlayers.map((player, index) => (
                <PlayerCard key={player.id} player={player} index={index} />
              ))}
            </div>
          )}

          {!isLoading && filteredPlayers.length === 0 && (
            <div className="text-center py-20">
              <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/50 text-lg">No players found</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}