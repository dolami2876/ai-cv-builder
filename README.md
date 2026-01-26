# CV Boost 🚀

**CV Boost** là ứng dụng tạo CV thông minh tích hợp AI, giúp người dùng viết CV chuyên nghiệp, chấm điểm CV và tối ưu hóa nội dung dựa trên JD (Job Description).

Dự án được xây dựng với **Next.js 14**, **MongoDB**, **Clerk Auth**, và **Google Gemini AI**.

---

## 🛠️ Công Nghệ Sử Dụng

-   **Frontend**: Next.js 14 (App Router), TailwindCSS, Lucide Icons.
-   **Backend**: Next.js API Routes.
-   **Database**: MongoDB (Mongoose).
-   **Auth**: Clerk.
-   **AI**: Google Gemini (Custom Prompt Engineering).
-   **Payment**: Sepay (QR Code Automation).
-   **State Management**: Zustand.

---

## ⚙️ Cài Đặt & Chạy Dự Án

Dành cho người mới bắt đầu (New Contributors).

### 1. Yêu cầu cần có (Prerequisites)

Hãy đảm bảo máy tính của bạn đã cài đặt:

-   [Node.js](https://nodejs.org/) (Phiên bản 18 trở lên).
-   [Git](https://git-scm.com/).
-   Một tài khoản [MongoDB Atlas](https://www.mongodb.com/) (hoặc cài MongoDB Compass local).
-   Tài khoản [Clerk](https://clerk.com/) (để làm chức năng đăng nhập).
-   API Key từ [Google AI Studio](https://aistudio.google.com/) (để chạy tính năng AI).

### 2. Clone dự án về máy

Mở Terminal (hoặc CMD/PowerShell) và chạy lệnh:

```bash
git clone https://github.com/your-repo/ai-cv-builder.git
cd ai-cv-builder
```

### 3. Cài đặt thư viện (Dependencies)

Chạy lệnh sau để tải các gói thư viện cần thiết:

```bash
npm install
# hoặc
yarn install
```

### 4. Thiết lập biến môi trường (.env)

Tạo một file tên là `.env.local` ở thư mục gốc của dự án.
Copy nội dung dưới đây và điền key của bạn vào:

```env
# --- DATABASE (MongoDB) ---
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/cv-boost

# --- AUTH (Clerk) ---
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# --- AI (Google Gemini) ---
GEMINI_API_KEY=AIzaSy...

# --- PAYMENT (Sepay - Optional) ---
SEPAY_API_TOKEN=...
SEPAY_CANUBI_TOKEN=...

# --- APP URL ---
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Lưu ý**: Không được để lộ file `.env.local` lên Github.

### 5. Chạy dự án (Local Development)

Sau khi config xong, chạy lệnh:

```bash
npm run dev
```

Mở trình duyệt và truy cập: [http://localhost:3000](http://localhost:3000)

---

## 📂 Cấu Trúc Thư Mục Chính

-   `app/`: Chứa source code chính (Pages & API).
    -   `app/api/`: Các API backend (Resumes, AI Generate, Webhook).
    -   `app/dashboard/`: Trang quản lý CV.
    -   `app/editor/[id]/`: Trang chỉnh sửa CV chính.
-   `components/`: Các UI Component tái sử dụng.
    -   `editor/`: Các form nhập liệu (Experience, Education...).
    -   `preview/`: Phần hiển thị CV (A4 Layout).
-   `lib/`: Các hàm tiện ích (DB Connect, Zustand Store, AI Helpers).
-   `models/`: Mongoose Schema (User, Resume).

---

## 🐛 Các Lỗi Thường Gặp

**1. Lỗi kết nối MongoDB?**
-> Kiểm tra lại `MONGODB_URI` trong file `.env.local`. Đảm bảo IP của bạn đã được Whitelist trên MongoDB Atlas.

**2. Lỗi AI không trả về kết quả?**
-> Kiểm tra `GEMINI_API_KEY`. Có thể key bị hết hạn hoặc sai model.

**3. Lỗi Đăng nhập Clerk?**
-> Đảm bảo bạn đã thêm `http://localhost:3000` vào phần **Allowed Origins** trong Dashboard của Clerk.

---

**Happy Coding! 🚀**
