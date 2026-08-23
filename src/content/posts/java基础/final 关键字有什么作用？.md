---
title: "final 关键字有什么作用？"
published: 2025-01-16
description: "final 关键字有什么作用？"
tags: ["Java","基础"]
category: "java基础"
draft: false
slug: "java-basic-011"
---

### final 关键字有什么作用？
final 表示不可变的意思，可用于修饰类、属性和方法：

- 被 final 修饰的类不可以被继承
- 被 final 修饰的方法不可以被重写
- 被 final 修饰的变量不可变，被 final 修饰的变量必须被显式第指定初始值，还得注意的是，这里的不可变指的是变量的引用不可变，不是引用指向的内容的不可变。例如：

```java
final StringBuilder sb = new StringBuilder("abc");
sb.append("d");
System.out.println(sb);  //abcd
```
一张图说明：
![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLVcyUqrgdSOGULtk7dZIguJFNu0V5hXtqXg3gibSiauibeE1BZiagmVtdAiajISLNXPdiaroAvUsTjrsmeA/640?wx_fmt=png&amp;from=appmsg)
final修饰变量