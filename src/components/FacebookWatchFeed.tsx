import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  Image as ImageIcon,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  Database,
  Download,
  Sparkles,
  Layers,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Clock,
  Heart,
  Smile,
  Send,
  Upload,
  RefreshCw,
  Video,
  FileText,
  Bookmark,
  MoreHorizontal
} from 'lucide-react';
import { FacebookPost, FacebookComment } from '../types';
import { FACEBOOK_SCRAPED_DATASET, mapRawPostToFacebookPost, RawApifyPost } from '../data/facebookScrapedData';

interface FacebookWatchFeedProps {
  onSyncPostToBase1?: (post: FacebookPost) => Promise<void>;
  onBulkSync?: (posts: FacebookPost[]) => Promise<void>;
  isSyncing?: boolean;
}

function parsePostDate(post: Partial<FacebookPost>): number {
  const value = post.post_created_at || post.postCreatedAt || post.postedAt || post.created_at || post.fetched_at;
  if (!value) return Number.NEGATIVE_INFINITY;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : Number.NEGATIVE_INFINITY;
}

function mapCommunityApiPost(raw: any): FacebookPost {
  const originalDate = raw.created_at || raw.post_created_at || raw.postCreatedAt || raw.postedAt || raw.raw_data?.created_at || raw.raw_data?.createdAt || raw.raw_data?.time || raw.updated_at;
  const comments = Array.isArray(raw.comments) ? raw.comments.map((comment: any) => ({
    id: String(comment.id || ''),
    post_id: String(comment.post_id || raw.id),
    author_name: comment.author_name || comment.author_display_name || 'مستخدم المجتمع',
    author_id: comment.author_id || undefined,
    author_image_url: comment.author_image_url || comment.author_avatar || undefined,
    comment_text: comment.comment_text || comment.content || comment.text || '',
    comment_created_at: comment.created_at || comment.comment_created_at || comment.createdAt,
    likes_count: Number(comment.likes_count || comment.likes || 0),
    extracted_by_api: comment.extracted_by_api,
  })) : [];

  return {
    id: String(raw.id),
    source_post_id: raw.source_post_id || raw.id,
    group_id: raw.group_id || '',
    group_name: raw.group_name || raw.groupName,
    group_url: raw.group_url || raw.groupUrl,
    post_url: raw.post_url || raw.postUrl || '#',
    post_text: raw.post_text || raw.content || '',
    content: raw.content || raw.post_text || '',
    author_name: raw.author_display_name || raw.author_name || raw.authorName || 'مستخدم المجتمع',
    author_id: raw.user_id || raw.author_id || undefined,
    author_profile_id: raw.author_profile_id,
    profile_type: raw.source_type === 'manual_json_import' ? 'bot' : (raw.profile_type || 'user'),
    is_bot: raw.source_type === 'manual_json_import' || String(raw.author_profile_id || '').startsWith('bot_'),
    post_created_at: originalDate,
    created_at: originalDate,
    updated_at: raw.updated_at,
    media_urls: Array.isArray(raw.media_urls) ? raw.media_urls : [],
    media_type: raw.media_type || 'none',
    author_avatar: raw.author_avatar_url || raw.author_avatar,
    comments_count: Number(raw.comments_count || comments.length || 0),
    reactions_count: Number(raw.reactions_count || 0),
    likes_count: Number(raw.likes_count || 0),
    source_api: raw.source_api || 'community_api',
    source_type: raw.source_type || 'user',
    status: raw.status,
    fetched_at: raw.fetched_at,
    raw_data: raw.raw_data,
    comments,
  };
}

export const FacebookWatchFeed: React.FC<FacebookWatchFeedProps> = ({
  onSyncPostToBase1,
  onBulkSync,
  isSyncing = false
}) => {
  // Live state loaded from Supabase B through the public Community API.
  const [posts, setPosts] = useState<FacebookPost[]>([]);
  const [visiblePostCount, setVisiblePostCount] = useState(10);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'with_images' | 'with_comments' | 'text_only'>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [syncedPostIds, setSyncedPostIds] = useState<Record<string, boolean>>({});

  const loadCommunityPosts = useCallback(async () => {
    setIsLoadingPosts(true);
    setLoadError(null);
    try {
      const response = await fetch('/api/v1/community/posts?all=true', { cache: 'no-store' });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || 'تعذر جلب منشورات المجتمع من قاعدة B');
      }

      const livePosts = (Array.isArray(payload.posts) ? payload.posts : [])
        .map(mapCommunityApiPost)
        .sort((a: FacebookPost, b: FacebookPost) => {
          const dateDifference = parsePostDate(b) - parsePostDate(a);
          return dateDifference || String(b.id).localeCompare(String(a.id));
        });
      setPosts(livePosts);
      setVisiblePostCount(10);
    } catch (error: any) {
      setPosts([]);
      setLoadError(error?.message || 'تعذر جلب منشورات المجتمع من قاعدة B');
    } finally {
      setIsLoadingPosts(false);
    }
  }, []);

  useEffect(() => {
    void loadCommunityPosts();
  }, [loadCommunityPosts]);

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      if (selectedGroup !== 'all' && post.group_name !== selectedGroup) return false;
      if (activeFilter === 'with_images' && (!post.media_urls || post.media_urls.length === 0)) return false;
      if (activeFilter === 'with_comments' && (!post.comments || post.comments.length === 0)) return false;
      if (activeFilter === 'text_only' && post.media_urls && post.media_urls.length > 0) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const textMatch = post.post_text?.toLowerCase().includes(q);
        const authorMatch = post.author_name?.toLowerCase().includes(q);
        const commentsMatch = post.comments?.some(c => c.comment_text.toLowerCase().includes(q));
        if (!textMatch && !authorMatch && !commentsMatch) return false;
      }
      return true;
    });
  }, [posts, activeFilter, selectedGroup, searchQuery]);

  const visiblePosts = useMemo(
    () => filteredPosts.slice(0, visiblePostCount),
    [filteredPosts, visiblePostCount]
  );

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel || isLoadingPosts || visiblePostCount >= filteredPosts.length) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          setVisiblePostCount(current => Math.min(current + 10, filteredPosts.length));
        }
      },
      { rootMargin: '600px 0px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredPosts.length, isLoadingPosts, visiblePostCount]);

  // Lightbox Modal state
  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean;
    images: string[];
    currentIndex: number;
    postTitle?: string;
  }>({
    isOpen: false,
    images: [],
    currentIndex: 0,
  });

  // Custom JSON Upload Modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [customJsonInput, setCustomJsonInput] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Total stats
  const totalImagesCount = useMemo(() => {
    return posts.reduce((acc, p) => acc + (p.media_urls?.length || 0), 0);
  }, [posts]);

  const totalCommentsCount = useMemo(() => {
    return posts.reduce((acc, p) => acc + (p.comments?.length || 0), 0);
  }, [posts]);

  const handleToggleLike = (postId: string) => {
    setLikedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleToggleComments = (postId: string) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleAddComment = (postId: string) => {
    const text = newComments[postId]?.trim();
    if (!text) return;

    const newComment: FacebookComment = {
      id: `c_user_${Date.now()}`,
      post_id: postId,
      author_name: 'أنت (طالب سادس)',
      comment_text: text,
      likes_count: 0,
      comment_created_at: new Date().toISOString(),
    };

    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const currentComments = p.comments || [];
          return {
            ...p,
            comments: [...currentComments, newComment],
            comments_count: (p.comments_count || 0) + 1,
          };
        }
        return p;
      })
    );

    setNewComments(prev => ({ ...prev, [postId]: '' }));
    setExpandedComments(prev => ({ ...prev, [postId]: true }));
  };

  const handleOpenLightbox = (images: string[], index = 0, title?: string) => {
    setLightboxState({
      isOpen: true,
      images,
      currentIndex: index,
      postTitle: title,
    });
  };

  const handleCloseLightbox = () => {
    setLightboxState(prev => ({ ...prev, isOpen: false }));
  };

  const handleLightboxPrev = () => {
    setLightboxState(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length,
    }));
  };

  const handleLightboxNext = () => {
    setLightboxState(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.images.length,
    }));
  };

  const handleSyncPost = async (post: FacebookPost) => {
    if (onSyncPostToBase1) {
      await onSyncPostToBase1(post);
      setSyncedPostIds(prev => ({ ...prev, [post.id]: true }));
    }
  };

  const handleBulkSyncAll = async () => {
    if (onBulkSync) {
      await onBulkSync(filteredPosts);
      const synced: Record<string, boolean> = {};
      filteredPosts.forEach(p => (synced[p.id] = true));
      setSyncedPostIds(prev => ({ ...prev, ...synced }));
    }
  };

  const handleImportCustomJson = () => {
    try {
      setUploadError(null);
      const parsed = JSON.parse(customJsonInput);
      const arrayData: RawApifyPost[] = Array.isArray(parsed) ? parsed : [parsed];
      const mapped = arrayData.map(mapRawPostToFacebookPost);
      setPosts(mapped);
      setIsUploadModalOpen(false);
      setCustomJsonInput('');
    } catch (err: any) {
      setUploadError(err.message || 'الملف غير صالح أو التنسيق غير صحيح');
    }
  };

  const handleResetToDefault = () => {
    void loadCommunityPosts();
  };

  return (
    <div id="facebook-watch-feed-container" className="space-y-6">
      {/* Top Facebook Header Bar */}
      <div className="bg-gradient-to-r from-[#1877F2] to-[#0d65d9] rounded-2xl p-5 text-white shadow-lg shadow-blue-500/15">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#1877F2] font-black text-2xl shadow-md">
              f
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">
                  منصة فيسبوك وشاهد (Facebook & Watch Feed)
                </h2>
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium backdrop-blur-xs">
                  مباشر من JSON
                </span>
              </div>
              <p className="text-blue-100 text-xs mt-0.5">
                موجز متكامل يعرض منشورات مجموعات السادس، الصور بجودتها الأصلية، والتعليقات المربوطة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-xs"
              title="رفع واستعراض ملف JSON مخصص"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>رفع ملف JSON</span>
            </button>

            <button
              onClick={handleResetToDefault}
              className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-xs"
              title="إعادة تحميل ملف المنشورات الأساسي"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>إعادة الضبط</span>
            </button>

            {onBulkSync && (
              <button
                onClick={handleBulkSyncAll}
                disabled={isSyncing || filteredPosts.length === 0}
                className="px-4 py-2 bg-white text-[#1877F2] hover:bg-blue-50 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <Database className="w-3.5 h-3.5" />
                <span>حفظ الكل في Base 1 ({filteredPosts.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/15 text-xs">
          <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
            <span className="text-blue-200 block text-[11px]">إجمالي المنشورات</span>
            <span className="text-lg font-bold">{posts.length} منشور</span>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
            <span className="text-blue-200 block text-[11px]">الصور والمرفقات الحقيقية</span>
            <span className="text-lg font-bold text-amber-300">{totalImagesCount} صورة</span>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
            <span className="text-blue-200 block text-[11px]">التعليقات المسحوبة</span>
            <span className="text-lg font-bold text-emerald-300">{totalCommentsCount} تعليق</span>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
            <span className="text-blue-200 block text-[11px]">ترتيب المنشورات</span>
            <span className="text-xs font-bold truncate block">الأحدث إلى الأقدم</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ابحث في نصوص المنشورات، أسماء المعلقين، أو المحتوى..."
            className="w-full pl-3 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1877F2]/30 focus:border-[#1877F2]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-semibold">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'all'
                ? 'bg-[#1877F2] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            الكل ({posts.length})
          </button>
          <button
            onClick={() => setActiveFilter('with_images')}
            className={`px-3 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeFilter === 'with_images'
                ? 'bg-[#1877F2] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>مع صور فقط ({posts.filter(p => p.media_urls && p.media_urls.length > 0).length})</span>
          </button>
          <button
            onClick={() => setActiveFilter('with_comments')}
            className={`px-3 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeFilter === 'with_comments'
                ? 'bg-[#1877F2] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>مع تعليقات ({posts.filter(p => p.comments && p.comments.length > 0).length})</span>
          </button>
          <button
            onClick={() => setActiveFilter('text_only')}
            className={`px-3 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeFilter === 'text_only'
                ? 'bg-[#1877F2] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>نصوص واستفسارات ({posts.filter(p => !p.media_urls || p.media_urls.length === 0).length})</span>
          </button>
        </div>
      </div>

      {/* Feed Column Container */}
      <div className="max-w-3xl mx-auto space-y-5">
        {isLoadingPosts ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <RefreshCw className="w-7 h-7 mx-auto mb-3 text-[#1877F2] animate-spin" />
            <h3 className="text-base font-bold text-slate-800 mb-1">جاري جلب أحدث المنشورات من قاعدة المجتمع</h3>
          </div>
        ) : loadError ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-rose-200">
            <p className="text-sm font-bold text-rose-700 mb-3">{loadError}</p>
            <button
              onClick={() => void loadCommunityPosts()}
              className="px-4 py-2 bg-[#1877F2] text-white text-xs font-bold rounded-xl hover:bg-blue-600 transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <div className="w-14 h-14 mx-auto rounded-full bg-blue-50 text-[#1877F2] flex items-center justify-center mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">لم يتم العثور على منشورات مطابقة</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              لا توجد منشورات منشورة حالياً أو لا تطابق معايير البحث.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('all');
              }}
              className="px-4 py-2 bg-[#1877F2] text-white text-xs font-bold rounded-xl hover:bg-blue-600 transition-colors"
            >
              عرض جميع المنشورات
            </button>
          </div>
        ) : (
          visiblePosts.map((post, postIdx) => {
            const isLiked = likedPosts[post.id];
            const areCommentsOpen = expandedComments[post.id];
            const isSynced = syncedPostIds[post.id] || post.isSyncedToBase1;
            const images = post.media_urls || [];
            const comments = post.comments || [];
            const likesCount = (post.likes_count || 0) + (isLiked ? 1 : 0);

            return (
              <div
                key={post.id || postIdx}
                id={`fb-post-${post.id}`}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Post Header */}
                <div className="p-4 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        {post.author_name?.charAt(0) || 'ف'}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[9px] font-black border-2 border-white">
                        f
                      </div>
                    </div>

                    {/* Author & Meta */}
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-bold text-slate-900 hover:underline cursor-pointer">
                          {post.author_name || 'مستخدم فيسبوك'}
                        </span>

                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.post_created_at ? new Date(post.post_created_at).toLocaleDateString('ar-EG', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'اليوم'}
                        </span>
                        <span>•</span>
                        <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded text-[10px]">
                          عام (Public)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Sync indicator */}
                  <div className="flex items-center gap-1.5">
                    {isSynced ? (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>محفوظ في Base 1</span>
                      </span>
                    ) : (
                      onSyncPostToBase1 && (
                        <button
                          onClick={() => handleSyncPost(post)}
                          className="px-2 py-1 text-slate-600 hover:text-[#1877F2] hover:bg-blue-50 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          title="حفظ في قاعدة بيانات Base 1"
                        >
                          <Database className="w-3 h-3" />
                          <span>حفظ في Base 1</span>
                        </button>
                      )
                    )}

                    <a
                      href={post.post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-400 hover:text-[#1877F2] hover:bg-slate-100 rounded-lg transition-colors"
                      title="فتح المنشور الأصلي في فيسبوك"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Post Text Content */}
                <div className="px-4 pb-3">
                  <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-normal">
                    {post.post_text}
                  </p>
                </div>

                {/* Post Images & Attachments Gallery (Authentic Facebook Style) */}
                {images.length > 0 && (
                  <div className="border-t border-slate-100 bg-slate-900/5">
                    {images.length === 1 ? (
                      // Single Image: Full Width Display
                      <div
                        onClick={() => handleOpenLightbox(images, 0, post.post_text)}
                        className="relative group cursor-pointer overflow-hidden max-h-[500px] flex items-center justify-center bg-slate-950"
                      >
                        <img
                          src={images[0]}
                          alt="مرفق منشور فيسبوك"
                          className="w-full h-auto max-h-[500px] object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <span className="px-3 py-1.5 bg-black/70 text-white rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-xs shadow-lg">
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>تكبير الصورة</span>
                          </span>
                        </div>
                      </div>
                    ) : images.length === 2 ? (
                      // 2 Images: Side-by-Side 50/50 Grid
                      <div className="grid grid-cols-2 gap-1 bg-slate-200">
                        {images.map((imgUrl, imgIdx) => (
                          <div
                            key={imgIdx}
                            onClick={() => handleOpenLightbox(images, imgIdx, post.post_text)}
                            className="relative group cursor-pointer aspect-4/3 overflow-hidden bg-slate-900"
                          >
                            <img
                              src={imgUrl}
                              alt={`صورة ${imgIdx + 1}`}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <Maximize2 className="w-5 h-5 text-white drop-shadow" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : images.length === 3 ? (
                      // 3 Images: 1 Main Top + 2 Bottom
                      <div className="grid grid-cols-2 gap-1 bg-slate-200">
                        <div
                          onClick={() => handleOpenLightbox(images, 0, post.post_text)}
                          className="col-span-2 relative group cursor-pointer aspect-16/9 overflow-hidden bg-slate-900"
                        >
                          <img
                            src={images[0]}
                            alt="صورة رئيسية"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Maximize2 className="w-5 h-5 text-white drop-shadow" />
                          </div>
                        </div>
                        {images.slice(1, 3).map((imgUrl, imgIdx) => (
                          <div
                            key={imgIdx + 1}
                            onClick={() => handleOpenLightbox(images, imgIdx + 1, post.post_text)}
                            className="relative group cursor-pointer aspect-4/3 overflow-hidden bg-slate-900"
                          >
                            <img
                              src={imgUrl}
                              alt={`صورة ${imgIdx + 2}`}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <Maximize2 className="w-5 h-5 text-white drop-shadow" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      // 4+ Images: Multi-grid with "+N more" badge
                      <div className="grid grid-cols-2 gap-1 bg-slate-200">
                        {images.slice(0, 4).map((imgUrl, imgIdx) => {
                          const isLast = imgIdx === 3 && images.length > 4;
                          const extraCount = images.length - 4;

                          return (
                            <div
                              key={imgIdx}
                              onClick={() => handleOpenLightbox(images, imgIdx, post.post_text)}
                              className="relative group cursor-pointer aspect-square overflow-hidden bg-slate-900"
                            >
                              <img
                                src={imgUrl}
                                alt={`صورة ${imgIdx + 1}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                                referrerPolicy="no-referrer"
                              />
                              {isLast ? (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-2xl">
                                  +{extraCount}
                                </div>
                              ) : (
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                  <Maximize2 className="w-5 h-5 text-white drop-shadow" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Reaction Summary Counts */}
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="flex items-center -space-x-1 space-x-reverse">
                      <span className="w-4 h-4 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[9px] shadow-xs">
                        👍
                      </span>
                      <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px] shadow-xs">
                        ❤️
                      </span>
                    </span>
                    <span className="font-medium text-slate-700">{likesCount} إعجاب وتفاعل</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleComments(post.id)}
                      className="hover:underline cursor-pointer"
                    >
                      {comments.length} تعليقات
                    </button>
                    {images.length > 0 && (
                      <span className="text-slate-400">
                        {images.length} {images.length === 1 ? 'صورة' : 'صور'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Facebook Action Buttons (Like / Comment / Share) */}
                <div className="px-2 py-1 flex items-center justify-between text-xs font-semibold text-slate-600">
                  <button
                    onClick={() => handleToggleLike(post.id)}
                    className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                      isLiked
                        ? 'text-[#1877F2] bg-blue-50/60 font-bold'
                        : 'hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-[#1877F2]' : ''}`} />
                    <span>أعجبني</span>
                  </button>

                  <button
                    onClick={() => handleToggleComments(post.id)}
                    className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                      areCommentsOpen ? 'text-[#1877F2] bg-blue-50/60' : 'hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>تعليق ({comments.length})</span>
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(post.post_url);
                      alert('تم نسخ رابط المنشور بنجاح!');
                    }}
                    className="flex-1 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>مشاركة</span>
                  </button>
                </div>

                {/* Comments Section (Expandable & Interactive) */}
                {areCommentsOpen && (
                  <div className="bg-slate-50/80 p-4 border-t border-slate-100 space-y-3">
                    {/* Add Comment Box */}
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        أ
                      </div>
                      <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-3 py-1.5 shadow-2xs focus-within:ring-2 focus-within:ring-[#1877F2]/30 focus:border-[#1877F2]">
                        <input
                          type="text"
                          value={newComments[post.id] || ''}
                          onChange={e => setNewComments(prev => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleAddComment(post.id);
                          }}
                          placeholder="اكتب تعليقاً على هذا المنشور..."
                          className="w-full text-xs bg-transparent focus:outline-none"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          disabled={!newComments[post.id]?.trim()}
                          className="p-1 text-[#1877F2] hover:bg-blue-50 rounded-lg disabled:opacity-30 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Existing Real Comments List */}
                    {comments.length === 0 ? (
                      <p className="text-center text-xs text-slate-400 py-3">لا توجد تعليقات إضافية مسحوبة لهذا المنشور</p>
                    ) : (
                      <div className="space-y-2.5 pt-1">
                        {comments.map((comment, cIdx) => (
                          <div key={comment.id || cIdx} className="flex items-start gap-2.5 group">
                            <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                              {comment.author_name?.charAt(0) || 'ط'}
                            </div>
                            <div className="flex-1">
                              <div className="bg-white rounded-2xl px-3.5 py-2.5 border border-slate-200/70 shadow-2xs inline-block max-w-full">
                                <span className="text-xs font-bold text-slate-900 block mb-0.5">
                                  {comment.author_name}
                                </span>
                                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                                  {comment.comment_text}
                                </p>
                              </div>
                              <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1 px-2 font-medium">
                                <button className="hover:underline text-slate-500 font-bold cursor-pointer">إعجاب</button>
                                <button className="hover:underline text-slate-500 font-bold cursor-pointer">رد</button>
                                <span>{comment.comment_created_at ? new Date(comment.comment_created_at).toLocaleDateString('ar-EG') : 'منذ قليل'}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div ref={loadMoreRef} className="min-h-12 flex items-center justify-center py-4" aria-live="polite">
        {!isLoadingPosts && visiblePostCount < filteredPosts.length && (
          <span className="text-xs text-slate-400">مرّر لرؤية منشورات أقدم</span>
        )}
        {!isLoadingPosts && visiblePostCount >= filteredPosts.length && posts.length > 0 && (
          <span className="text-xs text-slate-400">تم عرض جميع المنشورات المتاحة</span>
        )}
      </div>

      {/* Fullscreen Image Lightbox Modal */}
      {lightboxState.isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-4 backdrop-blur-md"
          onClick={handleCloseLightbox}
        >
          {/* Top Lightbox Header */}
          <div
            className="w-full max-w-6xl flex items-center justify-between text-white pb-3 border-b border-white/10"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center font-bold text-sm">
                f
              </div>
              <div>
                <span className="text-sm font-bold block">
                  معاينة الصورة {lightboxState.currentIndex + 1} من {lightboxState.images.length}
                </span>
                {lightboxState.postTitle && (
                  <span className="text-xs text-slate-400 truncate max-w-md block">
                    {lightboxState.postTitle}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={lightboxState.images[lightboxState.currentIndex]}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                title="فتح الرابط المباشر"
              >
                <Download className="w-4 h-4" />
              </a>
              <button
                onClick={handleCloseLightbox}
                className="p-2 bg-white/10 hover:bg-rose-600 text-white rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Image Display Area */}
          <div
            className="relative flex-1 w-full max-w-5xl flex items-center justify-center p-2"
            onClick={e => e.stopPropagation()}
          >
            {lightboxState.images.length > 1 && (
              <button
                onClick={handleLightboxPrev}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-[#1877F2] text-white rounded-full transition-all cursor-pointer z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            <img
              src={lightboxState.images[lightboxState.currentIndex]}
              alt="صورة فيسبوك مكبرة"
              className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl"
              referrerPolicy="no-referrer"
            />

            {lightboxState.images.length > 1 && (
              <button
                onClick={handleLightboxNext}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-[#1877F2] text-white rounded-full transition-all cursor-pointer z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          {lightboxState.images.length > 1 && (
            <div
              className="flex items-center gap-2 overflow-x-auto max-w-xl py-2 px-3 bg-white/10 rounded-2xl backdrop-blur-xs"
              onClick={e => e.stopPropagation()}
            >
              {lightboxState.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setLightboxState(prev => ({ ...prev, currentIndex: idx }))}
                  className={`w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    lightboxState.currentIndex === idx
                      ? 'border-[#1877F2] scale-105'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="مصغرة" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Custom JSON Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#1877F2]" />
                <h3 className="text-base font-bold text-slate-800">رفع أو لصق ملف JSON لمنشورات فيسبوك</h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              يمكنك لصق مخرجات الـ Scraper أو ملف الـ JSON الذي قمت برفعه وسيتم تحويله فورياً وعرض الصور والتعليقات بالهيكلية الكاملة.
            </p>

            <textarea
              value={customJsonInput}
              onChange={e => setCustomJsonInput(e.target.value)}
              placeholder="الصق مصفوفة الـ JSON هنا [ { facebookUrl, attachments, topComments, user, text, ... } ]"
              rows={10}
              className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1877F2]/30 focus:border-[#1877F2]"
            />

            {uploadError && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
                {uploadError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200"
              >
                إلغاء
              </button>
              <button
                onClick={handleImportCustomJson}
                disabled={!customJsonInput.trim()}
                className="px-5 py-2 bg-[#1877F2] text-white text-xs font-bold rounded-xl hover:bg-blue-600 disabled:opacity-50 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>استعراض وتطبيق البيانات</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
