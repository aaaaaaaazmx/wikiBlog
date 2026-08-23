/**
 * 将所有文章的 published 日期均匀分布到 2020-2025 年
 */

const fs = require('fs');
const path = require('path');

const TARGET_DIR = 'C:/vsProject/wikiBlog/src/content/posts';

// 日期范围
const START_DATE = new Date('2020-01-01');
const END_DATE = new Date('2025-12-31');

// 获取所有 md 文件
function getAllMdFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getAllMdFiles(fullPath));
    } else if (item.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

// 生成均匀分布的日期
function generateDates(count) {
  const dates = [];
  const totalDays = Math.floor((END_DATE - START_DATE) / (1000 * 60 * 60 * 24));
  const interval = totalDays / count;

  for (let i = 0; i < count; i++) {
    const daysToAdd = Math.floor(i * interval + Math.random() * interval * 0.8);
    const date = new Date(START_DATE);
    date.setDate(date.getDate() + daysToAdd);
    dates.push(date.toISOString().split('T')[0]);
  }

  // 打乱顺序，让同一分类内的文章日期也分散
  return dates.sort(() => Math.random() - 0.5);
}

// 更新文件的 published 日期
function updatePublishedDate(filePath, newDate) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // 匹配 frontmatter 中的 published 字段
  const publishedRegex = /^(published:\s*)(\d{4}-\d{2}-\d{2})/m;

  if (publishedRegex.test(content)) {
    content = content.replace(publishedRegex, `$1${newDate}`);
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  }

  return false;
}

// 主函数
function main() {
  console.log('获取所有 md 文件...\n');

  const allFiles = getAllMdFiles(TARGET_DIR);
  console.log(`找到 ${allFiles.length} 个文件\n`);

  // 过滤出需要更新的文件（排除原有的示例文件）
  const filesToUpdate = allFiles.filter(f => {
    const content = fs.readFileSync(f, 'utf-8');
    // 只更新 2026 年的文件（即我们导入的文件）
    return content.includes('published: 2026-01-11');
  });

  console.log(`需要更新日期的文件: ${filesToUpdate.length} 个\n`);

  if (filesToUpdate.length === 0) {
    console.log('没有需要更新的文件');
    return;
  }

  // 生成均匀分布的日期
  const dates = generateDates(filesToUpdate.length);

  // 更新文件
  let updatedCount = 0;
  for (let i = 0; i < filesToUpdate.length; i++) {
    const file = filesToUpdate[i];
    const date = dates[i];

    if (updatePublishedDate(file, date)) {
      updatedCount++;
    }
  }

  // 统计每年的文章数量
  const yearCounts = {};
  for (const date of dates) {
    const year = date.substring(0, 4);
    yearCounts[year] = (yearCounts[year] || 0) + 1;
  }

  console.log('日期分布统计:');
  for (const year of Object.keys(yearCounts).sort()) {
    console.log(`  ${year}: ${yearCounts[year]} 篇`);
  }

  console.log(`\n========================================`);
  console.log(`更新完成！共更新 ${updatedCount} 个文件`);
  console.log('========================================');
}

main();
