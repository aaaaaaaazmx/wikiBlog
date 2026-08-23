---
title: "CAS 了解多少？"
published: 2023-01-07
description: "CAS 了解多少？"
tags: ["Java","并发","多线程"]
category: "java并发"
draft: false
slug: "java-concurrent-003"
---

### CAS 了解多少？
CAS 叫做 CompareAndSwap，⽐较并交换，主要是通过处理器的指令来保证操作的原⼦性的。
CAS 指令包含 3 个参数：共享变量的内存地址 A、预期的值 B 和共享变量的新值 C。
只有当内存中地址 A 处的值等于 B 时，才能将内存中地址 A 处的值更新为新值 C。作为一条 CPU 指令，CAS 指令本身是能够保证原子性的 。