import React, { useState } from 'react';
import {
  Code,
  Copy,
  Check,
  Globe,
  Radio,
  Sparkles,
  Server,
  Layers,
  ArrowRight,
  ShieldCheck,
  Terminal,
  Activity,
  Zap,
} from 'lucide-react';
import { OcrProject, OcrComparisonResult } from '../types';

interface ApiGatewayDocsProps {
  projects: OcrProject[];
  incomingTasks: OcrComparisonResult[];
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ApiGatewayDocs: React.FC<ApiGatewayDocsProps> = ({
  projects,
  incomingTasks,
  showToast,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeSnippetTab, setActiveSnippetTab] = useState<'curl' | 'python' | 'js'>('curl');

  const originUrl = window.location.origin;
  const ingestionEndpoint = `${originUrl}/api/v1/ocr/process`;
  const leaderProject = projects.find((p) => p.is_current_leader && p.status === 'active');

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('تم نسخ الرابط/الكود بنجاح');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const curlSnippet = `curl -X POST "${ingestionEndpoint}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "questionText": "ما هو نص السؤال للمقارنة مع الجواب المستخرج؟",
    "language": "ara"
  }'`;

  const pythonSnippet = `import requests

url = "${ingestionEndpoint}"
payload = {
    "imageBase64": "data:image/jpeg;base64,...",
    "questionText": "نص السؤال للمقارنة مع نص الصورة",
    "language": "ara"
}

response = requests.post(url, json=payload)
data = response.json()

print("Image ID:", data["image_id"])
print("Extracted Answer:", data["extracted_answer"])
print("Similarity Score:", data["similarity_score"], "%")
print("Dispatched To Project:", data["dispatched_to_project"])`;

  const jsSnippet = `const res = await fetch("${ingestionEndpoint}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    imageBase64: "data:image/jpeg;base64,...",
    questionText: "نص السؤال للمقارنة مع نص الصورة",
    language: "ara"
  })
});

const data = await res.json();
console.log("Image ID:", data.image_id);
console.log("Extracted Answer:", data.extracted_answer);
console.log("Match Verdict:", data.match_verdict);`;

  return (
    <div className="space-y-6 text-right">
      
      {/* Top Architecture Overview Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg text-white">بوابة الربط البرمجي وتوجيه الطلبات (Ingestion API Gateway)</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  جاهز للاستقبال
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                تستقبل هذه النقطة الصور من منصتك الخارجية، وتوجهها إلى القواعد المشرفة الفرعية لمعالجة الـ OCR ومقارنة الجواب بالسؤال
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 text-xs">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-slate-300">القاعدة القائدة الحالية:</span>
            <span className="font-bold text-emerald-400 font-mono">
              {leaderProject ? leaderProject.name : 'قيد التعيين'}
            </span>
          </div>
        </div>

        {/* Endpoint URL Bar */}
        <div className="bg-slate-950/80 border border-slate-700/80 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-mono font-bold text-xs shrink-0">
              POST
            </span>
            <span className="font-mono text-xs text-emerald-300 select-all truncate" dir="ltr">
              {ingestionEndpoint}
            </span>
          </div>
          <button
            type="button"
            onClick={() => copyText(ingestionEndpoint, 'endpoint')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold border border-slate-600 transition-colors shrink-0 cursor-pointer"
          >
            {copiedKey === 'endpoint' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>تم النسخ</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>نسخ الرابط للمنصة</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Integration & Dispatch Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Code Snippets (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">أمثلة الربط البرمجي مع منصتك</h3>
            </div>
            
            {/* Snippet Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setActiveSnippetTab('curl')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activeSnippetTab === 'curl' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                cURL
              </button>
              <button
                onClick={() => setActiveSnippetTab('python')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activeSnippetTab === 'python' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Python
              </button>
              <button
                onClick={() => setActiveSnippetTab('js')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activeSnippetTab === 'js' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                JavaScript
              </button>
            </div>
          </div>

          <div className="relative">
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed max-h-72 border border-slate-800" dir="ltr">
              {activeSnippetTab === 'curl' && curlSnippet}
              {activeSnippetTab === 'python' && pythonSnippet}
              {activeSnippetTab === 'js' && jsSnippet}
            </pre>
            <button
              onClick={() => {
                const text = activeSnippetTab === 'curl' ? curlSnippet : activeSnippetTab === 'python' ? pythonSnippet : jsSnippet;
                copyText(text, 'snippet');
              }}
              className="absolute top-3 right-3 p-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
              title="نسخ الكود"
            >
              {copiedKey === 'snippet' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-600">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>مواصفات الاستجابة الفورية (JSON Response):</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed text-slate-600">
              <li><strong className="text-slate-800">image_id:</strong> معرّف فريد تم توليده للصورة (مثل: <code className="text-emerald-700">#img_...</code>).</li>
              <li><strong className="text-slate-800">extracted_answer:</strong> النص المستخرج من الصورة عبر محرك OCR.</li>
              <li><strong className="text-slate-800">similarity_score:</strong> نسبة التطابق بين السؤال والجواب (0-100%).</li>
              <li><strong className="text-slate-800">dispatched_to_project:</strong> القاعدة القائدة التي عالجت الطلب وسُجلت في حملها.</li>
            </ul>
          </div>
        </div>

        {/* Right: Architecture & Dispatch Flow (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">مسار توجيه الطلبات وتوزيع الحمل</h3>
          </div>

          <div className="space-y-3 text-xs">
            
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                1
              </div>
              <div>
                <h4 className="font-bold text-slate-900">المنصة الخارجية (External Platform)</h4>
                <p className="text-slate-500 mt-0.5">ترسل الصورة ونص السؤال المطلوب برمجياً عبر الـ API Endpoint.</p>
              </div>
            </div>

            <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h4 className="font-bold text-emerald-950">قاعدة المشرف والمنظم (Supervisor Orchestrator)</h4>
                <p className="text-emerald-800 mt-0.5">تولد معرّفاً فريداً لكل صورة، وتفحص القواعد الفرعية لاختيار القائد النشط.</p>
              </div>
            </div>

            <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                3
              </div>
              <div>
                <h4 className="font-bold text-blue-950">محرك استخراج النصوص (OCR Engine)</h4>
                <p className="text-blue-800 mt-0.5">استخراج النص (الجواب) مع محرك OCR المرن واحتياطي الذكاء التوليدي الفوري.</p>
              </div>
            </div>

            <div className="p-3 bg-indigo-50/50 border border-indigo-200 rounded-xl flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-700 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                4
              </div>
              <div>
                <h4 className="font-bold text-indigo-950">توزيع الحمل التلقائي (Round-Robin) ورصد الأداء</h4>
                <p className="text-indigo-800 mt-0.5">توجيه كل طلب بالتساوي للقاعدة التالية بالترتيب (طلب لكل قاعدة)، مع تسجيل دقيق للطلبات الناجحة والفاشلة وإمكانية التعافي التلقائي (Failover).</p>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
