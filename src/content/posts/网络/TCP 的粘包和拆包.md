---
title: "TCP 的粘包和拆包"
published: 2021-11-06
description: "TCP 的粘包和拆包"
tags: ["网络","HTTP"]
category: "网络"
draft: false
slug: "network-024"
---

# TCP 的粘包和拆包
TCP 的粘包和拆包更多的是业务上的概念！
**什么是 TCP 粘包和拆包？**
TCP 是面向流，没有界限的一串数据。TCP 底层并不了解上层业务数据的具体含义，它会根据 TCP 缓冲区的实际情况进行包的划分，所以在业务上认为，一**个完整的包可能会被 TCP 拆分成多个包进行发送**，**也有可能把多个小的包封装成一个大的数据包发送**，这就是所谓的 TCP 粘包和拆包问题
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXRFJecib9hM31POtvGK0RxgyPQtBXLDdalSYAyVgY3zO9nEE4EzcJKkmYBgoNvuWZ84ZsyCWpfz7w/640?wx_fmt=png&amp;from=appmsg)
**为什么会产生粘包和拆包呢?**

- 要发送的数据小于 TCP 发送缓冲区的大小，TCP 将多次写入缓冲区的数据一次发送出去，将会发生粘包；
- 接收数据端的应用层没有及时读取接收缓冲区中的数据，将发生粘包；
- 要发送的数据大于 TCP 发送缓冲区剩余空间大小，将会发生拆包；
- 待发送数据大于 MSS（最大报文长度），TCP 在传输前将进行拆包。即 TCP 报文长度 - TCP 头部长度 > MSS。

**那怎么解决呢？**

- 发送端将每个数据包封装为固定长度
- 在数据尾部增加特殊字符进行分割
- 将数据分为两部分，一部分是头部，一部分是内容体；其中头部结构大小固定，且有一个字段声明内容体的大小。
