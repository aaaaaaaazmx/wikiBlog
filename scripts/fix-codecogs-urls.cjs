/**
 * 修复 codecogs LaTeX 图片 URL
 * 将多行的 LaTeX URL 合并为单行，避免被误解析
 */

const fs = require('fs');
const path = require('path');

const TARGET_DIR = 'C:/vsProject/wikiBlog/src/content/posts';

function fixCodecogsUrls(content) {
  // 匹配 codecogs 图片格式（可能跨多行，$$可能在问号后或新行）
  const codecogsPattern = /!\[\]\(http:\/\/latex\.codecogs\.com\/png\.latex\?[\s]*\$\$[\s\S]*?\$\$\)/g;

  let modified = false;

  const newContent = content.replace(codecogsPattern, (match) => {
    // 将多行内容合并为单行，移除换行符
    const singleLine = match.replace(/\n/g, '').replace(/\s+/g, ' ');
    if (singleLine !== match) {
      modified = true;
    }
    return singleLine;
  });

  return { content: newContent, modified };
}

function processDirectory(dir) {
  const items = fs.readdirSync(dir);
  let fixedCount = 0;

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      fixedCount += processDirectory(fullPath);
    } else if (item.endsWith('.md')) {
      const content = fs.readFileSync(fullPath, 'utf-8');

      // 只处理包含 codecogs 的文件
      if (content.includes('latex.codecogs.com')) {
        const { content: newContent, modified } = fixCodecogsUrls(content);

        if (modified) {
          fs.writeFileSync(fullPath, newContent, 'utf-8');
          fixedCount++;
          console.log(`  ✓ ${path.relative(TARGET_DIR, fullPath)}`);
        }
      }
    }
  }

  return fixedCount;
}

console.log('修复 codecogs LaTeX 图片 URL...\n');
const fixedCount = processDirectory(TARGET_DIR);
console.log(`\n========================================`);
console.log(`修复完成！共修复 ${fixedCount} 个文件`);
console.log('========================================');
