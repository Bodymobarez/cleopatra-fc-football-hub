import React, { useState } from 'react';
import { ceramicaCleopatra } from '@/api/ceramicaCleopatraClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ensureArray } from '@/utils';
import { motion } from 'framer-motion';
import { useLanguage } from '@/components/LanguageContext';
import { 
  MessageCircle, ThumbsUp, Users, TrendingUp, 
  Vote, BarChart3, Send, Image as ImageIcon 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export default function FanZone() {
  const { t, isArabic } = useLanguage();
  const [commentText, setCommentText] = useState('');
  const queryClient = useQueryClient();

  const { data: polls = [], isLoading: pollsLoading } = useQuery({
    queryKey: ['polls'],
    queryFn: () => ceramicaCleopatra.entities.Poll.filter({ is_active: true }, '-created_date'),
    select: ensureArray,
  });

  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ['comments'],
    queryFn: () => ceramicaCleopatra.entities.Comment.filter({ status: 'approved' }, '-created_date', 20),
    select: ensureArray,
  });

  const voteMutation = useMutation({
    mutationFn: async ({ pollId, optionIndex }) => {
      const poll = polls.find(p => p.id === pollId);
      const updatedOptions = poll.options.map((opt, idx) => 
        idx === optionIndex ? { ...opt, votes: opt.votes + 1 } : opt
      );
      return ceramicaCleopatra.entities.Poll.update(pollId, {
        options: updatedOptions,
        total_votes: poll.total_votes + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      toast.success(isArabic ? 'تم التصويت بنجاح!' : 'Vote submitted successfully!');
    }
  });

  const commentMutation = useMutation({
    mutationFn: (commentData) => ceramicaCleopatra.entities.Comment.create(commentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      setCommentText('');
      toast.success(isArabic ? 'تم إرسال التعليق بنجاح!' : 'Comment posted successfully!');
    }
  });

  const handleVote = (pollId, optionIndex) => {
    voteMutation.mutate({ pollId, optionIndex });
  };

  const handleComment = () => {
    if (!commentText.trim()) return;
    commentMutation.mutate({
      content: commentText,
      user_name: 'Anonymous Fan',
      status: 'pending'
    });
  };

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
            <Users className="w-16 h-16 text-[#FFB81C] mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
              {isArabic ? 'منطقة' : 'Fan'} <span className="text-[#FFB81C]">{isArabic ? 'الجماهير' : 'Zone'}</span>
            </h1>
            <p className="text-white/70 text-lg">
              {t('fanzone.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Polls Section */}
            <section>
              <h2 className="text-3xl font-black text-[#1B2852] mb-6 flex items-center gap-3">
                <Vote className="w-8 h-8 text-[#FFB81C]" />
                {t('fanzone.polls')}
              </h2>

              {pollsLoading ? (
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-64 bg-white rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {polls.map((poll, index) => (
                    <motion.div
                      key={poll.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                        <CardHeader className="bg-gradient-to-r from-[#1B2852] to-[#C8102E]">
                          <CardTitle className="text-white text-xl">
                            {isArabic && poll.question_ar ? poll.question_ar : poll.question}
                          </CardTitle>
                          <CardDescription className="text-white/70">
                            {t('fanzone.total_votes')}: {poll.total_votes?.toLocaleString() || 0}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                          {poll.options?.map((option, idx) => {
                            const percentage = poll.total_votes > 0 
                              ? ((option.votes / poll.total_votes) * 100).toFixed(1) 
                              : 0;
                            
                            return (
                              <div key={idx} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-[#1B2852]">
                                    {isArabic && option.text_ar ? option.text_ar : option.text}
                                  </span>
                                  <span className="text-sm text-gray-500">{percentage}%</span>
                                </div>
                                <div className="flex gap-2 items-center">
                                  <Progress value={percentage} className="flex-1 h-3" />
                                  <Button
                                    size="sm"
                                    onClick={() => handleVote(poll.id, idx)}
                                    disabled={voteMutation.isPending}
                                    className="bg-[#FFB81C] hover:bg-[#f5a815] text-[#1B2852] font-bold"
                                  >
                                    <ThumbsUp className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>

            {/* Comments Section */}
            <section>
              <h2 className="text-3xl font-black text-[#1B2852] mb-6 flex items-center gap-3">
                <MessageCircle className="w-8 h-8 text-[#FFB81C]" />
                {t('fanzone.comments')}
              </h2>

              {/* Add Comment */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="font-bold text-[#1B2852] mb-4">{t('fanzone.share_opinion')}</h3>
                  <Textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={isArabic ? 'شارك برأيك...' : 'Share your thoughts...'}
                    className="mb-4 min-h-[100px]"
                  />
                  <Button
                    onClick={handleComment}
                    disabled={commentMutation.isPending || !commentText.trim()}
                    className="bg-[#1B2852] hover:bg-[#C8102E]"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isArabic ? 'نشر' : 'Post'}
                  </Button>
                </CardContent>
              </Card>

              {/* Comments List */}
              {commentsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment, index) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#1B2852] flex items-center justify-center text-white font-bold">
                              {comment.user_name?.[0] || 'F'}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-[#1B2852] mb-1">{comment.user_name}</h4>
                              <p className="text-gray-600">{comment.content}</p>
                              <div className="flex gap-4 mt-3 text-sm text-gray-400">
                                <button className="flex items-center gap-1 hover:text-[#FFB81C] transition-colors">
                                  <ThumbsUp className="w-4 h-4" />
                                  {comment.likes || 0}
                                </button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Fan Stats */}
            <Card className="bg-gradient-to-br from-[#1B2852] to-[#C8102E] text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6" />
                  {isArabic ? 'إحصائيات الجماهير' : 'Fan Stats'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-3xl font-black">{polls.reduce((acc, p) => acc + (p.total_votes || 0), 0).toLocaleString()}</div>
                  <div className="text-white/70 text-sm">{isArabic ? 'إجمالي الأصوات' : 'Total Votes'}</div>
                </div>
                <div>
                  <div className="text-3xl font-black">{comments.length.toLocaleString()}</div>
                  <div className="text-white/70 text-sm">{isArabic ? 'التعليقات النشطة' : 'Active Comments'}</div>
                </div>
                <div>
                  <div className="text-3xl font-black">{polls.length}</div>
                  <div className="text-white/70 text-sm">{isArabic ? 'استطلاعات نشطة' : 'Active Polls'}</div>
                </div>
              </CardContent>
            </Card>

            {/* Social Feed */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#1B2852]">
                  {isArabic ? 'أخبار سريعة' : 'Quick Updates'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 pb-4 border-b">
                  <div className="w-2 h-2 rounded-full bg-[#FFB81C] mt-2" />
                  <div>
                    <p className="text-sm text-gray-600">
                      {isArabic 
                        ? 'انضم إلى المحادثة مع آلاف المشجعين'
                        : 'Join the conversation with thousands of fans'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 pb-4 border-b">
                  <div className="w-2 h-2 rounded-full bg-[#FFB81C] mt-2" />
                  <div>
                    <p className="text-sm text-gray-600">
                      {isArabic
                        ? 'صوّت في استطلاعات الرأي وشارك برأيك'
                        : 'Vote in polls and share your opinion'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#FFB81C] mt-2" />
                  <div>
                    <p className="text-sm text-gray-600">
                      {isArabic
                        ? 'تواصل مع مشجعين من جميع أنحاء العالم'
                        : 'Connect with fans from around the world'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}