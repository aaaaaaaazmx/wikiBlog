---
title: "Java中可作为GC Roots的对象有哪几种？"
published: 2022-10-15
description: "Java中可作为GC Roots的对象有哪几种？"
tags: ["Java","JVM","虚拟机"]
category: "java虚拟机"
draft: false
slug: "jvm-003"
---

## Java中可作为GC Roots的对象有哪几种？
可以作为GC Roots的主要有四种对象：

- 虚拟机栈(栈帧中的本地变量表)中引用的对象
- 方法区中类静态属性引用的对象
- 方法区中常量引用的对象
- 本地方法栈中JNI引用的对象