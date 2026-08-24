import { Response } from 'express';
import {
  getCommunityDbClient,
  AuthenticatedRequest,
  DashboardAdminRecord,
  inMemoryDashboardAdmins,
  MASTER_OWNER_EMAIL,
} from './communityAuth';

// =========================================================================
// 1. GET /api/v1/community/admin/admins - LIST ADMINS & CAPACITY (Max 3)
// =========================================================================
export async function listDashboardAdmins(req: AuthenticatedRequest, res: Response) {
  try {
    const isProd = process.env.NODE_ENV === 'production';
    const db = getCommunityDbClient();
    let admins: DashboardAdminRecord[] = [];

    if (!db && isProd) {
      return res.status(503).json({
        error: 'قاعدة بيانات المشرفين غير متوفرة حالياً',
        code: 'DATABASE_UNAVAILABLE',
      });
    }

    if (db) {
      const { data, error } = await db
        .from('dashboard_admins')
        .select('*')
        .order('role', { ascending: false }) // 'owner' first, then 'admin'
        .order('created_at', { ascending: true });

      if (error) {
        if (isProd) {
          return res.status(503).json({
            error: `تعذر جلب المشرفين من قاعدة البيانات: ${error.message}`,
            code: 'DATABASE_UNAVAILABLE',
          });
        }
      } else if (data && data.length > 0) {
        admins = data;
      }
    }

    if (admins.length === 0 && !isProd) {
      admins = inMemoryDashboardAdmins;
    }

    const activeAdmins = admins.filter(a => a.status === 'active');
    const revokedAdmins = admins.filter(a => a.status === 'revoked');
    const activeCount = activeAdmins.length;
    const maxCapacity = 3;

    // Secure payload: Mask internal details, show safe display names and truncated user IDs
    const sanitizedActive = activeAdmins.map(a => ({
      id: a.id,
      user_id_short: `${a.user_id.substring(0, 8)}...`,
      user_id: a.user_id,
      display_name: a.display_name,
      role: a.role,
      status: a.status,
      created_at: a.created_at,
      last_login_at: a.last_login_at || null,
      is_current_user: a.user_id === req.user?.id,
    }));

    const sanitizedRevoked = revokedAdmins.map(a => ({
      id: a.id,
      user_id_short: `${a.user_id.substring(0, 8)}...`,
      user_id: a.user_id,
      display_name: a.display_name,
      role: a.role,
      status: a.status,
      created_at: a.created_at,
      revoked_at: a.revoked_at || null,
    }));

    res.json({
      success: true,
      maxCapacity,
      activeCount,
      remainingSeats: Math.max(0, maxCapacity - activeCount),
      isFull: activeCount >= maxCapacity,
      activeAdmins: sanitizedActive,
      revokedAdmins: sanitizedRevoked,
      currentUserRole: req.adminRecord?.role || 'admin',
    });
  } catch (err: any) {
    res.status(500).json({ error: `فشل جلب قائمة الحسابات الإدارية: ${err.message}` });
  }
}

// =========================================================================
// 2. POST /api/v1/community/admin/admins - ADD ADMIN (Atomic 3-seats enforcement)
// =========================================================================
export async function addDashboardAdmin(req: AuthenticatedRequest, res: Response) {
  try {
    const isProd = process.env.NODE_ENV === 'production';
    const actor = req.user;
    if (!actor) {
      return res.status(401).json({ error: 'غير مصرح' });
    }

    const { user_id, display_name, email } = req.body || {};

    if (!user_id || typeof user_id !== 'string' || !user_id.trim()) {
      return res.status(400).json({ error: 'معرف المستخدم (user_id من Supabase A) مطلوب لإضافة المشرف' });
    }

    const cleanUserId = user_id.trim();
    const cleanDisplayName = (display_name || '').trim() || 'مشرف معتمد';
    const cleanEmail = (email || '').trim().toLowerCase() || null;
    const db = getCommunityDbClient();

    if (!db && isProd) {
      return res.status(503).json({
        error: 'قاعدة بيانات المشرفين غير متوفرة حالياً',
        code: 'DATABASE_UNAVAILABLE',
      });
    }

    if (db) {
      // 1. Query existing record in DB
      const { data: existingDbUser } = await db
        .from('dashboard_admins')
        .select('*')
        .eq('user_id', cleanUserId)
        .maybeSingle();

      if (existingDbUser) {
        if (existingDbUser.status === 'active') {
          return res.json({
            success: true,
            message: 'المستخدم مسجل بالفعل كحساب إداري نشط',
            admin: existingDbUser,
          });
        }

        // Check capacity before restoring
        const { count: activeCount } = await db
          .from('dashboard_admins')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        if (activeCount !== null && activeCount >= 3) {
          return res.status(409).json({
            error: 'تم الوصول للحد الأقصى (3 حسابات إدارية نشطة). يجب إلغاء/تعطيل حساب إداري قديم أولاً قبل إعادة التفعيل.',
            code: 'ADMIN_SEATS_FULL',
            activeCount,
            maxCapacity: 3,
          });
        }

        const { data: updatedAdmin, error: updateErr } = await db
          .from('dashboard_admins')
          .update({
            status: 'active',
            revoked_at: null,
            updated_at: new Date().toISOString(),
            display_name: cleanDisplayName,
          })
          .eq('user_id', cleanUserId)
          .select()
          .single();

        if (updateErr && isProd) {
          return res.status(503).json({
            error: `تعذر تحديث الحساب في قاعدة البيانات: ${updateErr.message}`,
            code: 'DATABASE_UNAVAILABLE',
          });
        }

        return res.json({
          success: true,
          message: `تم إعادة تفعيل الحساب الإداري للمستخدم (${cleanDisplayName}) بنجاح`,
          admin: updatedAdmin || existingDbUser,
        });
      }

      // Check current active count
      const { count: activeCount } = await db
        .from('dashboard_admins')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (activeCount !== null && activeCount >= 3) {
        return res.status(409).json({
          error: 'تم استخدام الحسابات الإدارية الثلاثة (3/3). يجب إلغاء/تعطيل حساب إداري قديم أولاً قبل إضافة حساب جديد.',
          code: 'ADMIN_SEATS_FULL',
          activeCount,
          maxCapacity: 3,
        });
      }

      const newAdminRow: DashboardAdminRecord = {
        id: `adm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        user_id: cleanUserId,
        display_name: cleanDisplayName,
        email: cleanEmail || undefined,
        role: 'admin',
        status: 'active',
        created_by: actor.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login_at: new Date().toISOString(),
      };

      const { data: insertedAdmin, error: insertErr } = await db
        .from('dashboard_admins')
        .insert(newAdminRow)
        .select()
        .single();

      if (insertErr) {
        if (isProd) {
          return res.status(503).json({
            error: `تعذر إضافة الحساب الإداري إلى قاعدة البيانات: ${insertErr.message}`,
            code: 'DATABASE_UNAVAILABLE',
          });
        }
      }

      try {
        await db.from('moderation_logs').insert({
          id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          moderator_user_id: actor.id,
          target_type: 'dashboard_admin',
          target_id: cleanUserId,
          action: 'add_admin',
          reason: `إضافة مشرف جديد: ${cleanDisplayName}`,
          created_at: new Date().toISOString(),
        });
      } catch (_) {}

      return res.status(201).json({
        success: true,
        message: `تمت إضافة المشرف (${cleanDisplayName}) بنجاح إلى المقاعد الإدارية (المتبقي: ${3 - ((activeCount || 0) + 1)})`,
        admin: insertedAdmin || newAdminRow,
      });
    }

    // Local in-memory fallback for non-production environments
    const existingInMemory = inMemoryDashboardAdmins.find(a => a.user_id === cleanUserId);
    if (existingInMemory) {
      if (existingInMemory.status === 'active') {
        return res.json({
          success: true,
          message: 'المستخدم مسجل بالفعل كحساب إداري نشط',
          admin: existingInMemory,
        });
      }
      const activeCount = inMemoryDashboardAdmins.filter(a => a.status === 'active').length;
      if (activeCount >= 3) {
        return res.status(409).json({
          error: 'تم الوصول للحد الأقصى (3 حسابات إدارية نشطة). يجب إلغاء/تعطيل حساب إداري قديم أولاً قبل إعادة التفعيل.',
          code: 'ADMIN_SEATS_FULL',
          activeCount,
          maxCapacity: 3,
        });
      }

      existingInMemory.status = 'active';
      existingInMemory.revoked_at = null;
      existingInMemory.updated_at = new Date().toISOString();
      existingInMemory.display_name = cleanDisplayName;

      return res.json({
        success: true,
        message: `تم إعادة تفعيل الحساب الإداري للمستخدم (${cleanDisplayName}) بنجاح`,
        admin: existingInMemory,
      });
    }

    const currentActiveMemory = inMemoryDashboardAdmins.filter(a => a.status === 'active').length;
    if (currentActiveMemory >= 3) {
      return res.status(409).json({
        error: 'تم استخدام الحسابات الإدارية الثلاثة (3/3). يجب إلغاء/تعطيل حساب إداري قديم أولاً قبل إضافة حساب جديد.',
        code: 'ADMIN_SEATS_FULL',
        activeCount: currentActiveMemory,
        maxCapacity: 3,
      });
    }

    const newAdminRow: DashboardAdminRecord = {
      id: `adm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: cleanUserId,
      display_name: cleanDisplayName,
      email: cleanEmail || undefined,
      role: 'admin',
      status: 'active',
      created_by: actor.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login_at: new Date().toISOString(),
    };

    inMemoryDashboardAdmins.push(newAdminRow);

    return res.status(201).json({
      success: true,
      message: `تمت إضافة المشرف (${cleanDisplayName}) بنجاح إلى المقاعد الإدارية (المتبقي: ${3 - (currentActiveMemory + 1)})`,
      admin: newAdminRow,
    });
  } catch (err: any) {
    res.status(500).json({ error: `فشل إضافة الحساب الإداري: ${err.message}` });
  }
}

// =========================================================================
// 3. PATCH /api/v1/community/admin/admins/:userId/revoke - REVOKE ADMIN
// =========================================================================
export async function revokeDashboardAdmin(req: AuthenticatedRequest, res: Response) {
  try {
    const isProd = process.env.NODE_ENV === 'production';
    const actor = req.user;
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'معرف المستخدم المستهدف مطلوب' });
    }

    const db = getCommunityDbClient();
    if (!db && isProd) {
      return res.status(503).json({
        error: 'قاعدة بيانات المشرفين غير متوفرة حالياً',
        code: 'DATABASE_UNAVAILABLE',
      });
    }

    let targetAdmin: DashboardAdminRecord | null = null;

    if (db) {
      const { data } = await db.from('dashboard_admins').select('*').eq('user_id', userId).maybeSingle();
      if (data) targetAdmin = data;
    }

    if (!targetAdmin && !isProd) {
      targetAdmin = inMemoryDashboardAdmins.find(a => a.user_id === userId) || null;
    }

    if (!targetAdmin) {
      return res.status(404).json({ error: 'الحساب الإداري المستهدف غير موجود' });
    }

    // Protection rule 1: Cannot revoke Root Master Owner from UI
    if (targetAdmin.role === 'owner' || (targetAdmin.email && targetAdmin.email.toLowerCase() === MASTER_OWNER_EMAIL)) {
      return res.status(403).json({
        error: 'محظور: لا يمكن إلغاء حساب المالك الرئيسي (Owner) من الواجهة. تعديل المالك يتم فقط من إعدادات الخادم أو مسار الاسترداد الموثق.',
        code: 'OWNER_PROTECTED'
      });
    }

    // Protection rule 2: Check remaining active admins (Cannot revoke last active admin)
    if (db) {
      const { count: activeCount } = await db
        .from('dashboard_admins')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (activeCount !== null && activeCount <= 1 && targetAdmin.status === 'active') {
        return res.status(409).json({
          error: 'محظور: لا يمكن إلغاء آخر حساب إداري فعال حتى لا يتم إغلاق لوحة التحكم بالكامل.',
          code: 'LAST_ADMIN_PROTECTED'
        });
      }
    } else {
      const allActive = inMemoryDashboardAdmins.filter(a => a.status === 'active');
      if (allActive.length <= 1 && targetAdmin.status === 'active') {
        return res.status(409).json({
          error: 'محظور: لا يمكن إلغاء آخر حساب إداري فعال حتى لا يتم إغلاق لوحة التحكم بالكامل.',
          code: 'LAST_ADMIN_PROTECTED'
        });
      }
    }

    // Apply Revoke
    targetAdmin.status = 'revoked';
    targetAdmin.revoked_at = new Date().toISOString();
    targetAdmin.updated_at = new Date().toISOString();

    if (db) {
      const { error: updateErr } = await db.from('dashboard_admins').update({
        status: 'revoked',
        revoked_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('user_id', userId);

      if (updateErr && isProd) {
        return res.status(503).json({
          error: `تعذر تحديث حالة الحساب في قاعدة البيانات: ${updateErr.message}`,
          code: 'DATABASE_UNAVAILABLE',
        });
      }

      // Audit Log
      try {
        await db.from('moderation_logs').insert({
          id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          moderator_user_id: actor?.id || 'system',
          target_type: 'dashboard_admin',
          target_id: userId,
          action: 'revoke_admin',
          reason: `إلغاء صلاحيات المشرف: ${targetAdmin.display_name}`,
          created_at: new Date().toISOString(),
        });
      } catch (_) {}
    }

    res.json({
      success: true,
      message: `تم إلغاء وتجميد الحساب الإداري للمستخدم (${targetAdmin.display_name}) بنجاح. المقعد متاح الآن لإضافة مشرف جديد.`,
      admin: targetAdmin,
    });
  } catch (err: any) {
    res.status(500).json({ error: `فشل إلغاء الحساب الإداري: ${err.message}` });
  }
}

// =========================================================================
// 4. PATCH /api/v1/community/admin/admins/:userId/restore - RESTORE REVOKED ADMIN
// =========================================================================
export async function restoreDashboardAdmin(req: AuthenticatedRequest, res: Response) {
  try {
    const isProd = process.env.NODE_ENV === 'production';
    const actor = req.user;
    const { userId } = req.params;

    const db = getCommunityDbClient();
    if (!db && isProd) {
      return res.status(503).json({
        error: 'قاعدة بيانات المشرفين غير متوفرة حالياً',
        code: 'DATABASE_UNAVAILABLE',
      });
    }

    let targetAdmin: DashboardAdminRecord | null = null;

    if (db) {
      const { data } = await db.from('dashboard_admins').select('*').eq('user_id', userId).maybeSingle();
      if (data) targetAdmin = data;
    }

    if (!targetAdmin && !isProd) {
      targetAdmin = inMemoryDashboardAdmins.find(a => a.user_id === userId) || null;
    }

    if (!targetAdmin) {
      return res.status(404).json({ error: 'الحساب الإداري المستهدف غير موجود' });
    }

    if (targetAdmin.status === 'active') {
      return res.json({ success: true, message: 'الحساب نشط بالفعل', admin: targetAdmin });
    }

    // Check capacity limit
    if (db) {
      const { count: activeCount } = await db
        .from('dashboard_admins')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (activeCount !== null && activeCount >= 3) {
        return res.status(409).json({
          error: 'تم استخدام الحسابات الإدارية الثلاثة (3/3). يجب إلغاء حساب إداري قديم أولاً قبل إعادة التفعيل.',
          code: 'ADMIN_SEATS_FULL',
          activeCount,
          maxCapacity: 3,
        });
      }
    } else {
      const activeCount = inMemoryDashboardAdmins.filter(a => a.status === 'active').length;
      if (activeCount >= 3) {
        return res.status(409).json({
          error: 'تم استخدام الحسابات الإدارية الثلاثة (3/3). يجب إلغاء حساب إداري قديم أولاً قبل إعادة التفعيل.',
          code: 'ADMIN_SEATS_FULL',
          activeCount,
          maxCapacity: 3,
        });
      }
    }

    targetAdmin.status = 'active';
    targetAdmin.revoked_at = null;
    targetAdmin.updated_at = new Date().toISOString();

    if (db) {
      const { error: updateErr } = await db.from('dashboard_admins').update({
        status: 'active',
        revoked_at: null,
        updated_at: new Date().toISOString(),
      }).eq('user_id', userId);

      if (updateErr && isProd) {
        return res.status(503).json({
          error: `تعذر إعادة تفعيل الحساب في قاعدة البيانات: ${updateErr.message}`,
          code: 'DATABASE_UNAVAILABLE',
        });
      }

      // Audit Log
      try {
        await db.from('moderation_logs').insert({
          id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          moderator_user_id: actor?.id || 'system',
          target_type: 'dashboard_admin',
          target_id: userId,
          action: 'restore_admin',
          reason: `إعادة تفعيل المشرف: ${targetAdmin.display_name}`,
          created_at: new Date().toISOString(),
        });
      } catch (_) {}
    }

    res.json({
      success: true,
      message: `تم إعادة تفعيل الحساب الإداري للمشرف (${targetAdmin.display_name}) بنجاح`,
      admin: targetAdmin,
    });
  } catch (err: any) {
    res.status(500).json({ error: `فشل إعادة تفعيل الحساب الإداري: ${err.message}` });
  }
}

