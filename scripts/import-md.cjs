/**
 * 批量导入 md 文件脚本
 * 将 downloaded_md 目录下的文件按文件夹名归档到 src/content/posts/
 */

const fs = require('fs');
const path = require('path');

const SOURCE_DIR = 'C:/vsProject/mdDownLoad/downloaded_md';
const TARGET_DIR = 'C:/vsProject/wikiBlog/src/content/posts';

// 生成 slug（URL友好的标识符）
function generateSlug(filename, category, index) {
  // 使用分类缩写 + 序号
  const categoryMap = {
    'android基础': 'android-basic',
    'android进阶': 'android-adv',
    'framework': 'framework',
    'framework专栏': 'framework-col',
    'gradle': 'gradle',
    'java基础': 'java-basic',
    'java并发': 'java-concurrent',
    'java虚拟机': 'jvm',
    'java集合': 'java-collection',
    'kotlin': 'kotlin',
    '字节码专栏': 'bytecode',
    '性能优化': 'performance',
    '网络': 'network',
    '自定义View专栏': 'custom-view',
    '设计模式': 'design-pattern',
    '面经': 'interview'
  };

  const prefix = categoryMap[category] || category.replace(/[\s\u4e00-\u9fa5]/g, '').toLowerCase() || 'post';
  return `${prefix}-${String(index).padStart(3, '0')}`;
}

// 生成 frontmatter
function generateFrontmatter(filename, category, index) {
  const title = filename.replace('.md', '');
  const today = new Date().toISOString().split('T')[0];
  const slug = generateSlug(filename, category, index);

  // 根据分类生成 tags
  const categoryTags = {
    'android基础': ['Android', '基础'],
    'android进阶': ['Android', '进阶'],
    'framework': ['Android', 'Framework'],
    'framework专栏': ['Android', 'Framework', '专栏'],
    'gradle': ['Gradle', '构建工具'],
    'java基础': ['Java', '基础'],
    'java并发': ['Java', '并发', '多线程'],
    'java虚拟机': ['Java', 'JVM', '虚拟机'],
    'java集合': ['Java', '集合', '数据结构'],
    'kotlin': ['Kotlin', 'Android'],
    '字节码专栏': ['字节码', 'JVM', '专栏'],
    '性能优化': ['性能优化', 'Android'],
    '网络': ['网络', 'HTTP'],
    '自定义View专栏': ['自定义View', 'Android', 'UI'],
    '设计模式': ['设计模式', '架构'],
    '面经': ['面试', '面经']
  };

  const tags = categoryTags[category] || [category];

  return `---
title: "${title.replace(/"/g, '\\"')}"
published: ${today}
description: "${title.replace(/"/g, '\\"')}"
tags: ${JSON.stringify(tags)}
category: "${category}"
draft: false
slug: "${slug}"
---

`;
}

// 检查文件是否已有 frontmatter
function hasFrontmatter(content) {
  return content.trim().startsWith('---');
}

// 主函数
async function main() {
  console.log('开始导入 md 文件...\n');

  // 获取所有分类文件夹
  const categories = fs.readdirSync(SOURCE_DIR).filter(item => {
    const itemPath = path.join(SOURCE_DIR, item);
    return fs.statSync(itemPath).isDirectory();
  });

  console.log(`找到 ${categories.length} 个分类文件夹:\n${categories.join(', ')}\n`);

  let totalFiles = 0;
  let successCount = 0;
  let skipCount = 0;

  for (const category of categories) {
    const sourceCategoryPath = path.join(SOURCE_DIR, category);
    const targetCategoryPath = path.join(TARGET_DIR, category);

    // 创建目标分类文件夹
    if (!fs.existsSync(targetCategoryPath)) {
      fs.mkdirSync(targetCategoryPath, { recursive: true });
    }

    // 获取该分类下的所有 md 文件
    const mdFiles = fs.readdirSync(sourceCategoryPath).filter(file => file.endsWith('.md'));

    console.log(`\n处理分类: ${category} (${mdFiles.length} 个文件)`);

    let categoryIndex = 1;

    for (const mdFile of mdFiles) {
      totalFiles++;
      const sourceFilePath = path.join(sourceCategoryPath, mdFile);
      const targetFilePath = path.join(targetCategoryPath, mdFile);

      try {
        // 读取源文件
        let content = fs.readFileSync(sourceFilePath, 'utf-8');

        // 如果没有 frontmatter，添加 frontmatter
        if (!hasFrontmatter(content)) {
          const frontmatter = generateFrontmatter(mdFile, category, categoryIndex);
          content = frontmatter + content;
        } else {
          console.log(`  跳过 (已有frontmatter): ${mdFile}`);
          skipCount++;
        }

        // 写入目标文件
        fs.writeFileSync(targetFilePath, content, 'utf-8');
        successCount++;
        categoryIndex++;

      } catch (err) {
        console.error(`  错误处理文件 ${mdFile}: ${err.message}`);
      }
    }

    console.log(`  ✓ 完成 ${category}: ${mdFiles.length} 个文件`);
  }

  console.log('\n========================================');
  console.log(`导入完成!`);
  console.log(`总文件数: ${totalFiles}`);
  console.log(`成功导入: ${successCount}`);
  console.log(`跳过文件: ${skipCount}`);
  console.log('========================================');
}

main().catch(console.error);
