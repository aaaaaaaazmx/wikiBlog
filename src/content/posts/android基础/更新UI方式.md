---
title: "更新UI方式"
published: 2021-01-05
description: "更新UI方式"
tags: ["Android","基础"]
category: "android基础"
draft: false
slug: "android-basic-056"
---

# 更新UI方式

- Activity.runOnUiThread(Runnable)
- View.post(Runnable)，View.postDelay(Runnable, long)（可以理解为在当前操作视图UI线程添加队列）
- Handler
- AsyncTask
- Rxjava
- LiveData