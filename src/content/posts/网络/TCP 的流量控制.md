---
title: "TCP 的流量控制"
published: 2020-04-12
description: "TCP 的流量控制"
tags: ["网络","HTTP"]
category: "网络"
draft: false
slug: "network-023"
---

# TCP 的流量控制
TCP 提供了一种机制，可以让发送端根据接收端的实际接收能力控制发送的数据量，这就是**流量控制**。
TCP 通过**滑动窗口**来控制流量，我们看下简要流程：

- 首先双方三次握手，初始化各自的窗口大小，均为 400 个字节。

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXRFJecib9hM31POtvGK0RxgicIvp4ExqObUoG1wZk8c5kQqCY7vbGMFEUdOwJySGlrh6XmKyxHCJrA/640?wx_fmt=png&amp;from=appmsg)

- 假如当前发送方给接收方发送了 200 个字节，那么，发送方的SND.NXT会右移 200 个字节，也就是说当前的可用窗口减少了 200 个字节。
- 接受方收到后，放到缓冲队列里面，REV.WND =400-200=200 字节，所以 win=200 字节返回给发送方。接收方会在 ACK 的报文首部带上缩小后的滑动窗口 200 字节
- 发送方又发送 200 字节过来，200 字节到达，继续放到缓冲队列。不过这时候，由于大量负载的原因，接受方处理不了这么多字节，只能处理 100 字节，剩余的 100 字节继续放到缓冲队列。这时候，REV.WND = 400-200-100=100 字节，即 win=100 返回发送方。
- 发送方继续发送 100 字节过来，这时候，接收窗口 win 变为 0。
- 发送方停止发送，开启一个定时任务，每隔一段时间，就去询问接受方，直到 win 大于 0，才继续开始发送。

