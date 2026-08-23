---
title: "细说一下 TCP 的三次握手机制"
published: 2025-06-10
description: "细说一下 TCP 的三次握手机制"
tags: ["网络","HTTP"]
category: "网络"
draft: false
slug: "network-046"
---

# 细说一下 TCP 的三次握手机制
> TCP 三次握手是最重要的知识点，一定要熟悉到问到即送分。

TCP 提供面向连接的服务，在传送数据前必须建立连接，TCP 连接是通过三次握手建立的。
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXRFJecib9hM31POtvGK0RxgoNHJyaCcunahlD0HrWBpkj11fVuuWnRWAAleSkiaf30ict78ICjDX8KQ/640?wx_fmt=png&from=appmsg)
三次握手的过程：

- 最开始，客户端和服务端都处于 CLOSE 状态，服务端监听客户端的请求，进入 LISTEN 状态
- 客户端端发送连接请求，**第一次握手** (SYN=1, seq=x)，发送完毕后，客户端就进入 SYN_SENT 状态
- 服务端确认连接，**第二次握手** (SYN=1, ACK=1, seq=y, ACKnum=x+1)， 发送完毕后，服务器端就进入 SYN_RCV 状态。
- 客户端收到服务端的确认之后，再次向服务端确认，这就是**第三次握手 **(ACK=1，ACKnum=y+1)，发送完毕后，客户端进入 ESTABLISHED 状态，当服务器端接收到这个包时，也进入 ESTABLISHED 状态。



