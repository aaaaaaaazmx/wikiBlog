/**
 * 修复代码块语言标识大小写问题
 * Java -> java, Xml -> xml, etc.
 */

const fs = require('fs');
const path = require('path');

const TARGET_DIR = 'C:/vsProject/wikiBlog/src/content/posts';

// 需要修复的语言标识映射（大写 -> 小写）
const LANGUAGE_MAP = {
  'Java': 'java',
  'Xml': 'xml',
  'XML': 'xml',
  'JAVA': 'java',
  'Kotlin': 'kotlin',
  'KOTLIN': 'kotlin',
  'Python': 'python',
  'PYTHON': 'python',
  'JavaScript': 'javascript',
  'JAVASCRIPT': 'javascript',
  'TypeScript': 'typescript',
  'TYPESCRIPT': 'typescript',
  'Html': 'html',
  'HTML': 'html',
  'Css': 'css',
  'CSS': 'css',
  'Json': 'json',
  'JSON': 'json',
  'Yaml': 'yaml',
  'YAML': 'yaml',
  'Sql': 'sql',
  'SQL': 'sql',
  'Shell': 'shell',
  'SHELL': 'shell',
  'Bash': 'bash',
  'BASH': 'bash',
  'Groovy': 'groovy',
  'GROOVY': 'groovy',
  'Gradle': 'gradle',
  'GRADLE': 'gradle',
};

// 构建正则表达式
const languagePattern = Object.keys(LANGUAGE_MAP).join('|');
const codeBlockRegex = new RegExp(`^\`\`\`(${languagePattern})$`, 'gm');

function fixCodeBlocks(content) {
  return content.replace(codeBlockRegex, (match, lang) => {
    const lowerLang = LANGUAGE_MAP[lang] || lang.toLowerCase();
    return '```' + lowerLang;
  });
}

function processDirectory(dir) {
  const items = fs.readdirSync(dir);
  let fixedCount = 0;
  let filesFixed = [];

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      const result = processDirectory(fullPath);
      fixedCount += result.fixedCount;
      filesFixed = filesFixed.concat(result.filesFixed);
    } else if (item.endsWith('.md')) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const fixedContent = fixCodeBlocks(content);

      if (content !== fixedContent) {
        fs.writeFileSync(fullPath, fixedContent, 'utf-8');
        fixedCount++;
        filesFixed.push(fullPath.replace(TARGET_DIR + '/', ''));
        console.log(`  ✓ Fixed: ${path.relative(TARGET_DIR, fullPath)}`);
      }
    }
  }

  return { fixedCount, filesFixed };
}

console.log('修复代码块语言标识...\n');
const result = processDirectory(TARGET_DIR);
console.log(`\n========================================`);
console.log(`修复完成！共修复 ${result.fixedCount} 个文件`);
console.log('========================================');
