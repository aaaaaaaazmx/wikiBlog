---
title: "Kotlin Flow 是如何工作的？"
published: 2020-03-16
description: "Kotlin Flow 是如何工作的？"
tags: ["Kotlin","Android"]
category: "kotlin"
draft: false
slug: "kotlin-005"
---

#### Kotlin Flow 是如何工作的？
平常我们开发都会使用到网络请求吧，当从服务器请求数据并使用异步编程来处理该数据时，_Flow_会在后台线程中异步管理该数据，因为某些进程可能会运行更长时间来获取数据。一旦收集器接收并收集了数据，就会使用回收器视图显示数据。
![](https://cdn.nlark.com/yuque/0/2024/webp/215777/1712576830724-a7407377-945e-42be-8595-9ec47dbda743.webp)
我们已经知道，_Flow_是一系列值，它使用挂起函数异步生成和使用值。
Flow流由三个实体组成：

- 生产者: 用于发出添加到流中的数据。
- 中介：它可以修改发送到流中的值
- 消费者 : 从流中接收值

![](https://cdn.nlark.com/yuque/0/2024/webp/215777/1712576830708-55baeb40-3306-428e-8213-35c26db1241e.webp)
