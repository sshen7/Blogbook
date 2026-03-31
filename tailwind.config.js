/** @type {import('tailwindcss').Config} */
module.exports = {
  // 关键：指定要处理的文件路径，否则样式不生效
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("tailwindcss-animate")], // 你的项目里用到了这个插件
};