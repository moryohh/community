import React, { useState } from 'react';
import { X, Key, Check, AlertCircle, ShieldCheck, Zap, Cpu, Eye, EyeOff } from 'lucide-react';

interface KeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  keyType: 'ocr' | 'deepseek' | 'service_role';
  projectName?: string;
  onSave: (key: string) => Promise<void>;
  isReplacing?: boolean;
}

export const KeyModal: React.FC<KeyModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  keyType,
  projectName,
  onSave,
  isReplacing,
}) => {
  const [keyValue, setKeyValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showKey, setShowKey] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!keyValue.trim()) {
      setError('يرجى إدخال قيمة المفتاح');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(keyValue.trim());
      setKeyValue('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء حفظ المفتاح');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIcon = () => {
    if (keyType === 'deepseek') return <Cpu className="w-5 h-5" />;
    if (keyType === 'service_role') return <Key className="w-5 h-5" />;
    return <Zap className="w-5 h-5" />;
  };

  const getHeaderBg = () => {
    if (keyType === 'deepseek') return 'bg-blue-600';
    if (keyType === 'service_role') return 'bg-indigo-600';
    return 'bg-amber-600';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${getHeaderBg()}`}>
              {getIcon()}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{title}</h3>
              <p className="text-xs text-slate-500">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-right">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {projectName && (
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between">
              <span className="text-slate-500">القاعدة المستهدفة:</span>
              <span className="font-bold text-slate-800">{projectName}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                {isReplacing ? 'المفتاح الجديد المطلوب استبداله' : 'قيمة المفتاح السري'}
              </label>
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showKey ? 'إخفاء' : 'كشف المفتاح'}</span>
              </button>
            </div>
            <input
              type={showKey ? 'text' : 'password'}
              dir="ltr"
              required
              placeholder={
                keyType === 'deepseek'
                  ? 'sk-...'
                  : keyType === 'service_role'
                  ? 'أدخل مفتاح Service Role من Supabase...'
                  : 'K86142339988957 أو مفتاح OCR...'
              }
              value={keyValue}
              onChange={(e) => setKeyValue(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            />
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {keyType === 'deepseek'
                ? 'يتم تعيين وتحديث مفتاح DeepSeek العام المشترك لجميع القواعد.'
                : keyType === 'service_role'
                ? 'يحدد مفتاح Service Role هذا دور وقدرات قاعدة Supabase في إدارة البيانات وتأكيد قيادتها.'
                : 'يتم ربط مفتاح OCR بهذه القاعدة وتحديث حالتها بنجاح.'}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white rounded-lg shadow-xs transition-all disabled:opacity-60 bg-blue-600 hover:bg-blue-700 cursor-pointer"
            >
              {isSubmitting ? (
                <span>جاري الحفظ...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isReplacing ? 'تأكيد الاستبدال' : 'حفظ المفتاح'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
