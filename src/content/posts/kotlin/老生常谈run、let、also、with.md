---
title: "老生常谈run、let、also、with"
published: 2021-10-31
description: "老生常谈run、let、also、with"
tags: ["Kotlin","Android"]
category: "kotlin"
draft: false
slug: "kotlin-030"
---

run、let、apply、also、with都是Kotlin官方为我们提供的高阶函数，通常对比着4个操作符，

1. 差异

我们关注receiver、argument、return之间的差异，如图所示
![image.png](https://cdn.nlark.com/yuque/0/2023/png/215777/1688059631110-20a22367-cc81-4472-b19e-d14e61e6e3e8.png)

2. 场景

![image.png](https://cdn.nlark.com/yuque/0/2023/png/215777/1688059638114-01ca0acd-702d-4292-a2a2-75a2de080b06.png)
简而言之

- **run**适用于在顶层进行初始化时使用
- **let**在被可空对象调用时，适用于做null值的检查，let在被非空对象调用时，适用于做对象的映射计算，比如说从一个对象获取信息，之后对另一个对象进行初始化和设置最后返回新的对象
- **apply**适用于做对象初始化之后的配置
- **also**适用于与程序本身逻辑无关的副作用，比如说打印日志等

## 

