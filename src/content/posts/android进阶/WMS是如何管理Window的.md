---
title: "WMS是如何管理Window的"
published: 2024-08-17
description: "WMS是如何管理Window的"
tags: ["Android","进阶"]
category: "android进阶"
draft: false
slug: "android-adv-034"
---

# WMS是如何管理Window的

#### Window 、WindowManager、WMS、SurfaceFlinger
    
- WIndow：抽象概念不是实际存在的，而是以 View 的形式存在，通过 PhoneWindow 实现
- WindowManager：外界访问 Window 的入口，内部与 WMS 交互是个 IPC 过程
- WMS：管理窗口 Surface 的布局和次序，作为系统级服务单独运行在一个进程
- SurfaceFlinger：将 WMS 维护的窗口按一定次序混合后显示到屏幕上
