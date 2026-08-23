---
title: "equal、hash、=="
published: 2023-03-24
description: "equal、hash、=="
tags: ["Java","基础"]
category: "java基础"
draft: false
slug: "java-basic-010"
---

# equal、hash、==

## object类的equal 和hashcode 方法重写，为什么？

在Java API文档中关于hashCode方法有以下几点规定（原文来自java深入解析一书）：

1、在java应用程序执行期间，如果在equals方法比较中所用的信息没有被修改，那么在同一个对象上多次调用hashCode方法时必须一致地返回相同的整数。如果多次执行同一个应用时，不要求该整数必须相同。

2、如果两个对象通过调用equals方法是相等的，那么这两个对象调用hashCode方法必须返回相同的整数。

3、如果两个对象通过调用equals方法是不相等的，不要求这两个对象调用hashCode方法必须返回不同的整数。但是程序员应该意识到对不同的对象产生不同的hash值可以提供哈希表的性能。


## java中==和equals和hashCode的区别？

默认情况下也就是从超类Object继承而来的equals方法与‘==’是完全等价的，比较的都是对象的内存地址，但我们可以重写equals方法，使其按照我们的需求的方式进行比较，如String类重写了equals方法，使其比较的是字符的序列，而不再是内存地址。在java的集合中，判断两个对象是否相等的规则是：

      1.判断两个对象的hashCode是否相等。
      2.判断两个对象用equals运算是否相等。
