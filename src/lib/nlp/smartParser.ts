import { Difficulty, GameType, Grade, Subject } from '../../types';

export interface ParsedNLPConfig {
  subject: Subject;
  grade: Grade;
  textbook: string;
  lessonTitle: string;
  count: number;
  difficultyDistribution: string;
  gameType: GameType;
  suggestedGameReason?: string;
  rawPrompt: string;
}

/**
 * Natural language interpreter that parses teacher's casual Vietnamese prompts into structured game configurations.
 */
export function parseNaturalLanguagePrompt(prompt: string): ParsedNLPConfig {
  const text = prompt.toLowerCase();

  // 1. Detect Subject
  let subject: Subject = 'Tin học';
  if (text.includes('toán') || text.includes('hình học') || text.includes('đại số')) subject = 'Toán';
  else if (text.includes('vật lí') || text.includes('vật lý')) subject = 'Vật lí';
  else if (text.includes('hóa học') || text.includes('hóa')) subject = 'Hóa học';
  else if (text.includes('sinh học') || text.includes('sinh')) subject = 'Sinh học';
  else if (text.includes('văn') || text.includes('ngữ văn')) subject = 'Ngữ văn';
  else if (text.includes('lịch sử') || text.includes('sử')) subject = 'Lịch sử';
  else if (text.includes('địa lí') || text.includes('địa lý') || text.includes('địa')) subject = 'Địa lí';
  else if (text.includes('tiếng anh') || text.includes('anh văn') || text.includes('english')) subject = 'Tiếng Anh';
  else if (text.includes('tin học') || text.includes('tin') || text.includes('python') || text.includes('code') || text.includes('lập trình')) subject = 'Tin học';

  // 2. Detect Grade
  let grade: Grade = '12';
  if (text.includes('lớp 10') || text.includes('khối 10') || text.includes('tin 10') || text.includes('k10') || text.includes('10')) grade = '10';
  else if (text.includes('lớp 11') || text.includes('khối 11') || text.includes('tin 11') || text.includes('k11') || text.includes('11')) grade = '11';
  else if (text.includes('lớp 12') || text.includes('khối 12') || text.includes('tin 12') || text.includes('k12') || text.includes('12')) grade = '12';

  // 3. Detect Textbook
  let textbook = 'Kết nối tri thức';
  if (text.includes('cánh diều')) textbook = 'Cánh Diều';
  else if (text.includes('chân trời') || text.includes('chân trời sáng tạo')) textbook = 'Chân trời sáng tạo';
  else if (text.includes('kết nối') || text.includes('kntt')) textbook = 'Kết nối tri thức';

  // 4. Detect Number of Questions
  let count = 10;
  const countMatch = text.match(/(\d+)\s*(?:câu|question|q)/i);
  if (countMatch) {
    const parsedCount = parseInt(countMatch[1], 10);
    if (parsedCount >= 3 && parsedCount <= 40) {
      count = parsedCount;
    }
  } else if (text.includes('khởi động') || text.includes('5 câu')) {
    count = 5;
  } else if (text.includes('15 câu')) {
    count = 15;
  } else if (text.includes('20 câu') || text.includes('kiểm tra')) {
    count = 20;
  }

  // 5. Detect Lesson Title / Topic
  let lessonTitle = `Bài học môn ${subject} lớp ${grade}`;
  const baiMatch = prompt.match(/(?:bài|chủ đề|nội dung|về)\s+([^,.;\n]+)/i);
  if (baiMatch && baiMatch[1].trim().length > 2) {
    lessonTitle = baiMatch[1].trim();
    if (!lessonTitle.toLowerCase().startsWith('bài') && !lessonTitle.toLowerCase().startsWith('chủ đề')) {
      lessonTitle = `Bài: ${lessonTitle}`;
    }
  } else if (text.includes('mạng máy tính') || text.includes('internet')) {
    lessonTitle = 'Bài 4: Mạng máy tính và Internet';
  } else if (text.includes('cơ sở dữ liệu') || text.includes('csdl') || text.includes('sql')) {
    lessonTitle = 'Bài 15: Hệ cơ sở dữ liệu quan hệ và SQL';
  } else if (text.includes('python') || text.includes('mảng') || text.includes('list')) {
    lessonTitle = 'Bài 8: Lập trình mảng và List trong Python';
  } else if (text.includes('ai') || text.includes('trí tuệ nhân tạo')) {
    lessonTitle = 'Bài 11: Trí tuệ nhân tạo và tương lai công nghệ';
  }

  // 6. Detect Difficulty Distribution
  let difficultyDistribution = '30% Nhận biết, 40% Thông hiểu, 30% Vận dụng';
  if (text.includes('nhận biết') && text.includes('vận dụng')) {
    difficultyDistribution = '30% Nhận biết, 40% Thông hiểu, 30% Vận dụng';
  } else if (text.includes('khó') || text.includes('vận dụng cao') || text.includes('nâng cao')) {
    difficultyDistribution = '20% Thông hiểu, 40% Vận dụng, 40% Vận dụng cao';
  } else if (text.includes('dễ') || text.includes('cơ bản') || text.includes('khởi động')) {
    difficultyDistribution = '60% Nhận biết, 40% Thông hiểu';
  }

  // 7. Detect Game Type & Suggest Smart Match
  let gameType: GameType = 'racing';
  let suggestedGameReason = 'Đường đua kiến thức tạo không khí thi đua tốc độ sôi nổi cho cả lớp';

  if (text.includes('đua') || text.includes('racing') || text.includes('đường đua')) {
    gameType = 'racing';
    suggestedGameReason = 'Đường đua xe tốc độ cao kích thích thi đua';
  } else if (text.includes('vòng quay') || text.includes('wheel') || text.includes('may mắn')) {
    gameType = 'wheel';
    suggestedGameReason = 'Vòng quay may mắn phù hợp cho tiết củng cố bài học';
  } else if (text.includes('bom') || text.includes('bomb') || text.includes('gỡ bom')) {
    gameType = 'bomb';
    suggestedGameReason = 'Gỡ bom kiến thức kịch tính cho câu hỏi phân loại';
  } else if (text.includes('mảnh ghép') || text.includes('puzzle') || text.includes('hình')) {
    gameType = 'puzzle';
    suggestedGameReason = 'Lật mảnh ghép khơi gợi tò mò qua hình ảnh công nghệ';
  } else if (text.includes('vũ trụ') || text.includes('space') || text.includes('phi thuyền')) {
    gameType = 'space';
    suggestedGameReason = 'Chinh phục vũ trụ với hành trình vượt hành tinh';
  } else if (text.includes('chướng ngại') || text.includes('castle') || text.includes('vượt ải')) {
    gameType = 'castle';
    suggestedGameReason = 'Vượt chướng ngại vật từng bước vững chắc';
  } else if (text.includes('kho báu') || text.includes('treasure') || text.includes('chìa khóa')) {
    gameType = 'treasure';
    suggestedGameReason = 'Săn kho báu thu thập chìa khóa mở rương bí mật';
  } else if (text.includes('đấu trường') || text.includes('arena') || text.includes('đội') || text.includes('team')) {
    gameType = 'arena';
    suggestedGameReason = 'Đấu trường kéo co năng lượng tri thức cho 2 đội';
  } else if (text.includes('triệu phú') || text.includes('millionaire') || text.includes('ai là triệu phú')) {
    gameType = 'millionaire';
    suggestedGameReason = 'Ai là triệu phú với 15 mốc điểm và 3 quyền trợ giúp';
  } else if (text.includes('bóng') || text.includes('balloon') || text.includes('bắn bóng')) {
    gameType = 'balloon';
    suggestedGameReason = 'Bắn bóng kiến thức thư giãn, tương tác nhanh';
  } else {
    // Smart heuristic based on question count and difficulty
    if (count <= 5) {
      gameType = 'balloon';
      suggestedGameReason = 'Gợi ý: 5 câu ngắn phù hợp nhất với Bắn bóng kiến thức để khởi động nhanh';
    } else if (count >= 15) {
      gameType = 'wheel';
      suggestedGameReason = 'Gợi ý: Số lượng 15 câu rất thích hợp với Vòng quay may mắn';
    } else if (difficultyDistribution.includes('Vận dụng cao')) {
      gameType = 'millionaire';
      suggestedGameReason = 'Gợi ý: Đề thi thử thách mức độ khó nên chơi dạng Ai là triệu phú';
    } else {
      gameType = 'racing';
      suggestedGameReason = 'Gợi ý: 10 câu trắc nghiệm chuẩn rất thích hợp cho Đường đua kiến thức';
    }
  }

  return {
    subject,
    grade,
    textbook,
    lessonTitle,
    count,
    difficultyDistribution,
    gameType,
    suggestedGameReason,
    rawPrompt: prompt,
  };
}
