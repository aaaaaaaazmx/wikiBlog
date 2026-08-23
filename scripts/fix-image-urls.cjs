/**
 * 修复图片 URL 问题
 * 1. 去掉语雀图片链接中 # 后面的参数
 * 2. 清理其他平台的无效参数
 */

const fs = require('fs');
const path = require('path');

const TARGET_DIR = 'C:/vsProject/wikiBlog/src/content/posts';

// 匹配 markdown 图片语法，捕获 URL
const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;

function cleanImageUrl(url) {
  // 去掉 # 后面的所有内容（语雀等平台的参数）
  const hashIndex = url.indexOf('#');
  if (hashIndex !== -1) {
    return url.substring(0, hashIndex);
  }
  return url;
}

function fixImageUrls(content) {
  return content.replace(imageRegex, (match, alt, url) => {
    const cleanedUrl = cleanImageUrl(url);
    if (cleanedUrl !== url) {
      return `![${alt}](${cleanedUrl})`;
    }
    return match;
  });
}

function processDirectory(dir) {
  const items = fs.readdirSync(dir);
  let fixedCount = 0;
  let urlsFixed = 0;

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      const result = processDirectory(fullPath);
      fixedCount += result.fixedCount;
      urlsFixed += result.urlsFixed;
    } else if (item.endsWith('.md')) {
      const content = fs.readFileSync(fullPath, 'utf-8');

      // 计算修复的 URL 数量
      const matches = content.match(imageRegex) || [];
      const urlsToFix = matches.filter(m => m.includes('#')).length;

      const fixedContent = fixImageUrls(content);

      if (content !== fixedContent) {
        fs.writeFileSync(fullPath, fixedContent, 'utf-8');
        fixedCount++;
        urlsFixed += urlsToFix;
        console.log(`  ✓ ${path.relative(TARGET_DIR, fullPath)} (${urlsToFix} URLs)`);
      }
    }
  }

  return { fixedCount, urlsFixed };
}

console.log('修复图片 URL...\n');
const result = processDirectory(TARGET_DIR);
console.log(`\n========================================`);
console.log(`修复完成！`);
console.log(`修复文件数: ${result.fixedCount}`);
console.log(`修复 URL 数: ${result.urlsFixed}`);
console.log('========================================');
