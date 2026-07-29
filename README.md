# 🚀 My Next.js Learning Journey

![Next.js](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![Status: In Progress](https://img.shields.io/badge/Status-In%20Progress-blue?style=for-the-badge)

Welcome to my Next.js learning repository! After getting comfortable with React, I am taking the next step into full-stack React development by mastering Next.js. 

This repository serves as a centralized hub for all my notes, experiments, and mini-projects as I explore the modern Next.js ecosystem (specifically focusing on the App Router).

---

## 🎯 Goals

- Transition from client-side React to full-stack Next.js development.
- Master the **App Router** and understand the mental model of **React Server Components (RSC)**.
- Learn various data fetching and caching strategies (SSR, SSG, ISR).
- Build and deploy full-stack applications with built-in API routes (Route Handlers).
- Integrate databases and authentication seamlessly into Next.js applications.

## 📚 Concepts Roadmap

Here is my checklist of topics to cover. I will check these off as I conquer them!

### 1. Fundamentals & App Router
- [x] Routing & Pages (`page.tsx`)
- [ ] Layouts & Templates (`layout.tsx`, `template.tsx`)
- [ ] Linking and Navigating (`next/link`, `useRouter`)
- [ ] Server Components vs. Client Components (`"use client"`)

### 2. Data Fetching & Caching
- [ ] Fetching data on the server
- [ ] Static vs. Dynamic rendering
- [ ] Caching and Revalidating data (Time-based & On-demand)
- [ ] Mutating Data (Server Actions)

### 3. Advanced Routing & UI
- [ ] Dynamic Routes (`[id]`, `[...slug]`)
- [ ] Error Handling (`error.tsx`, `not-found.tsx`)
- [ ] Loading UI & Streaming (`loading.tsx`, Suspense)
- [ ] Parallel & Intercepting Routes

### 4. Full-Stack & Optimization
- [ ] Route Handlers (Building a backend API)
- [ ] Image, Font, and Script Optimization (`next/image`, `next/font`)
- [ ] Authentication (NextAuth.js / Auth.js)
- [ ] SEO & Metadata Integration

---

## 🛠️ Projects Built Along the Way

As I learn, I am building projects of increasing complexity. You can find them in the folders below:

1. **[01-routing-basics](./01-routing-basics):** A simple multi-page site to get a feel for file-based routing and layouts.
2. **[02-server-components-demo](./02-server-components-demo):** Testing data fetching directly from the server without `useEffect`.
3. **[03-markdown-blog](./03-markdown-blog):** A static blog using MDX and dynamic routing.
4. **[04-fullstack-dashboard](./04-fullstack-dashboard):** *(Coming Soon)* A complete app with a database, authentication, and Server Actions.

---

## 🚀 How to Run the Code

To test out any of the projects in this repository locally:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/yourusername/nextjs-learning-journey.git](https://github.com/yourusername/nextjs-learning-journey.git)
   cd nextjs-learning-journey
