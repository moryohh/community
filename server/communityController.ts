import { Request, Response } from 'express';
import { getCommunityDbClient, AuthenticatedRequest } from './communityAuth';

// In-memory fallback cache if database is temporarily unavailable
let inMemoryPostsCache: any[] = [];
let inMemoryCommentsCache: any[] = [];
let inMemoryReportsCache: any[] = [];

// =========================================================================
// 1. GET /api/v1/community/posts - PUBLIC READ (Strictly status = 'published')
// =========================================================================
export async function getPublishedPosts(req: Request, res: Response) {
  try {
    const {
      cursor,
      limit = '20',
      type = 'all',
      search,
      group_id,
    } = req.query;

    const loadAll = String(req.query.all || '').toLowerCase() === 'true';
    const requestedLimit = parseInt(limit as string, 10) || 20;
    // The UI can request the complete published feed once; keep a hard cap to avoid unbounded responses.
    const limitNum = loadAll ? 1000 : Math.min(50, Math.max(1, requestedLimit));
    const db = getCommunityDbClient();
    const isProd = process.env.NODE_ENV === 'production';

    if (!db && isProd) {
      return res.status(503).json({
        success: false,
        error: 'قاعدة بيانات المجتمع غير متاحة حالياً',
        code: 'DATABASE_UNAVAILABLE'
      });
    }

    if (db) {
      let query = db
        .from('posts')
        .select(`
          id,
          user_id,
          author_display_name,
          author_avatar_url,
          content,
          post_text,
          post_type,
          status,
          source_type,
          source_metadata,
          media,
          media_urls,
          likes_count,
          comments_count,
          reactions_count,
          group_id,
          group_name,
          group_url,
          post_url,
          created_at,
          updated_at,
          comments (
            id,
            post_id,
            user_id,
            author_name,
            author_image_url,
            comment_text,
            likes_count,
            created_at
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(limitNum);

      if (!loadAll && cursor && typeof cursor === 'string') {
        query = query.lt('created_at', cursor);
      }

      if (type && type !== 'all' && typeof type === 'string') {
        query = query.eq('post_type', type);
      }

      if (group_id && typeof group_id === 'string') {
        query = query.eq('group_id', group_id);
      }

      if (search && typeof search === 'string' && search.trim()) {
        query = query.or(`content.ilike.%${search.trim()}%,post_text.ilike.%${search.trim()}%`);
      }

      const { data, error } = await query;

      if (!error && data) {
        const nextCursor = !loadAll && data.length === limitNum ? data[data.length - 1].created_at : null;
        return res.json({
          success: true,
          posts: data,
          count: data.length,
          nextCursor,
          hasMore: Boolean(nextCursor),
        });
      }

      if (error) {
        console.error('[Community API] Failed to query published posts:', error.message);
        return res.status(503).json({
          success: false,
          error: 'تعذر جلب المنشورات من قاعدة البيانات حالياً',
          code: 'DATABASE_UNAVAILABLE'
        });
      }
    }

    // In-memory fallback ONLY in dev mode
    let filtered = inMemoryPostsCache.filter(p => p.status === 'published');
    if (search && typeof search === 'string') {
      filtered = filtered.filter(p => (p.content || p.post_text || '').includes(search));
    }
    const paginated = filtered.slice(0, limitNum);

    res.json({
      success: true,
      posts: paginated,
      count: paginated.length,
      nextCursor: null,
      hasMore: false,
    });
  } catch (err: any) {
    res.status(500).json({ error: `فشل جلب المنشورات: ${err.message}` });
  }
}

// =========================================================================
// 2. GET /api/v1/community/posts/:id - SINGLE POST DETAILS
// =========================================================================
export async function getSinglePost(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const db = getCommunityDbClient();
    const isProd = process.env.NODE_ENV === 'production';

    if (!db && isProd) {
      return res.status(503).json({
        success: false,
        error: 'قاعدة بيانات المجتمع غير متاحة حالياً',
        code: 'DATABASE_UNAVAILABLE'
      });
    }

    if (db) {
      const { data, error } = await db
        .from('posts')
        .select('*, comments(*)')
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (!error && data) {
        return res.json({ success: true, post: data });
      }

      if (error && isProd) {
        return res.status(error.code === 'PGRST116' ? 404 : 503).json({
          success: false,
          error: error.code === 'PGRST116' ? 'المنشور غير موجود أو غير منشور' : error.message,
        });
      }
    }

    const memPost = inMemoryPostsCache.find(p => p.id === id && p.status === 'published');
    if (memPost) {
      return res.json({ success: true, post: memPost });
    }

    return res.status(404).json({ error: 'المنشور غير موجود أو غير منشور' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// =========================================================================
// 3. POST /api/v1/community/posts - CREATE POST (Authenticated with JWT from A)
// =========================================================================
export async function createPost(req: AuthenticatedRequest, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'يجب تسجيل الدخول لنشر مشاركة' });
    }

    const {
      content,
      post_type = 'general',
      media = [],
      media_urls = [],
      group_id,
      group_name,
    } = req.body || {};

    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ error: 'محتوى المنشور مطلوب' });
    }

    const pid = `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const formattedMedia = Array.isArray(media) ? media : [];
    const formattedUrls = Array.isArray(media_urls) ? media_urls : formattedMedia.map((m: any) => typeof m === 'string' ? m : m.url || '');

    const newPostRecord = {
      id: pid,
      user_id: user.id, // Strictly extracted from verified JWT, NEVER from request body
      author_display_name: user.displayName || 'طالب المنصة',
      author_avatar_url: user.avatarUrl || null,
      content: content.trim(),
      post_text: content.trim(),
      post_type: post_type || 'general',
      status: 'published', // Student posts default to published
      source_type: 'user',
      source_metadata: {
        submitted_by_student: true,
        user_email: user.email,
      },
      media: formattedMedia,
      media_urls: formattedUrls,
      media_type: formattedUrls.length > 0 ? 'image' : 'none',
      likes_count: 0,
      comments_count: 0,
      reactions_count: 0,
      reports_count: 0,
      group_id: group_id || 'grp_students_main',
      group_name: group_name || 'مجتمع طلاب السادس الإعدادي',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const db = getCommunityDbClient();
    const isProd = process.env.NODE_ENV === 'production';
    if (!db && isProd) {
      return res.status(503).json({
        success: false,
        error: 'قاعدة بيانات المجتمع غير متاحة حالياً',
        code: 'DATABASE_UNAVAILABLE'
      });
    }

    if (db) {
      const { data, error } = await db.from('posts').insert(newPostRecord).select().single();
      if (!error && data) {
        return res.json({
          success: true,
          post: data,
          message: 'تم نشر مشاركتك بنجاح في مجتمع المنصة!',
        });
      }
      if (error && isProd) {
        return res.status(503).json({
          success: false,
          error: `تعذر حفظ المنشور في قاعدة البيانات: ${error.message}`,
          code: 'DATABASE_UNAVAILABLE'
        });
      }
    }

    inMemoryPostsCache.unshift(newPostRecord);
    res.json({
      success: true,
      post: newPostRecord,
      message: 'تم نشر مشاركتك بنجاح في مجتمع المنصة!',
    });
  } catch (err: any) {
    res.status(500).json({ error: `فشل إنشاء المنشور: ${err.message}` });
  }
}

// =========================================================================
// 4. GET /api/v1/community/posts/:id/comments - GET POST COMMENTS
// =========================================================================
export async function getPostComments(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const db = getCommunityDbClient();
    const isProd = process.env.NODE_ENV === 'production';

    if (!db && isProd) {
      return res.status(503).json({
        success: false,
        error: 'قاعدة بيانات المجتمع غير متاحة حالياً',
        code: 'DATABASE_UNAVAILABLE'
      });
    }

    if (db) {
      const { data, error } = await db
        .from('comments')
        .select('*')
        .eq('post_id', id)
        .eq('status', 'published')
        .order('created_at', { ascending: true });

      if (!error && data) {
        return res.json({ success: true, comments: data, count: data.length });
      }

      if (error && isProd) {
        return res.status(503).json({
          success: false,
          error: `تعذر جلب التعليقات من قاعدة البيانات: ${error.message}`,
          code: 'DATABASE_UNAVAILABLE'
        });
      }
    }

    const memComments = inMemoryCommentsCache.filter(c => c.post_id === id && c.status === 'published');
    res.json({ success: true, comments: memComments, count: memComments.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// =========================================================================
// 5. POST /api/v1/community/posts/:id/comments - ADD COMMENT
// =========================================================================
export async function addComment(req: AuthenticatedRequest, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'يجب تسجيل الدخول لإضافة تعليق' });
    }

    const { id } = req.params;
    const { content, comment_text, parent_comment_id } = req.body || {};
    const text = (content || comment_text || '').trim();

    if (!text) {
      return res.status(400).json({ error: 'نص التعليق مطلوب' });
    }

    const cid = `cmt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const commentRecord = {
      id: cid,
      post_id: id,
      user_id: user.id, // Strictly from JWT
      parent_comment_id: parent_comment_id || null,
      author_name: user.displayName || 'طالب متفاعل',
      author_id: user.id,
      author_image_url: user.avatarUrl || null,
      author_avatar: user.avatarUrl || null,
      comment_text: text,
      content: text,
      status: 'published',
      likes_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const db = getCommunityDbClient();
    const isProd = process.env.NODE_ENV === 'production';
    if (!db && isProd) {
      return res.status(503).json({
        success: false,
        error: 'قاعدة بيانات المجتمع غير متاحة حالياً',
        code: 'DATABASE_UNAVAILABLE'
      });
    }

    if (db) {
      const { data, error } = await db.from('comments').insert(commentRecord).select().single();
      
      // Increment comment count in posts table
      try {
        const { data: p } = await db.from('posts').select('comments_count').eq('id', id).single();
        if (p) {
          await db.from('posts').update({ comments_count: (p.comments_count || 0) + 1 }).eq('id', id);
        }
      } catch (_) {}

      if (!error && data) {
        return res.json({ success: true, comment: data, message: 'تمت إضافة التعليق بنجاح' });
      }

      if (error && isProd) {
        return res.status(503).json({
          success: false,
          error: `تعذر إضافة التعليق في قاعدة البيانات: ${error.message}`,
          code: 'DATABASE_UNAVAILABLE'
        });
      }
    }

    inMemoryCommentsCache.push(commentRecord);
    res.json({ success: true, comment: commentRecord, message: 'تمت إضافة التعليق بنجاح' });
  } catch (err: any) {
    res.status(500).json({ error: `فشل إضافة التعليق: ${err.message}` });
  }
}

// =========================================================================
// 6. PUT & DELETE /api/v1/community/posts/:id/reaction - IDEMPOTENT REACTIONS
// =========================================================================
export async function togglePostReaction(req: AuthenticatedRequest, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'يجب تسجيل الدخول للتفاعل' });
    }

    const { id } = req.params;
    const { reaction_type = 'like' } = req.body || {};
    const db = getCommunityDbClient();
    const isProd = process.env.NODE_ENV === 'production';

    if (!db && isProd) {
      return res.status(503).json({
        success: false,
        error: 'قاعدة بيانات المجتمع غير متاحة حالياً',
        code: 'DATABASE_UNAVAILABLE'
      });
    }

    if (db) {
      // Check existing reaction
      const { data: existing, error: existErr } = await db
        .from('post_reactions')
        .select('*')
        .eq('post_id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existErr && isProd) {
        return res.status(503).json({
          success: false,
          error: `تعذر معالجة التفاعل في قاعدة البيانات: ${existErr.message}`,
          code: 'DATABASE_UNAVAILABLE'
        });
      }

      if (existing) {
        if (existing.reaction_type === reaction_type) {
          // Remove reaction
          await db.from('post_reactions').delete().eq('id', existing.id);
          const { data: p } = await db.from('posts').select('likes_count, reactions_count').eq('id', id).single();
          if (p) {
            const updatedLikes = Math.max(0, (p.likes_count || 1) - 1);
            await db.from('posts').update({ likes_count: updatedLikes, reactions_count: updatedLikes }).eq('id', id);
          }
          return res.json({ success: true, action: 'removed', userReaction: null });
        } else {
          // Update reaction type
          await db.from('post_reactions').update({ reaction_type }).eq('id', existing.id);
          return res.json({ success: true, action: 'updated', userReaction: reaction_type });
        }
      } else {
        // Insert new reaction (Idempotent upsert)
        await db.from('post_reactions').upsert({
          id: `react_${id}_${user.id}`,
          post_id: id,
          user_id: user.id,
          reaction_type,
          created_at: new Date().toISOString(),
        }, { onConflict: 'post_id,user_id' });

        const { data: p } = await db.from('posts').select('likes_count, reactions_count').eq('id', id).single();
        if (p) {
          const updatedLikes = (p.likes_count || 0) + 1;
          await db.from('posts').update({ likes_count: updatedLikes, reactions_count: updatedLikes }).eq('id', id);
        }

        return res.json({ success: true, action: 'added', userReaction: reaction_type });
      }
    }

    res.json({ success: true, action: 'added', userReaction: reaction_type });
  } catch (err: any) {
    res.status(500).json({ error: `فشل تسجيل التفاعل: ${err.message}` });
  }
}

// =========================================================================
// 7. POST /api/v1/community/posts/:id/reports - REPORT POST
// =========================================================================
export async function reportPost(req: AuthenticatedRequest, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'يجب تسجيل الدخول لتقديم بلاغ' });
    }

    const { id } = req.params;
    const { reason, details } = req.body || {};

    if (!reason) {
      return res.status(400).json({ error: 'سبب البلاغ مطلوب' });
    }

    const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const reportRecord = {
      id: reportId,
      reporter_user_id: user.id,
      reporter_name: user.displayName || 'طالب مبلّغ',
      target_type: 'post',
      target_id: id,
      post_id: id,
      reason: reason.trim(),
      details: details ? details.trim() : null,
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const db = getCommunityDbClient();
    const isProd = process.env.NODE_ENV === 'production';

    if (!db && isProd) {
      return res.status(503).json({
        success: false,
        error: 'قاعدة بيانات المجتمع غير متاحة حالياً',
        code: 'DATABASE_UNAVAILABLE'
      });
    }

    if (db) {
      const { error } = await db.from('reports').insert(reportRecord);
      if (error && isProd) {
        return res.status(503).json({
          success: false,
          error: `تعذر تسجيل البلاغ في قاعدة البيانات: ${error.message}`,
          code: 'DATABASE_UNAVAILABLE'
        });
      }
      
      // Increment report count on post
      try {
        const { data: p } = await db.from('posts').select('reports_count').eq('id', id).single();
        if (p) {
          await db.from('posts').update({ reports_count: (p.reports_count || 0) + 1 }).eq('id', id);
        }
      } catch (_) {}
    }

    inMemoryReportsCache.push(reportRecord);

    res.json({
      success: true,
      message: 'شكراً لك. تم استلام بلاغك وسيقوم فريق الإشراف بمراجعته فوراً.',
    });
  } catch (err: any) {
    res.status(500).json({ error: `فشل تسجيل البلاغ: ${err.message}` });
  }
}

// =========================================================================
// 8. CLOUDFLARE R2 MEDIA UPLOAD (POSTPONED / SAFELY REJECTED)
// =========================================================================
export async function presignMediaUpload(req: AuthenticatedRequest, res: Response) {
  return res.status(501).json({
    success: false,
    code: 'MEDIA_NOT_IMPLEMENTED',
    error: 'خدمة رفع الصور عبر Cloudflare R2 مؤجلة حالياً وليست مفعلة في هذه المرحلة.',
  });
}

export async function completeMediaUpload(req: AuthenticatedRequest, res: Response) {
  return res.status(501).json({
    success: false,
    code: 'MEDIA_NOT_IMPLEMENTED',
    error: 'خدمة رفع الصور عبر Cloudflare R2 مؤجلة حالياً وليست مفعلة في هذه المرحلة.',
  });
}
