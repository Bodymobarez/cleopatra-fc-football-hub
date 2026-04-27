import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  RefreshCw, Newspaper, Users, Calendar, Trophy, 
  Download, CheckCircle, AlertCircle, Loader2, Globe 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function Admin() {
  const [loading, setLoading] = useState({});
  const [results, setResults] = useState({});
  const queryClient = useQueryClient();

  const fetchAndCreateData = async (type) => {
    setLoading(prev => ({ ...prev, [type]: true }));
    setResults(prev => ({ ...prev, [type]: null }));

    try {
      let result;

      switch (type) {
        case 'egyptian_league_news':
          result = await base44.integrations.Core.InvokeLLM({
            prompt: `Search for the latest Egyptian Premier League news, especially about Ceramica Cleopatra FC. 
            Get at least 10 recent news articles with titles, summaries, dates, and categories.
            Include transfer news, match reports, and player updates.
            Return structured data for each article.`,
            add_context_from_internet: true,
            response_json_schema: {
              type: "object",
              properties: {
                articles: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      excerpt: { type: "string" },
                      content: { type: "string" },
                      category: { type: "string" },
                      is_club_news: { type: "boolean" },
                      is_breaking: { type: "boolean" },
                      tags: { type: "array", items: { type: "string" } }
                    }
                  }
                }
              }
            }
          });

          // Create news articles
          for (const article of result.articles) {
            await base44.entities.News.create({
              ...article,
              status: 'published',
              published_at: new Date().toISOString(),
              featured_image: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800'
            });
          }
          break;

        case 'global_football_news':
          result = await base44.integrations.Core.InvokeLLM({
            prompt: `Get the latest global football news from Premier League, La Liga, Serie A, Bundesliga, and Champions League.
            Get 15 recent articles with titles, summaries, league/competition info.
            Include transfer rumors, match reports, and tactical analysis.`,
            add_context_from_internet: true,
            response_json_schema: {
              type: "object",
              properties: {
                articles: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      excerpt: { type: "string" },
                      content: { type: "string" },
                      category: { type: "string" },
                      league: { type: "string" },
                      tags: { type: "array", items: { type: "string" } }
                    }
                  }
                }
              }
            }
          });

          for (const article of result.articles) {
            await base44.entities.News.create({
              ...article,
              status: 'published',
              published_at: new Date().toISOString(),
              is_club_news: false,
              featured_image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800'
            });
          }
          break;

        case 'ceramica_squad':
          result = await base44.integrations.Core.InvokeLLM({
            prompt: `Get information about Ceramica Cleopatra FC current squad in Egyptian Premier League.
            Include player names, positions, jersey numbers, nationalities, and statistics if available.
            Get at least 25 players covering all positions (goalkeepers, defenders, midfielders, forwards).`,
            add_context_from_internet: true,
            response_json_schema: {
              type: "object",
              properties: {
                players: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      number: { type: "number" },
                      position: { type: "string" },
                      position_detail: { type: "string" },
                      nationality: { type: "string" },
                      stats: {
                        type: "object",
                        properties: {
                          appearances: { type: "number" },
                          goals: { type: "number" },
                          assists: { type: "number" }
                        }
                      }
                    }
                  }
                }
              }
            }
          });

          for (const player of result.players) {
            await base44.entities.Player.create({
              ...player,
              photo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&size=400&background=1B2852&color=FFB81C`,
              status: 'available',
              is_captain: player.number === 10
            });
          }
          break;

        case 'egyptian_league_matches':
          result = await base44.integrations.Core.InvokeLLM({
            prompt: `Get upcoming and recent Egyptian Premier League matches, especially featuring Ceramica Cleopatra FC.
            Include match dates, teams, venues, and scores for finished matches.
            Get at least 20 matches (past and upcoming).`,
            add_context_from_internet: true,
            response_json_schema: {
              type: "object",
              properties: {
                matches: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      home_team: { type: "string" },
                      away_team: { type: "string" },
                      date: { type: "string" },
                      venue: { type: "string" },
                      status: { type: "string" },
                      home_score: { type: "number" },
                      away_score: { type: "number" },
                      is_ceramica_match: { type: "boolean" }
                    }
                  }
                }
              }
            }
          });

          for (const match of result.matches) {
            await base44.entities.Match.create({
              ...match,
              competition: 'Egyptian Premier League',
              match_type: 'league'
            });
          }
          break;

        case 'transfer_news':
          result = await base44.integrations.Core.InvokeLLM({
            prompt: `Get the latest Egyptian football transfer news and rumors, including Ceramica Cleopatra FC transfers.
            Include player names, clubs involved, transfer fees if available, and transfer status.
            Get 10 recent transfer news articles.`,
            add_context_from_internet: true,
            response_json_schema: {
              type: "object",
              properties: {
                articles: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      excerpt: { type: "string" },
                      content: { type: "string" },
                      tags: { type: "array", items: { type: "string" } }
                    }
                  }
                }
              }
            }
          });

          for (const article of result.articles) {
            await base44.entities.News.create({
              ...article,
              category: 'transfers',
              status: 'published',
              published_at: new Date().toISOString(),
              is_club_news: article.content.toLowerCase().includes('ceramica cleopatra'),
              featured_image: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800'
            });
          }
          break;

        case 'league_standings':
          result = await base44.integrations.Core.InvokeLLM({
            prompt: `Get the current Egyptian Premier League standings table.
            Include team names, positions, matches played, wins, draws, losses, goals for, goals against, and points.
            Get the full table for all teams.`,
            add_context_from_internet: true,
            response_json_schema: {
              type: "object",
              properties: {
                teams: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      position: { type: "number" },
                      team: { type: "string" },
                      played: { type: "number" },
                      won: { type: "number" },
                      drawn: { type: "number" },
                      lost: { type: "number" },
                      goals_for: { type: "number" },
                      goals_against: { type: "number" },
                      goal_difference: { type: "number" },
                      points: { type: "number" }
                    }
                  }
                }
              }
            }
          });

          await base44.entities.Standing.create({
            competition: 'Egyptian Premier League',
            season: '2024/2025',
            teams: result.teams
          });
          break;
      }

      setResults(prev => ({ 
        ...prev, 
        [type]: { 
          success: true, 
          count: result.articles?.length || result.players?.length || result.matches?.length || result.teams?.length || 0 
        } 
      }));
      toast.success(`Successfully imported ${type.replace(/_/g, ' ')}`);
      queryClient.invalidateQueries();
    } catch (error) {
      console.error(error);
      setResults(prev => ({ 
        ...prev, 
        [type]: { success: false, error: error.message } 
      }));
      toast.error(`Failed to import ${type.replace(/_/g, ' ')}`);
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const dataCategories = [
    {
      id: 'egyptian_league_news',
      title: 'Egyptian League News',
      description: 'Fetch latest news about Egyptian Premier League and Ceramica Cleopatra FC',
      icon: Newspaper,
      color: 'from-[#C8102E] to-red-700'
    },
    {
      id: 'global_football_news',
      title: 'Global Football News',
      description: 'Fetch news from Premier League, La Liga, Serie A, Bundesliga, Champions League',
      icon: Globe,
      color: 'from-blue-500 to-blue-700'
    },
    {
      id: 'ceramica_squad',
      title: 'Ceramica Cleopatra Squad',
      description: 'Import current squad players with positions and statistics',
      icon: Users,
      color: 'from-[#FFB81C] to-yellow-600'
    },
    {
      id: 'egyptian_league_matches',
      title: 'Egyptian League Matches',
      description: 'Import fixtures and results from Egyptian Premier League',
      icon: Calendar,
      color: 'from-green-500 to-green-700'
    },
    {
      id: 'transfer_news',
      title: 'Transfer Market News',
      description: 'Latest transfer news, rumors, and completed transfers',
      icon: RefreshCw,
      color: 'from-purple-500 to-purple-700'
    },
    {
      id: 'league_standings',
      title: 'League Standings',
      description: 'Current Egyptian Premier League table and standings',
      icon: Trophy,
      color: 'from-[#1B2852] to-indigo-900'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1B2852] to-[#C8102E] py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl font-black text-white mb-4">
              Admin <span className="text-[#FFB81C]">Dashboard</span>
            </h1>
            <p className="text-white/70 text-lg">
              Import real-time data from the internet to populate your football platform
            </p>
          </motion.div>
        </div>
      </section>

      {/* Data Import Cards */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dataCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="relative overflow-hidden hover:shadow-xl transition-all">
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${category.color} opacity-10 rounded-full transform translate-x-8 -translate-y-8`} />
                  
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4`}>
                      <category.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <Button
                      onClick={() => fetchAndCreateData(category.id)}
                      disabled={loading[category.id]}
                      className={`w-full bg-gradient-to-r ${category.color} hover:opacity-90`}
                    >
                      {loading[category.id] ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Import Data
                        </>
                      )}
                    </Button>

                    {/* Result Status */}
                    {results[category.id] && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-4 p-3 rounded-lg ${
                          results[category.id].success 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-red-50 border border-red-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {results[category.id].success ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-700 font-medium">
                                Imported {results[category.id].count} items
                              </span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-4 h-4 text-red-600" />
                              <span className="text-sm text-red-700 font-medium">
                                Import failed
                              </span>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 bg-white rounded-2xl p-8 shadow-sm border"
          >
            <h3 className="text-xl font-bold text-[#1B2852] mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#FFB81C]" />
              How It Works
            </h3>
            <div className="space-y-3 text-gray-600">
              <p>• Click any "Import Data" button to fetch real-time information from the internet</p>
              <p>• The system uses AI to search Google and news sources for the latest information</p>
              <p>• Data is automatically structured and added to your database</p>
              <p>• Each import fetches fresh data, so you can run it multiple times for updates</p>
              <p>• <strong>Note:</strong> Importing may take 10-30 seconds depending on data volume</p>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Button
              onClick={async () => {
                for (const cat of dataCategories) {
                  await fetchAndCreateData(cat.id);
                }
              }}
              variant="outline"
              className="border-[#FFB81C] text-[#FFB81C] hover:bg-[#FFB81C] hover:text-[#1B2852]"
              disabled={Object.values(loading).some(v => v)}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Import All Data
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}