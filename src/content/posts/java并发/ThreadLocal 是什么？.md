---
title: "ThreadLocal 是什么？"
published: 2021-08-20
description: "ThreadLocal 是什么？"
tags: ["Java","并发","多线程"]
category: "java并发"
draft: false
slug: "java-concurrent-013"
---

### ThreadLocal 是什么？
[ThreadLocal](https://javabetter.cn/thread/ThreadLocal.html)是 Java 中提供的一种用于实现线程局部变量的工具类。它允许每个线程都拥有自己的独立副本，从而实现线程隔离，用于解决多线程中共享对象的线程安全问题。
![image.png](https://cdn.nlark.com/yuque/0/2024/png/215777/1712594884349-9fbd48e0-3f92-4da2-936f-75d9c0e3f72e.png)
ThreadLocal线程副本
使用 ThreadLocal 通常分为三步：
①、创建 ThreadLocal 变量

```java
//创建一个ThreadLocal变量
public static ThreadLocal<String> localVariable = new ThreadLocal<>();
```
②、设置 ThreadLocal 变量的值

```java
//设置ThreadLocal变量的值
localVariable.set("沉默王二是沙雕");
```
③、获取 ThreadLocal 变量的值

```java
//获取ThreadLocal变量的值
String value = localVariable.get();
```