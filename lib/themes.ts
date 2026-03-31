import { EditorTheme } from "@/types";

export const editorThemes: EditorTheme[] = [
  {
    id: "minimal",
    name: "极简",
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: "16px",
    lineHeight: "1.75",
    headingStyle: "sans",
    paragraphSpacing: "normal",
    colors: {
      background: "#ffffff",
      text: "#1a1a1a",
      accent: "#5b8a72",
    },
  },
  {
    id: "elegant",
    name: "优雅",
    fontFamily: "'Source Han Serif CN', 'Noto Serif SC', serif",
    fontSize: "17px",
    lineHeight: "1.9",
    headingStyle: "serif",
    paragraphSpacing: "relaxed",
    colors: {
      background: "#fdfcfa",
      text: "#2c2c2c",
      accent: "#8b7355",
    },
  },
  {
    id: "magazine",
    name: "杂志",
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: "15px",
    lineHeight: "1.7",
    headingStyle: "sans",
    paragraphSpacing: "compact",
    colors: {
      background: "#fafafa",
      text: "#1a1a1a",
      accent: "#d4a574",
    },
  },
  {
    id: "paper",
    name: "纸张",
    fontFamily: "'LXGW WenKai', 'KaiTi', serif",
    fontSize: "17px",
    lineHeight: "2",
    headingStyle: "kai",
    paragraphSpacing: "relaxed",
    colors: {
      background: "#f5f1e8",
      text: "#3d3d3d",
      accent: "#6b8e6b",
    },
  },
  {
    id: "dark",
    name: "深夜",
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: "16px",
    lineHeight: "1.8",
    headingStyle: "sans",
    paragraphSpacing: "normal",
    colors: {
      background: "#1a1a1a",
      text: "#e5e5e5",
      accent: "#7eb89f",
    },
  },
  {
    id: "sepia",
    name: "复古",
    fontFamily: "'Source Han Serif CN', 'Noto Serif SC', serif",
    fontSize: "17px",
    lineHeight: "1.85",
    headingStyle: "serif",
    paragraphSpacing: "relaxed",
    colors: {
      background: "#f4ecd8",
      text: "#433422",
      accent: "#8b6914",
    },
  },
];

export const getThemeById = (id: string): EditorTheme => {
  return editorThemes.find((theme) => theme.id === id) || editorThemes[0];
};

export const generateThemeStyles = (theme: EditorTheme): string => {
  const headingFont =
    theme.headingStyle === "serif"
      ? "'Source Han Serif CN', 'Noto Serif SC', serif"
      : theme.headingStyle === "kai"
      ? "'LXGW WenKai', 'KaiTi', serif"
      : "'Inter', system-ui, sans-serif";

  const paragraphMargin =
    theme.paragraphSpacing === "compact"
      ? "1em"
      : theme.paragraphSpacing === "relaxed"
      ? "2em"
      : "1.5em";

  return `
    .editor-theme-${theme.id} {
      font-family: ${theme.fontFamily};
      font-size: ${theme.fontSize};
      line-height: ${theme.lineHeight};
      color: ${theme.colors.text};
      background-color: ${theme.colors.background};
    }
    
    .editor-theme-${theme.id} h1,
    .editor-theme-${theme.id} h2,
    .editor-theme-${theme.id} h3 {
      font-family: ${headingFont};
      color: ${theme.colors.text};
    }
    
    .editor-theme-${theme.id} h1 {
      font-size: 2em;
      margin-top: 1.5em;
      margin-bottom: 0.75em;
      font-weight: 600;
    }
    
    .editor-theme-${theme.id} h2 {
      font-size: 1.5em;
      margin-top: 1.5em;
      margin-bottom: 0.75em;
      font-weight: 600;
    }
    
    .editor-theme-${theme.id} h3 {
      font-size: 1.25em;
      margin-top: 1.25em;
      margin-bottom: 0.5em;
      font-weight: 600;
    }
    
    .editor-theme-${theme.id} p {
      margin-bottom: ${paragraphMargin};
    }
    
    .editor-theme-${theme.id} blockquote {
      border-left: 3px solid ${theme.colors.accent};
      padding-left: 1em;
      margin: 1.5em 0;
      color: ${theme.colors.text}99;
      font-style: italic;
    }
    
    .editor-theme-${theme.id} ul,
    .editor-theme-${theme.id} ol {
      margin: 1em 0;
      padding-left: 1.5em;
    }
    
    .editor-theme-${theme.id} li {
      margin: 0.5em 0;
    }
    
    .editor-theme-${theme.id} hr {
      border: none;
      border-top: 1px solid ${theme.colors.text}20;
      margin: 2em 0;
    }
    
    .editor-theme-${theme.id} a {
      color: ${theme.colors.accent};
      text-decoration: underline;
      text-underline-offset: 2px;
    }
    
    .editor-theme-${theme.id} img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 1.5em 0;
    }
    
    .editor-theme-${theme.id} mark {
      background-color: ${theme.colors.accent}40;
      padding: 0 2px;
      border-radius: 2px;
    }
  `;
};

export const imageFilters = [
  { id: "none", name: "原图", filter: "none" },
  { id: "grayscale", name: "黑白", filter: "grayscale(100%)" },
  { id: "sepia", name: "复古", filter: "sepia(60%)" },
  { id: "warm", name: "暖色", filter: "sepia(30%) saturate(120%)" },
];

export const imageLayouts = [
  { id: "default", name: "默认", className: "" },
  { id: "center", name: "居中", className: "mx-auto" },
  { id: "full", name: "全宽", className: "w-full" },
  { id: "left", name: "左对齐", className: "float-left mr-4 mb-4" },
  { id: "right", name: "右对齐", className: "float-right ml-4 mb-4" },
];
