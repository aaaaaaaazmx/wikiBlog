---
title: "说一下JDK1.6、1.7、1.8内存区域的变化？"
published: 2024-03-22
description: "说一下JDK1.6、1.7、1.8内存区域的变化？"
tags: ["Java","JVM","虚拟机"]
category: "java虚拟机"
draft: false
slug: "jvm-019"
---

## 说一下JDK1.6、1.7、1.8内存区域的变化？
JDK1.6、1.7/1.8内存区域发生了变化，主要体现在方法区的实现：

- JDK1.6使用永久代实现方法区：

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLVXLYDoDiczicKRxlzxL22yDHQOSicWic5ykKztKXF1wndhhtUWwO49BmxW86dUL8kcGziaTQNZIm0wYaw/640?wx_fmt=png&from=appmsg)
JDK 1.6内存区域

- JDK1.7时发生了一些变化，将字符串常量池、静态变量，存放在堆上

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLVXLYDoDiczicKRxlzxL22yDHcxq09rlB9rKxAJIBBiaCiaIPQW7wQWjiayzc10UvxjicibibeaQgOPm7yZRA/640?wx_fmt=png&from=appmsg)
JDK 1.7内存区域

- 在JDK1.8时彻底干掉了永久代，而在直接内存中划出一块区域作为**元空间**，运行时常量池、类常量池都移动到元空间

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLVXLYDoDiczicKRxlzxL22yDHDI3CA3D7KPYAGZibGYvsRziaD6icW5icfjRnZ44xkZe41R4icHOF011CLSg/640?wx_fmt=png&from=appmsg)
JDK 1.8内存区域