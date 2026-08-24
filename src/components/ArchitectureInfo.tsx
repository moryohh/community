import React, { useState } from 'react';
import { ShieldCheck, Info, ChevronDown, ChevronUp, Cpu, Network, Lock, Layers } from 'lucide-react';

export const ArchitectureInfo: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
      <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">
              بنية النظام والأمان (Architecture & Security)
            </h4>
            <p className="text-xs text-slate-500">
              فصل طبقة الواجهة عن أسرار Supabase وجاهزية وسيط توزيع الطلبات
            </p>
          </div>
        </div>
        <button className="text-slate-400 hover:text-slate-700 p-1">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>أمان مفاتيح Service Role</span>
            </div>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              مفاتيح الخدمة مخزنة حصرياً في الخادم الخلفي (Backend) ولا يتم إرسالها إلى المتصفح أبداً للحفاظ على أمان مشاريعك.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              <span>إدارة الحمل وتسليم القيادة</span>
            </div>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              يتم رصد عدد الطلبات المعالجة لكل قاعدة مع إمكانية التبديل اليدوي للقائد وتحديد حد الحمل الافتراضي (200 طلب).
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Network className="w-3.5 h-3.5 text-blue-600" />
              <span>جاهزية الربط مع Supabase Proxy</span>
            </div>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              البنية البرمجية مفصولة ومعيارية بالكامل، مما يتيح دمج طبقة التوجيه الآلي (Request Router) مستقبلاً بسلاسة.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
