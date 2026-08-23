---
title: "Android 系统启动流程概览"
published: 2022-07-05
description: "Android 系统启动流程概览"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-007"
---

# Android 系统启动流程概览
按下手机电源按钮
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUGHgUuYAt58jImv3hCgck18ldc7Via6PO9Q6h7rxTia4ZxSrdTL90g9iaCk1tfw1U45t6Rmbmuzlsfg/640?wx_fmt=png&from=appmsg)

- init 是用户空间的第一个进程，它的父进程是idle进程
- init 进程通过解析init.rc 文件并fork出相应的进程
- zygote是第一个Java 虚拟机进程，通过它孵化出system_server 进程
- system_server 进程启动桌面(Launcher)App