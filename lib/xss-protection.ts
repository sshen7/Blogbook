// XSS 防护工具函数

// 清理 HTML 内容，防止 XSS 攻击
export function sanitizeHtml(html: string): string {
  if (!html) return "";

  // 移除危险的脚本标签
  const dangerousTags = [
    /<script[^>]*>[\s\S]*?<\/script>/gi,
    /<iframe[^>]*>[\s\S]*?<\/iframe>/gi,
    /<embed[^>]*>[\s\S]*?<\/embed>/gi,
    /<object[^>]*>[\s\S]*?<\/object>/gi,
    /<applet[^>]*>[\s\S]*?<\/applet>/gi,
    /<frame[^>]*>[\s\S]*?<\/frame>/gi,
    /<frameset[^>]*>[\s\S]*?<\/frameset>/gi,
    /<noframes[^>]*>[\s\S]*?<\/noframes>/gi,
  ];

  let sanitized = html;
  for (const regex of dangerousTags) {
    sanitized = sanitized.replace(regex, "");
  }

  // 移除危险的属性
  const dangerousAttributes = [
    /on\w+="[^"]*"/gi,
    /on\w+='[^']*'/gi,
    /javascript:[^"]*/gi,
    /javascript:[^']*/gi,
    /data:[^"]*javascript/i,
    /data:[^']*javascript/i,
  ];

  for (const regex of dangerousAttributes) {
    sanitized = sanitized.replace(regex, "");
  }

  // 限制样式属性
  sanitized = sanitized.replace(/style="[^"]*"/gi, (match) => {
    const styles = match
      .replace(/style="/gi, "")
      .replace(/"/gi, "")
      .split(";")
      .filter(style => {
        const [property] = style.split(":");
        const safeProperties = [
          "color", "background-color", "font-size", "font-family",
          "text-align", "margin", "padding", "border", "border-radius",
          "width", "height", "max-width", "max-height"
        ];
        return safeProperties.includes(property.trim());
      })
      .join(";");

    return styles ? `style="${styles}"` : "";
  });

  // 限制 class 属性
  sanitized = sanitized.replace(/class="[^"]*"/gi, (match) => {
    const classes = match
      .replace(/class="/gi, "")
      .replace(/"/gi, "")
      .split(" ")
      .filter(cls => {
        const safeClasses = [
          "prose", "prose-lg", "max-w-none", "focus:outline-none",
          "min-h-[300px]", "px-8", "py-12", "border-none",
          "editor-theme-minimal", "editor-theme-dark", "editor-theme-light"
        ];
        return safeClasses.includes(cls.trim());
      })
      .join(" ");

    return classes ? `class="${classes}"` : "";
  });

  // 限制 href 属性
  sanitized = sanitized.replace(/href="[^"]*"/gi, (match) => {
    const url = match
      .replace(/href="/gi, "")
      .replace(/"/gi, "");

    // 只允许安全的 URL 协议
    const safeProtocols = ["http://", "https://", "mailto:", "tel:"];
    const isSafe = safeProtocols.some(protocol => url.startsWith(protocol));

    return isSafe ? match : 'href="#"';
  });

  // 限制 src 属性
  sanitized = sanitized.replace(/src="[^"]*"/gi, (match) => {
    const url = match
      .replace(/src="/gi, "")
      .replace(/"/gi, "");

    // 只允许安全的 URL 协议和相对路径
    const safeProtocols = ["http://", "https://", "/"];
    const isSafe = safeProtocols.some(protocol => url.startsWith(protocol));

    return isSafe ? match : 'src="#"';
  });

  return sanitized;
}

// 清理文本内容，提取纯文本
export function extractPlainText(html: string): string {
  if (!html) return "";

  // 移除所有 HTML 标签
  let text = html.replace(/<[^>]*>/g, "");

  // 替换 HTML 实体
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");

  // 清理多余的空白
  text = text.replace(/\s+/g, " ").trim();

  return text;
}

// 验证富文本内容的安全性
export function validateRichText(html: string): boolean {
  if (!html) return true;

  // 检查是否有危险的标签或属性
  const dangerousPatterns = [
    /<script[^>]*>[\s\S]*?<\/script>/i,
    /on\w+="[^"]*"/i,
    /on\w+='[^']*'/i,
    /javascript:[^"]*/i,
    /javascript:[^']*/i,
    /data:[^"]*javascript/i,
    /data:[^']*javascript/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(html)) {
      return false;
    }
  }

  return true;
}

// 安全的图片 URL 验证
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;

  try {
    const parsedUrl = new URL(url);
    const allowedProtocols = ["http:", "https:"];
    const allowedDomains = [
      "picsum.photos",
      "placehold.co",
      "images.unsplash.com",
      "localhost",
    ];

    if (!allowedProtocols.includes(parsedUrl.protocol)) {
      return false;
    }

    if (parsedUrl.hostname !== "localhost" && !allowedDomains.includes(parsedUrl.hostname)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

// 安全的链接 URL 验证
export function isValidLinkUrl(url: string): boolean {
  if (!url) return false;

  try {
    const parsedUrl = new URL(url);
    const allowedProtocols = ["http:", "https:", "mailto:", "tel:"];

    if (!allowedProtocols.includes(parsedUrl.protocol)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}