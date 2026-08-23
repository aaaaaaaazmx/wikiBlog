---
title: "为什么通过Message.obtain()⽅法获取Message对象"
published: 2024-10-20
description: "为什么通过Message.obtain()⽅法获取Message对象"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-042"
---

# 为什么通过Message.obtain()⽅法获取Message对象

- Message.obtain提供了消息复⽤池的能⼒，这样可以有效节省资源，

具体是使⽤ 单向链表形式的对象池来缓存message，池的⼤⼩为50。 这种设计模式我们称
为为享元设计模式，也就是对象共⽤的意思。

- 为什么采⽤单向链表，⽽不使⽤ArrayList或HashMap？

ArrayList是采⽤动态数组来实现的、HashMap是采⽤映射来实现的，它们的
查询快，⽽链表的插⼊和删除更快