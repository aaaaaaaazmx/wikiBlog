---
title: "Asset目录与res目录的区别"
published: 2021-09-05
description: "Asset目录与res目录的区别"
tags: ["Android","基础"]
category: "android基础"
draft: false
slug: "android-basic-009"
---

# Asset目录与res目录的区别

assets：不会在 R 文件中生成相应标记，存放到这里的资源在打包时会打包到程序安装包中。（通过 AssetManager 类访问这些文件）

res：会在 R 文件中生成 id 标记，资源在打包时如果使用到则打包到安装包中，未用到不会打入安装包中。

res/anim：存放动画资源。

res/raw：和 asset 下文件一样，打包时直接打入程序安装包中（会映射到 R 文件中）。