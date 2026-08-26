import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Image as ImageIcon,
  FileText,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Trash2,
  Eye,
  Crown,
  HelpCircle,
  FileQuestion,
  Layers,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Zap,
  RefreshCw,
  ArrowLeftRight,
  XCircle,
} from 'lucide-react';
import { OcrProject, OcrComparisonResult } from '../types';
import * as api from '../api';

interface OcrComparatorProps {
  projects: OcrProject[];
  onProjectLoadUpdated?: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const OcrComparator: React.FC<OcrComparatorProps> = ({
  projects,
  onProjectLoadUpdated,
  showToast,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{ name: string; size: number } | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [language, setLanguage] = useState<'ara' | 'eng'>('ara');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentResult, setCurrentResult] = useState<OcrComparisonResult | null>(null);
  const [history, setHistory] = useState<OcrComparisonResult[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<OcrComparisonResult | null>(null);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const leaderProject = projects.find((p) => p.is_current_leader && p.status === 'active');

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const items = await api.fetchOcrHistory();
      setHistory(items);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('يرجى اختيار ملف صورة صالح (PNG, JPG, JPEG, WEBP)', 'error');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      showToast('حجم الصورة كبير جداً (الحد الأقصى 20MB)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setImageMeta({ name: file.name, size: file.size });
      setCurrentResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Sample quick test generator
  const loadSample = (type: 'receipt' | 'exam') => {
    if (type === 'receipt') {
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 380;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 600, 380);
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 22px Tahoma, Arial';
        ctx.textAlign = 'right';
        ctx.fillText('فاتورة مبيعات إلكترونية', 560, 50);
        ctx.font = '16px Tahoma, Arial';
        ctx.fillText('رقم الفاتورة: INV-2026-984', 560, 95);
        ctx.fillText('اسم العميل: شركة الأفق للتقنية', 560, 135);
        ctx.fillText('الخدمة: معالجة المستندات والنصوص OCR', 560, 175);
        ctx.fillText('المبلغ الإجمالي: 1500 ريال سعودي', 560, 215);
        ctx.fillText('حالة الدفع: مدفوع بالكامل', 560, 255);
        ctx.fillText('تاريخ الإصدار: 19 أغسطس 2026', 560, 295);

        const dataUrl = canvas.toDataURL('image/png');
        setSelectedImage(dataUrl);
        setImageMeta({ name: 'sample-receipt.png', size: 45000 });
        setQuestionText('ما هو المبلغ الإجمالي للفاتورة واسم العميل؟');
      }
    } else if (type === 'exam') {
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 360;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 600, 360);
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 22px Tahoma, Arial';
        ctx.textAlign = 'right';
        ctx.fillText('نموذج إجابة الاختبار القياسي', 560, 50);
        ctx.font = '18px Tahoma, Arial';
        ctx.fillText('السؤال: عرّف الذكاء الاصطناعي التوليدي.', 560, 100);
        ctx.font = '16px Tahoma, Arial';
        ctx.fillText('الجواب: الذكاء الاصطناعي التوليدي هو فرع من فروع الذكاء الاصطناعي', 560, 150);
        ctx.fillText('يركز على إنشاء محتوى جديد كالنصوص والصور والأكواد البرمجية', 560, 190);
        ctx.fillText('بناءً على أنماط تدريبية سابقة.', 560, 230);
        ctx.fillText('الدرجة والتقييم: 100%', 560, 280);

        const dataUrl = canvas.toDataURL('image/png');
        setSelectedImage(dataUrl);
        setImageMeta({ name: 'sample-exam-answer.png', size: 40000 });
        setQuestionText('الذكاء الاصطناعي التوليدي يركز على إنشاء محتوى جديد كالنصوص والصور');
      }
    }
  };

  const handleProcessOcr = async () => {
    if (!selectedImage) {
      showToast('يرجى تحميل أو اختيار صورة أولاً', 'error');
      return;
    }

    if (!questionText.trim()) {
      showToast('يرجى كتابة نص السؤال للمقارنة مع جواب الصورة', 'error');
      return;
    }

    setIsProcessing(true);
    setCurrentResult(null);

    try {
      const result = await api.processOcrImage({
        imageBase64: selectedImage,
        questionText: questionText.trim(),
        fileName: imageMeta?.name || 'sandbox_test.png',
        fileSize: imageMeta?.size || 0,
        language: language,
      });

      setCurrentResult(result);
      showToast('تم استخراج النص والمقارنة بنجاح!', 'success');
      loadHistory();
      if (onProjectLoadUpdated) {
        onProjectLoadUpdated();
      }
    } catch (err: any) {
      showToast(err.message || 'فشلت معالجة OCR واستخراج النص', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    showToast('تم النسخ إلى الحافظة');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const activeDisplayResult = selectedHistoryItem || currentResult;

  return (
    <div className="space-y-6 text-right">
      
      {/* Notice Banner: Testing Sandbox Mode */}
      <div className="bg-amber-50/80 border border-amber-300/80 rounded-2xl p-4.5 text-xs text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-200/80 text-amber-900 flex items-center justify-center font-bold shrink-0">
            <FlaskConical className="w-5 h-5 text-amber-800" />
          </div>
          <div>
            <div className="font-bold text-amber-950 text-sm">بيئة الاختبار والمحاكاة التجريبية (Testing & Sandbox Lab)</div>
            <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
              هذه الواجهة مخصصة <strong>للتجربة والتحقق اليدوي فقط</strong>. في بيئة الإنتاج، تستقبل المنظومة الصور برمجياً عبر الـ API وتوجهها للقواعد المشرفة الفرعية تلقائياً.
            </p>
          </div>
        </div>

        {/* Engine status indicator */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-amber-200 text-slate-700 shrink-0 font-medium">
          <Zap className="w-3.5 h-3.5 text-emerald-600" />
          <span>محرك OCR مزدوج (مفتاح OCR + احتياطي ذكي)</span>
        </div>
      </div>

      {/* Main Grid: Upload & Question Form | Result & Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Image Upload & Question Input (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          
          {/* Card 1: Image Upload Zone */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">1. رفع صورة للتجربة</h3>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => loadSample('receipt')}
                  className="px-2.5 py-1 text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                >
                  نموذج تجريبي (فاتورة)
                </button>
                <button
                  type="button"
                  onClick={() => loadSample('exam')}
                  className="px-2.5 py-1 text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                >
                  نموذج تجريبي (إجابة)
                </button>
              </div>
            </div>

            {/* Dropzone */}
            <div
              ref={dropZoneRef}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer ${
                selectedImage
                  ? 'border-emerald-300 bg-emerald-50/20'
                  : 'border-slate-300 hover:border-emerald-400 bg-slate-50/60 hover:bg-emerald-50/10'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />

              {selectedImage ? (
                <div className="space-y-3">
                  <div className="relative inline-block max-h-48 rounded-lg overflow-hidden border border-slate-200 shadow-xs">
                    <img
                      src={selectedImage}
                      alt="Uploaded preview"
                      className="max-h-48 w-auto object-contain mx-auto bg-slate-100"
                    />
                  </div>
                  <div className="text-xs text-slate-600 flex items-center justify-center gap-2">
                    <span className="font-semibold">{imageMeta?.name || 'صورة محددة'}</span>
                    <span>•</span>
                    <span>{imageMeta?.size ? `${Math.round(imageMeta.size / 1024)} KB` : 'جاهزة'}</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 font-medium">
                    انقر أو اسحب صورة أخرى للاستبدال
                  </p>
                </div>
              ) : (
                <div className="py-6 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-2">
                    <Upload className="w-6 h-6 text-slate-600" />
                  </div>
                  <div className="font-bold text-slate-800 text-sm">
                    اسحب وأفلت الصورة هنا أو <span className="text-emerald-700 underline underline-offset-2">تصفح ملفاتك</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    يدعم PNG, JPG, JPEG, WEBP بدقة عالية للغة العربية والإنجليزية
                  </p>
                </div>
              )}
            </div>

            {/* Language Selection */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-600 font-medium">لغة التعرف على النص:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLanguage('ara')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    language === 'ara'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  العربية (Arabic)
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('eng')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    language === 'eng'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  الإنجليزية (English)
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Question Text Input */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileQuestion className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">2. نص السؤال للمقارنة مع جواب الصورة</h3>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                {questionText.length} حرف
              </span>
            </div>

            <textarea
              rows={4}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="اكتب هنا نص السؤال المطلوب البحث عنه ومقارنته بالنص المستخرج من الصورة..."
              className="w-full p-3.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50/40 text-slate-900 leading-relaxed placeholder:text-slate-400"
            />

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500">
                القاعدة المشرفة القائدة: <strong className="text-emerald-700">{leaderProject?.name || 'قيد الاختيار'}</strong>
              </span>
              <button
                type="button"
                disabled={!selectedImage || !questionText.trim() || isProcessing}
                onClick={handleProcessOcr}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-700/20 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>جاري الاستخراج والمقارنة...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>تشغيل الاختبار والمقارنة</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Output & Comparison Result (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          
          {activeDisplayResult ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-200">
              
              {/* Result Header & Unique ID */}
              <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 font-medium">المعرّف الفريد للصورة (Unique Image ID):</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono font-bold text-sm text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md" dir="ltr">
                      #{activeDisplayResult.id}
                    </span>
                    <button
                      onClick={() => copyToClipboard(activeDisplayResult.id, 'id')}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                      title="نسخ المعرف الفريد"
                    >
                      {copiedField === 'id' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Match Verdict Badge */}
                <div className="text-left flex items-center gap-2">
                  {activeDisplayResult.failoverOccurred && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-300">
                      <RefreshCw className="w-3.5 h-3.5 text-purple-700 animate-spin-reverse" />
                      <span>تعافي وتحويل تلقائي</span>
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    activeDisplayResult.similarityScore >= 80
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : activeDisplayResult.similarityScore >= 30
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}>
                    {activeDisplayResult.similarityScore >= 80 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : activeDisplayResult.similarityScore >= 30 ? (
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                    )}
                    <span>نسبة التطابق: {activeDisplayResult.similarityScore}%</span>
                  </span>
                </div>
              </div>

              {/* Failover / Recovery Status Notice Box */}
              {activeDisplayResult.failoverOccurred && (
                <div className="mx-5 mt-4 p-3.5 bg-purple-50 border border-purple-200 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-purple-950 font-bold">
                    <RefreshCw className="w-4 h-4 text-purple-700" />
                    <span>سجل الطابور والتحويل التلقائي (Automatic Failover):</span>
                  </div>
                  {activeDisplayResult.failoverNote && (
                    <p className="text-purple-900 leading-relaxed font-medium">
                      {activeDisplayResult.failoverNote}
                    </p>
                  )}
                  {activeDisplayResult.attemptedBases && activeDisplayResult.attemptedBases.length > 0 && (
                    <div className="pt-2 border-t border-purple-200/70 flex flex-wrap items-center gap-2">
                      <span className="text-purple-900 font-semibold">تسلسل المحاولات في الطابور:</span>
                      {activeDisplayResult.attemptedBases.map((attempt, aIdx) => (
                        <div key={aIdx} className="flex items-center gap-1.5">
                          {aIdx > 0 && <ArrowRight className="w-3 h-3 text-purple-400" />}
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold ${
                              attempt.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : 'bg-rose-100 text-rose-900 border border-rose-300'
                            }`}
                            title={attempt.error || 'تمت بنجاح'}
                          >
                            {attempt.status === 'completed' ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            ) : (
                              <XCircle className="w-3 h-3 text-rose-700" />
                            )}
                            <span>{attempt.projectName}</span>
                            {attempt.status === 'failed' && (
                              <span className="text-[10px] text-rose-700 font-normal truncate max-w-28">
                                ({attempt.error})
                              </span>
                            )}
                            {attempt.durationMs && (
                              <span className="font-mono text-[10px] text-slate-500">
                                {attempt.durationMs}ms
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Similarity Score Visual Bar */}
              <div className="p-5 space-y-5">
                
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>مقياس التشابه بين السؤال والجواب المستخرج:</span>
                    <span className="font-mono text-emerald-800 font-bold">{activeDisplayResult.similarityScore}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        activeDisplayResult.similarityScore >= 80
                          ? 'bg-emerald-500'
                          : activeDisplayResult.similarityScore >= 30
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${activeDisplayResult.similarityScore}%` }}
                    />
                  </div>
                </div>

                {/* Matched Keywords Chips */}
                {activeDisplayResult.matchedKeywords && activeDisplayResult.matchedKeywords.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-700">الكلمات والمصطلحات المتطابقة:</span>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {activeDisplayResult.matchedKeywords.map((kw, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-xs font-medium"
                        >
                          ✓ {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Side-by-side / Structured Cards */}
                <div className="space-y-4 pt-1">
                  
                  {/* Card: Question */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <FileQuestion className="w-3.5 h-3.5 text-blue-600" />
                        <span>نص السؤال المطلوب:</span>
                      </span>
                      <button
                        onClick={() => copyToClipboard(activeDisplayResult.questionText, 'question')}
                        className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                      >
                        {copiedField === 'question' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed font-sans select-all whitespace-pre-wrap">
                      {activeDisplayResult.questionText}
                    </p>
                  </div>

                  {/* Card: Extracted Answer from Image */}
                  <div className="p-3.5 bg-emerald-50/40 border border-emerald-200 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        <span>النص المستخرج من الصورة (الجواب):</span>
                      </span>
                      <button
                        onClick={() => copyToClipboard(activeDisplayResult.extractedAnswer, 'answer')}
                        className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                      >
                        {copiedField === 'answer' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    {activeDisplayResult.extractedAnswer ? (
                      <p className="text-xs text-slate-900 leading-relaxed font-sans select-all whitespace-pre-wrap max-h-48 overflow-y-auto bg-white/70 p-2.5 rounded-lg border border-emerald-100">
                        {activeDisplayResult.extractedAnswer}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 italic p-2">
                        لم يتم العثور على نص واضح داخل الصورة.
                      </p>
                    )}
                  </div>

                  {/* DeepSeek Reasoning Explanation if available */}
                  {activeDisplayResult.explanation && (
                    <div className="p-3.5 bg-blue-50/50 border border-blue-200 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-blue-950 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                          <span>تحليل ومطابقة DeepSeek الدلالية:</span>
                        </span>
                      </div>
                      <p className="text-xs text-blue-900 leading-relaxed font-sans select-all whitespace-pre-wrap bg-white/80 p-2.5 rounded-lg border border-blue-100">
                        {activeDisplayResult.explanation}
                      </p>
                    </div>
                  )}

                </div>

                {/* Metadata Footnote */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>زمن المعالجة: {activeDisplayResult.processingTimeMs}ms</span>
                  </div>
                  {activeDisplayResult.processedByProject && (
                    <div className="flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5 text-amber-500" />
                      <span>المشروع القائد: {activeDisplayResult.processedByProject.name}</span>
                    </div>
                  )}
                </div>

              </div>

            </div>
          ) : (
            <div className="bg-slate-50/70 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-3 min-h-[380px] flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-slate-400">
                <Search className="w-7 h-7 text-slate-400" />
              </div>
              <h4 className="font-bold text-slate-700 text-sm">نتائج الاختبار والمقارنة ستظهر هنا</h4>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                ارفع صورة واكتب نص السؤال، ثم اضغط على زر التشغيل لاختبار استخراج النص ومطابقته فورياً وتوليد معرّف فريد للصورة.
              </p>
            </div>
          )}

        </div>

      </div>

      {/* Bottom Section: History of Processed Images */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-xs text-slate-800">
                سجل الطلبات والعمليات الحية ({history.length})
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
              >
                <span>{isHistoryExpanded ? 'طي السجل' : 'عرض السجل'}</span>
                {isHistoryExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (window.confirm('هل تريد مسح سجل العمليات بالكامل؟')) {
                    await api.clearOcrHistory();
                    setHistory([]);
                    setSelectedHistoryItem(null);
                    showToast('تم مسح السجل');
                  }
                }}
                className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 mr-3 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>مسح</span>
              </button>
            </div>
          </div>

          {isHistoryExpanded && (
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedHistoryItem(item)}
                  className={`p-3.5 hover:bg-slate-50 flex items-center justify-between gap-4 transition-colors cursor-pointer ${
                    activeDisplayResult?.id === item.id ? 'bg-emerald-50/30' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded shrink-0" dir="ltr">
                      #{item.id}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {item.questionText}
                        </p>
                        {item.failoverOccurred && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-bold rounded border border-purple-200 shrink-0">
                            <RefreshCw className="w-2.5 h-2.5 text-purple-600" />
                            تحويل تلقائي
                          </span>
                        )}
                        {item.status === 'failed' && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded border border-rose-200 shrink-0">
                            <XCircle className="w-2.5 h-2.5 text-rose-600" />
                            {item.failureStage === 'ocr' ? 'فشل OCR' : item.failureStage === 'deepseek' ? 'فشل DeepSeek' : 'فشلت'}
                          </span>
                        )}
                        {item.deepseekStatus === 'local_fallback' && item.status === 'completed' && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded border border-amber-200 shrink-0">
                            DeepSeek متوقف — مقارنة محلية
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {item.processedByProject ? `القاعدة: ${item.processedByProject.name} • ` : ''}
                        الجواب: {item.extractedAnswer || 'لا يوجد نص'}
                        {item.requestId ? ` • رقم الطلب: ${item.requestId}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                      item.similarityScore >= 80
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.similarityScore >= 30
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {item.similarityScore}% تطابق
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        api.deleteOcrHistoryItem(item.id);
                        setHistory(history.filter((h) => h.id !== item.id));
                        if (selectedHistoryItem?.id === item.id) setSelectedHistoryItem(null);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
