---
title: "如何设计在 UDP 上层保证 UDP 的可靠性传输"
published: 2023-03-08
description: "如何设计在 UDP 上层保证 UDP 的可靠性传输"
tags: ["网络","HTTP"]
category: "网络"
draft: false
slug: "network-039"
---

# 如何设计在 UDP 上层保证 UDP 的可靠性传输

传输层无法保证数据的可靠传输，只能通过应用层来实现了。实现的方式可以参照tcp可靠性传输的方式。如不考虑拥塞处理，可靠UDP的简单设计如下：

- 1、添加seq/ack机制，确保数据发送到对端
- 2、添加发送和接收缓冲区，主要是用户超时重传。
- 3、添加超时重传机制。

具体过程即是：送端发送数据时，生成一个随机seq=x，然后每一片按照数据大小分配seq。数据到达接收端后接收端放入缓存，并发送一个ack=x的包，表示对方已经收到了数据。发送端收到了ack包后，删除缓冲区对应的数据。时间到后，定时任务检查是否需要重传数据。

目前有如下开源程序利用udp实现了可靠的数据传输。分别为RUDP、RTP、UDT:

1、RUDP（Reliable User Datagram Protocol）

RUDP 提供一组数据服务质量增强机制，如拥塞控制的改进、重发机制及淡化服务器算法等。

2、RTP（Real Time Protocol）

RTP为数据提供了具有实时特征的端对端传送服务，如在组播或单播网络服务下的交互式视频音频或模拟数据。

3、UDT（UDP-based Data Transfer Protocol）

UDT的主要目的是支持高速广域网上的海量数据传输。

[关于RUDP、RTP、UDT的更多介绍请查看此处](https://www.jianshu.com/p/6c73a4585eba)
