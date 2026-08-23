---
title: "Http1.0,2.0,3.0"
published: 2023-09-26
description: "Http1.0,2.0,3.0"
tags: ["网络","HTTP"]
category: "网络"
draft: false
slug: "network-006"
---

# Http1.0,2.0,3.0
关键需要记住 **HTTP/1.0** 默认是短连接，可以强制开启，HTTP/1.1 默认长连接，HTTP/2.0 采用**多路复用**。
**HTTP/1.0**

- 默认使用**短连接**，每次请求都需要建立一个 TCP 连接。它可以设置Connection: keep-alive 这个字段，强制开启长连接。

**HTTP/1.1**

- 引入了持久连接，即 TCP 连接默认不关闭，可以被多个请求复用。
- 分块传输编码，即服务端每产生一块数据，就发送一块，用” 流模式” 取代” 缓存模式”。
- 管道机制，即在同一个 TCP 连接里面，客户端可以同时发送多个请求。

**HTTP/2.0**

- 二进制协议，1.1 版本的头信息是文本（ASCII 编码），数据体可以是文本或者二进制；2.0 中，头信息和数据体都是二进制。
- 完全多路复用，在一个连接里，客户端和浏览器都可以同时发送多个请求或回应，而且不用按照顺序一一对应。
- 报头压缩，HTTP 协议不带有状态，每次请求都必须附上所有信息。Http/2.0 引入了头信息压缩机制，使用 gzip 或 compress 压缩后再发送。
- 服务端推送，允许服务器未经请求，主动向客户端发送资源

HTTP/3 主要有两大变化，**传输层基于 UDP**、使用**QUIC 保证 UDP 可靠性**。
HTTP/2 存在的一些问题，比如重传等等，都是由于 TCP 本身的特性导致的，所以 HTTP/3 在 QUIC 的基础上进行发展而来，QUIC（Quick UDP Connections）直译为快速 UDP 网络连接，底层使用 UDP 进行数据传输。
HTTP/3 主要有这些特点：

- 使用 UDP 作为传输层进行通信
- 在 UDP 的基础上 QUIC 协议保证了 HTTP/3 的安全性，在传输的过程中就完成了 TLS 加密握手
- HTTPS 要建⽴⼀个连接，要花费 6 次交互，先是建⽴三次握⼿，然后是 TLS/1.3 的三次握⼿。QUIC 直接把以往的 TCP 和 TLS/1.3 的 6 次交互合并成了 **3** 次，减少了交互次数。
- QUIC 有⾃⼰的⼀套机制可以保证传输的可靠性的。当某个流发⽣丢包时，只会阻塞这个流，其他流不会受到影响。

我们拿一张图看一下 HTTP 协议的变迁：
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXRFJecib9hM31POtvGK0RxgxHvxB4AomMbXm3snYGxXnNV58eluIcWMZ5TFTOzPgwYqibskYLouWeg/640?wx_fmt=png&from=appmsg)

