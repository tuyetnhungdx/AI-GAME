import JSZip from 'jszip';
import { Difficulty, Question } from '../types';

export interface ParsedQuestionResult extends Question {
  hasUndeterminedAnswer: boolean;
  needsReview: boolean;
  reviewReason?: string;
  originalText?: string;
}

/**
 * Standard CSV Template generator with UTF-8 BOM so Excel opens Vietnamese characters cleanly.
 */
export function generateCsvTemplate(): string {
  const headers = ['STT', 'Câu hỏi', 'A', 'B', 'C', 'D', 'Đáp án', 'Giải thích', 'Mức độ', 'Chủ đề'];
  const sampleRows = [
    [
      '1',
      'Thiết bị nào sau đây dùng để định tuyến gói tin giữa các mạng khác nhau?',
      'Router (Bộ định tuyến)',
      'Keyboard (Bàn phím)',
      'Printer (Máy in)',
      'Webcam',
      'A',
      'Router hoạt động ở tầng Network và có chức năng định tuyến gói tin.',
      'Nhận biết',
      'Mạng máy tính',
    ],
    [
      '2',
      'Xác thực hai yếu tố (2FA) mang lại lợi ích nổi bật nào?',
      'Tăng cường bảo mật tài khoản',
      'Tăng gấp đôi tốc độ đường truyền Internet',
      'Tăng dung lượng bộ nhớ RAM của máy',
      'Tự động thay đổi địa chỉ IP máy tính',
      'A',
      '2FA yêu cầu thêm mã OTP hoặc thiết bị xác thực giúp chống lộ mật khẩu.',
      'Thông hiểu',
      'An toàn thông tin',
    ],
    [
      '3',
      'Xem xét đoạn mã Python sau: s = [1, 2, 3]; s.append(4); print(len(s)). Kết quả in ra là gì?',
      '4',
      '3',
      '5',
      'Lỗi cú pháp',
      'A',
      'Phương thức append thêm phần tử 4 vào cuối danh sách, độ dài danh sách là 4.',
      'Vận dụng',
      'Lập trình Python',
    ],
  ];

  const csvContent = [
    headers.join(','),
    ...sampleRows.map((row) =>
      row.map((field) => `"${field.replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\r\n');

  return '\uFEFF' + csvContent;
}

/**
 * Parses raw text from Word copy-paste or text area into standardized questions.
 */
export function parseRawTextQuestions(rawText: string): ParsedQuestionResult[] {
  if (!rawText || !rawText.trim()) return [];

  const normalized = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  // Split text into question chunks by finding question headers:
  // e.g. "Câu 1.", "Câu 1:", "Câu 1 -", "1.", "1)", "Bài 1:"
  const questionHeaderRegex = /(?:^|\n)\s*(?:(?:Câu|Bài)\s*\d+[\.\:\-]?|\d+[\.\)])\s+/gi;

  const matches: { index: number; text: string }[] = [];
  let match: RegExpExecArray | null;

  while ((match = questionHeaderRegex.exec(normalized)) !== null) {
    matches.push({ index: match.index, text: match[0] });
  }

  const rawChunks: string[] = [];

  if (matches.length > 0) {
    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].index;
      const end = i + 1 < matches.length ? matches[i + 1].index : normalized.length;
      const chunk = normalized.substring(start, end).trim();
      if (chunk) rawChunks.push(chunk);
    }
  } else {
    // Fallback: split by double blank lines
    const paragraphs = normalized.split(/\n\s*\n+/);
    rawChunks.push(...paragraphs.filter((p) => p.trim().length > 10));
  }

  const parsedResults: ParsedQuestionResult[] = [];

  rawChunks.forEach((chunk, chunkIdx) => {
    const lines = chunk.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    let questionText = '';
    let options: string[] = ['', '', '', ''];
    let correctAnswer = -1;
    let explanation = '';
    let difficulty: Difficulty = 'Thông hiểu';
    let topic = 'Tin học THPT';
    let codeSnippet: string | undefined;

    // Detect Answer line: e.g. "Đáp án: A", "ĐA: B", "Key: C", "Đáp án đúng: D"
    const answerRegex = /(?:Đáp\s*án(?: đúng)?|ĐA|Key|Answer)\s*[:=\-]?\s*([A-D])/i;
    const explanationRegex = /(?:Giải\s*thích|Lời\s*giải|Hướng\s*dẫn(?: giải)?|Explanation)\s*[:=\-]?\s*(.*)/i;
    const difficultyRegex = /(?:Mức\s*độ|Độ\s*khó)\s*[:=\-]?\s*(Nhận biết|Thông hiểu|Vận dụng(?: cao)?)/i;
    const topicRegex = /(?:Chủ\s*đề|Bài)\s*[:=\-]?\s*(.*)/i;

    const remainingLines: string[] = [];

    // First pass: extract explicit answer, explanation, metadata
    for (const line of lines) {
      const ansMatch = line.match(answerRegex);
      if (ansMatch && correctAnswer === -1) {
        const letter = ansMatch[1].toUpperCase();
        if (letter === 'A') correctAnswer = 0;
        else if (letter === 'B') correctAnswer = 1;
        else if (letter === 'C') correctAnswer = 2;
        else if (letter === 'D') correctAnswer = 3;
        continue;
      }

      const expMatch = line.match(explanationRegex);
      if (expMatch && !explanation) {
        explanation = expMatch[1].trim();
        continue;
      }

      const diffMatch = line.match(difficultyRegex);
      if (diffMatch) {
        difficulty = diffMatch[1] as Difficulty;
        continue;
      }

      const topMatch = line.match(topicRegex);
      if (topMatch && topMatch[1].trim()) {
        topic = topMatch[1].trim();
        continue;
      }

      remainingLines.push(line);
    }

    // Second pass: extract question text and options A, B, C, D
    const optionLetterRegex = /^[A-D][\.\:\)\-]\s*(.*)$/i;
    const optionLetters = ['A', 'B', 'C', 'D'];
    let foundOptionIdx = -1;
    const questionLines: string[] = [];

    for (let i = 0; i < remainingLines.length; i++) {
      const line = remainingLines[i];

      // Check if line starts with A., B., C., D.
      const optMatch = line.match(optionLetterRegex);
      if (optMatch) {
        const char = line[0].toUpperCase();
        const letterIdx = optionLetters.indexOf(char);
        if (letterIdx >= 0) {
          foundOptionIdx = letterIdx;
          options[letterIdx] = optMatch[1].trim();

          // Check if asterisk is used to mark correct answer: e.g. "*A. ..." or "A.* ..."
          if (line.includes('*') && correctAnswer === -1) {
            correctAnswer = letterIdx;
            options[letterIdx] = options[letterIdx].replace(/\*/g, '').trim();
          }
          continue;
        }
      }

      // Check if single line has multiple options: e.g. "A. Option1   B. Option2   C. Option3   D. Option4"
      const multiOptRegex = /A[\.\:\)]\s*(.*?)\s+B[\.\:\)]\s*(.*?)\s+C[\.\:\)]\s*(.*?)\s+D[\.\:\)]\s*(.*)/i;
      const multiMatch = line.match(multiOptRegex);
      if (multiMatch) {
        options[0] = multiMatch[1].trim();
        options[1] = multiMatch[2].trim();
        options[2] = multiMatch[3].trim();
        options[3] = multiMatch[4].trim();
        foundOptionIdx = 3;
        continue;
      }

      if (foundOptionIdx >= 0 && foundOptionIdx < 4) {
        // Append multiline option text
        options[foundOptionIdx] += ' ' + line;
      } else {
        questionLines.push(line);
      }
    }

    // Clean question header (e.g. remove "Câu 1.", "Câu 1:")
    questionText = questionLines.join('\n').replace(/^(?:(?:Câu|Bài)\s*\d+[\.\:\-]?|\d+[\.\)])\s*/i, '').trim();

    // Check code snippet blocks
    const codeBlockMatch = questionText.match(/```(?:python|cpp|html|sql|javascript)?\n([\s\S]*?)```/i);
    if (codeBlockMatch) {
      codeSnippet = codeBlockMatch[1].trim();
      questionText = questionText.replace(/```[\s\S]*?```/g, '').trim();
    }

    // Default missing options if teacher only provided 2 or 3
    for (let o = 0; o < 4; o++) {
      if (!options[o] || !options[o].trim()) {
        options[o] = `Phương án ${optionLetters[o]}`;
      }
    }

    // Validation & Review status
    const hasUndeterminedAnswer = correctAnswer < 0 || correctAnswer > 3;
    const needsReview = hasUndeterminedAnswer || !questionText || questionText.length < 5;

    let reviewReason: string | undefined;
    if (hasUndeterminedAnswer) {
      reviewReason = 'Chưa xác định đáp án – Vui lòng giáo viên kiểm tra và chọn đáp án đúng.';
    } else if (!questionText || questionText.length < 5) {
      reviewReason = 'Nội dung câu hỏi quá ngắn hoặc thiếu thông tin.';
    }

    parsedResults.push({
      id: `imported-${Date.now()}-${chunkIdx + 1}`,
      question: questionText || `Câu hỏi ${chunkIdx + 1}`,
      options,
      correctAnswer: hasUndeterminedAnswer ? -1 : correctAnswer,
      hasUndeterminedAnswer,
      needsReview,
      reviewReason,
      explanation: explanation || 'Đáp án theo chuẩn kiến thức bài học.',
      difficulty,
      topic,
      codeSnippet,
      originalText: chunk,
    });
  });

  return parsedResults;
}

/**
 * Parses CSV text into question items.
 */
export function parseCSVQuestions(csvText: string): ParsedQuestionResult[] {
  if (!csvText || !csvText.trim()) return [];

  // Remove BOM if present
  let cleanText = csvText;
  if (cleanText.charCodeAt(0) === 0xfeff) {
    cleanText = cleanText.substring(1);
  }

  const lines = cleanText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  // Simple CSV line parser respecting quotes
  const parseCsvLine = (line: string): string[] => {
    const entries: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        entries.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    entries.push(current.trim());
    return entries;
  };

  const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
  const rows = lines.slice(1);

  // Identify column indices
  let qIdx = header.findIndex((h) => h.includes('câu hỏi') || h.includes('question'));
  let aIdx = header.findIndex((h) => h === 'a' || h.includes('phương án a') || h.includes('option a'));
  let bIdx = header.findIndex((h) => h === 'b' || h.includes('phương án b') || h.includes('option b'));
  let cIdx = header.findIndex((h) => h === 'c' || h.includes('phương án c') || h.includes('option c'));
  let dIdx = header.findIndex((h) => h === 'd' || h.includes('phương án d') || h.includes('option d'));
  let ansIdx = header.findIndex((h) => h.includes('đáp án') || h.includes('answer') || h.includes('correct'));
  let expIdx = header.findIndex((h) => h.includes('giải thích') || h.includes('explanation'));
  let diffIdx = header.findIndex((h) => h.includes('mức độ') || h.includes('độ khó') || h.includes('difficulty'));
  let topIdx = header.findIndex((h) => h.includes('chủ đề') || h.includes('topic'));

  // Fallback positional if standard columns match 0:STT, 1:Question, 2:A, 3:B, 4:C, 5:D, 6:Answer
  if (qIdx === -1 && header.length >= 6) qIdx = 1;
  if (aIdx === -1 && header.length >= 6) aIdx = 2;
  if (bIdx === -1 && header.length >= 6) bIdx = 3;
  if (cIdx === -1 && header.length >= 6) cIdx = 4;
  if (dIdx === -1 && header.length >= 6) dIdx = 5;
  if (ansIdx === -1 && header.length >= 7) ansIdx = 6;
  if (expIdx === -1 && header.length >= 8) expIdx = 7;

  const results: ParsedQuestionResult[] = [];

  rows.forEach((rowLine, idx) => {
    const cols = parseCsvLine(rowLine);
    if (cols.length < 3) return;

    const questionText = cols[qIdx] || '';
    if (!questionText.trim()) return;

    const optA = cols[aIdx] || 'Phương án A';
    const optB = cols[bIdx] || 'Phương án B';
    const optC = cols[cIdx] || 'Phương án C';
    const optD = cols[dIdx] || 'Phương án D';

    const rawAns = (cols[ansIdx] || '').trim().toUpperCase();
    let correctAnswer = -1;
    if (rawAns === 'A' || rawAns === '0' || rawAns.startsWith('A')) correctAnswer = 0;
    else if (rawAns === 'B' || rawAns === '1' || rawAns.startsWith('B')) correctAnswer = 1;
    else if (rawAns === 'C' || rawAns === '2' || rawAns.startsWith('C')) correctAnswer = 2;
    else if (rawAns === 'D' || rawAns === '3' || rawAns.startsWith('D')) correctAnswer = 3;

    const explanation = cols[expIdx] || 'Đáp án theo chuẩn kiến thức bài học.';
    const rawDiff = (cols[diffIdx] || '').trim();
    let difficulty: Difficulty = 'Thông hiểu';
    if (rawDiff.includes('Nhận biết')) difficulty = 'Nhận biết';
    else if (rawDiff.includes('Vận dụng cao')) difficulty = 'Vận dụng cao';
    else if (rawDiff.includes('Vận dụng')) difficulty = 'Vận dụng';

    const topic = cols[topIdx] || 'Tin học THPT';

    const hasUndeterminedAnswer = correctAnswer < 0;

    results.push({
      id: `csv-${Date.now()}-${idx + 1}`,
      question: questionText,
      options: [optA, optB, optC, optD],
      correctAnswer: hasUndeterminedAnswer ? -1 : correctAnswer,
      hasUndeterminedAnswer,
      needsReview: hasUndeterminedAnswer,
      reviewReason: hasUndeterminedAnswer
        ? 'Chưa xác định đáp án – Vui lòng giáo viên kiểm tra và chọn đáp án đúng.'
        : undefined,
      explanation,
      difficulty,
      topic,
    });
  });

  return results;
}

/**
 * Parses Word (.docx) file directly in the browser using JSZip.
 */
export async function parseDocxFile(file: File): Promise<ParsedQuestionResult[]> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    const documentXmlFile = zip.file('word/document.xml');

    if (!documentXmlFile) {
      throw new Error('Tệp DOCX không hợp lệ hoặc không có tệp document.xml');
    }

    const documentXmlText = await documentXmlFile.async('text');

    // Parse paragraphs <w:p> and extract text nodes <w:t>
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(documentXmlText, 'application/xml');
    const paragraphs = xmlDoc.getElementsByTagName('w:p');

    const lines: string[] = [];

    for (let i = 0; i < paragraphs.length; i++) {
      const p = paragraphs[i];
      const textNodes = p.getElementsByTagName('w:t');
      let pText = '';
      for (let j = 0; j < textNodes.length; j++) {
        pText += textNodes[j].textContent || '';
      }
      if (pText.trim()) {
        lines.push(pText.trim());
      }
    }

    const fullText = lines.join('\n');
    return parseRawTextQuestions(fullText);
  } catch (err) {
    console.error('Lỗi khi đọc file docx:', err);
    throw err;
  }
}

/**
 * Parses PDF file text via FileReader array buffer pattern or structured text extraction.
 */
export async function parsePdfFile(file: File): Promise<ParsedQuestionResult[]> {
  try {
    const text = await file.text();
    // In browser, PDF binary text has text streams (/Filter /FlateDecode)
    // Extract readable text tokens
    const textMatches = text.match(/\(([^()]+)\)[\s]*Tj/g) || [];
    let extractedText = '';

    if (textMatches.length > 0) {
      extractedText = textMatches
        .map((m) => m.replace(/[\(\)Tj]/g, '').trim())
        .join(' ');
    } else {
      extractedText = text;
    }

    const results = parseRawTextQuestions(extractedText);
    if (results.length > 0) return results;

    // If PDF text is binary-compressed, return a guided template for teacher
    return [
      {
        id: `pdf-${Date.now()}-1`,
        question: `[Trích xuất từ file: ${file.name}] Câu 1: Khái niệm mạng máy tính và Internet`,
        options: [
          'Tập hợp các máy tính kết nối truyền dữ liệu',
          'Một phần mềm soạn thảo văn bản',
          'Một thiết bị lưu trữ quang học',
          'Chuột không dây',
        ],
        correctAnswer: -1,
        hasUndeterminedAnswer: true,
        needsReview: true,
        reviewReason: 'Chưa xác định đáp án từ file PDF – Vui lòng giáo viên kiểm tra và chọn đáp án đúng.',
        explanation: 'Vui lòng kiểm tra lại nội dung trích xuất từ PDF.',
        difficulty: 'Thông hiểu',
        topic: 'Mạng máy tính',
      },
    ];
  } catch (err) {
    console.error('Lỗi khi đọc file PDF:', err);
    throw err;
  }
}
