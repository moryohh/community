import { Response } from 'express';
import { AuthenticatedRequest, getCommunityDbClient } from './communityAuth';

const COURSE_TITLES: Record<string, string> = {
  'november-comprehensive': 'دورة شهر تشرين الثاني',
};

type CourseReminderRecord = {
  id: string;
  course_id: string;
  course_title: string;
  user_id: string;
  user_name: string;
  user_email: string;
  created_at: string;
  updated_at: string;
};

const inMemoryCourseReminders: CourseReminderRecord[] = [];

function makeReminderId() {
  return `course_reminder_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function createCourseReminder(req: AuthenticatedRequest, res: Response) {
  try {
    const user = req.user;
    const courseId = typeof req.body?.course_id === 'string' ? req.body.course_id.trim() : '';
    const courseTitle = COURSE_TITLES[courseId];

    if (!user?.id || !user.email) {
      return res.status(400).json({
        error: 'تعذر تسجيل التذكير لأن جلسة المستخدم لا تحتوي على بريد إلكتروني موثق',
        code: 'USER_EMAIL_REQUIRED',
      });
    }

    if (!courseTitle) {
      return res.status(400).json({
        error: 'الدورة المطلوبة غير معروفة أو لا تقبل التذكير حاليًا',
        code: 'COURSE_NOT_REMINDABLE',
      });
    }

    const now = new Date().toISOString();
    const record: CourseReminderRecord = {
      id: makeReminderId(),
      course_id: courseId,
      course_title: courseTitle,
      user_id: user.id,
      user_name: user.displayName || user.email.split('@')[0] || 'طالب المنصة',
      user_email: user.email,
      created_at: now,
      updated_at: now,
    };

    const db = getCommunityDbClient();
    const isProd = process.env.NODE_ENV === 'production';

    if (!db && isProd) {
      return res.status(503).json({
        error: 'قاعدة بيانات المجتمع غير متصلة حاليًا، تعذر حفظ التذكير',
        code: 'DATABASE_UNAVAILABLE',
      });
    }

    if (db) {
      const { data: existing, error: existingError } = await db
        .from('course_reminders')
        .select('id')
        .eq('course_id', courseId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingError) {
        return res.status(503).json({
          error: `تعذر فحص تذكيرك السابق: ${existingError.message}`,
          code: 'DATABASE_QUERY_FAILED',
        });
      }

      const { data, error } = await db
        .from('course_reminders')
        .upsert(record, { onConflict: 'course_id,user_id' })
        .select('*')
        .single();

      if (error) {
        return res.status(503).json({
          error: `تعذر حفظ تذكير الدورة: ${error.message}`,
          code: 'DATABASE_WRITE_FAILED',
        });
      }

      return res.json({
        success: true,
        alreadyRegistered: Boolean(existing),
        reminder: data,
        message: existing ? 'تم تسجيل تذكيرك مسبقًا لهذه الدورة' : 'تم تسجيل تذكيرك بنجاح',
      });
    }

    const existingIndex = inMemoryCourseReminders.findIndex(
      (item) => item.course_id === courseId && item.user_id === user.id,
    );

    if (existingIndex >= 0) {
      return res.json({
        success: true,
        alreadyRegistered: true,
        reminder: inMemoryCourseReminders[existingIndex],
        message: 'تم تسجيل تذكيرك مسبقًا لهذه الدورة',
      });
    }

    inMemoryCourseReminders.unshift(record);
    return res.json({
      success: true,
      alreadyRegistered: false,
      reminder: record,
      message: 'تم تسجيل تذكيرك بنجاح',
    });
  } catch (error: any) {
    return res.status(500).json({
      error: `فشل تسجيل تذكير الدورة: ${error?.message || 'خطأ غير معروف'}`,
      code: 'REMINDER_CREATE_FAILED',
    });
  }
}

export async function listCourseReminders(req: AuthenticatedRequest, res: Response) {
  try {
    const db = getCommunityDbClient();
    const isProd = process.env.NODE_ENV === 'production';

    if (!db && isProd) {
      return res.status(503).json({
        error: 'قاعدة بيانات المجتمع غير متصلة حاليًا، تعذر جلب التذكيرات',
        code: 'DATABASE_UNAVAILABLE',
      });
    }

    let reminders: CourseReminderRecord[] = [];

    if (db) {
      const { data, error } = await db
        .from('course_reminders')
        .select('id, course_id, course_title, user_id, user_name, user_email, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(503).json({
          error: `تعذر جلب تذكيرات الدورات: ${error.message}`,
          code: 'DATABASE_QUERY_FAILED',
        });
      }

      reminders = (data || []) as CourseReminderRecord[];
    } else {
      reminders = [...inMemoryCourseReminders];
    }

    return res.json({
      success: true,
      count: reminders.length,
      reminders,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: `فشل جلب تذكيرات الدورات: ${error?.message || 'خطأ غير معروف'}`,
      code: 'REMINDER_LIST_FAILED',
    });
  }
}
