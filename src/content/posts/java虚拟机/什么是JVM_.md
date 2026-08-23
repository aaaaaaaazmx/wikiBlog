---
title: "什么是JVM_"
published: 2023-03-12
description: "什么是JVM_"
tags: ["Java","JVM","虚拟机"]
category: "java虚拟机"
draft: false
slug: "jvm-007"
---


## 什么是JVM?
JVM——Java虚拟机，它是Java实现平台无关性的基石。
Java程序运行的时候，编译器将Java文件编译成平台无关的Java字节码文件（.class）,接下来对应平台JVM对字节码文件进行解释，翻译成对应平台匹配的机器指令并运行。
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLVXLYDoDiczicKRxlzxL22yDHAqEARsuK9ItMPiaaIWqC8Su5RtiaVJoq1lQ6o3mfb2nIPLWel6dbatVg/640?wx_fmt=png&from=appmsg)
同时JVM也是一个跨语言的平台，和语言无关，只和class的文件格式关联，任何语言，只要能翻译成符合规范的字节码文件，都能被JVM运行。
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLVXLYDoDiczicKRxlzxL22yDH1E2norzBXuhflod0ThBwibAMOtEF5vsA29tib3K6icjIvttVdptmiaHicmg/640?wx_fmt=png&from=appmsg)
