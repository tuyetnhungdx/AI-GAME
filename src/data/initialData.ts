import { ClassGroup, Game, ParticipantAnswer, Question, Room, TeacherProfile } from '../types';

export const initialTeacher: TeacherProfile = {
  id: 'teacher-tn-01',
  fullName: 'Trần Thị Tuyết Nhung',
  email: 'trannhungpninh@gmail.com',
  school: 'Trường THPT Nguyễn Dục',
  subject: 'Tin học',
  role: 'teacher',
  avatar: '👩‍🏫',
};

export const demoQuestionsTin12: Question[] = [
  {
    id: 'q1',
    question: 'Địa chỉ IPv4 bao gồm bao nhiêu bit và thường được biểu diễn dưới dạng nào?',
    options: [
      '32 bit, chia thành 4 nhóm số thập phân cách nhau bởi dấu chấm',
      '64 bit, chia thành 8 nhóm số thập lục phân',
      '128 bit, phân cách bằng dấu hai chấm',
      '16 bit, chia thành 2 nhóm số nhị phân'
    ],
    correctAnswer: 0,
    explanation: 'IPv4 gồm 32 bit (4 byte), mỗi byte biểu diễn từ 0–255 cách nhau bởi dấu chấm (ví dụ: 192.168.1.1).',
    difficulty: 'Nhận biết',
    topic: 'Mạng máy tính',
  },
  {
    id: 'q2',
    question: 'Đoạn mã Python sau thực hiện việc gì trên môi trường mạng?',
    options: [
      'Khởi tạo một TCP socket và kết nối tới web server qua cổng 80',
      'Tạo một UDP socket để truyền tệp tin âm thanh',
      'Tạo một máy chủ web lắng nghe cổng 80',
      'Gửi một bức thư điện tử qua cổng SMTP 25'
    ],
    correctAnswer: 0,
    explanation: 'socket.AF_INET đại diện cho địa chỉ IPv4, SOCK_STREAM là giao thức TCP hướng kết nối, cổng 80 là chuẩn HTTP.',
    difficulty: 'Thông hiểu',
    topic: 'Lập trình mạng Python',
    codeSnippet: `import socket
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect(("thptnguyenduc.edu.vn", 80))
print("Connected!")`,
    codeLanguage: 'python',
  },
  {
    id: 'q3',
    question: 'Thiết bị mạng nào hoạt động ở tầng Network (Tầng 3) và có chức năng định tuyến gói tin giữa các mạng khác nhau?',
    options: [
      'Router (Bộ định tuyến)',
      'Hub (Bộ chia tín hiệu)',
      'Switch tầng 2 (Bộ chuyển mạch)',
      'Repeater (Bộ lặp tín hiệu)'
    ],
    correctAnswer: 0,
    explanation: 'Router hoạt động ở tầng Mạng (Network layer), căn cứ vào địa chỉ IP đích để tìm đường đi tối ưu cho gói tin.',
    difficulty: 'Nhận biết',
    topic: 'Thiết bị mạng',
  },
  {
    id: 'q4',
    question: 'Xem xét đoạn code truy vấn thông tin máy tính sau, kết quả in ra màn hình là gì?',
    options: [
      'Tên máy chủ (hostname) và địa chỉ IP nội bộ của máy',
      'Tốc độ băng thông Internet',
      'Danh sách các cổng đang mở trên router',
      'Địa chỉ MAC của card mạng'
    ],
    correctAnswer: 0,
    explanation: 'Hàm gethostname() lấy tên máy chủ và gethostbyname() phân giải tên đó thành địa chỉ IP nội bộ.',
    difficulty: 'Vận dụng',
    topic: 'Lập trình mạng Python',
    codeSnippet: `import socket
hostname = socket.gethostname()
ip_addr = socket.gethostbyname(hostname)
print(f"Host: {hostname} | IP: {ip_addr}")`,
    codeLanguage: 'python',
  },
  {
    id: 'q5',
    question: 'Giao thức nào cung cấp kênh truyền thông được mã hóa an toàn (bảo mật SSL/TLS) khi duyệt web?',
    options: [
      'HTTPS (Port 443)',
      'HTTP (Port 80)',
      'FTP (Port 21)',
      'Telnet (Port 23)'
    ],
    correctAnswer: 0,
    explanation: 'HTTPS (HyperText Transfer Protocol Secure) sử dụng chứng chỉ SSL/TLS để mã hóa dữ liệu truyền tải trên mạng.',
    difficulty: 'Nhận biết',
    topic: 'An toàn thông tin mạng',
  },
  {
    id: 'q6',
    question: 'Trong kiến trúc Client - Server, khi máy khách gửi yêu cầu (Request) bằng phương thức POST, mục đích chính là gì?',
    options: [
      'Gửi dữ liệu lên máy chủ để xử lý hoặc lưu trữ (như gửi form, tạo tài nguyên mới)',
      'Chỉ để tải file ảnh về máy khách',
      'Xóa toàn bộ cơ sở dữ liệu trên server',
      'Kiểm tra xem mạng có bị đứt cáp quang không'
    ],
    correctAnswer: 0,
    explanation: 'Phương thức HTTP POST truyền dữ liệu trong phần body của request, thường dùng để gửi biểu mẫu, tạo bản ghi mới.',
    difficulty: 'Thông hiểu',
    topic: 'Kiến trúc Web & Mạng',
  },
  {
    id: 'q7',
    question: 'Đoạn mã HTML sau hiển thị một form đăng nhập. Thuộc tính method="POST" đảm bảo điều gì?',
    options: [
      'Dữ liệu biểu mẫu được đóng gói trong thân gói tin HTTP thay vì lộ trên thanh URL',
      'Tự động mã hóa mật khẩu bằng thuật toán lượng tử',
      'Form chỉ chạy được trên điện thoại di động',
      'Không cho phép người dùng gõ tiếng Việt'
    ],
    correctAnswer: 0,
    explanation: 'Khác với GET hiển thị tham số trực tiếp trên URL, POST truyền dữ liệu ngầm trong HTTP request body, an toàn hơn.',
    difficulty: 'Vận dụng',
    topic: 'Thiết kế Web & Giao thức',
    codeSnippet: `<form action="/api/login" method="POST">
  <input type="text" name="student_id" required>
  <input type="password" name="password" required>
  <button type="submit">Đăng nhập</button>
</form>`,
    codeLanguage: 'html',
  },
  {
    id: 'q8',
    question: 'Hệ thống tên miền (DNS - Domain Name System) giữ vai trò tương tự như thứ gì trong cuộc sống hàng ngày?',
    options: [
      'Danh bạ điện thoại (chuyển đổi tên miền dễ nhớ thành địa chỉ IP số học)',
      'Ổ khóa từ thông minh tại cửa ra vào',
      'Đồng hồ báo thức trong phòng ngủ',
      'Tấm vé xe buýt điện tử'
    ],
    correctAnswer: 0,
    explanation: 'DNS chuyển đổi tên miền như "thptnguyenduc.edu.vn" thành địa chỉ IP thực tế (ví dụ: 103.142.10.5) giống danh bạ tìm số theo tên.',
    difficulty: 'Thông hiểu',
    topic: 'Dịch vụ mạng DNS',
  },
  {
    id: 'q9',
    question: 'Khi lập trình mạng Python, khối lệnh nào sau đây xử lý lỗi mất kết nối mạng chuẩn xác nhất?',
    options: [
      'Sử dụng khối try - except socket.error để bắt biệt lệ và thông báo lỗi',
      'Chạy vòng lặp vô tận while True không có điểm dừng',
      'Sử dụng câu lệnh break ngay khi khởi tạo socket',
      'Tắt nguồn máy tính khi xảy ra xung đột'
    ],
    correctAnswer: 0,
    explanation: 'Lập trình mạng cần bọc kết nối trong khối try/except socket.error hoặc OSError để chương trình không bị crash bất ngờ.',
    difficulty: 'Vận dụng cao',
    topic: 'Lập trình mạng Python',
    codeSnippet: `import socket
try:
    s = socket.create_connection(("10.0.0.1", 80), timeout=3)
except socket.timeout:
    print("Hết thời gian chờ phản hồi từ máy chủ!")
except socket.error as err:
    print(f"Lỗi kết nối: {err}")`,
    codeLanguage: 'python',
  },
  {
    id: 'q10',
    question: 'Điện toán đám mây (Cloud Computing) mang lại ưu điểm nổi bật nào cho việc triển khai ứng dụng học tập?',
    options: [
      'Khả năng mở rộng linh hoạt, truy cập mọi lúc mọi nơi qua Internet mà không cần tự duy trì phần cứng đắt tiền',
      'Chỉ sử dụng được khi không có kết nối mạng',
      'Bắt buộc người dùng phải mua máy chủ vật lý đặt tại nhà',
      'Chỉ hỗ trợ máy tính bàn dùng hệ điều hành MS-DOS'
    ],
    correctAnswer: 0,
    explanation: 'Điện toán đám mây cho phép trường học và giáo viên tận dụng tài nguyên linh hoạt, chi phí tối ưu và truy cập mọi nơi.',
    difficulty: 'Thông hiểu',
    topic: 'Điện toán đám mây & Xu hướng công nghệ',
  }
];

export const demoGames: Game[] = [
  {
    id: 'game-racing-tin12',
    teacherId: 'teacher-tn-01',
    title: 'Đường đua kiến thức – Tin học 12 – Bài 4: Mạng máy tính & Internet',
    subject: 'Tin học',
    grade: '12',
    textbook: 'Kết nối tri thức',
    lesson: 'Bài 4: Mạng máy tính và Internet',
    gameType: 'racing',
    questions: demoQuestionsTin12,
    settings: {
      timePerQuestion: 20,
      showExplanation: true,
      allowRetry: true,
      shuffleQuestions: false,
      shuffleOptions: false,
      musicEnabled: true,
      soundEffects: true,
      mode: 'live_class',
    },
    createdAt: '2026-10-18T07:00:00Z',
    playCount: 142,
    averageScore: 785,
  },
  {
    id: 'game-wheel-tin11',
    teacherId: 'teacher-tn-01',
    title: 'Vòng quay may mắn – Tin học 11 – Python & Cấu trúc dữ liệu mảng',
    subject: 'Tin học',
    grade: '11',
    textbook: 'Cánh Diều',
    lesson: 'Bài 8: Mảng một chiều và List trong Python',
    gameType: 'wheel',
    questions: [
      {
        id: 'q-w1',
        question: 'Đoạn mã Python sau: a = [1, 2, 3]; a.append([4, 5]); print(len(a)) in ra giá trị gì?',
        options: ['4', '5', '3', 'Lỗi cú pháp'],
        correctAnswer: 0,
        explanation: 'Phương thức append thêm nguyên danh sách con [4, 5] như 1 phần tử đơn lẻ vào vị trí cuối, độ dài list là 4.',
        difficulty: 'Thông hiểu',
        topic: 'Python List',
        codeSnippet: `a = [1, 2, 3]\na.append([4, 5])\nprint(len(a))`,
        codeLanguage: 'python',
      },
      {
        id: 'q-w2',
        question: 'Cấu trúc dữ liệu nào hoạt động theo nguyên tắc LIFO (Last In First Out)?',
        options: ['Stack (Ngăn xếp)', 'Queue (Hàng đợi)', 'Array (Mảng)', 'Graph (Đồ thị)'],
        correctAnswer: 0,
        explanation: 'Stack đưa phần tử vào sau cùng sẽ lấy ra đầu tiên (Vào sau ra trước).',
        difficulty: 'Nhận biết',
        topic: 'Cấu trúc dữ liệu',
      },
      {
        id: 'q-w3',
        question: 'Thuật toán sắp xếp nổi bọt (Bubble Sort) có độ phức tạp thời gian trung bình là bao nhiêu?',
        options: ['O(n^2)', 'O(n log n)', 'O(n)', 'O(1)'],
        correctAnswer: 0,
        explanation: 'Bubble Sort so sánh các cặp liền kề qua hai vòng lặp lồng nhau nên độ phức tạp là O(n^2).',
        difficulty: 'Thông hiểu',
        topic: 'Thuật toán',
      },
      {
        id: 'q-w4',
        question: 'Đoạn mã Python sau in ra gì: [x**2 for x in range(4) if x % 2 == 0]?',
        options: ['[0, 4]', '[0, 1, 4, 9]', '[1, 9]', '[4]'],
        correctAnswer: 0,
        explanation: 'range(4) gồm 0,1,2,3; các số chẵn là 0 và 2; bình phương lần lượt là 0^2=0 và 2^2=4.',
        difficulty: 'Vận dụng',
        topic: 'List Comprehension',
        codeSnippet: `result = [x**2 for x in range(4) if x % 2 == 0]\nprint(result)`,
        codeLanguage: 'python',
      },
      {
        id: 'q-w5',
        question: 'Trong Python, kiểu dữ liệu tuple khác list ở điểm cơ bản nào?',
        options: ['Tuple là bất biến (immutable), không thể thay đổi giá trị sau khi tạo', 'Tuple chỉ chứa được số thực', 'List không cho phép duyệt for', 'Tuple tốn gấp 10 lần bộ nhớ'],
        correctAnswer: 0,
        explanation: 'Tuple được bao bởi ngoặc tròn () và không thể thêm/sửa/xóa phần tử sau khi khởi tạo.',
        difficulty: 'Nhận biết',
        topic: 'Python cơ bản',
      }
    ],
    settings: {
      timePerQuestion: 25,
      showExplanation: true,
      allowRetry: true,
      shuffleQuestions: false,
      shuffleOptions: false,
      musicEnabled: true,
      soundEffects: true,
      mode: 'individual',
    },
    createdAt: '2026-10-17T14:30:00Z',
    playCount: 98,
    averageScore: 820,
  },
  {
    id: 'game-bomb-tin10',
    teacherId: 'teacher-tn-01',
    title: 'Gỡ bom kiến thức – Tin học 10 – An toàn thông tin & Pháp luật số',
    subject: 'Tin học',
    grade: '10',
    textbook: 'Kết nối tri thức',
    lesson: 'Bài 7: An toàn và bảo mật trên không gian mạng',
    gameType: 'bomb',
    questions: [
      {
        id: 'q-b1',
        question: 'Hành vi nào dưới đây vi phạm nghiêm trọng Luật An ninh mạng Việt Nam?',
        options: ['Phát tán mã độc, đánh cắp thông tin cá nhân và đăng tin giả', 'Cập nhật bản vá bảo mật cho Windows', 'Bật chế độ xác thực 2 lớp (2FA)', 'Tham gia các diễn đàn lập trình học tập'],
        correctAnswer: 0,
        explanation: 'Hành vi phát tán tin giả, tấn công mạng, đánh cắp danh tính bị pháp luật xử phạt nghiêm khắc.',
        difficulty: 'Nhận biết',
        topic: 'Luật An ninh mạng',
      },
      {
        id: 'q-b2',
        question: 'Mật khẩu nào sau đây có độ an toàn và chống tấn công vét cạn (brute-force) tốt nhất?',
        options: ['ThptND@2026#BaoMat!', '12345678', 'admin2026', 'nguyenduc123'],
        correctAnswer: 0,
        explanation: 'Mật khẩu mạnh dài trên 12 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.',
        difficulty: 'Thông hiểu',
        topic: 'Bảo mật mật khẩu',
      },
      {
        id: 'q-b3',
        question: 'Hình thức tấn công "Phishing" hoạt động bằng cách nào?',
        options: ['Giả mạo email hoặc trang web ngân hàng/trường học uy tín để lừa người dùng nhập tài khoản', 'Dùng virus phá hủy bo mạch chủ của máy chủ', 'Cắt đứt dây cáp quang biển', 'Làm tràn bộ nhớ máy in'],
        correctAnswer: 0,
        explanation: 'Phishing (tấn công giả mạo) lợi dụng sự mất cảnh giác của nạn nhân bằng trang web giả.',
        difficulty: 'Thông hiểu',
        topic: 'Mối đe dọa an ninh mạng',
      },
      {
        id: 'q-b4',
        question: 'Khi nhận được tệp tin đính kèm có đuôi .exe từ một người lạ trên mạng xã hội, em nên xử lý thế nào?',
        options: ['Tuyệt đối không mở, quét virus và chặn người gửi', 'Nhấp đúp mở ngay để xem bên trong có gì', 'Gửi chuyển tiếp cho cả lớp', 'Đổi tên thành .mp3 rồi phát'],
        correctAnswer: 0,
        explanation: 'Tệp tin thực thi .exe không rõ nguồn gốc tiềm ẩn nguy cơ chứa trojan và ransomware.',
        difficulty: 'Vận dụng',
        topic: 'Kỹ năng phòng ngừa mã độc',
      }
    ],
    settings: {
      timePerQuestion: 15,
      showExplanation: true,
      allowRetry: true,
      shuffleQuestions: false,
      shuffleOptions: false,
      musicEnabled: true,
      soundEffects: true,
      mode: 'individual',
    },
    createdAt: '2026-10-16T09:15:00Z',
    playCount: 165,
    averageScore: 740,
  },
  {
    id: 'game-puzzle-tin12',
    teacherId: 'teacher-tn-01',
    title: 'Lật mảnh ghép – Tin học 12 – Trí tuệ nhân tạo (AI) và Ứng dụng',
    subject: 'Tin học',
    grade: '12',
    textbook: 'Chân trời sáng tạo',
    lesson: 'Bài 11: Trí tuệ nhân tạo và tương lai công nghệ',
    gameType: 'puzzle',
    questions: [
      {
        id: 'q-p1',
        question: 'Học máy (Machine Learning) là gì?',
        options: [
          'Khả năng máy tính học hỏi từ dữ liệu để cải thiện hiệu suất mà không cần lập trình quy tắc tường minh',
          'Một phần mềm gõ văn bản tự động',
          'Một loại chip điện tử tự làm sạch bụi',
          'Chương trình vẽ tranh tĩnh vật cổ điển'
        ],
        correctAnswer: 0,
        explanation: 'Machine Learning trích xuất quy luật từ tập dữ liệu huấn luyện để đưa ra dự đoán.',
        difficulty: 'Nhận biết',
        topic: 'Khái niệm AI',
      },
      {
        id: 'q-p2',
        question: 'Mô hình ngôn ngữ lớn (LLM - Large Language Model) như Gemini được huấn luyện dựa trên kiến trúc nào?',
        options: ['Kiến trúc Transformer với cơ chế Self-Attention', 'Mạng nơ-ron Perceptron đơn tầng', 'Thuật toán tìm kiếm nhị phân', 'Cây quyết định Decision Tree'],
        correctAnswer: 0,
        explanation: 'Kiến trúc Transformer (Vaswani et al.) cách mạng hóa AI với khả năng xử lý ngữ cảnh song song.',
        difficulty: 'Thông hiểu',
        topic: 'Kiến trúc AI',
      },
      {
        id: 'q-p3',
        question: 'Ứng dụng nào sau đây KHÔNG phải là ứng dụng tiêu biểu của Trí tuệ nhân tạo?',
        options: ['Nấu nước sôi bằng ấm đun cơ truyền thống', 'Nhận diện khuôn mặt FaceID', 'Xe tự lái Tesla', 'Trợ lý ảo Google Assistant'],
        correctAnswer: 0,
        explanation: 'Ấm đun cơ khí đơn thuần sử dụng rơ-le nhiệt, không chứa thuật toán trí tuệ nhân tạo.',
        difficulty: 'Nhận biết',
        topic: 'Ứng dụng AI',
      },
      {
        id: 'q-p4',
        question: 'Đạo đức trong AI (AI Ethics) nhấn mạnh nguyên tắc quan trọng nào?',
        options: [
          'Tính minh bạch, công bằng, bảo vệ quyền riêng tư và không thiên vị dữ liệu',
          'Tất cả mã nguồn phải đóng kín',
          'Không cho học sinh tiếp cận máy tính',
          'Chỉ cho AI đưa ra phán quyết pháp lý duy nhất'
        ],
        correctAnswer: 0,
        explanation: 'AI có trách nhiệm yêu cầu minh bạch, tôn trọng quyền riêng tư và kiểm soát định kiến.',
        difficulty: 'Vận dụng',
        topic: 'Đạo đức AI',
      }
    ],
    settings: {
      timePerQuestion: 20,
      showExplanation: true,
      allowRetry: true,
      shuffleQuestions: false,
      shuffleOptions: false,
      musicEnabled: true,
      soundEffects: true,
      mode: 'individual',
    },
    createdAt: '2026-10-15T08:00:00Z',
    playCount: 110,
    averageScore: 810,
  },
  {
    id: 'game-space-tin11',
    teacherId: 'teacher-tn-01',
    title: 'Chinh phục vũ trụ – Tin học 11 – Hệ CSDL Quan hệ & SQL',
    subject: 'Tin học',
    grade: '11',
    textbook: 'Kết nối tri thức',
    lesson: 'Bài 15: Hệ quản trị cơ sở dữ liệu và truy vấn SQL',
    gameType: 'space',
    questions: [
      {
        id: 'q-s1',
        question: 'Câu lệnh SQL nào dùng để chọn tất cả các cột từ bảng "HocSinh" có điểm trung bình >= 8.0?',
        options: [
          'SELECT * FROM HocSinh WHERE DiemTB >= 8.0;',
          'GET ALL IN HocSinh DiemTB >= 8.0;',
          'FIND * FROM HocSinh WITH DiemTB >= 8.0;',
          'SHOW TABLES WHERE DiemTB >= 8.0;'
        ],
        correctAnswer: 0,
        explanation: 'Cú pháp chuẩn SQL: SELECT [cột] FROM [bảng] WHERE [điều kiện].',
        difficulty: 'Thông hiểu',
        topic: 'SQL Query',
        codeSnippet: `SELECT * \nFROM HocSinh \nWHERE DiemTB >= 8.0 \nORDER BY DiemTB DESC;`,
        codeLanguage: 'sql',
      },
      {
        id: 'q-s2',
        question: 'Khóa chính (Primary Key) trong bảng quan hệ có đặc tính bắt buộc nào?',
        options: [
          'Giá trị là duy nhất và không được phép chứa giá trị NULL',
          'Phải luôn là kiểu dữ liệu văn bản dài',
          'Có thể trùng lặp giữa các dòng',
          'Mỗi bảng có thể có tối đa 10 khóa chính độc lập'
        ],
        correctAnswer: 0,
        explanation: 'Khóa chính định danh duy nhất mỗi bản ghi, phải NOT NULL và UNIQUE.',
        difficulty: 'Nhận biết',
        topic: 'Khóa chính',
      },
      {
        id: 'q-s3',
        question: 'Mối quan hệ giữa bảng "LopHoc" và bảng "HocSinh" thường là mối quan hệ nào?',
        options: ['Một - Nhiều (1 - N)', 'Một - Một (1 - 1)', 'Nhiều - Nhiều (N - N)', 'Không có quan hệ'],
        correctAnswer: 0,
        explanation: 'Một lớp học có thể có nhiều học sinh, nhưng mỗi học sinh chỉ thuộc về một lớp.',
        difficulty: 'Thông hiểu',
        topic: 'Liên kết bảng',
      }
    ],
    settings: {
      timePerQuestion: 25,
      showExplanation: true,
      allowRetry: true,
      shuffleQuestions: false,
      shuffleOptions: false,
      musicEnabled: true,
      soundEffects: true,
      mode: 'individual',
    },
    createdAt: '2026-10-14T11:00:00Z',
    playCount: 88,
    averageScore: 795,
  },
  {
    id: 'game-castle-tin10',
    teacherId: 'teacher-tn-01',
    title: 'Vượt chướng ngại vật – Tin học 10 – Cấu trúc phần cứng máy tính',
    subject: 'Tin học',
    grade: '10',
    textbook: 'Cánh Diều',
    lesson: 'Bài 2: Các bộ phận bên trong máy tính',
    gameType: 'castle',
    questions: demoQuestionsTin12.slice(0, 4),
    settings: {
      timePerQuestion: 20,
      showExplanation: true,
      allowRetry: true,
      shuffleQuestions: false,
      shuffleOptions: false,
      musicEnabled: true,
      soundEffects: true,
      mode: 'individual',
    },
    createdAt: '2026-10-13T10:00:00Z',
    playCount: 72,
    averageScore: 840,
  },
  {
    id: 'game-treasure-tin12',
    teacherId: 'teacher-tn-01',
    title: 'Săn kho báu – Tin học 12 – Thiết kế Web với HTML & CSS',
    subject: 'Tin học',
    grade: '12',
    textbook: 'Kết nối tri thức',
    lesson: 'Bài 19: Định dạng trang web với CSS',
    gameType: 'treasure',
    questions: demoQuestionsTin12.slice(4, 8),
    settings: {
      timePerQuestion: 20,
      showExplanation: true,
      allowRetry: true,
      shuffleQuestions: false,
      shuffleOptions: false,
      musicEnabled: true,
      soundEffects: true,
      mode: 'individual',
    },
    createdAt: '2026-10-12T15:00:00Z',
    playCount: 120,
    averageScore: 810,
  },
  {
    id: 'game-arena-tin11',
    teacherId: 'teacher-tn-01',
    title: 'Đấu trường kiến thức – Tin học 11 – Đội Đỏ vs Đội Xanh',
    subject: 'Tin học',
    grade: '11',
    textbook: 'Cánh Diều',
    lesson: 'Ôn tập học kì: Cấu trúc điều khiển & Mảng',
    gameType: 'arena',
    questions: demoQuestionsTin12.slice(2, 7),
    settings: {
      timePerQuestion: 20,
      showExplanation: true,
      allowRetry: true,
      shuffleQuestions: false,
      shuffleOptions: false,
      musicEnabled: true,
      soundEffects: true,
      mode: 'team',
    },
    createdAt: '2026-10-11T09:00:00Z',
    playCount: 95,
    averageScore: 860,
  }
];

// Names bank for 42 students of 12A1
const NAMES_12A1 = [
  'Nguyễn Văn An', 'Trần Thu Hà', 'Lê Hoàng Nam', 'Phạm Quỳnh Mai', 'Hoàng Quốc Bảo',
  'Đặng Thảo Linh', 'Vũ Đức Minh', 'Bùi Phương Thảo', 'Đỗ Quang Huy', 'Nguyễn Thị Hương',
  'Phan Thanh Tùng', 'Võ Hoài Nam', 'Lâm Gia Bảo', 'Đoàn Ngọc Trâm', 'Trịnh Nhật Minh',
  'Nguyễn Khánh Linh', 'Dương Tuấn Kiệt', 'Hồ Bích Phương', 'Lê Minh Khôi', 'Trần Thảo My',
  'Ngô Đình Trọng', 'Tô Hải Đăng', 'Đinh Diệu Huyền', 'Trần Hữu Thắng', 'Nguyễn Hồng Phúc',
  'Cao Tuấn Dũng', 'Lý Kim Ngân', 'Mai Thanh Vân', 'Phan Hoàng Long', 'Nguyễn Trúc Quỳnh',
  'Tạ Đình Phong', 'Bùi Gia Khiêm', 'Lê Yến Nhi', 'Trần Tuấn Anh', 'Vũ Mai Lan',
  'Nguyễn Thành Đạt', 'Lê Bảo Châu', 'Đỗ Trung Kiên', 'Huỳnh Thảo Vy',
  // 3 students who haven't participated yet:
  'Nguyễn Minh Anh', 'Trần Đình Khôi', 'Hoàng Bích Ngọc'
];

export const demoClasses: ClassGroup[] = [
  {
    id: 'class-12a1',
    name: '12A1',
    schoolYear: '2025 - 2026',
    studentCount: 42,
    students: NAMES_12A1.map((name, idx) => ({
      id: `st-12a1-${String(idx + 1).padStart(2, '0')}`,
      fullName: name,
      studentCode: `12A1${String(idx + 1).padStart(2, '0')}`,
      completedGames: idx < 39 ? 12 : 8,
      avgScore: idx < 39 ? Math.round(750 + ((idx * 17) % 230)) : 0,
    })),
  },
  {
    id: 'class-12a2',
    name: '12A2',
    schoolYear: '2025 - 2026',
    studentCount: 38,
    students: [
      'Dương Tấn Đạt', 'Lý Diệu Hương', 'Ngô Trọng Nghĩa', 'Phan Bảo Trâm', 'Nguyễn Quốc Tuấn',
      'Đặng Hoài An', 'Trần Minh Quân', 'Lê Thị Thu', 'Vũ Hải Long', 'Phạm Quỳnh Nga',
      'Hoàng Đức Thắng', 'Bùi Thu Trang', 'Đỗ Văn Hùng', 'Nguyễn Phương Thảo', 'Lê Cẩm Tú'
    ].map((name, idx) => ({
      id: `st-12a2-${String(idx + 1).padStart(2, '0')}`,
      fullName: name,
      studentCode: `12A2${String(idx + 1).padStart(2, '0')}`,
      completedGames: 11,
      avgScore: Math.round(740 + ((idx * 19) % 220)),
    })),
  },
  {
    id: 'class-11a1',
    name: '11A1',
    schoolYear: '2025 - 2026',
    studentCount: 40,
    students: [
      'Trịnh Hoàng Quân', 'Lưu Ngọc Ánh', 'Nguyễn Đình Phúc', 'Trần Thảo Ly', 'Phạm Quốc Bảo',
      'Đỗ Thanh Mai', 'Lê Hữu Đạt', 'Vũ Quỳnh Như', 'Hoàng Bảo Long', 'Bùi Kim Oanh'
    ].map((name, idx) => ({
      id: `st-11a1-${String(idx + 1).padStart(2, '0')}`,
      fullName: name,
      studentCode: `11A1${String(idx + 1).padStart(2, '0')}`,
      completedGames: 9,
      avgScore: Math.round(760 + ((idx * 13) % 200)),
    })),
  },
  {
    id: 'class-11a2',
    name: '11A2',
    schoolYear: '2025 - 2026',
    studentCount: 39,
    students: [
      'Nguyễn Đức Huy', 'Trần Yến My', 'Lê Tuấn Hưng', 'Phan Thu Giang', 'Hoàng Khải Minh',
      'Đặng Thanh Hà', 'Vũ Minh Trí', 'Bùi Lan Chi', 'Đỗ Văn Nam', 'Phạm Thùy Linh'
    ].map((name, idx) => ({
      id: `st-11a2-${String(idx + 1).padStart(2, '0')}`,
      fullName: name,
      studentCode: `11A2${String(idx + 1).padStart(2, '0')}`,
      completedGames: 8,
      avgScore: Math.round(730 + ((idx * 21) % 210)),
    })),
  },
  {
    id: 'class-10a1',
    name: '10A1',
    schoolYear: '2025 - 2026',
    studentCount: 42,
    students: [
      'Tạ Minh Khang', 'Chu Khánh Vy', 'Nguyễn Tấn Lộc', 'Trần Bích Ngọc', 'Lê Hạo Nhiên',
      'Phạm Trà My', 'Hoàng Gia Huy', 'Đặng Phương Uyên', 'Vũ Tuấn Kiệt', 'Bùi Thảo Trang'
    ].map((name, idx) => ({
      id: `st-10a1-${String(idx + 1).padStart(2, '0')}`,
      fullName: name,
      studentCode: `10A1${String(idx + 1).padStart(2, '0')}`,
      completedGames: 7,
      avgScore: Math.round(750 + ((idx * 15) % 190)),
    })),
  },
  {
    id: 'class-10a2',
    name: '10A2',
    schoolYear: '2025 - 2026',
    studentCount: 41,
    students: [
      'Nguyễn Hoàng Dũng', 'Lê Bảo Ngọc', 'Trần Công Thành', 'Phạm Thảo Vy', 'Đỗ Minh Trí',
      'Vũ Thu Ngân', 'Hoàng Anh Quân', 'Bùi Mai Phương', 'Đặng Tuấn Anh', 'Lưu Hồng Hạnh'
    ].map((name, idx) => ({
      id: `st-10a2-${String(idx + 1).padStart(2, '0')}`,
      fullName: name,
      studentCode: `10A2${String(idx + 1).padStart(2, '0')}`,
      completedGames: 6,
      avgScore: Math.round(720 + ((idx * 17) % 210)),
    })),
  },
];

// Generate 39 participating students for 12A1 with detailed answers for each of the 10 questions
const PARTICIPANT_SCORES = [
  980, 960, 950, 940, 920, 910, 890, 880, 870, 860,
  850, 850, 840, 830, 820, 820, 810, 800, 800, 790,
  790, 780, 780, 770, 760, 750, 740, 730, 720, 710,
  700, 680, 670, 650, 640, 620, 590, 560, 540
];

const optionLetters = ['A', 'B', 'C', 'D'];

export const demoRoomTIN012: Room = {
  id: 'room-tin-012',
  gameId: 'game-racing-tin12',
  roomCode: 'TIN012',
  status: 'ended',
  createdAt: '2026-10-18T07:10:00Z',
  startedAt: '2026-10-18T07:15:00Z',
  endedAt: '2026-10-18T07:35:00Z',
  game: demoGames[0],
  participants: NAMES_12A1.slice(0, 39).map((name, idx) => {
    const rawScore = PARTICIPANT_SCORES[idx] || 780;
    const correctCount = Math.min(10, Math.max(5, Math.round(rawScore / 100)));
    const wrongCount = 10 - correctCount;
    const totalTimeSeconds = Math.round(35 + ((idx * 7) % 35));

    // Generate detailed answers for all 10 questions
    const answers: ParticipantAnswer[] = demoQuestionsTin12.map((q, qIdx) => {
      // Questions 2 and 9 are harder (code questions)
      const isHardQuestion = qIdx === 1 || qIdx === 8;
      let isCorrect = true;
      if (wrongCount >= 4 && isHardQuestion) {
        isCorrect = false;
      } else if (wrongCount >= 2 && qIdx % 4 === 1) {
        isCorrect = false;
      } else if (wrongCount >= 1 && qIdx === 9 && idx > 25) {
        isCorrect = false;
      } else if (wrongCount >= 3 && qIdx === 5 && idx > 30) {
        isCorrect = false;
      }

      const chosen = isCorrect ? q.correctAnswer : (q.correctAnswer + 1) % 4;
      const respTime = Math.round(isHardQuestion ? 6 + ((idx + qIdx) % 8) : 3 + ((idx + qIdx) % 5));
      const speedBonus = isCorrect ? Math.round(Math.max(0, 20 - respTime) * 3) : 0;
      const baseScore = isCorrect ? 80 : 0;
      const awarded = baseScore + speedBonus;

      return {
        participantId: `p-${idx + 1}`,
        questionId: q.id,
        questionNumber: qIdx + 1,
        questionText: q.question,
        chosenAnswer: chosen,
        chosenAnswerText: `${optionLetters[chosen]}. ${q.options[chosen] || ''}`,
        correctAnswer: q.correctAnswer,
        correctAnswerText: `${optionLetters[q.correctAnswer]}. ${q.options[q.correctAnswer] || ''}`,
        isCorrect,
        responseTime: respTime,
        baseScore,
        speedBonus,
        streakBonus: isCorrect && qIdx > 2 ? 10 : 0,
        scoreAwarded: awarded,
      };
    });

    return {
      id: `p-${String(idx + 1).padStart(2, '0')}`,
      roomId: 'room-tin-012',
      studentId: `st-12a1-${String(idx + 1).padStart(2, '0')}`,
      studentCode: `12A1${String(idx + 1).padStart(2, '0')}`,
      studentName: name,
      className: '12A1',
      score: rawScore,
      streak: Math.min(5, correctCount),
      maxStreak: Math.min(6, correctCount),
      correctCount,
      wrongCount,
      totalTimeSeconds,
      joinedAt: `2026-10-18T07:11:${String(10 + (idx % 45)).padStart(2, '0')}Z`,
      completedAt: `2026-10-18T07:25:${String(10 + (idx % 45)).padStart(2, '0')}Z`,
      rank: idx + 1,
      answers,
      finished: true,
    };
  }),
};

