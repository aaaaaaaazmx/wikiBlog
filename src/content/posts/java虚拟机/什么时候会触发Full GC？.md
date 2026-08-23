---
title: "什么时候会触发Full GC？"
published: 2022-01-13
description: "什么时候会触发Full GC？"
tags: ["Java","JVM","虚拟机"]
category: "java虚拟机"
draft: false
slug: "jvm-006"
---

## 什么时候会触发Full GC？
这个触发条件稍微有点多，往下看：
![image.png](https://cdn.nlark.com/yuque/0/2024/png/215777/1712493031080-1a888b43-631b-4a17-a7f8-9d83d98dc71e.png)
Full GC触发条件

- **Young GC之前检查老年代**：在要进行 Young GC 的时候，发现老年代可用的连续内存空间 < 新生代历次Young GC后升入老年代的对象总和的平均大小，说明本次Young GC后可能升入老年代的对象大小，可能超过了老年代当前可用内存空间,那就会触发 Full GC。
- **Young GC之后老年代空间不足**：执行Young GC之后有一批对象需要放入老年代，此时老年代就是没有足够的内存空间存放这些对象了，此时必须立即触发一次Full GC
- **老年代空间不足**，老年代内存使用率过高，达到一定比例，也会触发Full GC。
- **空间分配担保失败**（ Promotion Failure），新生代的 To 区放不下从 Eden 和 From 拷贝过来对象，或者新生代对象 GC 年龄到达阈值需要晋升这两种情况，老年代如果放不下的话都会触发 Full GC。
- **方法区内存空间不足**：如果方法区由永久代实现，永久代空间不足 Full GC。
- **System.gc()等命令触发**：System.gc()、jmap -dump 等命令会触发 full gc。