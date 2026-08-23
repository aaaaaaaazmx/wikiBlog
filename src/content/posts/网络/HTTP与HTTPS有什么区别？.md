---
title: "HTTP与HTTPS有什么区别？"
published: 2023-07-09
description: "HTTP与HTTPS有什么区别？"
tags: ["网络","HTTP"]
category: "网络"
draft: false
slug: "network-012"
---

# HTTP与HTTPS有什么区别？

TTPS是一种通过计算机网络进行安全通信的传输协议。HTTPS经由HTTP进行通信，但利用SSL/TLS来加密数据包。HTTPS开发的主要目的，是提供对网站服务器的身份 认证，保护交换数据的隐私与完整性。

HTPPS和HTTP的概念：

HTTPS（全称：Hypertext Transfer Protocol over Secure Socket Layer），是以安全为目标的HTTP通道，简单讲是HTTP的安全版。即HTTP下加入SSL层，HTTPS的安全基础是SSL，因此加密的详细内容就需要SSL。 它是一个URI scheme（抽象标识符体系），句法类同http:体系。用于安全的HTTP数据传输。https:URL表明它使用了HTTP，但HTTPS存在不同于HTTP的默认端口及一个加密/身份验证层（在HTTP与TCP之间）。这个系统的最初研发由网景公司进行，提供了身份验证与加密通讯方法，现在它被广泛用于万维网上安全敏感的通讯，例如交易支付方面。

超文本传输协议 (HTTP-Hypertext transfer protocol) 是一种详细规定了浏览器和万维网服务器之间互相通信的规则，通过因特网传送万维网文档的数据传送协议。

https协议需要到ca申请证书，一般免费证书很少，需要交费。http是超文本传输协议，信息是明文传输，https 则是具有安全性的ssl加密传输协议http和https使用的是完全不同的连接方式用的端口也不一样,前者是80,后者是443。http的连接很简单,是无状态的HTTPS协议是由SSL+HTTP协议构建的可进行加密传输、身份认证的网络协议 要比http协议安全HTTPS解决的问题：1 . 信任主机的问题. 采用https 的server 必须从CA 申请一个用于证明服务器用途类型的证书. 改证书只有用于对应的server 的时候,客户度才信任次主机2 . 防止通讯过程中的数据的泄密和被窜改

如下图所示，可以很明显的看出两个的区别：

![image](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUw9BicVvmviceybO8w5pgney3AU71pKOMZuiaPJLibjnepV2qALvXNDU6kqC4ffHVzbs4kg8x04S9xyg/640?wx_fmt=png)

注：TLS是SSL的升级替代版，具体发展历史可以参考传输层安全性协议。

HTTP与HTTPS在写法上的区别也是前缀的不同，客户端处理的方式也不同，具体说来：

如果URL的协议是HTTP，则客户端会打开一条到服务端端口80（默认）的连接，并向其发送老的HTTP请求。
如果URL的协议是HTTPS，则客户端会打开一条到服务端端口443（默认）的连接，然后与服务器握手，以二进制格式与服务器交换一些SSL的安全参数，附上加密的 HTTP请求。
所以你可以看到，HTTPS比HTTP多了一层与SSL的连接，这也就是客户端与服务端SSL握手的过程，整个过程主要完成以下工作：

- 交换协议版本号
- 选择一个两端都了解的密码
- 对两端的身份进行认证
- 生成临时的会话密钥，以便加密信道。
SSL握手是一个相对比较复杂的过程，更多关于SSL握手的过程细节可以参考TLS/SSL握手过程

SSL/TSL的常见开源实现是OpenSSL，OpenSSL是一个开放源代码的软件库包，应用程序可以使用这个包来进行安全通信，避免窃听，同时确认另一端连接者的身份。这个包广泛被应用在互联网的网页服务器上。 更多源于OpenSSL的技术细节可以参考OpenSSL。

