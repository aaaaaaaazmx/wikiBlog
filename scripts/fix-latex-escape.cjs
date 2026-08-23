/**
 * 转义代码中的 $ 符号，避免被误解析为 LaTeX
 * 只转义 $0, $1, $2, $args, $class 等代码变量模式
 * 不转义代码块内的内容和真正的 LaTeX 公式
 */

const fs = require('fs');
const path = require('path');

const TARGET_DIR = 'C:/vsProject/wikiBlog/src/content/posts';

// 匹配需要转义的模式：$后跟数字、字母或下划线（代码变量）
// 但不在代码块内
function escapeCodeDollarSigns(content) {
  const lines = content.split('\n');
  let inCodeBlock = false;
  let inLatexBlock = false;
  let modified = false;

  const result = lines.map(line => {
    // 检测代码块开始/结束
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      return line;
    }

    // 检测 LaTeX 块（$$）
    if (line.trim() === '$$') {
      inLatexBlock = !inLatexBlock;
      return line;
    }

    // 在代码块或 LaTeX 块内不处理
    if (inCodeBlock || inLatexBlock) {
      return line;
    }

    // 跳过图片 URL 中的 LaTeX（codecogs）
    if (line.includes('latex.codecogs.com')) {
      return line;
    }

    // 跳过已经转义的
    if (line.includes('\\$')) {
      return line;
    }

    // 转义代码变量模式：$0, $1, $args, $class, this$0 等
    // 但保留真正的 LaTeX 行内公式（$...$）
    const newLine = line.replace(/(\$)([0-9]|args|class|this|[a-z_][a-z0-9_]*\$)/gi, (match, dollar, rest) => {
      modified = true;
      return '\\' + dollar + rest;
    });

    return newLine;
  });

  return { content: result.join('\n'), modified };
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
      const { content: newContent, modified } = escapeCodeDollarSigns(content);

      if (modified && content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf-8');
        fixedCount++;
        console.log(`  ✓ ${path.relative(TARGET_DIR, fullPath)}`);
      }
    }
  }

  return fixedCount;
}

console.log('转义代码中的 $ 符号...\n');
const fixedCount = processDirectory(TARGET_DIR);
console.log(`\n========================================`);
console.log(`修复完成！共修复 ${fixedCount} 个文件`);
console.log('========================================');
