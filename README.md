# BiteExpress 🍕 | Premium Food Ordering Platform

BiteExpress is a modern, high-performance food ordering application built with Next.js 15, Supabase, and Tailwind CSS. It features a sleek, responsive UI for exploring menus, managing orders, and an integrated admin panel for business management.

## ✨ Key Features

- **🚀 Lightning Fast**: Built with Next.js 15 App Router and Server Components.
- **📱 Fully Responsive**: Optimized for mobile, tablet, and desktop experiences.
- **🍕 Comprehensive Menu**: Browse categories, view item details, and select variants.
- **🛒 Dynamic Cart System**: Seamlessly add items and manage your order in real-time.
- **🔐 Secure Authentication**: Integrated with Supabase Auth for secure user and admin access.
- **🛡️ Admin Dashboard**: Full-featured administrative panel for managing menu items, categories, and tracking sales performance.
- **🎨 Premium UI/UX**: Crafted with Shadcn UI, Lucide icons, and custom animations for a "wow" factor.

## 🛠️ Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org/), [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/)
- **Backend & Auth**: [Supabase](https://supabase.com/)
- **State Management**: [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ installed
- A Supabase account and project

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/pizza-shop.git
   cd pizza-shop
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Database Setup**:
   Run the SQL scripts located in the `/supabase` directory within your Supabase SQL Editor to set up the necessary tables and policies.

5. **Run the development server**:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

```text
├── app/              # Next.js App Router (Pages & Layouts)
├── components/       # Reusable React components (UI, Menu, Admin)
├── lib/              # Utility functions and Supabase client
├── public/           # Static assets
├── supabase/         # SQL schema and migration files
├── middleware.ts     # Request processing and Auth protection
└── package.json      # Dependencies and scripts
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
