import https from 'https';

export interface DeepSeekAnalysisResult {
  similarityScore: number;
  matchVerdict: 'full_match' | 'partial_match' | 'no_match';
  matchedKeywords: string[];
  missingKeywords: string[];
  explanation?: string;
}

/**
 * Call DeepSeek API for deep semantic question-vs-answer comparison
 */
export async function compareWithDeepSeek(
  questionText: string,
  extractedAnswer: string,
  apiKey: string = process.env.DEEPSEEK_API_KEY || '',
  modelAnswer: string = ''
): Promise<DeepSeekAnalysisResult | null> {
  const effectiveKey = apiKey.trim() || process.env.DEEPSEEK_API_KEY || '';
  if (!effectiveKey) {
    return null;
  }

  const prompt = `أنت خبير في تصحيح إجابات الطلاب ومقارنتها بالإجابة النموذجية.
استخدم السؤال لفهم المطلوب، ثم قارن إجابة الطالب المستخرجة من الصورة مع الإجابة النموذجية. لا تعتبر تشابه كلمات السؤال مع الجواب دليلًا على صحة الإجابة.

[السؤال]:
${questionText}

[الإجابة النموذجية]:
${modelAnswer || 'غير متوفرة؛ قيّم الإجابة بناءً على السؤال والمعرفة العلمية الظاهرة.'}

[إجابة الطالب المستخرجة من الصورة]:
${extractedAnswer}

أعد الإجابة بصيغة JSON فقط بهذا الشكل المحدد بدقة دون أي علامات markdown إضافية:
{
  "similarityScore": 85,
  "matchVerdict": "full_match" | "partial_match" | "no_match",
  "matchedKeywords": ["كلمة1", "كلمة2"],
  "missingKeywords": ["كلمة3"],
  "explanation": "شرح مختصر لمدى دقة التطابق بالعربية"
}`;

  const payload = JSON.stringify({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: 'You are a precise JSON-only comparison evaluator.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.1,
    max_tokens: 500,
    response_format: { type: 'json_object' }
  });

  return new Promise((resolve, reject) => {
    const options: https.RequestOptions = {
      hostname: 'api.deepseek.com',
      port: 443,
      path: '/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${effectiveKey}`,
        'Content-Length': Buffer.byteLength(payload),
      },
      timeout: 15000,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const content = json.choices?.[0]?.message?.content;
          if (!content) {
            reject(new Error(`لم تُرجع DeepSeek نتيجة قابلة للقراءة (HTTP ${res.statusCode})`));
            return;
          }

          const parsed = JSON.parse(content);
          resolve({
            similarityScore: Math.min(100, Math.max(0, Number(parsed.similarityScore) || 0)),
            matchVerdict: ['full_match', 'partial_match', 'no_match'].includes(parsed.matchVerdict)
              ? parsed.matchVerdict
              : 'partial_match',
            matchedKeywords: Array.isArray(parsed.matchedKeywords) ? parsed.matchedKeywords : [],
            missingKeywords: Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords : [],
            explanation: parsed.explanation || '',
          });
        } catch (e: any) {
          const message = e instanceof SyntaxError
            ? 'تعذر تحليل استجابة DeepSeek بصيغة JSON'
            : (e?.message || 'تعذر قراءة استجابة DeepSeek');
          console.warn('DeepSeek parse error:', message);
          reject(new Error(message));
        }
      });
    });

    req.on('error', (err) => {
      console.warn('DeepSeek network error:', err.message);
      reject(new Error(`تعذر الاتصال بـ DeepSeek: ${err.message}`));
    });

    req.on('timeout', () => {
      req.destroy(new Error('انتهت مهلة استجابة DeepSeek (15 ثانية)'));
    });

    req.write(payload);
    req.end();
  });
}
