---
title: "说说Activity、Intent、Service 是什么关系"
published: 2021-07-13
description: "说说Activity、Intent、Service 是什么关系"
tags: ["Android","基础"]
category: "android基础"
draft: false
slug: "android-basic-064"
---

# 说说Activity、Intent、Service 是什么关系

他们都是 Android 开发中使用频率最高的类。其中 Activity 和 Service 都是 Android 四大组件之一。

他俩都是
Context 类的子类 ContextWrapper 的子类

Activity
负责用户界面的显示和交互，Service 负责后台任务的处理。

Activity 和 Service 之间可以通过 Intent 传递数据，因此
可以把 Intent 看作是通信使者。