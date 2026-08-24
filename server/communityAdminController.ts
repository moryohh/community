import { Request, Response } from 'express';
import { getCommunityDbClient, AuthenticatedRequest } from './communityAuth';
import {
  CommunityProfileRecord,
  normalizeBotAuthorName,
  createAuthorNameKey,
  getBotProfileId,
  buildBotProfileRecord,
  generateDeterministicPostId,
  generateDeterministicCommentId,
} from './communityProfiles';

// =========================================================================
// 1. GET /api/v1/community/admin/posts - ADMIN POST MATRIX (All Statuses)
// =========================================================================
export async function getAdminPosts(req: AuthenticatedRequest, res: Response) {
  try {
    const isProd = process.env.NODE_ENV === 'production';
    const {
      status,
      source_type,
      page = '1',
      limit = '20',
      search,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const db = getCommunityDbClient();

    if (!db && isProd) {
      return res.status(503).json({
        error: 'قاعدة بيانات المنشورات غير متوفرة حالياً',
        code: 'DATABASE_UNAVAILABLE',
      });
    }

    if (db) {
      let query = db
        .from('posts')
        .select('*, comments(*)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limitNum - 1);

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      if (source_type && source_type !== 'all') {
        query = query.eq('source_type', source_type);
      }

      if (search && typeof search === 'string' && search.trim()) {
        query = query.or(`content.ilike.%${search.trim()}%,post_text.ilike.%${search.trim()}%,author_display_name.ilike.%${search.trim()}%`);
      }

      const { data, count, error } = await query;

      if (error) {
        if (isProd) {
          return res.status(503).json({
            error: `تعذر جلب منشورات المشرف من قاعدة البيانات: ${error.message}`,
            code: 'DATABASE_UNAVAILABLE',
          });
        }
        return res.status(400).json({ error: error.message });
      }

      if (data) {
        return res.json({
          success: true,
          posts: data,
          totalCount: count !== null ? count : data.length,
          page: pageNum,
          limit: limitNum,
        });
      }
    }

    if (isProd) {
      return res.status(503).json({
        error: 'قاعدة بيانات المنشورات غير متوفرة حالياً',
        code: 'DATABASE_UNAVAILABLE',
      });
    }

    res.json({
      success: true,
      posts: [],
      totalCount: 0,
      page: pageNum,
      limit: limitNum,
    });
  } catch (err: any) {
    res.status(500).json({ error: `فشل جلب منشورات المشرف: ${err.message}` });
  }
}

// =========================================================================
// 2. PATCH /api/v1/community/admin/posts/:id/status - MODERATE POST STATUS
// =========================================================================
export async function updatePostStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const isProd = process.env.NODE_ENV === 'production';
    const { id } = req.params;
    const { status, reason } = req.body || {};
    const moderatorId = req.user?.id || 'admin_supervisor';

    const validStatuses = ['pending', 'published', 'rejected', 'hidden', 'deleted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `حالة غير صالحة. الحالات المقبولة: ${validStatuses.join(', ')}`,
      });
    }

    const db = getCommunityDbClient();
    if (!db && isProd) {
      return res.status(503).json({
        error: 'قاعدة بيانات المنشورات غير متوفرة حالياً',
        code: 'DATABASE_UNAVAILABLE',
      });
    }

    if (db) {
      const { data, error } = await db
        .from('posts')
        .update({
          status,
          moderated_at: new Date().toISOString(),
          moderated_by: moderatorId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (isProd) {
          return res.status(503).json({
            error: `تعذر تحديث حالة المنشور في قاعدة البيانات: ${error.message}`,
            code: 'DATABASE_UNAVAILABLE',
          });
        }
        return res.status(400).json({ error: error.message });
      }

      // Log moderation action
      try {
        await db.from('moderation_logs').insert({
          id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          moderator_user_id: moderatorId,
          target_type: 'post',
          target_id: id,
          action: status === 'published' ? 'approve' : status,
          reason: reason || `تعديل الحالة إلى ${status}`,
          created_at: new Date().toISOString(),
        });
      } catch (_) {}

      if (data) {
        return res.json({
          success: true,
          post: data,
          message: `تم تحديث حالة المنشور إلى (${status}) بنجاح!`,
        });
      }
      return res.status(404).json({ error: 'المنشور المطلوب غير موجود' });
    }

    if (isProd) {
      return res.status(503).json({
        error: 'قاعدة بيانات المنشورات غير متوفرة حالياً',
        code: 'DATABASE_UNAVAILABLE',
      });
    }

    res.json({
      success: true,
      message: `تم تحديث حالة المنشور إلى (${status}) بنجاح!`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// =========================================================================
// 3. GET /api/v1/community/admin/reports - MODERATE REPORTS
// =========================================================================
export async function getAdminReports(req: AuthenticatedRequest, res: Response) {
  try {
    const isProd = process.env.NODE_ENV === 'production';
    const { status = 'open' } = req.query;
    const db = getCommunityDbClient();

    if (!db && isProd) {
      return res.status(503).json({
        error: 'قاعدة بيانات البلاغات غير متوفرة حالياً',
        code: 'DATABASE_UNAVAILABLE',
      });
    }

    if (db) {
      let query = db
        .from('reports')
        .select('*, posts(*), comments(*)')
        .order('created_at', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) {
        if (isProd) {
          return res.status(503).json({
            error: `تعذر جلب البلاغات من قاعدة البيانات: ${error.message}`,
            code: 'DATABASE_UNAVAILABLE',
          });
        }
        return res.status(400).json({ error: error.message });
      }

      if (data) {
        return res.json({ success: true, reports: data, count: data.length });
      }
    }

    if (isProd) {
      return res.status(503).json({
        error: 'قاعدة بيانات البلاغات غير متوفرة حالياً',
        code: 'DATABASE_UNAVAILABLE',
      });
    }

    res.json({ success: true, reports: [], count: 0 });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// =========================================================================
// 4. PATCH /api/v1/community/admin/reports/:id - RESOLVE REPORT
// =========================================================================
export async function resolveReport(req: AuthenticatedRequest, res: Response) {
  try {
    const isProd = process.env.NODE_ENV === 'production';
    const { id } = req.params;
    const { status, action_taken } = req.body || {};
    const moderatorId = req.user?.id || 'admin_supervisor';

    const db = getCommunityDbClient();
    if (!db && isProd) {
      return res.status(503).json({
        error: 'قاعدة بيانات البلاغات غير متوفرة حالياً',
        code: 'DATABASE_UNAVAILABLE',
      });
    }

    if (db) {
      const { data, error } = await db
        .from('reports')
        .update({
          status: status || 'reviewed',
          action_taken: action_taken || 'تمت المراجعة من قبل المشرف',
          reviewed_by: moderatorId,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (isProd) {
          return res.status(503).json({
            error: `تعذر تحديث البلاغ في قاعدة البيانات: ${error.message}`,
            code: 'DATABASE_UNAVAILABLE',
          });
        }
        return res.status(400).json({ error: error.message });
      }

      if (data) {
        return res.json({ success: true, report: data, message: 'تم تحديث حالة البلاغ' });
      }
      return res.status(404).json({ error: 'البلاغ المطلوب غير موجود' });
    }

    if (isProd) {
      return res.status(503).json({
        error: 'قاعدة بيانات البلاغات غير متوفرة حالياً',
        code: 'DATABASE_UNAVAILABLE',
      });
    }

    res.json({ success: true, message: 'تم تحديث حالة البلاغ' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// =========================================================================
// 6. POST /api/v1/community/admin/import-json - IMPORT COMMUNITY JSON DATA
// Parse -> Validate Schema -> Normalize -> Upsert Profiles/Posts/Comments in Supabase B
// =========================================================================
export async function importCommunityJson(req: AuthenticatedRequest, res: Response) {
  const startTime = Date.now();
  try {
    const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL || !!process.env.K_SERVICE;
    const db = getCommunityDbClient();

    if (!db && isProd) {
      return res.status(503).json({
        success: false,
        error: 'قاعدة بيانات Supabase B غير متصلة حالياً لإجراء الاستيراد',
        code: 'DATABASE_UNAVAILABLE',
      });
    }

    const payload = req.body || {};
    let rawPosts: any[] = [];
    let rawTopLevelComments: any[] = [];
    let rawProfiles: any[] = [];
    const importKey = (payload.import_key || payload.schema_version ? `import_v${payload.schema_version || 2}` : 'community_seed').toString().trim();
    let defaultGroupName = typeof payload.default_group_name === 'string' ? payload.default_group_name.trim() : 'مجموعة منهاج وأسئلة السادس الإعدادي 2026';
    let defaultGroupId = typeof payload.default_group_id === 'string' ? payload.default_group_id.trim() : 'grp_curriculum_2026';
    let autoPublish = payload.auto_publish !== false;

    // Detect format of input payload
    if (Array.isArray(payload)) {
      rawPosts = payload;
    } else if (Array.isArray(payload.posts)) {
      rawPosts = payload.posts;
      if (Array.isArray(payload.comments)) {
        rawTopLevelComments = payload.comments;
      }
      if (Array.isArray(payload.profiles)) {
        rawProfiles = payload.profiles;
      }
    } else if (Array.isArray(payload.items)) {
      rawPosts = payload.items;
    } else if (Array.isArray(payload.data)) {
      rawPosts = payload.data;
    } else if (Array.isArray(payload.questions)) {
      rawPosts = payload.questions;
    } else if (payload && typeof payload === 'object' && (payload.content || payload.post_text || payload.text)) {
      // Single post object wrapped in JSON
      rawPosts = [payload];
    }

    if (!rawPosts || rawPosts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'لم يتم العثور على مصفوفة منشورات صالحة في ملف JSON. يرجى إرسال مصفوفة posts أو كائن يحتوي على المنشورات.',
      });
    }

    // Profiles Map (author_name_key -> CommunityProfileRecord)
    const profilesMap = new Map<string, CommunityProfileRecord>();

    // 1. Ingest explicit profiles if provided
    for (let pIdx = 0; pIdx < rawProfiles.length; pIdx++) {
      const p = rawProfiles[pIdx];
      if (p && typeof p === 'object') {
        const displayName = (p.display_name || p.name || p.author_name || '').toString().trim();
        if (displayName) {
          const prof = buildBotProfileRecord(displayName, p.avatar_url || p.avatar, p.bio, p.profile_type || 'bot');
          if (p.id) prof.id = String(p.id).trim();
          profilesMap.set(prof.author_name_key, prof);
        }
      }
    }

    const postRows: any[] = [];
    const commentRows: any[] = [];
    const candidateProfileIds: string[] = [];
    const candidatePostIds: string[] = [];
    const candidateCommentIds: string[] = [];
    const skippedReasons: string[] = [];

    let skippedPostsCount = 0;
    let skippedCommentsCount = 0;
    let botCommentsCount = 0;
    let ignoredUserIdsCount = 0;

    const importBatchId = `batch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // 2. Process & Validate Posts
    for (let i = 0; i < rawPosts.length; i++) {
      const item = rawPosts[i];
      if (!item || typeof item !== 'object') {
        skippedPostsCount++;
        skippedReasons.push(`العنصر رقم ${i + 1} ليس كائن JSON صالح`);
        continue;
      }

      const postContent = (item.content || item.post_text || item.text || item.question || item.body || item.caption || item.message || '').toString().trim();
      if (!postContent) {
        skippedPostsCount++;
        skippedReasons.push(`المنشور رقم ${i + 1} تم تخطيه لعدم وجود محتوى نصي (content أو text)`);
        continue;
      }

      // Check human user_id in imported JSON: Discard it to protect student accounts
      if (item.user_id) {
        ignoredUserIdsCount++;
        skippedReasons.push(`تم تجاهل user_id بشري (${item.user_id}) في المنشور رقم ${i + 1} لفرض الحماية وعدم انتحال هويات الطلاب.`);
      }

      // Author name normalization & Profile resolution
      const rawAuthorName = (item.author_display_name || item.author_name || item.author || item.userName || item.name || 'أستاذ المادة / ناشر معتمد').toString().trim();
      const normalizedAuthorName = normalizeBotAuthorName(rawAuthorName);
      const authorNameKey = createAuthorNameKey(normalizedAuthorName);

      let profileRecord = profilesMap.get(authorNameKey);
      if (!profileRecord) {
        profileRecord = buildBotProfileRecord(
          rawAuthorName,
          item.author_avatar_url || item.author_avatar || item.authorAvatar || item.avatar || null,
          item.bio || 'مساعد تعليمي معتمد لمادة السادس الإعدادي',
          item.profile_type || 'bot'
        );
        profilesMap.set(authorNameKey, profileRecord);
      }

      const authorProfileId = profileRecord.id;

      // Deterministic or specified Post ID
      const rawId = item.id || item.postId || item.post_id || item.source_post_id;
      const pid = rawId
        ? String(rawId).trim()
        : generateDeterministicPostId(importKey, authorNameKey, postContent, i);

      candidatePostIds.push(pid);

      // Parse media
      let mediaUrls: string[] = [];
      if (Array.isArray(item.media_urls)) {
        mediaUrls = item.media_urls.filter((u: any) => typeof u === 'string' && u.trim().length > 0);
      } else if (Array.isArray(item.media)) {
        mediaUrls = item.media.map((m: any) => typeof m === 'string' ? m : m.url || m.image || m.src).filter(Boolean);
      } else if (Array.isArray(item.images)) {
        mediaUrls = item.images.map((img: any) => typeof img === 'string' ? img : img.url || img.src).filter(Boolean);
      } else if (item.imageUrl || item.image || item.photo || item.media_url) {
        const u = item.imageUrl || item.image || item.photo || item.media_url;
        if (typeof u === 'string' && u.trim()) mediaUrls = [u.trim()];
      }

      const mediaObjects = mediaUrls.map((url, mIdx) => ({
        url,
        key: `media_${pid}_${mIdx}`,
        type: 'image',
      }));

      const postType = item.post_type || item.type || 'curriculum';
      const postStatus = item.status || (autoPublish ? 'published' : 'pending');
      const sourceType = 'manual_json_import';

      const postRow = {
        id: pid,
        user_id: null, // Always null for imported / bot / curriculum posts
        author_profile_id: authorProfileId,
        author_display_name: profileRecord.display_name,
        author_avatar_url: profileRecord.avatar_url,
        content: postContent,
        post_text: postContent, // Compatibility
        post_type: postType,
        status: postStatus,
        source_type: sourceType,
        source_metadata: {
          import_batch: importBatchId,
          import_key: importKey,
          imported_by: req.user?.id || 'admin',
          imported_at: new Date().toISOString(),
          original_source: item.source_api || item.source || 'community_json_upload',
        },
        media: mediaObjects,
        media_urls: mediaUrls,
        media_type: mediaUrls.length > 0 ? 'image' : 'none',
        likes_count: Number(item.likes_count || item.reactions_count || item.likes || 0),
        comments_count: 0, // Will be computed after comments processing
        reports_count: 0,
        reactions_count: Number(item.reactions_count || item.likes_count || item.likes || 0),
        group_id: item.group_id || defaultGroupId,
        group_name: item.group_name || defaultGroupName,
        group_url: item.group_url || 'https://facebook.com/groups/curriculum2026',
        post_url: item.post_url || `https://facebook.com/groups/posts/${pid}`,
        source_post_id: item.source_post_id || pid,
        source_api: 'manual_json_import',
        fetched_at: item.fetched_at || new Date().toISOString(),
        raw_data: item,
        created_at: item.created_at || item.createdAt || item.time || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Process embedded comments for this post
      const itemComments = Array.isArray(item.comments) ? item.comments : (Array.isArray(item.topComments) ? item.topComments : []);

      let validCommentsForThisPost = 0;
      for (let cIdx = 0; cIdx < itemComments.length; cIdx++) {
        const c = itemComments[cIdx];
        if (!c || typeof c !== 'object') {
          skippedCommentsCount++;
          continue;
        }

        const commentText = (c.comment_text || c.text || c.content || c.body || '').toString().trim();
        if (!commentText) {
          skippedCommentsCount++;
          continue;
        }

        // Check human user_id in comment
        if (c.user_id) {
          ignoredUserIdsCount++;
          skippedReasons.push(`تم تجاهل user_id بشري (${c.user_id}) في تعليق المنشور رقم ${i + 1}.`);
        }

        // Author name & Profile for comment
        const rawCAuthor = (c.author_name || c.author_display_name || c.userName || c.name || 'المساعد الذكي (Bot)').toString().trim();
        const normCAuthor = normalizeBotAuthorName(rawCAuthor);
        const cNameKey = createAuthorNameKey(normCAuthor);

        let cProfile = profilesMap.get(cNameKey);
        if (!cProfile) {
          cProfile = buildBotProfileRecord(
            rawCAuthor,
            c.author_image_url || c.author_avatar || c.authorAvatar || c.avatar || null,
            'مساعد آلي للمجتمع التعليمي',
            'bot'
          );
          profilesMap.set(cNameKey, cProfile);
        }

        const isBot = Boolean(
          c.is_bot || 
          c.isBot || 
          c.author_type === 'bot' || 
          c.extracted_by_api === 'bot' ||
          cProfile.profile_type === 'bot' ||
          rawCAuthor.includes('مساعد') || 
          rawCAuthor.includes('بوت') || 
          rawCAuthor.toLowerCase().includes('bot')
        );

        if (isBot) botCommentsCount++;

        const cid = c.id || c.commentId
          ? String(c.id || c.commentId).trim()
          : generateDeterministicCommentId(pid, cNameKey, commentText, cIdx);

        candidateCommentIds.push(cid);

        commentRows.push({
          id: cid,
          post_id: pid,
          user_id: null, // Always null for imported comments
          author_profile_id: cProfile.id,
          parent_comment_id: c.parent_comment_id || null,
          author_name: cProfile.display_name,
          author_id: cProfile.id,
          author_image_url: cProfile.avatar_url,
          author_avatar: cProfile.avatar_url,
          comment_text: commentText,
          content: commentText,
          status: c.status || 'published',
          likes_count: Number(c.likes_count || c.likes || 0),
          source_comment_id: c.source_comment_id || cid,
          extracted_by_api: isBot ? 'bot' : 'manual_json_import',
          raw_data: c,
          comment_created_at: c.comment_created_at || c.createdAt || c.time || new Date().toISOString(),
          fetched_at: new Date().toISOString(),
          created_at: c.created_at || c.createdAt || c.time || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        validCommentsForThisPost++;
      }

      postRow.comments_count = validCommentsForThisPost;
      postRows.push(postRow);
    }

    // 3. Process top-level comments if provided
    for (let cIdx = 0; cIdx < rawTopLevelComments.length; cIdx++) {
      const c = rawTopLevelComments[cIdx];
      if (!c || typeof c !== 'object') {
        skippedCommentsCount++;
        continue;
      }
      const commentText = (c.comment_text || c.text || c.content || c.body || '').toString().trim();
      const targetPostId = c.post_id || c.postId;
      if (!commentText || !targetPostId) {
        skippedCommentsCount++;
        skippedReasons.push(`التعليق المنفصل رقم ${cIdx + 1} تم تخطيه لعدم وجود نص أو post_id`);
        continue;
      }

      if (c.user_id) {
        ignoredUserIdsCount++;
        skippedReasons.push(`تم تجاهل user_id بشري (${c.user_id}) في التعليق المنفصل رقم ${cIdx + 1}.`);
      }

      const rawCAuthor = (c.author_name || c.author_display_name || c.userName || c.name || 'المساعد الذكي (Bot)').toString().trim();
      const normCAuthor = normalizeBotAuthorName(rawCAuthor);
      const cNameKey = createAuthorNameKey(normCAuthor);

      let cProfile = profilesMap.get(cNameKey);
      if (!cProfile) {
        cProfile = buildBotProfileRecord(
          rawCAuthor,
          c.author_image_url || c.author_avatar || c.authorAvatar || c.avatar || null,
          'مساعد آلي للمجتمع التعليمي',
          'bot'
        );
        profilesMap.set(cNameKey, cProfile);
      }

      const isBot = Boolean(
        c.is_bot || 
        c.isBot || 
        c.author_type === 'bot' || 
        c.extracted_by_api === 'bot' ||
        cProfile.profile_type === 'bot' ||
        rawCAuthor.includes('مساعد') || 
        rawCAuthor.includes('بوت') || 
        rawCAuthor.toLowerCase().includes('bot')
      );

      if (isBot) botCommentsCount++;

      const cid = c.id || c.commentId
        ? String(c.id || c.commentId).trim()
        : generateDeterministicCommentId(String(targetPostId), cNameKey, commentText, cIdx);

      candidateCommentIds.push(cid);

      commentRows.push({
        id: cid,
        post_id: String(targetPostId),
        user_id: null,
        author_profile_id: cProfile.id,
        parent_comment_id: c.parent_comment_id || null,
        author_name: cProfile.display_name,
        author_id: cProfile.id,
        author_image_url: cProfile.avatar_url,
        author_avatar: cProfile.avatar_url,
        comment_text: commentText,
        content: commentText,
        status: c.status || 'published',
        likes_count: Number(c.likes_count || c.likes || 0),
        source_comment_id: c.source_comment_id || cid,
        extracted_by_api: isBot ? 'bot' : 'manual_json_import',
        raw_data: c,
        comment_created_at: c.comment_created_at || c.createdAt || new Date().toISOString(),
        fetched_at: new Date().toISOString(),
        created_at: c.created_at || c.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    if (postRows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'لم يتم العثور على أي منشورات صالحة للاستيراد بعد التحقق من الحقول الإلزامية.',
        skipped_reasons: skippedReasons,
      });
    }

    const profileRows = Array.from(profilesMap.values());
    candidateProfileIds.push(...profileRows.map(p => p.id));

    let insertedProfilesCount = 0;
    let updatedProfilesCount = 0;
    let skippedProfilesCount = 0;

    let insertedPostsCount = 0;
    let updatedPostsCount = 0;

    let insertedCommentsCount = 0;
    let updatedCommentsCount = 0;

    // Database Insertion into Supabase B in strict sequence:
    // 1. community_profiles -> 2. posts -> 3. comments
    if (db) {
      try {
        // Step 1: Detect existing profiles
        if (candidateProfileIds.length > 0) {
          const { data: existingProfiles } = await db.from('community_profiles').select('id').in('id', candidateProfileIds);
          const existingProfileSet = new Set((existingProfiles || []).map((p: any) => p.id));
          updatedProfilesCount = profileRows.filter(p => existingProfileSet.has(p.id)).length;
          insertedProfilesCount = profileRows.length - updatedProfilesCount;
        } else {
          insertedProfilesCount = profileRows.length;
        }

        // Upsert community_profiles
        if (profileRows.length > 0) {
          const { error: profileUpsertError } = await db.from('community_profiles').upsert(profileRows, { onConflict: 'id' });
          if (profileUpsertError) {
            if (isProd) {
              return res.status(503).json({
                success: false,
                error: `تعذر إدخال أو تحديث ملفات التعريف (Profiles) في Supabase B: ${profileUpsertError.message}`,
                code: 'DATABASE_UNAVAILABLE',
              });
            }
            console.warn('[Import Profiles Error Note]:', profileUpsertError.message);
          }
        }

        // Step 2: Detect existing posts
        if (candidatePostIds.length > 0) {
          const { data: existingPosts } = await db.from('posts').select('id').in('id', candidatePostIds);
          const existingPostSet = new Set((existingPosts || []).map((p: any) => p.id));
          updatedPostsCount = postRows.filter(p => existingPostSet.has(p.id)).length;
          insertedPostsCount = postRows.length - updatedPostsCount;
        } else {
          insertedPostsCount = postRows.length;
        }

        // Upsert posts
        const { error: postUpsertError } = await db.from('posts').upsert(postRows, { onConflict: 'id' });
        if (postUpsertError) {
          if (isProd) {
            return res.status(503).json({
              success: false,
              error: `تعذر إدخال المنشورات في Supabase B: ${postUpsertError.message}`,
              code: 'DATABASE_UNAVAILABLE',
            });
          }
          return res.status(400).json({ success: false, error: postUpsertError.message });
        }

        // Step 3: Detect existing comments
        if (candidateCommentIds.length > 0) {
          const { data: existingComments } = await db.from('comments').select('id').in('id', candidateCommentIds);
          const existingCommentSet = new Set((existingComments || []).map((c: any) => c.id));
          updatedCommentsCount = commentRows.filter(c => existingCommentSet.has(c.id)).length;
          insertedCommentsCount = commentRows.length - updatedCommentsCount;
        } else {
          insertedCommentsCount = commentRows.length;
        }

        // Upsert comments if any
        if (commentRows.length > 0) {
          const { error: commentUpsertError } = await db.from('comments').upsert(commentRows, { onConflict: 'id' });
          if (commentUpsertError) {
            if (isProd) {
              return res.status(503).json({
                success: false,
                error: `تعذر إدخال تعليقات المنشورات في Supabase B: ${commentUpsertError.message}`,
                code: 'DATABASE_UNAVAILABLE',
              });
            }
            console.warn('[Import Comments Error]:', commentUpsertError.message);
            skippedReasons.push(`تحذير أثناء إدخال التعليقات في القاعدة: ${commentUpsertError.message}`);
          }
        }
      } catch (dbErr: any) {
        if (isProd) {
          return res.status(503).json({
            success: false,
            error: `خطأ أثناء الاتصال بقاعدة بيانات Supabase B: ${dbErr.message}`,
            code: 'DATABASE_UNAVAILABLE',
          });
        }
        return res.status(500).json({ success: false, error: dbErr.message });
      }
    } else {
      // Local dev in-memory fallback
      insertedProfilesCount = profileRows.length;
      insertedPostsCount = postRows.length;
      insertedCommentsCount = commentRows.length;
    }

    const durationMs = Date.now() - startTime;

    // Return the exact report structure required
    res.json({
      success: true,
      message: `تم بنجاح استيراد ومعالجة ملف JSON وإدخال المنشورات والتعليقات والملفات التعريفية في Supabase B!`,
      report: {
        batch_id: importBatchId,
        profiles: {
          inserted: insertedProfilesCount,
          updated: updatedProfilesCount,
          skipped: skippedProfilesCount,
        },
        posts: {
          inserted: insertedPostsCount,
          updated: updatedPostsCount,
          skipped: skippedPostsCount,
        },
        comments: {
          inserted: insertedCommentsCount,
          updated: updatedCommentsCount,
          skipped: skippedCommentsCount,
        },
        bot_comments: botCommentsCount,
        ignored_user_ids: ignoredUserIdsCount,
        skipped_reasons: skippedReasons.slice(0, 20),
        duration_ms: durationMs,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: `فشل استيراد ملف JSON: ${err.message}`,
    });
  }
}

// =========================================================================
// 7. GET /api/v1/community/admin/stats - COMPLETE COMMUNITY METRICS
// =========================================================================
export async function getAdminStats(req: AuthenticatedRequest, res: Response) {
  try {
    const isProd = process.env.NODE_ENV === 'production';
    const db = getCommunityDbClient();

    if (!db && isProd) {
      return res.status(503).json({
        error: 'قاعدة بيانات الإحصائيات غير متوفرة حالياً',
        code: 'DATABASE_UNAVAILABLE',
      });
    }

    const stats = {
      totalPosts: 0,
      publishedPosts: 0,
      pendingReviewPosts: 0,
      rejectedPosts: 0,
      hiddenPosts: 0,
      totalComments: 0,
      totalLikes: 0,
      openReports: 0,
      apifyImportsCount: 0,
    };

    if (db) {
      try {
        const [postsRes, reportsRes] = await Promise.all([
          db.from('posts').select('id, status, source_type, likes_count, comments_count'),
          db.from('reports').select('id, status'),
        ]);

        if (postsRes.error || reportsRes.error) {
          const errMsg = postsRes.error?.message || reportsRes.error?.message;
          if (isProd) {
            return res.status(503).json({
              error: `تعذر جلب الإحصائيات من قاعدة البيانات: ${errMsg}`,
              code: 'DATABASE_UNAVAILABLE',
            });
          }
          return res.status(400).json({ error: errMsg });
        }

        if (postsRes.data) {
          stats.totalPosts = postsRes.data.length;
          stats.publishedPosts = postsRes.data.filter(p => p.status === 'published').length;
          stats.pendingReviewPosts = postsRes.data.filter(p => p.status === 'pending').length;
          stats.rejectedPosts = postsRes.data.filter(p => p.status === 'rejected').length;
          stats.hiddenPosts = postsRes.data.filter(p => p.status === 'hidden').length;
          stats.totalLikes = postsRes.data.reduce((acc, p) => acc + (p.likes_count || 0), 0);
          stats.totalComments = postsRes.data.reduce((acc, p) => acc + (p.comments_count || 0), 0);
          stats.apifyImportsCount = postsRes.data.filter(p => p.source_type === 'apify').length;
        }

        if (reportsRes.data) {
          stats.openReports = reportsRes.data.filter(r => r.status === 'open').length;
        }
      } catch (err: any) {
        if (isProd) {
          return res.status(503).json({
            error: `تعذر جلب الإحصائيات: ${err.message}`,
            code: 'DATABASE_UNAVAILABLE',
          });
        }
        return res.status(500).json({ error: err.message });
      }
    }

    res.json({ success: true, stats });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
