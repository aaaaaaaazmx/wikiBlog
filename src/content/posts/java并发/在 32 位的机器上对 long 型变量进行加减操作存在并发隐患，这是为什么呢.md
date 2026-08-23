---
title: "在 32 位的机器上对 long 型变量进行加减操作存在并发隐患，这是为什么呢"
published: 2021-12-09
description: "在 32 位的机器上对 long 型变量进行加减操作存在并发隐患，这是为什么呢"
tags: ["Java","并发","多线程"]
category: "java并发"
draft: false
slug: "java-concurrent-023"
---


# 在 32 位的机器上对 long 型变量进行加减操作存在并发隐患，这是为什么呢

ong类型64位，所以在32位的机器上，对long类型的数据操作通常需要多条指令组合出来，无法保证原子性，所以并发的时候会出问题