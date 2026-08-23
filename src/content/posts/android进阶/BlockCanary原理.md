---
title: "BlockCanary原理"
published: 2021-02-07
description: "BlockCanary原理"
tags: ["Android","进阶"]
category: "android进阶"
draft: false
slug: "android-adv-020"
---

# BlockCanary原理

该组件利用了主线程的消息队列处理机制，应用发生卡顿，一定是在dispatchMessage中执行了耗时操作。我们通过给主线程的Looper设置一个Printer，打点统计dispatchMessage方法执行的时间，如果超出阀值，表示发生卡顿，则dump出各种信息，提供开发者分析性能瓶颈。