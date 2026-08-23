---
title: "Handler是如何进⾏线程切换的"
published: 2024-12-25
description: "Handler是如何进⾏线程切换的"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-020"
---

# Handler是如何进⾏线程切换的
线程间是共享资源的。⼦线程通过handler.sendXXX，handler.postXXX等⽅法发送消息

然后通过Looper.loop()在消息队列中不断的循环检索消息

最后交给 msg.target.dispatchMessage⽅法进⾏消息的分发处理。

这⾥的资源就是msg，msg.target就是handler，所有可以间接对Handler实现线程切换。