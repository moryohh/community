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
  apiKey: string = process.env.DEEPSEEK_API_KEY || ''
): Promise<DeepSeekAnalysisResult | null> {
  const effectiveKey = apiKey.trim() || process.env.DEEPSEEK_API_KEY || '';
  if (!effectiveKey) {
    return null;
  }

  const prompt = `أنت خبير في تدقيق ومطابقة إجابات الأسئلة مع النصوص المستخرجة من الصور (OCR).
قم بمقارنة السؤال التالي مع النص المستخرج من الصورة (الذي يمثل الجواب)، وقيم مدى التطابق وصحة الإجابة:

[السؤال]:
${questionText}

[النص المستخرج من الصورة (الجواب)]:
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

  return new Promise((resolve) => {
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
            resolve(null);
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
        } catch (e) {
          console.warn('DeepSeek parse error:', e);
          resolve(null);
        }
      });
    });

    req.on('error', (err) => {
      console.warn('DeepSeek network error:', err.message);
      resolve(null);
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });

    req.write(payload);
    req.end();
  });
}
