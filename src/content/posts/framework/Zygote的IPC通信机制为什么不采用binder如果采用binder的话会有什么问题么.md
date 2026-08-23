---
title: "Zygote的IPC通信机制为什么不采用binder如果采用binder的话会有什么问题么"
published: 2022-12-24
description: "Zygote的IPC通信机制为什么不采用binder如果采用binder的话会有什么问题么"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-039"
---

# Zygote的IPC通信机制为什么不采用binder如果采用binder的话会有什么问题么

**fork**机制是单线程**fork**，也就是说**fork**出来的子进程只有一个线程，
如果使用**binder**机制去实现进程间的通讯，因为**binder**机制有**binder**线程池，线程之间的安全由锁控制，
所以当**fork**出现的子线程如果只有一个线程时，很可能会引起死锁，主要答出关键点单线程、死锁基本就ok了