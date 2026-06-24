/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    // 强制生成 col-span 类（5/23 设计的布局依赖这些，Tailwind purge 时漏生成）
    "col-span-2", "col-span-3", "col-span-4", "col-span-5", "col-span-6",
    "col-span-7", "col-span-8", "col-span-9", "col-span-10", "col-span-11", "col-span-12",
    "xl:col-span-2", "xl:col-span-3", "xl:col-span-4", "xl:col-span-5", "xl:col-span-6",
    "xl:col-span-7", "xl:col-span-8", "xl:col-span-9", "xl:col-span-10", "xl:col-span-11", "xl:col-span-12",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
