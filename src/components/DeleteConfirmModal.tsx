import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { OcrProject } from '../types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  project: OcrProject | null;
  isDeleting: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  project,
  isDeleting,
}) => {
  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h3 className="text-base font-bold text-slate-900 mb-1">
            تأكيد حذف مشروع OCR
          </h3>

          <p className="text-sm text-slate-600 mb-4 leading-relaxed">
            هل أنت متأكد من حذف المشروع <strong className="text-slate-900 font-bold">"{project.name}"</strong> (ترتيب #{project.priority_order}) من جدول ocr_projects؟
          </p>

          {project.is_current_leader && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 font-medium mb-4 text-right">
              ⚠️ تنبيه: هذا المشروع هو <strong>القائد الحالي</strong>، سيتم نقل القيادة تلقائياً إلى مشروع نشط آخر عند الحذف.
            </div>
          )}

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="w-1/2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="w-1/2 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-lg shadow-xs transition-colors disabled:opacity-60"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isDeleting ? 'جاري الحذف...' : 'تأكيد الحذف'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
