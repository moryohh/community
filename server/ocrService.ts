import https from 'https';
import { GoogleGenAI } from '@google/genai';

const DEFAULT_OCR_KEY = process.env.OCR_API_KEY || '';

export interface OcrExtractionResult {
  text: string;
  durationMs: number;
  engineUsed: string;
  success: boolean;
  error?: string;
  rawResponse?: any;
}

/**
 * Extract clean Base64 data and standard MIME type from any data URL or raw Base64 string
 */
export function cleanImageBase64(input: string): { cleanBase64: string; mimeType: string; dataUrl: string } {
  let raw = (input || '').trim();
  let mimeType = 'image/jpeg';

  if (raw.startsWith('data:')) {
    const commaIndex = raw.indexOf(',');
    if (commaIndex !== -1) {
      const header = raw.slice(0, commaIndex);
      const mimeMatch = header.match(/data:([^;]+)/i);
      if (mimeMatch && mimeMatch[1]) {
        let extractedMime = mimeMatch[1].toLowerCase().trim();
        if (extractedMime === 'image/jpg') extractedMime = 'image/jpeg';
        if (['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'].includes(extractedMime)) {
          mimeType = extractedMime;
        }
      }
      raw = raw.slice(commaIndex + 1);
    }
  }

  // Strip all whitespace, line breaks, carriage returns, tabs, URL escapes
  const cleanBase64 = raw.replace(/[\s\r\n\t]+/g, '');
  const dataUrl = `data:${mimeType};base64,${cleanBase64}`;

  return { cleanBase64, mimeType, dataUrl };
}

/**
 * Map language input to valid OCR.Space language and compatible OCR Engine
 * Note: For Arabic in OCR.Space, OCREngine '3' or '1' is required. 
 * If language is 'ara', OCREngine 3 / 1 supports it best.
 */
function resolveOcrSpaceConfig(langInput?: string, enginePreference: string = '3'): { language: string; ocrEngine: string } {
  const normalized = (langInput || 'ara').toLowerCase().trim();

  // Arabic variants
  if (normalized === 'ara' || normalized === 'ar' || normalized === 'arabic') {
    return { language: 'ara', ocrEngine: enginePreference === '1' ? '1' : '3' };
  }

  // English variants
  if (normalized === 'eng' || normalized === 'en' || normalized === 'english') {
    return { language: 'eng', ocrEngine: '2' };
  }

  // Common languages requiring Engine 1 or 3 in OCR.Space
  const standardLanguages = ['ara', 'bul', 'chs', 'cht', 'hrv', 'cze', 'dan', 'dut', 'fin', 'fre', 'ger', 'gre', 'hun', 'kor', 'ita', 'jpn', 'nor', 'pol', 'por', 'rus', 'slv', 'spa', 'swe', 'tur'];
  if (standardLanguages.includes(normalized)) {
    return { language: normalized, ocrEngine: enginePreference };
  }

  // Default to Arabic with Engine 3
  return { language: 'ara', ocrEngine: '3' };
}

/**
 * Call OCR.Space API using multipart or form-data
 */
async function callOcrSpace(
  imageBase64: string,
  apiKey: string,
  language: string = 'ara',
  engineChoice: string = '3'
): Promise<string> {
  const { cleanBase64, mimeType, dataUrl } = cleanImageBase64(imageBase64);

  if (!cleanBase64 || cleanBase64.length < 20) {
    throw new Error('بيانات الصورة فارغة أو غير صالحة');
  }

  // Detect filetype from header
  let filetype = 'JPG';
  if (mimeType.includes('png')) filetype = 'PNG';
  else if (mimeType.includes('webp')) filetype = 'WEBP';
  else if (mimeType.includes('gif')) filetype = 'GIF';

  const { language: resolvedLang, ocrEngine } = resolveOcrSpaceConfig(language, engineChoice);

  const postParams: Record<string, string> = {
    apikey: apiKey.trim() || DEFAULT_OCR_KEY,
    base64Image: dataUrl,
    language: resolvedLang,
    filetype: filetype,
    isOverlayRequired: 'false',
    detectOrientation: 'true',
    scale: 'true',
  };

  // Only attach OCREngine if needed
  if (ocrEngine) {
    postParams.OCREngine = ocrEngine;
  }

  const postData = new URLSearchParams(postParams).toString();

  const options: https.RequestOptions = {
    hostname: 'api.ocr.space',
    port: 443,
    path: '/parse/image',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
      'apikey': apiKey.trim() || DEFAULT_OCR_KEY,
    },
    timeout: 20000,
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.IsErroredOnProcessing) {
            const msg = Array.isArray(json.ErrorMessage)
              ? json.ErrorMessage.join(', ')
              : json.ErrorMessage || 'خطأ في معالجة OCR.Space';
            return reject(new Error(msg));
          }

          if (!json.ParsedResults || json.ParsedResults.length === 0) {
            return resolve('');
          }

          const parsedText = json.ParsedResults
            .map((r: any) => r.ParsedText || '')
            .join('\n')
            .trim();

          resolve(parsedText);
        } catch (e: any) {
          reject(new Error(`استجابة غير متوقعة من OCR.Space: ${e.message} (كود: ${res.statusCode})`));
        }
      });
    });

    req.on('error', (err) => {
      reject(new Error(`تعذر الاتصال بخادم OCR.Space: ${err.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('انتهت مهلة استجابة OCR.Space (20 ثانية)'));
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Intelligent Fallback: Extract text from image via Gemini Vision (gemini-3.7-flash)
 */
async function callGeminiVision(imageBase64: string): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const { cleanBase64, mimeType } = cleanImageBase64(imageBase64);

  if (!cleanBase64 || cleanBase64.length < 20) {
    throw new Error('Invalid or empty image base64 data');
  }

  const ai = new GoogleGenAI({
    apiKey: geminiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3.7-flash',
    contents: {
      parts: [
        {
          inlineData: {
            data: cleanBase64,
            mimeType: mimeType,
          },
        },
        {
          text: 'استخرج كافة النصوص المكتوبة في هذه الصورة بدقة بالغة وبنفس الترتيب. اكتب النص المستخرج فقط دون أي مقدمة أو تعليق إضافي.',
        },
      ],
    },
  });

  return response.text?.trim() || '';
}

/**
 * Multi-Engine Resilient OCR Extractor
 */
export async function extractTextFromImage(
  imageBase64: string,
  apiKey: string = DEFAULT_OCR_KEY,
  language: string = 'ara'
): Promise<OcrExtractionResult> {
  const startTime = Date.now();
  let errors: string[] = [];

  // Attempt 1: OCR.Space with Engine 3
  try {
    const text = await callOcrSpace(imageBase64, apiKey, language, '3');
    if (text && text.trim().length > 0) {
      return {
        text: text.trim(),
        durationMs: Date.now() - startTime,
        engineUsed: `OCR.Space Engine 3 (Key: ${apiKey.slice(0, 4)}***)`,
        success: true,
      };
    }
  } catch (err: any) {
    console.warn('OCR.Space (Engine 3) call note:', err.message);
    errors.push(`OCR.Space E3: ${err.message}`);
  }

  // Attempt 2: OCR.Space retry with Engine 1
  try {
    const text = await callOcrSpace(imageBase64, apiKey, language, '1');
    if (text && text.trim().length > 0) {
      return {
        text: text.trim(),
        durationMs: Date.now() - startTime,
        engineUsed: `OCR.Space Engine 1 (Key: ${apiKey.slice(0, 4)}***)`,
        success: true,
      };
    }
  } catch (err: any) {
    console.warn('OCR.Space (Engine 1) call note:', err.message);
    errors.push(`OCR.Space E1: ${err.message}`);
  }

  // Attempt 3: Intelligent High-Accuracy Vision (Gemini 3.7 Flash)
  try {
    const text = await callGeminiVision(imageBase64);
    if (text && text.trim().length > 0) {
      return {
        text: text.trim(),
        durationMs: Date.now() - startTime,
        engineUsed: 'Intelligent Vision OCR (Gemini 3.7 Flash)',
        success: true,
      };
    }
  } catch (fallbackErr: any) {
    console.error('Intelligent fallback also failed:', fallbackErr.message);
    errors.push(`Vision Fallback: ${fallbackErr.message}`);
  }

  // If all failed, return diagnostic result
  return {
    text: '',
    durationMs: Date.now() - startTime,
    engineUsed: 'None (Processing Failed)',
    success: false,
    error: errors.join(' | '),
  };
}
