import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Minus, Crown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Standings() {
  const { data: standings = [], isLoading } = useQuery({
    queryKey: ['standings'],
    queryFn: () => base44.entities.Standing.list('-created_date', 10)
  });

  const currentStanding = standings[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#1B2852] via-[#C8102E] to-[#1B2852] py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Trophy className="w-16 h-16 text-[#FFB81C] mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
              League <span className="text-[#FFB81C]">Standings</span>
            </h1>
            <p className="text-white/70 text-lg">
              {currentStanding?.competition} - {currentStanding?.season}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Standings Table */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="space-y-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            </div>
          ) : currentStanding ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#1B2852]">
                      <TableHead className="text-white font-bold">Pos</TableHead>
                      <TableHead className="text-white font-bold">Team</TableHead>
                      <TableHead className="text-white font-bold text-center">P</TableHead>
                      <TableHead className="text-white font-bold text-center">W</TableHead>
                      <TableHead className="text-white font-bold text-center">D</TableHead>
                      <TableHead className="text-white font-bold text-center">L</TableHead>
                      <TableHead className="text-white font-bold text-center">GF</TableHead>
                      <TableHead className="text-white font-bold text-center">GA</TableHead>
                      <TableHead className="text-white font-bold text-center">GD</TableHead>
                      <TableHead className="text-white font-bold text-center">Pts</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentStanding.teams?.map((team, index) => (
                      <motion.tr
                        key={team.team}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`border-b hover:bg-gray-50 transition-colors ${
                          team.team === 'Ceramica Cleopatra' 
                            ? 'bg-[#FFB81C]/10 font-semibold' 
                            : ''
                        } ${
                          team.position <= 3 
                            ? 'border-l-4 border-l-[#FFB81C]' 
                            : team.position >= currentStanding.teams.length - 2
                            ? 'border-l-4 border-l-red-500'
                            : ''
                        }`}
                      >
                        <TableCell className="font-bold">
                          <div className="flex items-center gap-2">
                            {team.position}
                            {team.position === 1 && (
                              <Crown className="w-4 h-4 text-[#FFB81C]" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-[#1B2852] flex items-center justify-center text-white text-xs font-bold">
                              {team.team.slice(0, 2).toUpperCase()}
                            </div>
                            {team.team}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{team.played}</TableCell>
                        <TableCell className="text-center text-green-600 font-medium">{team.won}</TableCell>
                        <TableCell className="text-center text-gray-500">{team.drawn}</TableCell>
                        <TableCell className="text-center text-red-500">{team.lost}</TableCell>
                        <TableCell className="text-center">{team.goals_for}</TableCell>
                        <TableCell className="text-center">{team.goals_against}</TableCell>
                        <TableCell className={`text-center font-medium ${
                          team.goal_difference > 0 ? 'text-green-600' : 
                          team.goal_difference < 0 ? 'text-red-500' : 
                          'text-gray-500'
                        }`}>
                          {team.goal_difference > 0 ? '+' : ''}{team.goal_difference}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#1B2852] text-white font-bold">
                            {team.points}
                          </span>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Legend */}
              <div className="p-6 bg-gray-50 border-t flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#FFB81C] rounded" />
                  <span className="text-sm text-gray-600">Champions League</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded" />
                  <span className="text-sm text-gray-600">Relegation Zone</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#FFB81C]/20 rounded" />
                  <span className="text-sm text-gray-600">Ceramica Cleopatra</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="text-center py-20">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No standings data available</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}