# 🎮 AI GAME HỌC TẬP – THPT NGUYỄN DỤC

> **“Học mà chơi – Chơi để hiểu – AI đồng hành cùng lớp học”**

- **Tác giả ý tưởng & Thiết kế:** Cô **Trần Thị Tuyết Nhung**
- **Đơn vị công tác:** **Trường THPT Nguyễn Dục**
- **Chuyên môn:** **Giáo viên Tin học THPT**
- **Liên hệ:** `trannhungpninh@gmail.com`

---

## I. GIỚI THIỆU DỰ ÁN

**AI GAME HỌC TẬP** là nền tảng trò chơi giáo dục trực tuyến ứng dụng Trí tuệ Nhân tạo thế hệ mới (Google Gemini 3.8 Flash), cho phép giáo viên THPT:
1. **Tạo câu hỏi tự động bằng AI:** Phân tích nội dung SGK, giáo án để tạo ra bộ câu hỏi trắc nghiệm 4 phương án khoa học, bám sát cấu trúc đề thi và phân bổ độ khó (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao).
2. **Đặc quyền cho môn Tin học:** Hỗ trợ hiển thị và chấm các đoạn mã code thực tế (Python, C++, HTML, SQL) với giao diện Syntax Highlighting trực quan.
3. **8 Kiểu trò chơi thi đua trực tiếp:**
   - 🏎️ **Đường đua kiến thức:** Xe tăng tốc khi trả lời đúng, kích hoạt Nitro khi đạt chuỗi đúng liên tiếp.
   - 🎡 **Vòng quay may mắn:** Bốc thăm điểm số may mắn, nhân đôi X2, câu hỏi bí mật.
   - 💣 **Gỡ bom kiến thức:** Đếm ngược 20s kịch tính, chọn đúng dây ngòi nổ an toàn.
   - 🧩 **Lật mảnh ghép:** Mỗi câu đúng mở 1 ô hé lộ hình ảnh công nghệ bí mật.
   - 🚀 **Chinh phục vũ trụ:** Phi thuyền không gian vượt các hành tinh tri thức.
   - 🏰 **Vượt chướng ngại vật:** Vượt cầu, vượt núi, công phá cổng thành.
   - 💎 **Săn kho báu:** Thu thập 4 chìa khóa vàng mở rương báu.
   - ⚔️ **Đấu trường kiến thức:** Kéo co năng lượng Đội Đỏ vs Đội Xanh.
4. **Học sinh tham gia tức thì:** Chỉ cần nhập mã phòng 6 chữ số (hoặc quét QR Code) – không bắt buộc tạo tài khoản.
5. **Cố vấn sư phạm thông minh bằng AI:** Tự động phân tích điểm mạnh, điểm yếu, các lỗi phổ biến và đề xuất nội dung ôn tập sau mỗi buổi học.

---

## II. HƯỚNG DẪN TEST NHANH TRÊN AI STUDIO

Hệ thống đã nạp sẵn dữ liệu demo hoàn chỉnh:
- **Giáo viên:** Cô Trần Thị Tuyết Nhung – Trường THPT Nguyễn Dục.
- **Trò chơi demo:** *Đường đua kiến thức – Tin học 12 – Bài 4: Mạng máy tính & Internet*.
- **Mã phòng demo:** `TIN012`.
- **Học sinh đã vào phòng chờ sẵn:** Nguyễn Văn An (12A1), Trần Thu Hà (12A1), Lê Hoàng Nam (12A1), Phạm Quỳnh Mai (12A1).

### Quy trình trải nghiệm trọn vẹn:
1. Nhấp **"Thử mã: TIN012"** trên thanh menu hoặc vào **"Học sinh tham gia"** gõ `TIN012`.
2. Bấm **"Vào phòng"** ➔ Tham gia đường đua xe kiến thức 10 câu hỏi mạng máy tính & code Python.
3. Xem bảng xếp hạng chung cuộc có bục vinh danh Top 1, Top 2, Top 3 và pháo hoa Confetti.
4. Chuyển sang **"Dashboard Giáo viên"** hoặc **"Tạo trò chơi (AI)"** để trải nghiệm AI tự động sinh câu hỏi theo bất kỳ chủ đề bài học nào.
5. Nhấp nút **"✨ AI PHÂN TÍCH KẾT QUẢ"** để xem báo cáo sư phạm 7 mục chi tiết.

---

## III. HƯỚNG DẪN TRIỂN KHAI LÊN VERCEL

Dự án được tối ưu hóa để triển khai mượt mà lên [Vercel](https://vercel.com):

### Bước 1: Chuẩn bị mã nguồn
Push mã nguồn dự án lên GitHub repository của Thầy/Cô.

### Bước 2: Import vào Vercel
1. Đăng nhập Vercel và chọn **"Add New Project"**.
2. Chọn repository GitHub vừa tạo.
3. Framework Preset: **Vite** (hoặc Other).
4. Build Command: `npm run build`.
5. Output Directory: `dist`.

### Bước 3: Cấu hình biến môi trường (Environment Variables) trên Vercel
Thêm các biến môi trường sau từ file `.env.example`:
- `GEMINI_API_KEY`: API Key lấy miễn phí tại [Google AI Studio](https://aistudio.google.com).
- `NEXT_PUBLIC_SUPABASE_URL`: Đường dẫn URL dự án Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon public key của Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key bảo mật của Supabase.

### Bước 4: Deploy
Nhấp **Deploy**. Sau 1-2 phút, ứng dụng sẽ có link online công khai (ví dụ: `https://ai-game-hoc-tap.vercel.app`).

---

## IV. CẤU HÌNH SUPABASE DATABASE

Để lưu trữ dữ liệu vĩnh viễn trên cơ sở dữ liệu PostgreSQL của Supabase:
1. Tạo một dự án mới tại [supabase.com](https://supabase.com).
2. Vào mục **SQL Editor**.
3. Mở file `supabase-schema.sql` có trong thư mục gốc của dự án này, copy toàn bộ nội dung và dán vào SQL Editor.
4. Bấm **Run**. Hệ thống sẽ tự động tạo đủ 10 bảng dữ liệu:
   - `profiles`: Thông tin giáo viên
   - `classes`: Danh sách lớp học (12A1, 12A2, ...)
   - `students`: Danh sách học sinh
   - `question_sets`: Bộ câu hỏi
   - `questions`: Chi tiết từng câu hỏi (kèm code snippet)
   - `games`: Danh mục trò chơi và cài đặt
   - `rooms`: Phiên chơi trực tuyến và mã phòng
   - `participants`: Người tham gia
   - `answers`: Chi tiết lịch sử trả lời
   - `results`: Kết quả xếp hạng

---

## V. CÔNG NGHỆ SỬ DỤNG
- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide React, Motion, Canvas-Confetti, Web Audio API.
- **Backend:** Node.js, Express, tsx.
- **AI Engine:** `@google/genai` (Model `gemini-3.8-flash`).
- **Database Schema:** PostgreSQL (Supabase Compatible).

---
*Bản quyền ý tưởng thiết kế thuộc về Cô Trần Thị Tuyết Nhung – Giáo viên Tin học Trường THPT Nguyễn Dục.*
