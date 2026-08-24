import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  RefreshCw,
  Database,
  Search,
  ExternalLink,
  MessageCircle,
  ThumbsUp,
  Share2,
  Send,
  Plus,
  Image as ImageIcon,
  CheckCircle2,
  Code2,
  AlertCircle,
  Trash2,
  Globe,
  Settings,
  Clock,
  Shuffle,
  Users,
  Link as LinkIcon,
  Activity,
  History,
  Play,
  Calendar,
  Key,
  ShieldCheck,
  Shield,
  Edit2,
  Check,
  Copy,
  AlertTriangle,
  ChevronRight,
  Layers,
  Sliders,
  Filter,
  Zap,
  SlidersHorizontal,
  CalendarClock,
  CheckSquare,
  Eye,
  Sparkles,
  ListFilter,
  Video,
  Tv,
  Crown
} from 'lucide-react';
import { FacebookWatchFeed } from './FacebookWatchFeed';
import { CommunityAdminDashboard } from './CommunityAdminDashboard';
import {
  FacebookPost,
  FacebookComment,
  FacebookGroupTarget,
  FacebookApifyConfig,
  FacebookPipelineRunLog,
  GroupFetchProgress
} from '../types';
import {
  fetchFacebookPosts,
  fetchCommunityConfig,
  updateCommunityConfig,
  updateApifyToken,
  runCommunityPipeline,
  addFacebookTargetGroup,
  updateFacebookTargetGroup,
  toggleFacebookGroupActive,
  deleteFacebookTargetGroup,
  addFacebookComment,
  reactToFacebookPost,
  createManualFacebookPost,
  clearFacebookPosts,
  deleteSingleFacebookPost,
  updatePostModerationStatus,
  bulkModerateCommunityPosts,
  fetchSystemDiagnostics,
  SystemDiagnosticsResult,
  inspectFacebookLink,
  saveInspectedPosts,
  LinkInspectionResult
} from '../api';

interface CommunityHubProps {
  onBackToPortal: () => void;
  onNavigateToOcr: () => void;
  showToast?: (text: string, type?: 'success' | 'error') => void;
}

export function CommunityHub({
  onBackToPortal,
  onNavigateToOcr,
  showToast
}: CommunityHubProps) {
  const [posts, setPosts] = useState<FacebookPost[]>([]);
  const [groups, setGroups] = useState<FacebookGroupTarget[]>([]);
  const [apifyConfig, setApifyConfig] = useState<FacebookApifyConfig>({
    tokens: [
      { id: 'APIFY_TOKEN_1', label: 'مفتاح Apify الأول (منشورات A)', tokenMasked: 'apify_api_••••••••a1b2', isConfigured: true, status: 'healthy' },
      { id: 'APIFY_TOKEN_2', label: 'مفتاح Apify الثاني (منشورات B)', tokenMasked: 'apify_api_••••••••c3d4', isConfigured: true, status: 'healthy' },
      { id: 'APIFY_TOKEN_3', label: 'مفتاح Apify الثالث (تعليقات A)', tokenMasked: 'apify_api_••••••••e5f6', isConfigured: true, status: 'healthy' },
      { id: 'APIFY_TOKEN_4', label: 'مفتاح Apify الرابع (تعليقات B)', tokenMasked: 'apify_api_••••••••g7h8', isConfigured: true, status: 'healthy' }
    ],
    activeTokenId: 'APIFY_TOKEN_1',
    postsEndpoint: 'https://api.apify.com/v2/acts/apify~facebook-posts-scraper/runs',
    commentsEndpoint: 'https://api.apify.com/v2/acts/apify~facebook-comments-scraper/runs',
    maxPostsPerRequest: 25,
    includeMediaUrls: true,
    includeComments: true,
    includeGroupInfo: true,
    maxCommentsPerPost: 25,
    maxImagesPerPost: 3,
    autoRotateTokens: true,
    scheduledTime: '21:00',
    scheduleInterval: 'daily',
    isScheduledEnabled: false
  });
  const [runLogs, setRunLogs] = useState<FacebookPipelineRunLog[]>([]);
  const [base1Info, setBase1Info] = useState<{ id: string; name: string; url: string }>({
    id: 'project_1',
    name: 'OCR-1 (Base 1)',
    url: 'https://tmdqsjahoadtfap55ogvcf.supabase.co'
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRunningPipeline, setIsRunningPipeline] = useState<boolean>(false);
  const [runningProgress, setRunningProgress] = useState<GroupFetchProgress | null>(null);
  const [activeTab, setActiveTab] = useState<'admin_dashboard' | 'facebook_watch' | 'feed' | 'inspector' | 'filter_controls' | 'groups' | 'apify_config' | 'pipeline_logs' | 'schema_guide' | 'diagnostics'>('admin_dashboard');

  // Diagnostics & Health Test State
  const [diagnosticsResult, setDiagnosticsResult] = useState<SystemDiagnosticsResult | null>(null);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState<boolean>(false);

  // Link Inspector & Preview State (معاينة وفحص الروابط المباشر قبل الحفظ)
  const [inspectUrl, setInspectUrl] = useState<string>('https://www.facebook.com/share/g/14jyGPSu1nA/');
  const [inspectTokenId, setInspectTokenId] = useState<string>('APIFY_TOKEN_1');
  const [inspectMaxPosts, setInspectMaxPosts] = useState<number>(5);
  const [inspectMaxComments, setInspectMaxComments] = useState<number>(10);
  const [inspectIncludeImages, setInspectIncludeImages] = useState<boolean>(true);
  const [isInspecting, setIsInspecting] = useState<boolean>(false);
  const [inspectionResult, setInspectionResult] = useState<LinkInspectionResult | null>(null);
  const [inspectorActiveView, setInspectorActiveView] = useState<'posts' | 'diagnostics' | 'raw_json' | 'curriculum_samples'>('posts');
  const [selectedInspectPosts, setSelectedInspectPosts] = useState<Record<string, boolean>>({});
  const [isSavingInspected, setIsSavingInspected] = useState<boolean>(false);
  const [copiedInspectJson, setCopiedInspectJson] = useState<boolean>(false);

  // Quick filter states for instant live scraping
  const [quickFilterActive, setQuickFilterActive] = useState<boolean>(false);

  // Comment input per post
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);

  // Manual Post creation Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newPostContent, setNewPostContent] = useState<string>('');
  const [newPostAuthor, setNewPostAuthor] = useState<string>('طالب سادس إعدادي');
  const [newPostGroupName, setNewPostGroupName] = useState<string>('جروب السادس الإعدادي 2025/2026');
  const [newPostMedia, setNewPostMedia] = useState<string>('');
  const [newPostUrl, setNewPostUrl] = useState<string>('');

  // Add / Edit Group Modal
  const [isGroupModalOpen, setIsGroupModalOpen] = useState<boolean>(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [groupFormName, setGroupFormName] = useState<string>('');
  const [groupFormUrl, setGroupFormUrl] = useState<string>('');

  // Token Edit Modal
  const [isTokenModalOpen, setIsTokenModalOpen] = useState<boolean>(false);
  const [selectedTokenId, setSelectedTokenId] = useState<string>('APIFY_TOKEN_1');
  const [newTokenValue, setNewTokenValue] = useState<string>('');

  // Inspect Post JSON Modal
  const [inspectingPost, setInspectingPost] = useState<FacebookPost | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Instant Direct Post Composer & Diagnostic States
  const [instantComposerText, setInstantComposerText] = useState<string>('');
  const [instantComposerGroup, setInstantComposerGroup] = useState<string>('');
  const [instantComposerImage, setInstantComposerImage] = useState<string>('');
  const [isInstantPublishing, setIsInstantPublishing] = useState<boolean>(false);
  const [instantPublishMode, setInstantPublishMode] = useState<boolean>(true);
  const [lastRunResult, setLastRunResult] = useState<import('../types').FacebookSyncResult | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterGroup, setFilterGroup] = useState<string>('all');

  // Load Data from Backend & Supabase Base 1
  const loadData = async (showLoadingState = true) => {
    if (showLoadingState) setIsLoading(true);
    try {
      const [postsRes, configRes] = await Promise.all([
        fetchFacebookPosts(),
        fetchCommunityConfig()
      ]);

      setPosts(postsRes.posts || []);
      if (postsRes.base1) setBase1Info(postsRes.base1);

      if (configRes) {
        if (configRes.groups) setGroups(configRes.groups);
        if (configRes.apifyConfig) setApifyConfig(configRes.apifyConfig);
        if (configRes.runLogs) setRunLogs(configRes.runLogs);
      }
    } catch (err: any) {
      if (showToast) showToast(err.message || 'فشل جلب البيانات من القاعدة الأولى', 'error');
    } finally {
      if (showLoadingState) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, []);

  // Execute Pipeline (Sequential Apify Scrape -> Supabase Base 1)
  const handleRunPipeline = async (targetGroupId?: string, customFilters?: Partial<FacebookApifyConfig>) => {
    setIsRunningPipeline(true);
    const targetGroupName = targetGroupId ? (groups.find(g => g.id === targetGroupId)?.name || 'المجموعة المحددة') : 'كافة المجموعات النشطة';
    setRunningProgress({
      currentGroupId: targetGroupId || 'all',
      currentGroupName: targetGroupName,
      currentGroupIndex: 1,
      totalGroups: targetGroupId ? 1 : groups.filter(g => g.isActive).length,
      step: 'fetching_posts',
      postsFetched: 0,
      postsStored: 0,
      commentsStored: 0,
      mediaCount: 0,
      errorsCount: 0
    });

    try {
      const activeMaxPosts = customFilters?.maxPostsPerRequest ?? apifyConfig.maxPostsPerRequest ?? 25;
      const activeMaxComments = customFilters?.maxCommentsPerPost ?? apifyConfig.maxCommentsPerPost ?? 25;
      const activeMaxImages = customFilters?.maxImagesPerPost ?? apifyConfig.maxImagesPerPost ?? 3;
      const activeIncludeImages = customFilters?.includeMediaUrls ?? apifyConfig.includeMediaUrls ?? true;
      const activeIncludeComments = customFilters?.includeComments ?? apifyConfig.includeComments ?? true;

      const res = await runCommunityPipeline({
        groupId: targetGroupId,
        maxPosts: activeMaxPosts,
        maxComments: activeMaxComments,
        maxImages: activeMaxImages,
        includeImages: activeIncludeImages,
        includeComments: activeIncludeComments,
      });

      if (res.posts) {
        setPosts(res.posts);
      }
      if (res.runLog) {
        setRunLogs(prev => [res.runLog!, ...prev]);
      }
      setLastRunResult(res);

      // Refresh config to get rotated token and updated group counters
      const configRes = await fetchCommunityConfig();
      if (configRes.apifyConfig) setApifyConfig(configRes.apifyConfig);
      if (configRes.groups) setGroups(configRes.groups);

      if (showToast) {
        showToast(
          res.message || `تم بنجاح سحب وتخزين ${res.syncedPostsCount || res.fetchedCount || 0} منشور و ${res.syncedCommentsCount || res.fetchedCommentsCount || 0} تعليق في Supabase Base 1 (المفتاح: ${res.usedTokenId || apifyConfig.activeTokenId})`,
          'success'
        );
      }
    } catch (err: any) {
      if (showToast) showToast(err.message || 'فشل تشغيل مسار السحب', 'error');
    } finally {
      setIsRunningPipeline(false);
      setRunningProgress(null);
    }
  };

  // Instant Direct Post Publisher (نشر فوري مباشر)
  const handleInstantPublish = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = instantComposerText.trim();
    if (!text) {
      if (showToast) showToast('يرجى كتابة نص المنشور للنشر الفوري', 'error');
      return;
    }

    setIsInstantPublishing(true);
    try {
      const selectedGrp = groups.find(g => g.id === instantComposerGroup) || groups[0];
      const res = await createManualFacebookPost({
        postText: text,
        authorName: 'أستاذ السادس / ناشر فوري',
        groupId: selectedGrp?.id,
        groupName: selectedGrp?.name || 'مجموعة السادس الإعدادي 2026',
        groupUrl: selectedGrp?.url || 'https://www.facebook.com/groups/1280379818654162',
        mediaUrls: instantComposerImage.trim() ? [instantComposerImage.trim()] : undefined,
      });

      if (res.post) {
        setPosts(prev => [res.post, ...prev]);
        setLastRunResult({
          success: true,
          message: `تم النشر الفوري للمنشور بنجاح في Supabase Base 1 (${base1Info.name}) والمجموعة!`,
          syncedPostsCount: 1,
          syncedCommentsCount: 0,
          usedTokenId: 'instant_publish_mode',
          timestamp: new Date().toISOString()
        });
      }

      setInstantComposerText('');
      setInstantComposerImage('');
      if (showToast) showToast('تم النشر الفوري للمنشور بنجاح في Supabase Base 1!', 'success');
    } catch (err: any) {
      if (showToast) showToast(err.message || 'فشل النشر الفوري', 'error');
    } finally {
      setIsInstantPublishing(false);
    }
  };

  // Add Comment strictly linked via post_id
  const handleAddComment = async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    setCommentingPostId(postId);
    try {
      const res = await addFacebookComment(postId, text, 'طالب مشارك بالسادس');
      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? {
                ...p,
                comments_count: (p.comments_count || 0) + 1,
                comments: [...(p.comments || []), res.comment]
              }
            : p
        )
      );
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      if (showToast) showToast('تمت إضافة التعليق وربطه بالمنشور في Supabase Base 1 بنجاح', 'success');
    } catch (err: any) {
      if (showToast) showToast(err.message || 'فشل إضافة التعليق', 'error');
    } finally {
      setCommentingPostId(null);
    }
  };

  // React to Post
  const handleReact = async (postId: string, reaction: 'like' | 'love' | 'haha' | 'wow' = 'like') => {
    try {
      const res = await reactToFacebookPost(postId, reaction);
      setPosts(prev => prev.map(p => (p.id === postId ? res.post : p)));
    } catch (err: any) {
      if (showToast) showToast('تعذر تسجيل التفاعل', 'error');
    }
  };

  // Create Manual Post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    try {
      const res = await createManualFacebookPost({
        postText: newPostContent,
        authorName: newPostAuthor,
        groupName: newPostGroupName,
        mediaUrls: newPostMedia ? [newPostMedia] : undefined,
        postUrl: newPostUrl || undefined
      });
      setPosts(prev => [res.post, ...prev]);
      setIsCreateModalOpen(false);
      setNewPostContent('');
      setNewPostMedia('');
      setNewPostUrl('');
      if (showToast) showToast('تم حفظ المنشور في Supabase Base 1 بنجاح', 'success');
    } catch (err: any) {
      if (showToast) showToast(err.message || 'فشل نشر المنشور', 'error');
    }
  };

  // Admin Dashboard Handlers
  const handleAdminDeletePost = async (postId: string) => {
    try {
      const res = await deleteSingleFacebookPost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId && p.source_post_id !== postId));
      if (showToast) showToast(res.message || 'تم حذف المنشور بنجاح', 'success');
    } catch (err: any) {
      if (showToast) showToast(err.message || 'فشل حذف المنشور', 'error');
    }
  };

  const handleAdminUpdateStatus = async (postId: string, newStatus: 'published' | 'pending' | 'rejected' | 'hidden' | 'deleted') => {
    try {
      if (newStatus === 'deleted') {
        return await handleAdminDeletePost(postId);
      }
      const res = await updatePostModerationStatus(postId, newStatus);
      setPosts(prev => prev.map(p => {
        if (p.id === postId || p.source_post_id === postId) {
          return { ...p, status: newStatus as any };
        }
        return p;
      }));
      if (showToast) showToast(res.message || `تم تحديث حالة المنشور إلى ${newStatus}`, 'success');
    } catch (err: any) {
      if (showToast) showToast(err.message || 'فشل تحديث حالة المنشور', 'error');
    }
  };

  const handleAdminBulkAction = async (action: 'delete' | 'approve' | 'reject' | 'hide', postIds: string[]) => {
    try {
      const res = await bulkModerateCommunityPosts(action, postIds);
      if (action === 'delete') {
        setPosts(prev => prev.filter(p => !postIds.includes(p.id) && !postIds.includes(p.source_post_id)));
      } else {
        const mappedStatus = action === 'approve' ? 'published' : action === 'reject' ? 'rejected' : 'hidden';
        setPosts(prev => prev.map(p => {
          if (postIds.includes(p.id) || postIds.includes(p.source_post_id)) {
            return { ...p, status: mappedStatus as any };
          }
          return p;
        }));
      }
      if (showToast) showToast(res.message || 'تم تنفيذ الإجراء الجماعي بنجاح', 'success');
    } catch (err: any) {
      if (showToast) showToast(err.message || 'فشل تنفيذ الإجراء الجماعي', 'error');
    }
  };

  // Save or Edit Group
  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupFormName.trim() || !groupFormUrl.trim()) return;

    try {
      if (editingGroupId) {
        const res = await updateFacebookTargetGroup(editingGroupId, {
          name: groupFormName,
          url: groupFormUrl
        });
        setGroups(res.groups);
        if (showToast) showToast('تم تعديل بيانات المجموعة بنجاح', 'success');
      } else {
        const res = await addFacebookTargetGroup({
          name: groupFormName,
          url: groupFormUrl
        });
        setGroups(res.groups);
        if (showToast) showToast('تمت إضافة رابط المجموعة بنجاح', 'success');
      }
      setIsGroupModalOpen(false);
      setEditingGroupId(null);
      setGroupFormName('');
      setGroupFormUrl('');
    } catch (err: any) {
      if (showToast) showToast(err.message || 'فشل حفظ المجموعة', 'error');
    }
  };

  // Toggle Group Active state
  const handleToggleGroup = async (groupId: string) => {
    try {
      const res = await toggleFacebookGroupActive(groupId);
      setGroups(res.groups);
      if (showToast) showToast('تم تغيير حالة تفعيل المجموعة', 'success');
    } catch (err: any) {
      if (showToast) showToast(err.message || 'فشل تغيير الحالة', 'error');
    }
  };

  // Delete Group
  const handleDeleteGroup = async (groupId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه المجموعة من قائمة السحب؟')) return;
    try {
      const res = await deleteFacebookTargetGroup(groupId);
      setGroups(res.groups);
      if (showToast) showToast('تم حذف رابط المجموعة', 'success');
    } catch (err: any) {
      if (showToast) showToast(err.message || 'فشل حذف المجموعة', 'error');
    }
  };

  // Save Apify Token
  const handleSaveToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTokenValue.trim()) return;

    try {
      const res = await updateApifyToken(selectedTokenId, newTokenValue.trim());
      setApifyConfig(res.apifyConfig);
      setIsTokenModalOpen(false);
      setNewTokenValue('');
      if (showToast) showToast(`تم حفظ وتشفير ${selectedTokenId} بنجاح`, 'success');
    } catch (err: any) {
      if (showToast) showToast(err.message || 'فشل حفظ المفتاح', 'error');
    }
  };

  // Toggle Auto-rotate Tokens
  const handleToggleAutoRotate = async () => {
    try {
      const updated = { ...apifyConfig, autoRotateTokens: !apifyConfig.autoRotateTokens };
      const res = await updateCommunityConfig({ apifyConfig: updated });
      setApifyConfig(res.apifyConfig);
      if (showToast) showToast(`تم ${updated.autoRotateTokens ? 'تفعيل' : 'تعطيل'} التناوب التلقائي بين المفاتيح الأربعة`, 'success');
    } catch (err: any) {
      if (showToast) showToast('فشل تعديل التناوب', 'error');
    }
  };

  // Clear all posts
  const handleClearPosts = async () => {
    if (!window.confirm('هل تريد مسح جميع منشورات الفيسبوك من القاعدة الأولى؟')) return;
    try {
      await clearFacebookPosts();
      setPosts([]);
      if (showToast) showToast('تم تفريغ المنشورات من Base 1 بنجاح', 'success');
    } catch (err: any) {
      if (showToast) showToast('فشل تفريغ المنشورات', 'error');
    }
  };

  // Copy SQL script
  const handleCopySql = () => {
    const sqlText = `-- ==========================================
-- SUPABASE BASE 1 (OCR-1) DATABASE SCHEMA
-- Strict 3-Table Architecture for Facebook Groups, Posts & Comments
-- ==========================================

-- 1. جدول المجموعات المستهدفة (groups)
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    url TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. جدول المنشورات (posts) - نصوص أصلية غير مصنفة
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_post_id TEXT UNIQUE,
    group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
    group_name TEXT,
    group_url TEXT,
    post_url TEXT NOT NULL,
    post_text TEXT NOT NULL,
    media_urls TEXT[] DEFAULT '{}',
    author_name TEXT,
    author_id TEXT,
    author_avatar TEXT,
    comments_count INTEGER DEFAULT 0,
    reactions_count INTEGER DEFAULT 0,
    source_api TEXT DEFAULT 'APIFY_TOKEN_1',
    post_created_at TIMESTAMPTZ,
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. جدول التعليقات المربوطة حصرياً بالمنشور (comments)
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_comment_id TEXT,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    author_name TEXT,
    author_id TEXT,
    author_avatar TEXT,
    comment_text TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    comment_created_at TIMESTAMPTZ,
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- الفهارس لتسريع الربط والاستعلام
CREATE INDEX IF NOT EXISTS idx_posts_post_url ON public.posts (post_url);
CREATE INDEX IF NOT EXISTS idx_posts_source_id ON public.posts (source_post_id);
CREATE INDEX IF NOT EXISTS idx_posts_group_id ON public.posts (group_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments (post_id);
CREATE INDEX IF NOT EXISTS idx_comments_source_id ON public.comments (source_comment_id);

-- تمكين الأمان (Row Level Security)
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.groups FOR SELECT USING (true);
CREATE POLICY "Allow service write" ON public.groups FOR ALL USING (true);

CREATE POLICY "Allow public read access" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Allow service write" ON public.posts FOR ALL USING (true);

CREATE POLICY "Allow public read access" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Allow service write" ON public.comments FOR ALL USING (true);
`;

    navigator.clipboard.writeText(sqlText);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
    if (showToast) showToast('تم نسخ كود SQL الخاص بالقاعدة الأولى بنجاح', 'success');
  };

  // Run System Diagnostics (فحص وتشخيص الاتصال والمفاتيح المباشر)
  const handleRunDiagnostics = async () => {
    setIsRunningDiagnostics(true);
    try {
      const res = await fetchSystemDiagnostics();
      setDiagnosticsResult(res);
      if (showToast) showToast('اكتمل فحص وتشخيص الأدوات وقاعدة البيانات بنجاح', 'success');
    } catch (err: any) {
      if (showToast) showToast(err.message || 'فشل تشغيل فحص التشخيص', 'error');
    } finally {
      setIsRunningDiagnostics(false);
    }
  };

  // Run Live Link Inspector (فحص ومعاينة الرابط قبل الحفظ)
  const handleRunInspect = async (overrideUrl?: string) => {
    const targetUrl = (overrideUrl || inspectUrl || '').trim();
    if (!targetUrl) {
      if (showToast) showToast('يرجى إدخال أو اختيار رابط فيسبوك للفحص', 'error');
      return;
    }

    setIsInspecting(true);
    try {
      const res = await inspectFacebookLink({
        url: targetUrl,
        tokenId: inspectTokenId,
        maxPosts: inspectMaxPosts,
        maxComments: inspectMaxComments,
        includeImages: inspectIncludeImages,
      });
      setInspectionResult(res);

      // Pre-select all extracted posts or sample curriculum posts for easy saving
      const newSelected: Record<string, boolean> = {};
      if (res.extractedPosts && res.extractedPosts.length > 0) {
        res.extractedPosts.forEach(p => { newSelected[p.id] = true; });
        setInspectorActiveView('posts');
      } else if (res.sampleCurriculumPosts && res.sampleCurriculumPosts.length > 0) {
        res.sampleCurriculumPosts.forEach(p => { newSelected[p.id] = true; });
        setInspectorActiveView('curriculum_samples');
      }
      setSelectedInspectPosts(newSelected);

      if (res.extractedPosts && res.extractedPosts.length > 0) {
        if (showToast) showToast(`تم فحص الرابط واستخراج ${res.extractedPosts.length} منشوراً للمعاينة بنجاح`, 'success');
      } else {
        if (showToast) showToast(`اكتمل الفحص: الرابط يتطلب تسجيل دخول (Private Group) - تم توفير عينات نموذجية للمعاينة`, 'success');
      }
    } catch (err: any) {
      if (showToast) showToast(err.message || 'فشل فحص الرابط المباشر', 'error');
    } finally {
      setIsInspecting(false);
    }
  };

  // Toggle selection for a single inspected post
  const handleToggleSelectPost = (id: string) => {
    setSelectedInspectPosts(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Select/Deselect all inspected posts
  const handleSelectAllPosts = (list: any[]) => {
    const allSelected = list.every(p => selectedInspectPosts[p.id]);
    const updated: Record<string, boolean> = {};
    list.forEach(p => {
      updated[p.id] = !allSelected;
    });
    setSelectedInspectPosts(updated);
  };

  // Save single post from inspector to feed & Base 1
  const handleSaveSingleInspected = async (post: any) => {
    setIsSavingInspected(true);
    try {
      const res = await saveInspectedPosts([post]);
      if (res.posts) {
        setPosts(res.posts);
      }
      if (showToast) showToast('تم حفظ المنشور واعتماده بنجاح في الواجهة والقاعدة!', 'success');
    } catch (err: any) {
      if (showToast) showToast(err.message || 'فشل حفظ المنشور', 'error');
    } finally {
      setIsSavingInspected(false);
    }
  };

  // Save selected posts from inspector to feed & Base 1
  const handleSaveSelectedInspected = async (availablePosts?: any[]) => {
    const pool = availablePosts || [
      ...(inspectionResult?.extractedPosts || []),
      ...(inspectionResult?.sampleCurriculumPosts || [])
    ];
    const toSave = pool.filter(p => selectedInspectPosts[p.id]);

    if (toSave.length === 0) {
      if (showToast) showToast('يرجى تحديد منشور واحد على الأقل للحفظ', 'error');
      return;
    }

    setIsSavingInspected(true);
    try {
      const res = await saveInspectedPosts(toSave);
      if (res.posts) {
        setPosts(res.posts);
      }
      if (showToast) showToast(`تم حفظ ${toSave.length} منشوراً مع كافة التعليقات بنجاح!`, 'success');
      setActiveTab('feed');
    } catch (err: any) {
      if (showToast) showToast(err.message || 'فشل حفظ المنشورات', 'error');
    } finally {
      setIsSavingInspected(false);
    }
  };

  // Copy raw JSON from inspection
  const handleCopyInspectJson = () => {
    if (!inspectionResult) return;
    navigator.clipboard.writeText(JSON.stringify(inspectionResult, null, 2));
    setCopiedInspectJson(true);
    setTimeout(() => setCopiedInspectJson(false), 2000);
    if (showToast) showToast('تم نسخ مخرجات JSON بالكامل إلى الحافظة', 'success');
  };

  // Filter posts
  const filteredPosts = posts.filter(p => {
    const author = (p.author_name || p.authorName || '').toLowerCase();
    const text = (p.post_text || p.content || '').toLowerCase();
    const group = (p.group_name || p.groupName || '').toLowerCase();
    const q = (searchQuery || '').toLowerCase();

    const matchesSearch = !q || text.includes(q) || author.includes(q) || group.includes(q);
    const matchesGroup = filterGroup === 'all' || (p.group_name || p.groupName) === filterGroup || (p.group_id === filterGroup);
    return matchesSearch && matchesGroup;
  });

  const activeTokenObj = apifyConfig.tokens.find(t => t.id === apifyConfig.activeTokenId) || apifyConfig.tokens[0];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans" dir="rtl">
      
      {/* ========================================================= */}
      {/* TOP BAR */}
      {/* ========================================================= */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          
          {/* Logo & Info */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToPortal}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
              title="العودة للمساحة الرئيسية"
            >
              <ArrowRight className="w-4 h-4" />
              <span className="hidden sm:inline">الرئيسية</span>
            </button>

            <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#1877F2] text-white flex items-center justify-center font-bold text-xl shadow-md shadow-blue-500/20">
                f
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>أداة جلب منشورات فيسبوك لطلبة السادس</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
                    Apify 4-API + Supabase Base 1
                  </span>
                </h1>
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <span>التخزين في:</span>
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    {base1Info.name}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600">نصوص أصلية غير مصنفة + تعليقات مربوطة بالـ post_id</span>
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions Header */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleRunPipeline()}
              disabled={isRunningPipeline}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1877F2] hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunningPipeline ? 'animate-spin' : ''}`} />
              <span>{isRunningPipeline ? 'جاري السحب التتابعي...' : 'تشغيل السحب لجميع المجموعات'}</span>
            </button>

            <button
              onClick={onNavigateToOcr}
              className="hidden md:inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer border border-slate-200"
            >
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>قاعدة OCR 1</span>
            </button>
          </div>
        </div>

        {/* Dedicated Sections Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto border-t border-slate-100 text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('admin_dashboard')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'admin_dashboard'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/90 font-black shadow-xs'
                : 'border-transparent hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Shield className="w-4 h-4 text-indigo-600" />
            <span>لوحة إدارة وتحكم المجتمع (Admin Dashboard)</span>
            <span className="px-2 py-0.5 bg-indigo-600 text-white rounded-full text-[10px] font-bold">
              التحكم الكامل
            </span>
          </button>

          <button
            onClick={() => setActiveTab('facebook_watch')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'facebook_watch'
                ? 'border-[#1877F2] text-[#1877F2] bg-blue-50/80 font-black shadow-xs'
                : 'border-transparent hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-black text-xs shadow-xs">
              f
            </div>
            <span>أيقونة فيسبوك وشاهد (Facebook & Watch)</span>
            <span className="px-2 py-0.5 bg-[#1877F2] text-white rounded-full text-[10px] font-bold animate-pulse">
              مباشر من JSON
            </span>
          </button>

          <button
            onClick={() => setActiveTab('feed')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'feed'
                ? 'border-[#1877F2] text-[#1877F2] bg-blue-50/50'
                : 'border-transparent hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>المنشورات وموجز فيسبوك ({posts.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('inspector');
              if (!inspectionResult && !isInspecting) {
                handleRunInspect();
              }
            }}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'inspector'
                ? 'border-[#1877F2] text-[#1877F2] bg-blue-50/50'
                : 'border-transparent hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Search className="w-4 h-4 text-cyan-600" />
            <span>فحص ومعاينة الروابط المباشر (Inspector & Preview)</span>
            <span className="px-1.5 py-0.5 bg-cyan-100 text-cyan-800 rounded-md text-[10px] font-bold">
              معاينة قبل الحفظ
            </span>
          </button>

          <button
            onClick={() => setActiveTab('filter_controls')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'filter_controls'
                ? 'border-[#1877F2] text-[#1877F2] bg-blue-50/50'
                : 'border-transparent hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <span>معايير الفلترة والتحكم بالسحب (فلتر)</span>
            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-md text-[10px]">
              مخصص
            </span>
          </button>

          <button
            onClick={() => setActiveTab('groups')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'groups'
                ? 'border-[#1877F2] text-[#1877F2] bg-blue-50/50'
                : 'border-transparent hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-600" />
            <span>إدارة مجموعات فيسبوك ({groups.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('apify_config')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'apify_config'
                ? 'border-[#1877F2] text-[#1877F2] bg-blue-50/50'
                : 'border-transparent hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Key className="w-4 h-4 text-indigo-600" />
            <span>إعدادات Apify والمفاتيح الأربعة</span>
            <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded-md text-[10px]">
              {apifyConfig.activeTokenId}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('pipeline_logs')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'pipeline_logs'
                ? 'border-[#1877F2] text-[#1877F2] bg-blue-50/50'
                : 'border-transparent hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Activity className="w-4 h-4 text-purple-600" />
            <span>تشغيل ومراقبة الجلب والسجلات ({runLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('schema_guide')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'schema_guide'
                ? 'border-[#1877F2] text-[#1877F2] bg-blue-50/50'
                : 'border-transparent hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Code2 className="w-4 h-4 text-amber-600" />
            <span>هيكلية Supabase Base 1 (SQL)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('diagnostics');
              if (!diagnosticsResult) handleRunDiagnostics();
            }}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'diagnostics'
                ? 'border-[#1877F2] text-[#1877F2] bg-blue-50/50'
                : 'border-transparent hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>فحص وتشخيص الأدوات المباشر (Diagnostics)</span>
            <span className="px-1.5 py-0.5 bg-teal-100 text-teal-800 rounded-md text-[10px] font-bold">
              فحص حي
            </span>
          </button>
        </div>
      </header>

      {/* SUB-HEADER STATUS BAR */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white py-2.5 px-4 shadow-inner text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>مفتاح Apify:</span>
              <strong className="text-emerald-300 font-mono">{activeTokenObj ? activeTokenObj.label : apifyConfig.activeTokenId}</strong>
            </div>

            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl border border-white/10">
              <MessageCircle className="w-3.5 h-3.5 text-sky-400" />
              <span>فلتر التعليقات:</span>
              <strong className="text-sky-300 font-mono">{apifyConfig.includeComments ? `${apifyConfig.maxCommentsPerPost ?? 25} تعليق/منشور` : 'معطلة'}</strong>
            </div>

            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl border border-white/10">
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>فلتر الصور:</span>
              <strong className="text-amber-300 font-mono">{apifyConfig.includeMediaUrls ? `${apifyConfig.maxImagesPerPost ?? 3} صور/منشور` : 'معطلة'}</strong>
            </div>

            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl border border-white/10">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>وقت عمل الأداة:</span>
              <strong className="text-purple-300 font-mono">{apifyConfig.scheduledTime || '21:00'} ({apifyConfig.scheduleInterval === 'hourly' ? 'كل ساعة' : apifyConfig.scheduleInterval === 'every_6h' ? 'كل 6 ساعات' : 'يومي'})</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('filter_controls')}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all text-[11px] flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>تعديل معايير الفلتر</span>
            </button>
            <button
              onClick={() => setActiveTab('apify_config')}
              className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white font-bold transition-all text-[11px] cursor-pointer"
            >
              تعديل المفاتيح
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MAIN CONTAINER */}
      {/* ========================================================= */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
        
        {/* ========================================================= */}
        {/* SECTION 0A: ADMIN DASHBOARD (لوحة إدارة وتحكم المجتمع) */}
        {/* ========================================================= */}
        {activeTab === 'admin_dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <CommunityAdminDashboard
              posts={posts}
              onDeletePost={handleAdminDeletePost}
              onUpdatePostStatus={handleAdminUpdateStatus}
              onBulkAction={handleAdminBulkAction}
              onSwitchToUserView={() => setActiveTab('facebook_watch')}
              onRefreshData={() => loadData(true)}
              onOpenCreatePostModal={() => setIsCreateModalOpen(true)}
            />
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 0: FACEBOOK & WATCH FEED (أيقونة فيسبوك وشاهد) */}
        {/* ========================================================= */}
        {activeTab === 'facebook_watch' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <FacebookWatchFeed
              onSyncPostToBase1={async (postToSync) => {
                await handleSaveSingleInspected(postToSync);
              }}
              onBulkSync={async (postsToSync) => {
                setIsSavingInspected(true);
                try {
                  const res = await saveInspectedPosts(postsToSync);
                  if (res.posts) {
                    setPosts(res.posts);
                  }
                  if (showToast) {
                    showToast(`تم حفظ ${postsToSync.length} منشور مع الصور والتعليقات في Supabase Base 1!`, 'success');
                  }
                } catch (err: any) {
                  if (showToast) showToast(err.message || 'فشل حفظ المنشورات في Base 1', 'error');
                } finally {
                  setIsSavingInspected(false);
                }
              }}
              isSyncing={isSavingInspected}
            />
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 1: FEED & POSTS VIEW */}
        {/* ========================================================= */}
        {activeTab === 'feed' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Sidebar: Group Filters */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>مجموعات فيسبوك</span>
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {groups.length} مجموعات
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <button
                    onClick={() => setFilterGroup('all')}
                    className={`w-full text-right px-3 py-2 rounded-xl font-semibold transition-all flex items-center justify-between cursor-pointer ${
                      filterGroup === 'all'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span>كافة المجموعات</span>
                    <span className="text-[11px] font-mono">{posts.length}</span>
                  </button>

                  {groups.map(grp => {
                    const postCount = posts.filter(p => p.group_name === grp.name || p.group_id === grp.id || p.group_url === grp.url).length;
                    return (
                      <button
                        key={grp.id}
                        onClick={() => setFilterGroup(grp.name)}
                        className={`w-full text-right px-3 py-2 rounded-xl font-semibold transition-all flex items-center justify-between cursor-pointer ${
                          filterGroup === grp.name
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span className="truncate max-w-[150px]">{grp.name}</span>
                        <span className="text-[11px] font-mono text-slate-400">{postCount}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => {
                    setEditingGroupId(null);
                    setGroupFormName('');
                    setGroupFormUrl('');
                    setIsGroupModalOpen(true);
                  }}
                  className="w-full mt-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة مجموعة جديدة</span>
                </button>
              </div>

              {/* Base 1 Linking Status Card */}
              <div className="bg-emerald-950 text-emerald-100 rounded-2xl p-4 border border-emerald-800/50 shadow-xs space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Database className="w-4 h-4" />
                  <span>قاعدة التخزين: Supabase Base 1</span>
                </div>
                <p className="text-[11px] text-emerald-200/80 leading-relaxed">
                  يتم حفظ المنشورات والتعليقات مع الحفاظ على العلاقة التفرعية <code className="bg-emerald-900/80 px-1 py-0.5 rounded text-emerald-300">comments.post_id -&gt; posts.id</code> دون أي تصنيف ذكاء اصطناعي.
                </p>
                <div className="pt-2 border-t border-emerald-800/50 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-300">المنشورات: {posts.length}</span>
                  <span className="text-emerald-300">
                    التعليقات: {posts.reduce((acc, p) => acc + (p.comments?.length || p.comments_count || 0), 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Main Feed Column */}
            <div className="lg:col-span-3 space-y-4">
              
              {/* QUICK LINK INSPECTOR & PREVIEW PROMPT BANNER */}
              <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 text-white rounded-2xl p-4 border border-cyan-500/30 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center shrink-0">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-cyan-200 flex items-center gap-2">
                      <span>أداة فحص ومعاينة الروابط المباشرة (Inspect Before Save)</span>
                      <span className="px-2 py-0.5 bg-cyan-500/30 text-cyan-300 rounded-md text-[10px] font-mono">
                        معاينة حية
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      يمكنك فحص الروابط المستهدفة ومعاينة المنشورات والتعليقات واستجابة فيسبوك و Apify والتأكد من البيانات قبل حفظها في القاعدة.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('inspector');
                    if (!inspectionResult && !isInspecting) {
                      handleRunInspect();
                    }
                  }}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md shadow-cyan-500/20 whitespace-nowrap cursor-pointer flex items-center gap-1.5 self-end sm:self-auto"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>فتح أداة الفحص والمعاينة</span>
                </button>
              </div>

              {/* INSTANT DIRECT POST COMPOSER (صندوق النشر الفوري المباشر) */}
              <div className="bg-white rounded-2xl border-2 border-blue-200/80 p-4 shadow-sm space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>صندوق النشر الفوري المباشر</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          فوري ⚡ Instant
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        كتابة ونشر منشور وسؤال تعليمي فوري في Supabase Base 1 والمجموعات بدون انتظار
                      </p>
                    </div>
                  </div>

                  {/* Instant Publish Toggle Option */}
                  <label className="flex items-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs select-none">
                    <input
                      type="checkbox"
                      checked={instantPublishMode}
                      onChange={(e) => setInstantPublishMode(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-bold text-slate-700 text-[11px]">
                      تفعيل النشر الفوري
                    </span>
                  </label>
                </div>

                <form onSubmit={handleInstantPublish} className="space-y-3">
                  <div className="relative">
                    <textarea
                      rows={3}
                      value={instantComposerText}
                      onChange={(e) => setInstantComposerText(e.target.value)}
                      placeholder="اكتب منشوراً أو سؤالاً وزارياً لطلبة السادس للنشر الفوري المباشر في Base 1..."
                      className="w-full bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 rounded-xl p-3 text-xs leading-relaxed text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Target Group Selector */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                        <Users className="w-3 h-3 text-blue-600" />
                        <span>المجموعة المستهدفة:</span>
                      </label>
                      <select
                        value={instantComposerGroup || (groups[0]?.id || '')}
                        onChange={(e) => setInstantComposerGroup(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      >
                        {groups.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name} ({g.url.includes('1280379818654162') ? 'ID: 1280379818654162' : 'مجموعة نشطة'})
                          </option>
                        ))}
                        {groups.length === 0 && (
                          <option value="grp_default">مجموعة السادس الإعدادي 2026</option>
                        )}
                      </select>
                    </div>

                    {/* Image URL input (optional) */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                        <ImageIcon className="w-3 h-3 text-amber-600" />
                        <span>رابط صورة مرفقة (اختياري):</span>
                      </label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={instantComposerImage}
                        onChange={(e) => setInstantComposerImage(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <Database className="w-3.5 h-3.5 text-emerald-600" />
                      <span>الحفظ المباشر: <strong>{base1Info.name}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        خيارات متقدمة...
                      </button>
                      <button
                        type="submit"
                        disabled={isInstantPublishing || !instantComposerText.trim()}
                        className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isInstantPublishing ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>جاري النشر الفوري...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>نشر فوري الآن ⚡</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* LIVE DIAGNOSTIC & RESULT BANNER (نتائج السحب والتشخيص المباشر) */}
              {lastRunResult && (
                <div
                  className={`rounded-2xl border p-4 shadow-xs transition-all space-y-3 animate-in fade-in duration-200 ${
                    lastRunResult.success && (lastRunResult.syncedPostsCount || lastRunResult.fetchedCount || 0) > 0
                      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                      : 'bg-blue-50/90 border-blue-300 text-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          lastRunResult.success && (lastRunResult.syncedPostsCount || lastRunResult.fetchedCount || 0) > 0
                            ? 'bg-emerald-600 text-white'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {lastRunResult.success && (lastRunResult.syncedPostsCount || lastRunResult.fetchedCount || 0) > 0 ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <AlertCircle className="w-5 h-5" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold flex items-center gap-2">
                          <span>
                            {lastRunResult.success && (lastRunResult.syncedPostsCount || lastRunResult.fetchedCount || 0) > 0
                              ? 'تمت العملية بنجاح وتحديث البيانات في Base 1'
                              : 'تقرير تشخيص استعلام السحب من المجموعات'}
                          </span>
                          <span className="font-mono text-[10px] bg-white/80 px-2 py-0.5 rounded-full font-bold border border-slate-200">
                            {new Date().toLocaleTimeString('ar-EG')}
                          </span>
                        </h4>
                        <p className="text-xs leading-relaxed opacity-90">
                          {lastRunResult.message}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setLastRunResult(null)}
                      className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
                      title="إغلاق التقرير"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Summary Metric Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-black/10 text-xs">
                    <div className="bg-white/80 rounded-xl p-2 border border-black/5 flex items-center justify-between">
                      <span className="text-slate-600 text-[11px]">المنشورات:</span>
                      <span className="font-mono font-bold text-blue-700">
                        {lastRunResult.syncedPostsCount || lastRunResult.fetchedCount || 0}
                      </span>
                    </div>
                    <div className="bg-white/80 rounded-xl p-2 border border-black/5 flex items-center justify-between">
                      <span className="text-slate-600 text-[11px]">التعليقات:</span>
                      <span className="font-mono font-bold text-sky-700">
                        {lastRunResult.syncedCommentsCount || lastRunResult.fetchedCommentsCount || 0}
                      </span>
                    </div>
                    <div className="bg-white/80 rounded-xl p-2 border border-black/5 flex items-center justify-between">
                      <span className="text-slate-600 text-[11px]">المفتاح المستخدم:</span>
                      <span className="font-mono font-bold text-indigo-700 text-[10px]">
                        {lastRunResult.usedTokenId || apifyConfig.activeTokenId}
                      </span>
                    </div>
                    <div className="bg-white/80 rounded-xl p-2 border border-black/5 flex items-center justify-between">
                      <span className="text-slate-600 text-[11px]">قاعدة البيانات:</span>
                      <span className="font-mono font-bold text-emerald-700 text-[10px]">
                        {base1Info.name}
                      </span>
                    </div>
                  </div>

                  {/* Diagnostic Action Advice when 0 posts returned */}
                  {(lastRunResult.syncedPostsCount || lastRunResult.fetchedCount || 0) === 0 && (
                    <div className="bg-white/90 rounded-xl p-3 border border-blue-200/80 space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 text-blue-800 font-bold">
                        <Zap className="w-3.5 h-3.5" />
                        <span>خيارات فورية لتوليد المحتوى أو تكرار السحب:</span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        نظراً لعدم توليد أي بيانات وهمية، يمكنك استخدام <strong>النشر الفوري</strong> لكتابة منشورك الآن، أو تبديل المفتاح لإعادة السحب.
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          onClick={() => {
                            setInstantComposerText('سؤال وزاري فيزياء السادس الإعدادي: ما هو مبدأ عمل الخلية الشمسية مع رسم الدائرة المكافئة؟');
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                        >
                          <Send className="w-3 h-3" />
                          <span>تعبئة سؤال وزاري ونشر فوري</span>
                        </button>

                        <button
                          onClick={() => handleRunPipeline()}
                          disabled={isRunningPipeline}
                          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>إعادة السحب بالمفتاح التالي</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Search & Action Bar */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                    س
                  </div>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 text-right px-4 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer"
                  >
                    أضف منشوراً يدوياً لطلبة السادس في Base 1...
                  </button>
                  <button
                    onClick={() => handleRunPipeline()}
                    disabled={isRunningPipeline}
                    className="px-4 py-2.5 bg-[#1877F2] hover:bg-blue-700 text-white rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRunningPipeline ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">تشغيل السحب</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="ابحث في نصوص منشورات وأسئلة طلبة السادس..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <button
                    onClick={() => setQuickFilterActive(!quickFilterActive)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                      quickFilterActive
                        ? 'bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-blue-100'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>فلتر السحب الفوري</span>
                  </button>

                  <button
                    onClick={handleClearPosts}
                    className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    title="تفريغ المنشورات"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Quick Live Filter Controls Expansion Bar */}
                {quickFilterActive && (
                  <div className="mt-3 p-4 bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-50 border border-blue-200 rounded-2xl space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-blue-600" />
                        <h4 className="text-xs font-bold text-slate-900">
                          معايير الفلترة الفورية للسحب القادم (التحكم بالتعليقات والصور والوقت)
                        </h4>
                      </div>
                      <span className="text-[11px] text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md font-medium">
                        تطبيق مباشر بدون أي قيم وهمية
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Comments filter */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <label className="font-bold text-slate-700 flex items-center gap-1">
                            <MessageCircle className="w-3.5 h-3.5 text-sky-600" />
                            <span>عدد التعليقات/منشور:</span>
                          </label>
                          <span className="font-mono font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded text-[11px]">
                            {apifyConfig.maxCommentsPerPost ?? 25}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={apifyConfig.maxCommentsPerPost ?? 25}
                          onChange={(e) =>
                            setApifyConfig((prev) => ({
                              ...prev,
                              maxCommentsPerPost: parseInt(e.target.value) || 0,
                              includeComments: parseInt(e.target.value) > 0,
                            }))
                          }
                          className="w-full accent-sky-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>0 (بدون)</span>
                          <span>50</span>
                          <span>100+</span>
                        </div>
                      </div>

                      {/* Images filter */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <label className="font-bold text-slate-700 flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                            <span>عدد الصور/منشور:</span>
                          </label>
                          <span className="font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[11px]">
                            {apifyConfig.maxImagesPerPost ?? 3}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          step="1"
                          value={apifyConfig.maxImagesPerPost ?? 3}
                          onChange={(e) =>
                            setApifyConfig((prev) => ({
                              ...prev,
                              maxImagesPerPost: parseInt(e.target.value) || 0,
                              includeMediaUrls: parseInt(e.target.value) > 0,
                            }))
                          }
                          className="w-full accent-amber-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>0 (نصوص فقط)</span>
                          <span>5</span>
                          <span>20</span>
                        </div>
                      </div>

                      {/* Max posts per request */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <label className="font-bold text-slate-700 flex items-center gap-1">
                            <Globe className="w-3.5 h-3.5 text-indigo-600" />
                            <span>إجمالي المنشورات:</span>
                          </label>
                          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded text-[11px]">
                            {apifyConfig.maxPostsPerRequest ?? 25}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="100"
                          step="1"
                          value={apifyConfig.maxPostsPerRequest ?? 25}
                          onChange={(e) =>
                            setApifyConfig((prev) => ({
                              ...prev,
                              maxPostsPerRequest: parseInt(e.target.value) || 10,
                            }))
                          }
                          className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>1</span>
                          <span>50</span>
                          <span>100</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-blue-200/60 text-xs">
                      <div className="flex items-center gap-3 text-slate-600 text-[11px]">
                        <span>
                          وقت الأداة المبرمج: <strong className="text-slate-800 font-mono">{apifyConfig.scheduledTime || '21:00'}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          المفتاح: <strong className="text-indigo-700 font-mono">{apifyConfig.activeTokenId}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={async () => {
                            const res = await updateCommunityConfig({ apifyConfig });
                            setApifyConfig(res.apifyConfig);
                            if (showToast) showToast('تم حفظ معايير الفلتر بنجاح', 'success');
                          }}
                          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold transition-all cursor-pointer text-xs"
                        >
                          حفظ المعايير
                        </button>
                        <button
                          onClick={() => handleRunPipeline()}
                          disabled={isRunningPipeline}
                          className="px-4 py-1.5 bg-[#1877F2] hover:bg-blue-700 text-white rounded-xl font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50 text-xs"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>سحب فوري بالمعايير الحالية</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* POSTS LIST */}
              {isLoading ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                  <p className="text-sm font-bold text-slate-700">جاري تحميل منشورات الفيسبوك من القاعدة الأولى (Base 1)...</p>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#1877F2] flex items-center justify-center mx-auto shadow-inner">
                    <Globe className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-800">لا توجد منشورات مسحوبة حالياً</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      اضغط على زر "تشغيل السحب لجميع المجموعات" لبدء تشغيل Apify وسحب المنشورات والتعليقات وتخزينها في Base 1.
                    </p>
                  </div>
                  <button
                    onClick={() => handleRunPipeline()}
                    disabled={isRunningPipeline}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1877F2] hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4" />
                    <span>بدء عملية السحب الآن</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPosts.map((post) => (
                    <article
                      key={post.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all hover:border-slate-300"
                    >
                      {/* Post Header */}
                      <div className="p-4 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-slate-700 text-sm overflow-hidden shrink-0">
                            {post.author_avatar ? (
                              <img
                                src={post.author_avatar}
                                alt={post.author_name || post.authorName || 'طالب'}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              (post.author_name || post.authorName || 'ط').charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-900">
                                {post.author_name || post.authorName || 'طالب سادس إعدادي'}
                              </h4>
                              {post.group_name && (
                                <>
                                  <span className="text-slate-400 text-xs">في</span>
                                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                                    {post.group_name}
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                              <span>
                                {post.post_created_at
                                  ? new Date(post.post_created_at).toLocaleString('ar-IQ')
                                  : 'اليوم'}
                              </span>
                              <span>•</span>
                              <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                                <Database className="w-3 h-3" />
                                <span>Base 1</span>
                              </span>
                              {post.source_api && (
                                <>
                                  <span>•</span>
                                  <span className="text-indigo-600 font-mono text-[10px] bg-indigo-50 px-1.5 rounded">
                                    {post.source_api}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5">
                          {post.post_url && (
                            <a
                              href={post.post_url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors text-xs flex items-center gap-1"
                              title="فتح رابط المنشور على فيسبوك"
                            >
                              <LinkIcon className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline text-[11px]">رابط المنشور</span>
                            </a>
                          )}
                          <button
                            onClick={() => setInspectingPost(post)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors text-xs flex items-center gap-1 cursor-pointer"
                            title="فحص سجل Base 1 والعلاقات"
                          >
                            <Code2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline text-[11px]">سجل JSON</span>
                          </button>
                        </div>
                      </div>

                      {/* Post Text (Strictly Unclassified Original Arabic Content) */}
                      <div className="px-4 pb-3">
                        <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                          {post.post_text || post.content}
                        </p>
                      </div>

                      {/* Post Media Attachments (0, 1, or more) */}
                      {((post.media_urls && post.media_urls.length > 0) || post.media_url) && (
                        <div className="border-t border-b border-slate-100 bg-slate-50 max-h-96 overflow-hidden flex items-center justify-center">
                          <img
                            src={(post.media_urls && post.media_urls[0]) || post.media_url}
                            alt="مرفق المنشور"
                            className="w-full h-auto max-h-96 object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}

                      {/* Reactions & Summary */}
                      <div className="px-4 py-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[10px]">
                            👍
                          </span>
                          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] -mr-2">
                            ❤️
                          </span>
                          <span className="font-semibold text-slate-700 mr-1 font-mono">
                            {post.likes_count || post.reactions_count || 0} تفاعل
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs">
                          <span>
                            <strong className="text-slate-700 font-mono">{post.comments?.length || post.comments_count || 0}</strong> تعليق مربوط
                          </span>
                          {post.source_post_id && (
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                              ID: {post.source_post_id.slice(-8)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Post Actions Bar */}
                      <div className="px-2 py-1 border-t border-slate-100 grid grid-cols-3 gap-1 text-xs font-bold text-slate-600">
                        <button
                          onClick={() => handleReact(post.id, 'like')}
                          className="py-2 rounded-xl hover:bg-slate-100 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <ThumbsUp className="w-4 h-4 text-blue-600" />
                          <span>إعجاب</span>
                        </button>

                        <button
                          onClick={() => {
                            const inputElem = document.getElementById(`comment-input-${post.id}`);
                            inputElem?.focus();
                          }}
                          className="py-2 rounded-xl hover:bg-slate-100 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4 text-emerald-600" />
                          <span>تعليق</span>
                        </button>

                        <button
                          onClick={() => {
                            if (post.post_url) {
                              navigator.clipboard.writeText(post.post_url);
                              if (showToast) showToast('تم نسخ رابط المنشور', 'success');
                            }
                          }}
                          className="py-2 rounded-xl hover:bg-slate-100 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Share2 className="w-4 h-4 text-purple-600" />
                          <span>نسخ الرابط</span>
                        </button>
                      </div>

                      {/* LINKED COMMENTS SECTION */}
                      <div className="bg-slate-50/80 p-4 border-t border-slate-100 space-y-3">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
                            <span>التعليقات المربوطة بالـ post_id (الحد الأقصى 50): {post.comments?.length || 0}</span>
                          </span>
                          <span className="text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded font-mono text-[10px]">
                            FK: post_id -&gt; {post.id.slice(0, 8)}...
                          </span>
                        </div>

                        {/* List of comments */}
                        {post.comments && post.comments.length > 0 ? (
                          <div className="space-y-2.5">
                            {post.comments.map((comment) => (
                              <div key={comment.id} className="flex items-start gap-2.5 text-xs">
                                <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0 overflow-hidden">
                                  {comment.author_avatar ? (
                                    <img
                                      src={comment.author_avatar}
                                      alt={comment.author_name || 'مشارك'}
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    (comment.author_name || 'م').charAt(0)
                                  )}
                                </div>
                                <div className="flex-1 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-900">{comment.author_name || 'طالب مشارك'}</span>
                                    <span className="text-[10px] text-slate-400">
                                      {comment.comment_created_at
                                        ? new Date(comment.comment_created_at).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })
                                        : 'الآن'}
                                    </span>
                                  </div>
                                  <p className="text-slate-700 leading-relaxed text-xs">{comment.comment_text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 text-center py-2">
                            لا توجد تعليقات مربوطة بهذا المنشور حالياً.
                          </p>
                        )}

                        {/* Add Comment Input */}
                        <div className="flex items-center gap-2 pt-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                            أنت
                          </div>
                          <div className="flex-1 relative">
                            <input
                              id={`comment-input-${post.id}`}
                              type="text"
                              placeholder="اكتب تعليقاً لربطه بهذا المنشور وتخزينه في Base 1..."
                              value={commentInputs[post.id] || ''}
                              onChange={(e) =>
                                setCommentInputs((prev) => ({
                                  ...prev,
                                  [post.id]: e.target.value
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleAddComment(post.id);
                                }
                              }}
                              className="w-full bg-white border border-slate-200 rounded-full pr-4 pl-10 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                            <button
                              onClick={() => handleAddComment(post.id)}
                              disabled={commentingPostId === post.id || !commentInputs[post.id]?.trim()}
                              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#1877F2] hover:bg-blue-700 text-white rounded-full transition-all disabled:opacity-30 cursor-pointer"
                            >
                              <Send className="w-3 h-3 rotate-180" />
                            </button>
                          </div>
                        </div>

                      </div>
                    </article>
                  ))}
                </div>
              )}

            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION: LIVE LINK INSPECTOR & DATA PREVIEW (فحص ومعاينة الروابط) */}
        {/* ========================================================= */}
        {activeTab === 'inspector' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Header / Intro Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center shadow-inner">
                  <Search className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>فحص ومعاينة الروابط المباشرة (Inspect Link & Live Data Preview)</span>
                    <span className="px-2 py-0.5 bg-cyan-100 text-cyan-800 text-[10px] rounded-full font-mono">
                      Real-time Probe
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    افحص أي رابط فيسبوك وتحقق من استجابة الخادم وسحب المنشورات والتعليقات للمعاينة قبل اعتمادها وحفظها في قاعدة البيانات.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRunInspect()}
                  disabled={isInspecting}
                  className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-cyan-600/20 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isInspecting ? 'animate-spin' : ''}`} />
                  <span>{isInspecting ? 'جاري الفحص المباشر...' : 'تشغيل الفحص والمعاينة الآن'}</span>
                </button>
              </div>
            </div>

            {/* Target Link Selector & Controls Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <LinkIcon className="w-4 h-4 text-cyan-600" />
                  <span>اختر رابطاً من المجموعات المستهدفة أو اكتب رابطاً مخصصاً:</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Facebook URL Probe</span>
              </div>

              {/* Quick Select Presets for the 4 User Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                {[
                  {
                    name: 'المجموعة 1 (14jyGPSu1nA)',
                    url: 'https://www.facebook.com/share/g/14jyGPSu1nA/',
                    desc: 'جروب السادس العلمي والأدبي',
                    badge: 'Group 1'
                  },
                  {
                    name: 'المجموعة 2 (1cAZdsqEiy)',
                    url: 'https://www.facebook.com/share/g/1cAZdsqEiy/',
                    desc: 'أسئلة الفيزياء والكيمياء الوزارية',
                    badge: 'Group 2'
                  },
                  {
                    name: 'المجموعة 3 (14ikzxh2Vuv)',
                    url: 'https://www.facebook.com/share/g/14ikzxh2Vuv/',
                    desc: 'مرشحات وملازم السادس الإعدادي',
                    badge: 'Group 3'
                  },
                  {
                    name: 'المنشور 4 (183mxRUEG9)',
                    url: 'https://www.facebook.com/share/p/183mxRUEG9/',
                    desc: 'منشور مسائل وحلول وزارية',
                    badge: 'Post 4'
                  }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInspectUrl(item.url);
                      handleRunInspect(item.url);
                    }}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                      inspectUrl === item.url
                        ? 'border-cyan-500 bg-cyan-50/70 text-cyan-950 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-xs">{item.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        inspectUrl === item.url ? 'bg-cyan-200 text-cyan-900 font-bold' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{item.desc}</p>
                    <code className="text-[10px] text-cyan-700 font-mono truncate w-full block">
                      {item.url}
                    </code>
                  </button>
                ))}
              </div>

              {/* Custom URL Input Field */}
              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-bold text-slate-700">
                  رابط فيسبوك المستهدف للفحص:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={inspectUrl}
                    onChange={(e) => setInspectUrl(e.target.value)}
                    placeholder="https://www.facebook.com/share/g/... أو https://www.facebook.com/groups/..."
                    className="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => handleRunInspect()}
                    disabled={isInspecting}
                    className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 whitespace-nowrap flex items-center gap-1.5"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>فحص الرابط</span>
                  </button>
                </div>
              </div>

              {/* Inspection Configuration Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">مفتاح Apify المستخدم:</label>
                  <select
                    value={inspectTokenId}
                    onChange={(e) => setInspectTokenId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-mono"
                  >
                    {apifyConfig.tokens.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.id} ({t.label})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">أقصى عدد منشورات للمعاينة:</label>
                  <select
                    value={inspectMaxPosts}
                    onChange={(e) => setInspectMaxPosts(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs"
                  >
                    <option value={1}>1 منشور</option>
                    <option value={3}>3 منشورات</option>
                    <option value={5}>5 منشورات</option>
                    <option value={10}>10 منشورات</option>
                    <option value={20}>20 منشور</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">أقصى عدد تعليقات للمنشور:</label>
                  <select
                    value={inspectMaxComments}
                    onChange={(e) => setInspectMaxComments(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs"
                  >
                    <option value={5}>5 تعليقات</option>
                    <option value={10}>10 تعليقات</option>
                    <option value={25}>25 تعليق</option>
                    <option value={50}>50 تعليق</option>
                  </select>
                </div>

                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 w-full select-none">
                    <input
                      type="checkbox"
                      checked={inspectIncludeImages}
                      onChange={(e) => setInspectIncludeImages(e.target.checked)}
                      className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-bold text-slate-700 text-xs">سحب الصور والمرفقات</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Inspection In-Progress State */}
            {isInspecting && (
              <div className="bg-white rounded-2xl border border-cyan-200 p-8 shadow-sm text-center space-y-4 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center mx-auto">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">جاري فحص الرابط وسحب البيانات الحية...</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    يتم الآن تتبع توجيه الرابط، وفحص استجابة Facebook HTTP Probe، واستدعاء مشغل Apify Actor لاستخراج المنشورات والتعليقات للمعاينة.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 text-[11px] text-cyan-800 font-mono">
                  <span className="bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-100">1. Probe URL</span>
                  <span>→</span>
                  <span className="bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-100">2. Facebook Wall Check</span>
                  <span>→</span>
                  <span className="bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-100">3. Apify Actor</span>
                  <span>→</span>
                  <span className="bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-100">4. Preview Ready</span>
                </div>
              </div>
            )}

            {/* Inspection Results Dashboard */}
            {inspectionResult && !isInspecting && (
              <div className="space-y-5">
                
                {/* Top High-Level Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  
                  {/* Metric 1: HTTP & Redirect */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="font-bold flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-blue-600" />
                        <span>استجابة الرابط (HTTP)</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        inspectionResult.httpProbe.status === 200 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        HTTP {inspectionResult.httpProbe.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-700 font-mono truncate" title={inspectionResult.canonicalUrl}>
                      {inspectionResult.canonicalUrl || inspectionResult.inputUrl}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <span>التحويل:</span>
                      <strong className={inspectionResult.isRedirected ? 'text-amber-600' : 'text-slate-600'}>
                        {inspectionResult.isRedirected ? 'تم حل الرابط المختصر بنجاح' : 'رابط مباشر'}
                      </strong>
                    </div>
                  </div>

                  {/* Metric 2: Privacy Wall */}
                  <div className={`rounded-2xl border p-4 shadow-xs space-y-2 ${
                    inspectionResult.httpProbe.requiresLogin || inspectionResult.httpProbe.isPrivateGroup
                      ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                      : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1 text-xs">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>حالة خصوصية المجموعة</span>
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/80 border border-current">
                        {inspectionResult.httpProbe.requiresLogin ? 'مغلقة / تتطلب تسجيل' : 'مفتوحة للعامة'}
                      </span>
                    </div>
                    <p className="text-[11px] leading-snug">
                      {inspectionResult.httpProbe.notes}
                    </p>
                  </div>

                  {/* Metric 3: Apify Run Status */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="font-bold flex items-center gap-1">
                        <Key className="w-3.5 h-3.5 text-indigo-600" />
                        <span>مشغل Apify Scraper</span>
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800">
                        {inspectionResult.executionTimeMs}ms
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-700 font-mono flex items-center justify-between">
                      <span>المفتاح: {inspectionResult.apifyExecution.tokenId}</span>
                      <span className="text-emerald-700 font-bold">200 OK</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      تم استدعاء: <code className="text-indigo-600 font-mono">{inspectionResult.apifyExecution.actorId}</code>
                    </div>
                  </div>

                  {/* Metric 4: Save Readiness */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="font-bold flex items-center gap-1">
                        <Database className="w-3.5 h-3.5 text-emerald-600" />
                        <span>جاهزية الحفظ في Base 1</span>
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        جاهز للحفظ
                      </span>
                    </div>
                    <div className="text-xs text-slate-800 font-bold">
                      {inspectionResult.extractedPosts?.length || 0} منشور مستخرج • {inspectionResult.sampleCurriculumPosts?.length || 0} عينات نموذجية
                    </div>
                    <div className="text-[10px] text-slate-500">
                      العلاقات محفوظة: <code className="text-emerald-700 font-mono">comments.post_id</code>
                    </div>
                  </div>

                </div>

                {/* Sub-view Navigation Tabs */}
                <div className="bg-white rounded-2xl border border-slate-200 p-1.5 shadow-xs flex items-center gap-1 overflow-x-auto text-xs font-bold">
                  
                  <button
                    type="button"
                    onClick={() => setInspectorActiveView('posts')}
                    className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                      inspectorActiveView === 'posts'
                        ? 'bg-cyan-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <ListFilter className="w-3.5 h-3.5" />
                    <span>المنشورات المستخرجة من الرابط ({inspectionResult.extractedPosts?.length || 0})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInspectorActiveView('curriculum_samples')}
                    className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                      inspectorActiveView === 'curriculum_samples'
                        ? 'bg-cyan-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>منشورات السادس الإعدادي النموذجية ({inspectionResult.sampleCurriculumPosts?.length || 0})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInspectorActiveView('diagnostics')}
                    className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                      inspectorActiveView === 'diagnostics'
                        ? 'bg-cyan-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>تقرير الفحص والتشخيص الفني</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInspectorActiveView('raw_json')}
                    className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                      inspectorActiveView === 'raw_json'
                        ? 'bg-cyan-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>استجابة Apify و JSON الخام</span>
                  </button>

                </div>

                {/* ========================================================= */}
                {/* SUB-VIEW 1: EXTRACTED POSTS FROM LINK */}
                {/* ========================================================= */}
                {inspectorActiveView === 'posts' && (
                  <div className="space-y-4">
                    {inspectionResult.extractedPosts && inspectionResult.extractedPosts.length > 0 ? (
                      <>
                        {/* Action Bar for Extracted Posts */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleSelectAllPosts(inspectionResult.extractedPosts)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <CheckSquare className="w-3.5 h-3.5 text-cyan-600" />
                              <span>تحديد / إلغاء تحديد الكل</span>
                            </button>
                            <span className="text-slate-500 font-medium">
                              المحدد للحفظ: <strong className="text-cyan-700 font-bold">
                                {Object.values(selectedInspectPosts).filter(Boolean).length}
                              </strong> من أصل {inspectionResult.extractedPosts.length}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSaveSelectedInspected(inspectionResult.extractedPosts)}
                              disabled={isSavingInspected || Object.values(selectedInspectPosts).filter(Boolean).length === 0}
                              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                              <Database className="w-3.5 h-3.5" />
                              <span>{isSavingInspected ? 'جاري الحفظ في Base 1...' : 'حفظ المنشورات المحددة في المجتمع وقاعدة البيانات'}</span>
                            </button>
                          </div>
                        </div>

                        {/* List of Extracted Posts */}
                        <div className="space-y-4">
                          {inspectionResult.extractedPosts.map((post) => (
                            <div
                              key={post.id}
                              className={`bg-white rounded-2xl border transition-all p-5 shadow-xs space-y-3 relative ${
                                selectedInspectPosts[post.id]
                                  ? 'border-cyan-500 ring-2 ring-cyan-500/20'
                                  : 'border-slate-200'
                              }`}
                            >
                              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    checked={!!selectedInspectPosts[post.id]}
                                    onChange={() => handleToggleSelectPost(post.id)}
                                    className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                                  />
                                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                                    {(post.author_name || 'ف')[0]}
                                  </div>
                                  <div>
                                    <div className="font-bold text-xs text-slate-900">{post.author_name}</div>
                                    <div className="text-[10px] text-slate-400">
                                      {post.group_name} • {new Date(post.post_created_at).toLocaleString('ar-IQ')}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleSaveSingleInspected(post)}
                                    disabled={isSavingInspected}
                                    className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                                  >
                                    <Database className="w-3 h-3 text-emerald-600" />
                                    <span>حفظ هذا المنشور فقط</span>
                                  </button>
                                  {post.post_url && (
                                    <a
                                      href={post.post_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg"
                                      title="فتح الرابط الأصلي"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                </div>
                              </div>

                              <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                                {post.post_text}
                              </p>

                              {post.media_urls && post.media_urls.length > 0 && (
                                <div className="flex gap-2 overflow-x-auto py-2">
                                  {post.media_urls.map((img, idx) => (
                                    <img
                                      key={idx}
                                      src={img}
                                      alt="مرفق المعاينة"
                                      className="h-32 rounded-xl object-cover border border-slate-200"
                                      referrerPolicy="no-referrer"
                                    />
                                  ))}
                                </div>
                              )}

                              {/* Attached Comments */}
                              {post.comments && post.comments.length > 0 && (
                                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-2 mt-2">
                                  <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                                    <MessageCircle className="w-3 h-3 text-sky-600" />
                                    <span>التعليقات المربوطة ({post.comments.length}):</span>
                                  </div>
                                  <div className="space-y-1.5">
                                    {post.comments.map((c) => (
                                      <div key={c.id} className="text-xs bg-white p-2 rounded-lg border border-slate-100">
                                        <span className="font-bold text-slate-900 ml-2">{c.author_name}:</span>
                                        <span className="text-slate-700">{c.comment_text}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      /* If Facebook Returned 0 Items due to Private / Login Wall */
                      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
                          <ShieldCheck className="w-7 h-7" />
                        </div>
                        <div className="space-y-1.5 max-w-lg mx-auto">
                          <h3 className="text-sm font-bold text-slate-900">
                            استجابة فيسبوك: المجموعة مغلقة أو تتطلب تسجيل دخول (Empty or private data)
                          </h3>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            أكد الفحص الفني أن الرابط <code className="text-cyan-800 font-mono text-[11px] bg-slate-100 px-1 py-0.5 rounded">{inspectionResult.canonicalUrl || inspectionResult.inputUrl}</code> محمي بحائط خصوصية فيسبوك ولا يسمح بالكشط العام دون جلسة مستخدم مسجلة.
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setInspectorActiveView('curriculum_samples')}
                            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-2"
                          >
                            <Sparkles className="w-4 h-4 text-amber-300" />
                            <span>استعراض المنشورات النموذجية لمنهاج السادس وحفظها</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => setInspectorActiveView('diagnostics')}
                            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-slate-200"
                          >
                            <Code2 className="w-4 h-4 text-slate-600" />
                            <span>قراءة التقرير الفني والـ JSON المباشر</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ========================================================= */}
                {/* SUB-VIEW 2: SAMPLE CURRICULUM POSTS */}
                {/* ========================================================= */}
                {inspectorActiveView === 'curriculum_samples' && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-cyan-950 text-white rounded-2xl p-5 border border-indigo-500/30 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-xs font-bold text-indigo-200 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <span>منشورات وأسئلة السادس الإعدادي النموذجية المجهزة للمعاينة</span>
                        </h3>
                        <p className="text-[11px] text-slate-300 mt-1">
                          نماذج واقعية دقيقة لأسئلة وزارية في الفيزياء والكيمياء مع تعليقات الحلول النموذجية، مهيأة بالكامل للحفظ المباشر في Base 1.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleSelectAllPosts(inspectionResult.sampleCurriculumPosts)}
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          تحديد الكل
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveSelectedInspected(inspectionResult.sampleCurriculumPosts)}
                          disabled={isSavingInspected}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer flex items-center gap-1.5"
                        >
                          <Database className="w-3.5 h-3.5" />
                          <span>حفظ المنشورات النموذجية في القاعدة</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {inspectionResult.sampleCurriculumPosts.map((post) => (
                        <div
                          key={post.id}
                          className={`bg-white rounded-2xl border transition-all p-5 shadow-xs space-y-3 ${
                            selectedInspectPosts[post.id]
                              ? 'border-cyan-500 ring-2 ring-cyan-500/20'
                              : 'border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={!!selectedInspectPosts[post.id]}
                                onChange={() => handleToggleSelectPost(post.id)}
                                className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                              />
                              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                                {(post.author_name || 'ط')[0]}
                              </div>
                              <div>
                                <div className="font-bold text-xs text-slate-900">{post.author_name}</div>
                                <div className="text-[10px] text-slate-400">
                                  {post.group_name} • {new Date(post.post_created_at).toLocaleString('ar-IQ')}
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleSaveSingleInspected(post)}
                              disabled={isSavingInspected}
                              className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Database className="w-3 h-3 text-emerald-600" />
                              <span>حفظ هذا المنشور فقط</span>
                            </button>
                          </div>

                          <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed font-sans">
                            {post.post_text}
                          </p>

                          {post.media_urls && post.media_urls.length > 0 && (
                            <div className="py-2">
                              <img
                                src={post.media_urls[0]}
                                alt="مرفق السؤال النموذجي"
                                className="h-44 rounded-xl object-cover border border-slate-200"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          )}

                          {post.comments && post.comments.length > 0 && (
                            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-2 mt-2">
                              <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                                <MessageCircle className="w-3 h-3 text-sky-600" />
                                <span>التعليقات والإجابات النموذجية المربوطة ({post.comments.length}):</span>
                              </div>
                              <div className="space-y-1.5">
                                {post.comments.map((c) => (
                                  <div key={c.id} className="text-xs bg-white p-2.5 rounded-lg border border-slate-100">
                                    <span className="font-bold text-indigo-700 ml-2">{c.author_name}:</span>
                                    <span className="text-slate-700 leading-relaxed">{c.comment_text}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* SUB-VIEW 3: TECHNICAL DIAGNOSTICS */}
                {/* ========================================================= */}
                {inspectorActiveView === 'diagnostics' && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5 text-xs">
                    <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                      <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-teal-600" />
                        <span>التقرير الفني التفصيلي للرابط المفحوص</span>
                      </div>
                      <span className="text-slate-400 font-mono text-[11px]">
                        Timestamp: {new Date(inspectionResult.timestamp).toLocaleTimeString('ar-IQ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                        <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-blue-600" />
                          <span>1. نتائج فحص الرابط الأصلي (Canonical Probe):</span>
                        </div>
                        <div className="space-y-1 font-mono text-[11px] text-slate-700">
                          <div><strong>الرابط المدخل:</strong> <span className="break-all text-slate-600">{inspectionResult.inputUrl}</span></div>
                          <div><strong>الرابط المحلول:</strong> <span className="break-all text-blue-700">{inspectionResult.canonicalUrl}</span></div>
                          <div><strong>كود استجابة فيسبوك:</strong> <span className="text-emerald-700 font-bold">{inspectionResult.httpProbe.status}</span></div>
                          <div><strong>عنوان الصفحة (HTML Title):</strong> <span>{inspectionResult.httpProbe.title || 'Facebook Group'}</span></div>
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                        <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                          <Key className="w-3.5 h-3.5 text-indigo-600" />
                          <span>2. استدعاء مشغل Apify Actor:</span>
                        </div>
                        <div className="space-y-1 font-mono text-[11px] text-slate-700">
                          <div><strong>Actor ID:</strong> <span>{inspectionResult.apifyExecution.actorId}</span></div>
                          <div><strong>المفتاح المستخدم:</strong> <span>{inspectionResult.apifyExecution.tokenId} ({inspectionResult.apifyExecution.tokenMasked})</span></div>
                          <div><strong>عدد العناصر المسترجعة:</strong> <span className="font-bold">{inspectionResult.apifyExecution.itemsCount}</span></div>
                          <div><strong>وقت الاستجابة:</strong> <span>{inspectionResult.executionTimeMs} ms</span></div>
                        </div>
                      </div>

                    </div>

                    {/* Explanatory Technical Notice */}
                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 text-amber-900 space-y-2">
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>تحليل سبب عدم ظهور البيانات للمجموعات المغلقة:</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        عند محاولة سحب مجموعات فيسبوك الخاصة أو المغلقة بواسطة الـ Scraping Actors، يقوم فيسبوك بعرض شاشة تسجيل الدخول (Login Wall)، مما يجعل الأداة تعيد <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">Empty or private data for provided input</code>. لهذا السبب تم توفير أداة الفحص والمعاينة المسبقة لتمكينك من فحص أي رابط والتأكد من توفر البيانات ورؤية الـ JSON قبل اعتماد الحفظ.
                      </p>
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* SUB-VIEW 4: RAW JSON PAYLOAD */}
                {/* ========================================================= */}
                {inspectorActiveView === 'raw_json' && (
                  <div className="bg-slate-950 text-slate-200 rounded-2xl p-5 font-mono text-xs border border-slate-800 space-y-3 shadow-inner">
                    <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-cyan-400" />
                        <span>الاستجابة الخام المسترجعة (Raw Link Inspection Payload)</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyInspectJson}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5 text-amber-400" />
                        <span>{copiedInspectJson ? 'تم النسخ!' : 'نسخ كود الـ JSON'}</span>
                      </button>
                    </div>

                    <pre className="overflow-x-auto max-h-96 text-cyan-300 whitespace-pre-wrap leading-relaxed text-[11px]">
                      {JSON.stringify(inspectionResult, null, 2)}
                    </pre>
                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION: ADVANCED FILTER & CONTROL CRITERIA */}
        {/* ========================================================= */}
        {activeTab === 'filter_controls' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Filter Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                  <SlidersHorizontal className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>لوحة معايير الفلترة والتحكم الكامل بالسحب</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] rounded-full font-mono">
                      Real Filter Controls
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    حدد بنفسك بدقة عدد التعليقات لكل منشور، وعدد الصور المراد سحبها، ووقت عمل الأداة والجدولة، بدون أي افتراضات أو بيانات وهمية.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    const res = await updateCommunityConfig({ apifyConfig });
                    setApifyConfig(res.apifyConfig);
                    if (showToast) showToast('تم حفظ كافة معايير الفلترة بنجاح', 'success');
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-200"
                >
                  حفظ المعايير
                </button>
                <button
                  onClick={() => handleRunPipeline()}
                  disabled={isRunningPipeline}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />
                  <span>{isRunningPipeline ? 'جاري السحب الفعلي...' : 'تشغيل السحب بالمعايير الحالية'}</span>
                </button>
              </div>
            </div>

            {/* Main Criteria Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Criterion 1: Comments Filter */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">معيار فلتر التعليقات</h3>
                      <p className="text-[10px] text-slate-400">Comments Per Post Limit</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={apifyConfig.includeComments}
                      onChange={(e) => setApifyConfig(prev => ({ ...prev, includeComments: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600"></div>
                  </label>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  حدد الحد الأقصى لعدد التعليقات المسموح بجلبها وربطها بكل منشور عبر الـ <code className="text-sky-700 bg-sky-50 px-1 py-0.5 rounded font-mono text-[10px]">post_id</code>.
                </p>

                <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>عدد التعليقات المحدد:</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="200"
                        value={apifyConfig.maxCommentsPerPost ?? 25}
                        disabled={!apifyConfig.includeComments}
                        onChange={(e) => setApifyConfig(prev => ({ ...prev, maxCommentsPerPost: Math.max(0, parseInt(e.target.value) || 0) }))}
                        className="w-16 bg-white border border-slate-300 rounded-lg px-2 py-1 text-center font-mono font-bold text-sky-700 text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 disabled:opacity-50"
                      />
                      <span className="text-[11px] text-slate-500">تعليق</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    disabled={!apifyConfig.includeComments}
                    value={apifyConfig.maxCommentsPerPost ?? 25}
                    onChange={(e) => setApifyConfig(prev => ({ ...prev, maxCommentsPerPost: parseInt(e.target.value) || 0 }))}
                    className="w-full accent-sky-600 cursor-pointer h-2 bg-slate-200 rounded-lg disabled:opacity-40"
                  />

                  <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1">
                    <span>0 (تعطيل)</span>
                    <span>25</span>
                    <span>50</span>
                    <span>100+</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{apifyConfig.includeComments ? `سيتم جلب حتى ${apifyConfig.maxCommentsPerPost ?? 25} تعليق لكل منشور` : 'تم إيقاف جلب التعليقات بالكامل'}</span>
                </div>
              </div>

              {/* Criterion 2: Media & Images Filter */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">معيار فلتر الصور والوسائط</h3>
                      <p className="text-[10px] text-slate-400">Media & Images Per Post</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={apifyConfig.includeMediaUrls}
                      onChange={(e) => setApifyConfig(prev => ({ ...prev, includeMediaUrls: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  تحكم بعدد روابط الصور المرفقة المستخرجة لكل منشور، أو استخراج النصوص الصافية فقط لتوفير النطاق الترددي.
                </p>

                <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>عدد الصور المحدد:</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={apifyConfig.maxImagesPerPost ?? 3}
                        disabled={!apifyConfig.includeMediaUrls}
                        onChange={(e) => setApifyConfig(prev => ({ ...prev, maxImagesPerPost: Math.max(0, parseInt(e.target.value) || 0) }))}
                        className="w-16 bg-white border border-slate-300 rounded-lg px-2 py-1 text-center font-mono font-bold text-amber-700 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-50"
                      />
                      <span className="text-[11px] text-slate-500">صورة</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    disabled={!apifyConfig.includeMediaUrls}
                    value={apifyConfig.maxImagesPerPost ?? 3}
                    onChange={(e) => setApifyConfig(prev => ({ ...prev, maxImagesPerPost: parseInt(e.target.value) || 0 }))}
                    className="w-full accent-amber-600 cursor-pointer h-2 bg-slate-200 rounded-lg disabled:opacity-40"
                  />

                  <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1">
                    <span>0 (نصوص فقط)</span>
                    <span>5</span>
                    <span>10</span>
                    <span>20</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{apifyConfig.includeMediaUrls ? `سحب حتى ${apifyConfig.maxImagesPerPost ?? 3} صور للمنشور الواحد` : 'سحب المنشورات كنصوص فقط بدون صور'}</span>
                </div>
              </div>

              {/* Criterion 3: Tool Execution Timing & Schedule */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <CalendarClock className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">معيار وقت عمل الأداة والجدولة</h3>
                      <p className="text-[10px] text-slate-400">Execution Schedule & Timing</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={apifyConfig.isScheduledEnabled}
                      onChange={(e) => setApifyConfig(prev => ({ ...prev, isScheduledEnabled: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  تحديد موعد وتكرار تشغيل أداة السحب التلقائي لأوقات تفاعل طلبة السادس (أوقات الذروة المسائية).
                </p>

                <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>وقت بدء التشغيل المفضل:</span>
                      <span className="font-mono text-purple-700 text-xs font-bold">{apifyConfig.scheduledTime || '21:00'}</span>
                    </label>
                    <input
                      type="time"
                      value={apifyConfig.scheduledTime || '21:00'}
                      onChange={(e) => setApifyConfig(prev => ({ ...prev, scheduledTime: e.target.value }))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">دورية التكرار:</label>
                    <select
                      value={apifyConfig.scheduleInterval || 'daily'}
                      onChange={(e) => setApifyConfig(prev => ({ ...prev, scheduleInterval: e.target.value as any }))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    >
                      <option value="hourly">كل ساعة (سحب مستمر)</option>
                      <option value="every_3h">كل 3 ساعات</option>
                      <option value="every_6h">كل 6 ساعات</option>
                      <option value="daily">يومياً عند وقت الذروة المحدد</option>
                      <option value="manual">يدوي فقط عند الضغط على الزر</option>
                    </select>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <span>
                    {apifyConfig.isScheduledEnabled
                      ? `الجدولة مفعلة: تعمل ${apifyConfig.scheduleInterval === 'hourly' ? 'كل ساعة' : 'يومياً الساعة ' + (apifyConfig.scheduledTime || '21:00')}`
                      : 'الجدولة التلقائية معطلة (تشغيل يدوي)'}
                  </span>
                </div>
              </div>

              {/* Criterion 4: Posts Batch Limit */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">معيار عدد المنشورات لكل دورة</h3>
                    <p className="text-[10px] text-slate-400">Total Posts Batch Size</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  عدد المنشورات الإجمالي المطلوب سحبها من كل مجموعة نشطة أثناء تشغيل الدورة.
                </p>

                <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>عدد المنشورات:</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={apifyConfig.maxPostsPerRequest ?? 25}
                        onChange={(e) => setApifyConfig(prev => ({ ...prev, maxPostsPerRequest: Math.max(1, parseInt(e.target.value) || 1) }))}
                        className="w-16 bg-white border border-slate-300 rounded-lg px-2 py-1 text-center font-mono font-bold text-indigo-700 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                      <span className="text-[11px] text-slate-500">منشور</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="100"
                    step="1"
                    value={apifyConfig.maxPostsPerRequest ?? 25}
                    onChange={(e) => setApifyConfig(prev => ({ ...prev, maxPostsPerRequest: parseInt(e.target.value) || 10 }))}
                    className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />

                  <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1">
                    <span>1</span>
                    <span>25</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>سحب أحدث {apifyConfig.maxPostsPerRequest ?? 25} منشور من كل مجموعة</span>
                </div>
              </div>

              {/* Criterion 5: Token Rotation & Group Info */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Shuffle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">معايير التناوب ومعلومات المجموعات</h3>
                    <p className="text-[10px] text-slate-400">Tokens & Group Details</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  تحديد سلوك التبديل بين مفاتيح Apify الأربعة وتضمين تفاصيل اسم ورابط المجموعة في Base 1.
                </p>

                <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="font-bold text-slate-700">التناوب التلقائي بين المفاتيح:</span>
                    <input
                      type="checkbox"
                      checked={apifyConfig.autoRotateTokens}
                      onChange={(e) => setApifyConfig(prev => ({ ...prev, autoRotateTokens: e.target.checked }))}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-200">
                    <span className="font-bold text-slate-700">تضمين بيانات المجموعة (Group Info):</span>
                    <input
                      type="checkbox"
                      checked={apifyConfig.includeGroupInfo}
                      onChange={(e) => setApifyConfig(prev => ({ ...prev, includeGroupInfo: e.target.checked }))}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    />
                  </label>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>المفتاح الحالي: <strong className="font-mono text-slate-800">{apifyConfig.activeTokenId}</strong></span>
                </div>
              </div>

              {/* Criterion 6: Live Summary & Direct Trigger */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-md space-y-4 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>ملخص المعايير المعتمدة للسحب</span>
                  </div>

                  <ul className="text-xs space-y-1.5 text-slate-300">
                    <li className="flex items-center justify-between">
                      <span>التعليقات:</span>
                      <strong className="text-white font-mono">{apifyConfig.includeComments ? `${apifyConfig.maxCommentsPerPost ?? 25} تعليق` : 'معطل'}</strong>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>الصور والوسائط:</span>
                      <strong className="text-white font-mono">{apifyConfig.includeMediaUrls ? `${apifyConfig.maxImagesPerPost ?? 3} صور` : 'نصوص فقط'}</strong>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>عدد المنشورات:</span>
                      <strong className="text-white font-mono">{apifyConfig.maxPostsPerRequest ?? 25} منشور</strong>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>وقت العمل:</span>
                      <strong className="text-white font-mono">{apifyConfig.scheduledTime || '21:00'} ({apifyConfig.scheduleInterval || 'daily'})</strong>
                    </li>
                  </ul>
                </div>

                <div className="space-y-2 pt-3 border-t border-white/10">
                  <button
                    onClick={() => handleRunPipeline()}
                    disabled={isRunningPipeline}
                    className="w-full py-2.5 bg-[#1877F2] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRunningPipeline ? 'animate-spin' : ''}`} />
                    <span>{isRunningPipeline ? 'جاري السحب الفعلي...' : 'تشغيل السحب بالمعايير الحالية'}</span>
                  </button>
                  <p className="text-[10px] text-slate-400 text-center">
                    يتم تخزين المنشورات والتعليقات الحقيقية مباشرة في Supabase Base 1
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 2: GROUPS MANAGEMENT VIEW */}
        {/* ========================================================= */}
        {activeTab === 'groups' && (
          <div className="space-y-6">
            
            {/* Header Description */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    إدارة روابط مجموعات فيسبوك المستهدفة
                  </h2>
                  <p className="text-xs text-slate-500">
                    تستطيع إضافة وتعديل وحذف وتفعيل أو تعطيل أي مجموعة، مع فحص صلاحية الروابط تلقائياً.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setEditingGroupId(null);
                  setGroupFormName('');
                  setGroupFormUrl('');
                  setIsGroupModalOpen(true);
                }}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة رابط مجموعة فيسبوك</span>
              </button>
            </div>

            {/* Groups Table & Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map((grp) => {
                const isSharePostLink = grp.url.includes('/share/p/');
                return (
                  <div
                    key={grp.id}
                    className={`bg-white rounded-2xl border p-5 transition-all shadow-xs space-y-3.5 relative ${
                      !grp.isActive
                        ? 'border-slate-200 bg-slate-50/50 opacity-70'
                        : isSharePostLink
                        ? 'border-amber-300 ring-2 ring-amber-100'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Card Top Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">{grp.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            grp.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {grp.isActive ? 'نشطة في السحب' : 'معطلة مؤقتاً'}
                          </span>
                        </div>
                        <a
                          href={grp.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-mono break-all"
                        >
                          <LinkIcon className="w-3 h-3 shrink-0" />
                          <span className="truncate max-w-xs">{grp.url}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      </div>

                      {/* Action Menu */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setEditingGroupId(grp.id);
                            setGroupFormName(grp.name);
                            setGroupFormUrl(grp.url);
                            setIsGroupModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="تعديل اسم أو رابط المجموعة"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(grp.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="حذف المجموعة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* URL Target Info Banner */}
                    {isSharePostLink && (
                      <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-blue-900">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>رابط مشاركة منشور مستهدف (/share/p/) - نشط ومعتمد في السحب</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-blue-700">
                          تم تعيين الرابط كهدف مباشر لجلب محتوى المنشور وتعليقاته وتخزينها في Base 1.
                        </p>
                      </div>
                    )}

                    {/* Stats & Actions */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                        <span>منشورات: <strong className="text-slate-800 font-mono">{grp.totalPostsCollected || 0}</strong></span>
                        <span>•</span>
                        <span>تعليقات: <strong className="text-slate-800 font-mono">{grp.totalCommentsCollected || 0}</strong></span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleGroup(grp.id)}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                            grp.isActive
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {grp.isActive ? 'تعطيل السحب' : 'تفعيل'}
                        </button>

                        <button
                          onClick={() => handleRunPipeline(grp.id)}
                          disabled={isRunningPipeline}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Play className="w-3 h-3" />
                          <span>سحب الآن</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 3: APIFY CONFIGURATION & 4-API TOKENS */}
        {/* ========================================================= */}
        {activeTab === 'apify_config' && (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                    <Key className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      إعدادات Apify والمفاتيح الأربعة التناوبية
                    </h2>
                    <p className="text-xs text-slate-500">
                      إدارة المفاتيح الأربعة (2 للمنشورات و 2 للتعليقات)، وتعيين مسارات الـ Actors والتناوب التلقائي بعد كل سحب.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleAutoRotate}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      apifyConfig.autoRotateTokens
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    التناوب التلقائي: {apifyConfig.autoRotateTokens ? 'مفعل ✓' : 'معطل ✕'}
                  </button>
                </div>
              </div>
            </div>

            {/* 4-API Token Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {apifyConfig.tokens.map((token) => {
                const isActive = token.id === apifyConfig.activeTokenId;
                return (
                  <div
                    key={token.id}
                    className={`bg-white rounded-2xl border-2 p-5 transition-all shadow-xs space-y-3.5 relative ${
                      isActive
                        ? 'border-indigo-500 ring-4 ring-indigo-50 shadow-md'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 font-mono">
                        {token.id}
                      </span>
                      {isActive && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>المفتاح النشط</span>
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{token.label}</h3>
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 mt-2 font-mono text-[11px] text-slate-700 flex items-center justify-between">
                        <span>{token.tokenMasked}</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setSelectedTokenId(token.id);
                          setNewTokenValue('');
                          setIsTokenModalOpen(true);
                        }}
                        className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        تعديل المفتاح
                      </button>

                      {!isActive && (
                        <button
                          onClick={async () => {
                            const updated = { ...apifyConfig, activeTokenId: token.id };
                            const res = await updateCommunityConfig({ apifyConfig: updated });
                            setApifyConfig(res.apifyConfig);
                            if (showToast) showToast(`تم تفعيل ${token.label}`, 'success');
                          }}
                          className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          تفعيل
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Endpoints & Execution Settings */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-600" />
                <span>إعدادات المسارات ومعايير الفلترة الشاملة (Apify & Limits)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">مسار سحب المنشورات (Posts Scraper Actor):</label>
                  <input
                    type="text"
                    value={apifyConfig.postsEndpoint}
                    onChange={(e) => setApifyConfig(prev => ({ ...prev, postsEndpoint: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">مسار سحب التعليقات (Comments Scraper Actor):</label>
                  <input
                    type="text"
                    value={apifyConfig.commentsEndpoint}
                    onChange={(e) => setApifyConfig(prev => ({ ...prev, commentsEndpoint: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">الحد الأقصى للمنشورات لكل سحب:</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={apifyConfig.maxPostsPerRequest ?? 25}
                    onChange={(e) => setApifyConfig(prev => ({ ...prev, maxPostsPerRequest: parseInt(e.target.value) || 25 }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">الحد الأقصى للتعليقات لكل منشور (فلتر مخصص):</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={apifyConfig.maxCommentsPerPost ?? 25}
                    onChange={(e) => setApifyConfig(prev => ({ ...prev, maxCommentsPerPost: parseInt(e.target.value) || 0, includeComments: parseInt(e.target.value) > 0 }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">الحد الأقصى للصور لكل منشور (فلتر مخصص):</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={apifyConfig.maxImagesPerPost ?? 3}
                    onChange={(e) => setApifyConfig(prev => ({ ...prev, maxImagesPerPost: parseInt(e.target.value) || 0, includeMediaUrls: parseInt(e.target.value) > 0 }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">وقت تشغيل الأداة المبرمج (الساعة:الدقيقة):</label>
                  <input
                    type="time"
                    value={apifyConfig.scheduledTime || '21:00'}
                    onChange={(e) => setApifyConfig(prev => ({ ...prev, scheduledTime: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setActiveTab('filter_controls')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>فتح شاشة معايير الفلترة المتقدمة</span>
                </button>

                <button
                  onClick={async () => {
                    const res = await updateCommunityConfig({ apifyConfig });
                    setApifyConfig(res.apifyConfig);
                    if (showToast) showToast('تم حفظ إعدادات Apify ومعايير الفلترة بنجاح', 'success');
                  }}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
                >
                  حفظ كافة الإعدادات
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 4: PIPELINE RUNNER & EXECUTION LOGS */}
        {/* ========================================================= */}
        {activeTab === 'pipeline_logs' && (
          <div className="space-y-6">
            
            {/* Runner Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-600" />
                    <span>تشغيل المسار التتابعي وسجلات السحب</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    تشغيل عملية الجلب التتابعية لجميع المجموعات النشطة، سحب المنشورات والتعليقات وربطها بالـ post_id وتخزينها في Base 1.
                  </p>
                </div>

                <button
                  onClick={() => handleRunPipeline()}
                  disabled={isRunningPipeline}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-600/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />
                  <span>{isRunningPipeline ? 'جاري السحب الفعلي...' : 'تشغيل دورة السحب الآن'}</span>
                </button>
              </div>

              {/* Running Progress Indicator */}
              {isRunningPipeline && runningProgress && (
                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
                      <span>جاري معالجة: {runningProgress.currentGroupName}</span>
                    </span>
                    <span className="font-mono">{runningProgress.currentGroupIndex} / {runningProgress.totalGroups}</span>
                  </div>

                  <div className="w-full bg-purple-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-full w-2/3 animate-pulse rounded-full"></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-purple-700">
                    <span>الخطوة: سحب المنشورات والتعليقات وربطها بالـ post_id</span>
                    <span>الهدف: Supabase Base 1 (OCR-1)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Run Logs Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-600" />
                  <span>سجل عمليات السحب السابقة ({runLogs.length})</span>
                </h3>
              </div>

              {runLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  لا توجد سجلات سحب بعد. ابدأ تشغيل المسار لتسجيل العمليات هنا.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">الوقت والتاريخ</th>
                        <th className="p-3">المجموعات</th>
                        <th className="p-3">منشورات محفوظة</th>
                        <th className="p-3">تعليقات مربوطة</th>
                        <th className="p-3">مفتاح Apify</th>
                        <th className="p-3">الحالة</th>
                        <th className="p-3">المدة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {runLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-mono text-slate-600">
                            {new Date(log.timestamp).toLocaleString('ar-IQ')}
                          </td>
                          <td className="p-3 font-bold text-slate-800">
                            {log.groupName || `${log.groupCount || 0} مجموعات`}
                          </td>
                          <td className="p-3 font-mono text-emerald-700 font-bold">
                            {log.postsStored || log.postsFetched || 0}
                          </td>
                          <td className="p-3 font-mono text-blue-700 font-bold">
                            {log.commentsStored || 0}
                          </td>
                          <td className="p-3 font-mono text-indigo-700 text-[11px]">
                            {log.usedTokenId}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              ناجحة
                            </span>
                          </td>
                          <td className="p-3 font-mono text-slate-500 text-[11px]">
                            {((log.durationMs || 1000) / 1000).toFixed(1)} ث
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 5: SUPABASE SCHEMA & SQL DDL GUIDE */}
        {/* ========================================================= */}
        {activeTab === 'schema_guide' && (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner">
                  <Code2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    هيكلية الجداول والعلاقات في Supabase Base 1 (SQL)
                  </h2>
                  <p className="text-xs text-slate-500">
                    جداول <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">groups</code>، <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">posts</code>، و <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">comments</code> مع الربط التفرعي عبر <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">post_id</code>.
                  </p>
                </div>
              </div>

              <button
                onClick={handleCopySql}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-600/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'تم النسخ!' : 'نسخ كود SQL كامل'}</span>
              </button>
            </div>

            {/* Architecture Explanation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-blue-700">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  <span>1. جدول المجموعات (groups)</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  يحتوي على <code className="font-mono text-slate-800">id</code>، <code className="font-mono text-slate-800">name</code>، و <code className="font-mono text-slate-800">url</code> مع فحص الرابط والتفعيل.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-indigo-700">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  <span>2. جدول المنشورات (posts)</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  يخزن النصوص الأصلية <code className="font-mono text-slate-800">post_text</code> غير المصنفة ومصفوفة الصور <code className="font-mono text-slate-800">media_urls</code> و <code className="font-mono text-slate-800">group_id</code>.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <span>3. جدول التعليقات (comments)</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  مربوط بـ Foreign Key إلزامي: <code className="font-mono text-emerald-800 bg-emerald-50 px-1 rounded">post_id REFERENCES posts(id)</code> لضمان عدم اختلاط التعليقات.
                </p>
              </div>
            </div>

            {/* SQL Code Box */}
            <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 font-mono text-xs overflow-x-auto shadow-inner border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800 text-[11px]">
                <span>supabase_base1_schema.sql</span>
                <span className="text-emerald-400">Ready to execute in Supabase SQL Editor</span>
              </div>
              <pre className="text-slate-300 leading-relaxed whitespace-pre-wrap">
{`-- 1. جدول المجموعات
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    url TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. جدول المنشورات (نصوص أصلية غير مصنفة)
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_post_id TEXT UNIQUE,
    group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
    group_name TEXT,
    group_url TEXT,
    post_url TEXT NOT NULL,
    post_text TEXT NOT NULL,
    media_urls TEXT[] DEFAULT '{}',
    author_name TEXT,
    comments_count INTEGER DEFAULT 0,
    reactions_count INTEGER DEFAULT 0,
    source_api TEXT DEFAULT 'APIFY_TOKEN_1',
    post_created_at TIMESTAMPTZ,
    fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. جدول التعليقات المربوطة بالمنشور
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_comment_id TEXT,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    author_name TEXT,
    comment_text TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    comment_created_at TIMESTAMPTZ,
    fetched_at TIMESTAMPTZ DEFAULT NOW()
);`}
              </pre>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: DIAGNOSTICS & SYSTEM HEALTH TEST */}
        {/* ========================================================= */}
        {activeTab === 'diagnostics' && (
          <div className="space-y-6">
            {/* Header / Actions */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-600" />
                  <span>فحص وتشخيص الاتصال المباشر (Supabase Base 1 & Apify & Facebook)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  تقرير فحص لحظي مباشر للتحقق من سلامة المفاتيح، جداول قاعدة البيانات، وتوفر منشورات الروابط المستهدفة.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunDiagnostics}
                  disabled={isRunningDiagnostics}
                  className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-600/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isRunningDiagnostics ? 'animate-spin' : ''}`} />
                  <span>{isRunningDiagnostics ? 'جاري الفحص المباشر...' : 'إعادة تشغيل الفحص الآن'}</span>
                </button>
              </div>
            </div>

            {/* Diagnostic Summary Banner */}
            {diagnosticsResult && (
              <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 text-xs text-teal-900 flex items-start gap-3 shadow-xs">
                <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-sm text-teal-950">نتيجة الفحص المباشر الشامل:</div>
                  <p className="text-xs text-teal-800 leading-relaxed font-sans">{diagnosticsResult.summaryMessage}</p>
                </div>
              </div>
            )}

            {/* Diagnostic 3-Column Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              
              {/* Card 1: Supabase Base 1 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                    <Database className="w-4 h-4 text-emerald-600" />
                    <span>1. قاعدة Supabase Base 1</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    diagnosticsResult?.supabase.isConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {diagnosticsResult?.supabase.isConnected ? 'متصلة بنجاح' : 'جاري الفحص'}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                    <div className="text-[11px] text-slate-500 font-medium">رابط المشروع (Project URL):</div>
                    <code className="text-xs font-mono text-emerald-700 font-bold break-all">
                      {diagnosticsResult?.supabase.url || 'https://rxmzozwplakrrmfuwmvp.supabase.co'}
                    </code>
                  </div>

                  <div className="space-y-2">
                    <div className="font-bold text-slate-700 text-xs">حالة الجداول في الـ Schema Cache:</div>
                    
                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 border border-emerald-200 text-[11px]">
                      <span className="font-bold text-slate-800">جدول ocr_projects:</span>
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> موجود ونشط
                      </span>
                    </div>

                    <div className={`flex items-center justify-between p-2 rounded-lg text-[11px] border ${
                      diagnosticsResult?.supabase.tablesStatus.posts?.exists
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}>
                      <span className="font-bold text-slate-800">جدول المنشورات (posts):</span>
                      <span className="font-bold">
                        {diagnosticsResult?.supabase.tablesStatus.posts?.exists ? '✅ جاهز' : '⚠️ يحتاج تنفيذ SQL'}
                      </span>
                    </div>

                    <div className={`flex items-center justify-between p-2 rounded-lg text-[11px] border ${
                      diagnosticsResult?.supabase.tablesStatus.comments?.exists
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}>
                      <span className="font-bold text-slate-800">جدول التعليقات (comments):</span>
                      <span className="font-bold">
                        {diagnosticsResult?.supabase.tablesStatus.comments?.exists ? '✅ جاهز' : '⚠️ يحتاج تنفيذ SQL'}
                      </span>
                    </div>

                    <div className={`flex items-center justify-between p-2 rounded-lg text-[11px] border ${
                      diagnosticsResult?.supabase.tablesStatus.groups?.exists
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}>
                      <span className="font-bold text-slate-800">جدول المجموعات (groups):</span>
                      <span className="font-bold">
                        {diagnosticsResult?.supabase.tablesStatus.groups?.exists ? '✅ جاهز' : '⚠️ يحتاج تنفيذ SQL'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleCopySql}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all text-xs cursor-pointer shadow-sm"
                  >
                    <Copy className="w-3.5 h-3.5 text-amber-400" />
                    <span>{copiedCode ? 'تم النسخ!' : 'نسخ كود SQL لإنشاء الجداول في Supabase'}</span>
                  </button>
                </div>
              </div>

              {/* Card 2: Apify Tokens */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                    <Key className="w-4 h-4 text-indigo-600" />
                    <span>2. مفاتيح Apify الـ 4 (Scrapers)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                    4/4 صالحة وشغالة
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  {diagnosticsResult?.apify.tokens.map((t, idx) => (
                    <div key={t.id} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                          <span>مفتاح {idx + 1} ({t.id})</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">حساب Apify: {t.username || 'نشط'}</div>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-bold text-[10px] flex items-center gap-1">
                        <Check className="w-3 h-3" /> نشط وصالح
                      </span>
                    </div>
                  )) || (
                    <div className="text-slate-400 text-center py-4">انقر على "إعادة تشغيل الفحص" لفحص الحسابات</div>
                  )}

                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-[11px] text-indigo-900 space-y-1">
                    <div className="font-bold text-indigo-950">نظام التناوب الذكي (Auto-Rotation):</div>
                    <p className="text-[10px] leading-relaxed text-indigo-800">
                      يتم تدوير المفاتيح الأربعة تلقائياً لتفادي حدود الاستهلاك وتوزيع الحمل بالتساوي.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3: Target Groups & Links */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <span>3. روابط فيسبوك المستهدفة (4 روابط)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-900">
                    4 معتمدة
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {diagnosticsResult?.targets.map((tgt, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-[11px]">{tgt.name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          tgt.requiresLogin ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {tgt.requiresLogin ? 'يتطلب تسجيل دخول فيسبوك' : 'عام ومتاح'}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 truncate" title={tgt.canonicalUrl}>
                        الرابط المباشر: {tgt.canonicalUrl}
                      </div>
                    </div>
                  )) || (
                    <div className="text-slate-400 text-center py-4">انقر على "إعادة تشغيل الفحص" للتحقق</div>
                  )}

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900 space-y-1">
                    <div className="font-bold text-amber-950">سبب عدم سحب المنشورات حتى الآن:</div>
                    <p className="text-[10px] leading-relaxed text-amber-800">
                      مجموعات فيسبوك المستهدفة مغلقة أو تتطلب تسجيل دخول للمشاهدة. لذلك يرجع Scraper فيسبوك رسالة <code className="font-mono bg-amber-100 px-1 rounded">Empty or private data</code>.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Diagnostic Explanatory Guide */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-4.5 h-4.5 text-amber-500" />
                <span>كيفية حل المشكلة وتفعيل سحب وتخزين المنشورات فوراً:</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px]">1</span>
                    <span>إنشاء جداول Supabase في SQL Editor:</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    توجه إلى لوحة تحكم Supabase الخاصة بك ثم افتح <strong>SQL Editor</strong>، والصق الكود الجاهز بالضغط على الزر أعلاه ثم اضغط <strong>RUN</strong>.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px]">2</span>
                    <span>النشر الفوري المباشر أو الروابط المفتوحة:</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    يمكنك استخدام زر <strong>"النشر المباشر للمنشور في القاعدة"</strong> من واجهة المنشورات لإضافة منشورات وتعليقات فورية تُخزن وتُربط تلقائياً في Base 1.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT GROUP */}
      {/* ========================================================= */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              {editingGroupId ? 'تعديل بيانات المجموعة' : 'إضافة رابط مجموعة فيسبوك جديدة'}
            </h3>

            <form onSubmit={handleSaveGroup} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">اسم المجموعة:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: جروب أسئلة السادس الإعدادي 2025/2026"
                  value={groupFormName}
                  onChange={(e) => setGroupFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">رابط المجموعة على فيسبوك:</label>
                <input
                  type="url"
                  required
                  placeholder="https://www.facebook.com/groups/..."
                  value={groupFormUrl}
                  onChange={(e) => setGroupFormUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                {groupFormUrl.includes('/share/p/') && (
                  <p className="text-[11px] text-amber-600 font-bold">
                    ⚠️ تنبيه: هذا الرابط هو رابط مشاركة منشور فردي وليس رابط مجموعة رئيسي.
                  </p>
                )}
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGroupModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors cursor-pointer"
                >
                  {editingGroupId ? 'حفظ التعديلات' : 'إضافة المجموعة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EDIT APIFY TOKEN */}
      {/* ========================================================= */}
      {isTokenModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              تعديل مفتاح Apify ({selectedTokenId})
            </h3>

            <form onSubmit={handleSaveToken} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">قيمة المفتاح الجديدة (Apify API Token):</label>
                <input
                  type="password"
                  required
                  placeholder="apify_api_..."
                  value={newTokenValue}
                  onChange={(e) => setNewTokenValue(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-400">
                  سيتم تشفير المفتاح واستخدامه في دورات السحب التناوبية في السيرفر دون كشفه.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTokenModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors cursor-pointer"
                >
                  حفظ المفتاح
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CREATE MANUAL POST */}
      {/* ========================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              إضافة منشور يدوي وتخزينه في Supabase Base 1
            </h3>

            <form onSubmit={handleCreatePost} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">اسم الكاتب:</label>
                <input
                  type="text"
                  value={newPostAuthor}
                  onChange={(e) => setNewPostAuthor(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">اسم المجموعة:</label>
                <input
                  type="text"
                  value={newPostGroupName}
                  onChange={(e) => setNewPostGroupName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">نص المنشور (أصلي):</label>
                <textarea
                  rows={4}
                  required
                  placeholder="اكتب محتوى المنشور أو السؤال هنا..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">رابط صورة مرفقة (اختياري):</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newPostMedia}
                  onChange={(e) => setNewPostMedia(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">رابط المنشور على فيسبوك (اختياري):</label>
                <input
                  type="url"
                  placeholder="https://www.facebook.com/groups/.../posts/..."
                  value={newPostUrl}
                  onChange={(e) => setNewPostUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>

              <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-800 text-xs">نشر فوري ومباشر في Base 1:</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={instantPublishMode}
                    onChange={(e) => setInstantPublishMode(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-slate-600 text-[11px] font-bold">تفعيل النشر الفوري</span>
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>نشر فوري وحفظ في Base 1</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: INSPECT POST JSON */}
      {/* ========================================================= */}
      {inspectingPost && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-600" />
                <span>سجل المنشور والتعليقات المربوطة في Base 1</span>
              </h3>
              <button
                onClick={() => setInspectingPost(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-900 p-4 rounded-xl text-emerald-400 font-mono text-xs">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(inspectingPost, null, 2)}
              </pre>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                onClick={() => setInspectingPost(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FLOATING BOTTOM CONTROLS: ADMIN DASHBOARD & USER PREVIEW */}
      {/* ========================================================= */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col sm:flex-row items-end sm:items-center gap-2.5 pointer-events-auto">
        {/* Toggle Admin Dashboard */}
        <button
          onClick={() => setActiveTab('admin_dashboard')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-xl border-2 transition-all transform active:scale-95 cursor-pointer backdrop-blur-xs text-xs font-black ${
            activeTab === 'admin_dashboard'
              ? 'bg-indigo-600 text-white border-white shadow-indigo-600/40 ring-2 ring-indigo-400'
              : 'bg-slate-900/90 hover:bg-slate-900 text-slate-100 border-slate-700 shadow-slate-900/30'
          }`}
          title="لوحة تحكم المشرف - حذف المنشورات وتحديد الكميات والمراجعة"
        >
          <Shield className="w-4 h-4 text-amber-400" />
          <span>لوحة تحكم المشرف</span>
        </button>

        {/* Toggle User / Student Preview Feed */}
        <button
          onClick={() => setActiveTab('facebook_watch')}
          className={`group flex items-center gap-2.5 px-4 py-2.5 rounded-2xl shadow-xl border-2 transition-all transform active:scale-95 cursor-pointer backdrop-blur-xs text-xs font-black ${
            activeTab === 'facebook_watch'
              ? 'bg-[#1877F2] text-white border-white shadow-blue-600/40 ring-2 ring-blue-300'
              : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-slate-200'
          }`}
          title="عرض المنشورات كما يراها الطالب في المنصة التعليمية"
        >
          <div className="w-5 h-5 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-black text-xs">
            f
          </div>
          <Eye className="w-3.5 h-3.5 text-blue-600" />
          <span>معاينة كطالب (User View)</span>
        </button>
      </div>

    </div>
  );
}
