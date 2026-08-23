---
title: "TCP的拥塞控制"
published: 2020-07-15
description: "TCP的拥塞控制"
tags: ["网络","HTTP"]
category: "网络"
draft: false
slug: "network-028"
---

# TCP的拥塞控制
> **什么是拥塞控制？不是有了流量控制吗？**

前⾯的流量控制是避免发送⽅的数据填满接收⽅的缓存，但是并不知道整个⽹络之中发⽣了什么。

⼀般来说，计算机⽹络都处在⼀个共享的环境。因此也有可能会因为其他主机之间的通信使得⽹络拥堵。
在⽹络出现拥堵时，如果继续发送⼤量数据包，可能会导致数据包时延、丢失等，这时 **TCP** 就会重传数据，但是⼀重传就会导致⽹络的负担更重，于是会导致更⼤的延迟以及更多的丢包，这个情况就会进⼊恶性循环被不断地放⼤....
所以，TCP 不能忽略整个网络中发⽣的事，它被设计成⼀个⽆私的协议，当⽹络发送拥塞时，TCP 会⾃我牺牲，降低发送的数据流。
于是，就有了拥塞控制，控制的⽬的就是避免发送⽅的数据填满整个⽹络。
就像是一个水管，不能让太多的水（数据流）流入水管，如果超过水管的承受能力，水管会被撑爆（丢包）。
![](https://cdn.nlark.com/yuque/0/2024/jpeg/215777/1712315396522-fbfac5ef-3b7e-40ae-8a35-f91c6c4a657c.jpeg)
破解的水管-图片来源网络
发送方维护一个**拥塞窗口 cwnd（congestion window）** 的变量，调节所要发送数据的量。
**什么是拥塞窗⼝？和发送窗⼝有什么关系呢？**
拥塞窗⼝ **cwnd**是发送⽅维护的⼀个的状态变量，它会根据⽹络的拥塞程度动态变化的。
发送窗⼝ swnd 和接收窗⼝ rwnd 是约等于的关系，那么由于加⼊了拥塞窗⼝的概念后，此时发送窗⼝的值是 swnd = min(cwnd, rwnd)，也就是拥塞窗⼝和接收窗⼝中的最⼩值。
拥塞窗⼝ cwnd 变化的规则：

- 只要⽹络中没有出现拥塞， cwnd 就会增⼤；
- 但⽹络中出现了拥塞， cwnd 就减少；

**拥塞控制有哪些常用算法？**
拥塞控制主要有这几种常用算法：
![image.png](https://cdn.nlark.com/yuque/0/2024/png/215777/1712315608395-7c7bbd13-2860-4d2e-8d2c-4b7a5f43f4d1.png)

- 慢启动
- 拥塞避免
- 拥塞发生
- 快速恢复
##### [#](https://javabetter.cn/sidebar/sanfene/network.html#%E6%85%A2%E5%90%AF%E5%8A%A8%E7%AE%97%E6%B3%95)慢启动算法
慢启动算法，慢慢启动。
它表示 TCP 建立连接完成后，一开始不要发送大量的数据，而是先探测一下网络的拥塞程度。由小到大逐渐增加拥塞窗口的大小，如果没有出现丢包，**每收到一个 ACK，就将拥塞窗口 cwnd 大小就加 1（单位是 MSS）**。**每轮次**发送窗口增加一倍，呈指数增长，如果出现丢包，拥塞窗口就减半，进入拥塞避免阶段。
举个例子：

- 连接建⽴完成后，⼀开始初始化 cwnd = 1 ，表示可以传⼀个 MSS ⼤⼩的数据。
- 当收到⼀个 ACK 确认应答后，cwnd 增加 1，于是⼀次能够发送 2 个
- 当收到 2 个的 ACK 确认应答后， cwnd 增加 2，于是就可以⽐之前多发 2 个，所以这⼀次能够发送 4 个
- 当这 4 个的 ACK 确认到来的时候，每个确认 cwnd 增加 1， 4 个确认 cwnd 增加 4，于是就可以⽐之前多发 4 个，所以这⼀次能够发送 8 个。

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXRFJecib9hM31POtvGK0RxgLHHX2JGqCvBHbYH4WCwCV3hlMgKOicD4wnXmcrsjl7CXAZUvHAibvEPQ/640?wx_fmt=png&amp;from=appmsg)
发包的个数是指数性的增⻓。
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXRFJecib9hM31POtvGK0RxgGN902r7zG96BOIicB7KAt7oMyK04AiaDH82pn5EzwY34DiaWrc0tHnOxQ/640?wx_fmt=png&amp;from=appmsg)
为了防止 cwnd 增长过大引起网络拥塞，还需设置一个**慢启动阀值 ssthresh**（slow start threshold）状态变量。当cwnd到达该阀值后，就好像水管被关小了水龙头一样，减少拥塞状态。即当 **cwnd >ssthresh** 时，进入了**拥塞避免**算法。
**拥塞避免算法**
一般来说，慢启动阀值 ssthresh 是 65535 字节，cwnd到达**慢启动阀值**后

- 每收到一个 ACK 时，cwnd = cwnd + 1/cwnd
- 当每过一个 RTT 时，cwnd = cwnd + 1

显然这是一个线性上升的算法，避免过快导致网络拥塞问题。
接着上面慢启动的例子，假定 ssthresh 为 8 ：：

- 当 8 个 ACK 应答确认到来时，每个确认增加 1/8，8 个 ACK 确认 cwnd ⼀共增加 1，于是这⼀次能够发送 9 个 MSS ⼤⼩的数据，变成了线性增⻓。

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXRFJecib9hM31POtvGK0Rxgjf8KhVQEINkicicknP16JQ2FsCLwm4PZ6z4iaKBmwk75Uluc2sCxD3DgQ/640?wx_fmt=png&amp;from=appmsg)
##### 拥塞发生
当网络拥塞发生**丢包**时，会有两种情况：

- RTO 超时重传
- 快速重传

如果是发生了 **RTO 超时重传**，就会使用拥塞发生算法

- 慢启动阀值 sshthresh = cwnd /2
- cwnd 重置为 1
- 进入新的慢启动过程

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXRFJecib9hM31POtvGK0RxgV4KMkqL1icIV54tjysfEzGEPyFeEnDHguFfCcjFlzicyU0N1LYXSvBicQ/640?wx_fmt=png&amp;from=appmsg)
这种方式就像是飙车的时候急刹车，还飞速倒车，这。。。
其实还有更好的处理方式，就是**快速重传**。发送方收到 3 个连续重复的 ACK 时，就会快速地重传，不必等待 **RTO 超时**再重传。
发⽣快速重传的拥塞发⽣算法：

- 拥塞窗口大小 cwnd = cwnd/2
- 慢启动阀值 ssthresh = cwnd
- 进入快速恢复算法
##### [#](https://javabetter.cn/sidebar/sanfene/network.html#%E5%BF%AB%E9%80%9F%E6%81%A2%E5%A4%8D)快速恢复
快速重传和快速恢复算法一般同时使用。快速恢复算法认为，还有 3 个重复 ACK 收到，说明网络也没那么糟糕，所以没有必要像 RTO 超时那么强烈。
正如前面所说，进入快速恢复之前，cwnd 和 sshthresh 已被更新：

- cwnd = cwnd /2

- sshthresh = cwnd
然后，进⼊快速恢复算法如下：

- cwnd = sshthresh + 3
- 重传重复的那几个 ACK（即丢失的那几个数据包）
- 如果再收到重复的 ACK，那么 cwnd = cwnd +1
- 如果收到新数据的 ACK 后, cwnd = sshthresh。因为收到新数据的 ACK，表明恢复过程已经结束，可以再次进入了拥塞避免的算法了

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXRFJecib9hM31POtvGK0RxgeopcpCGuD1n31TRDxicl67PB2z9cjD5fAOpicfTjcZmLgyCVnVfdMiapw/640?wx_fmt=png&amp;from=appmsg)

