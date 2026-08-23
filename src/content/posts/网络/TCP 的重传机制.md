---
title: "TCP 的重传机制"
published: 2024-05-23
description: "TCP 的重传机制"
tags: ["网络","HTTP"]
category: "网络"
draft: false
slug: "network-025"
---

# TCP 的重传机制
重传包括**超时重传、快速重传、带选择确认的重传（SACK）、重复 SACK 四种**。
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXRFJecib9hM31POtvGK0RxgPkSiaN6hOWf0zj37yW2o57WTGkiaYRYYqnYZkWGicktMFcbYuUxKq9I5g/640?wx_fmt=png&amp;from=appmsg)
##### 超时重传
超时重传，是 TCP 协议保证数据可靠性的另一个重要机制，其原理是在发送某一个数据以后就开启一个计时器，在一定时间内如果没有得到发送的数据报的 ACK 报文，那么就重新发送数据，直到发送成功为止。
**超时时间应该设置为多少呢？**
先来看下什么叫 **RTT（Round-Trip Time，往返时间）**。
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXRFJecib9hM31POtvGK0Rxg5ZYkvAIJZxSLdCW7GsRyj1wtIOPhLicAM86dlPvj0sEEHToQoibSLNlw/640?wx_fmt=png&amp;from=appmsg)
RTT 就是数据完全发送完，到收到确认信号的时间，即数据包的一次往返时间。
超时重传时间，就是 RTO（Retransmission Timeout)。那么，**RTO 到底设置多大呢？**

- 如果 RTO 设置很大，等了很久都没重发，这样肯定就不行。
- 如果 RTO 设置很小，那很可能数据都没有丢失，就开始重发了，这会导致网络阻塞，从而恶性循环，导致更多的超时出现。

一般来说，RTO 略微大于 RTT，效果是最佳的。
其实，RTO 有个标准方法的计算公式，也叫 **Jacobson / Karels 算法**。

1. 首先计算 SRTT（即计算平滑的 RTT）

```
SRTT = (1 - α) * SRTT + α * RTT  //求 SRTT 的加权平均
```

1. 其次，计算 RTTVAR (round-trip time variation)

```
RTTVAR = (1 - β) * RTTVAR + β * (|RTT - SRTT|) //计算 SRTT 与真实值的差距
```

1. 最后，得出最终的 RTO

```
RTO = µ * SRTT + ∂ * RTTVAR  =  SRTT + 4·RTTVAR
```
在 Linux 下，**α = 0.125**，**β = 0.25**， **μ = 1**，**∂ = 4**。别问这些参数是怎么来的，它们是大量实践，调出的最优参数。
超时重传不是十分完美的重传方案，它有这些缺点：

- 当一个报文丢失时，会等待一定的超时周期，才重传分组，增加了端到端的时延。
- 当一个报文丢失时，在其等待超时的过程中，可能会出现这种情况：其后的报文段已经被接收端接收但却迟迟得不到确认，发送端会认为也丢失了，从而引起不必要的重传，既浪费资源也浪费时间。

并且，对于 TCP，如果发生一次超时重传，时间间隔下次就会加倍。
##### [#](https://javabetter.cn/sidebar/sanfene/network.html#%E5%BF%AB%E9%80%9F%E9%87%8D%E4%BC%A0)快速重传
TCP 还有另外⼀种快速重传（**Fast Retransmit**）机制，它不以时间为驱动，⽽是以数据驱动重传。
它不以时间驱动，而是以数据驱动。它是基于接收端的反馈信息来引发重传的。
可以用它来解决超时重发的时间等待问题，快速重传流程如下
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXRFJecib9hM31POtvGK0RxgwNGmVOlObbSsP6ibFExhjFa2FfK1Wfl7jQZmK6736NzK5rUGwU16YmA/640?wx_fmt=png&amp;from=appmsg)
在上图，发送⽅发出了 1，2，3，4，5 份数据：

- 第⼀份 Seq1 先送到了，于是就 Ack 回 2；
- 结果 Seq2 因为某些原因没收到，Seq3 到达了，于是还是 Ack 回 2；
- 后⾯的 Seq4 和 Seq5 都到了，但还是 Ack 回 2，因为 Seq2 还是没有收到；
- 发送端收到了三个 **Ack = 2** 的确认，知道了 **Seq2** 还没有收到，就会在定时器过期之前，重传丢失的 **Seq2**。
- 最后，收到了 Seq2，此时因为 Seq3，Seq4，Seq5 都收到了，于是 Ack 回 6 。

快速重传机制只解决了⼀个问题，就是超时时间的问题，但是它依然⾯临着另外⼀个问题。就是重传的时候，是重传之前的⼀个，还是重传所有的问题。
⽐如对于上⾯的例⼦，是重传 Seq2 呢？还是重传 Seq2、Seq3、Seq4、Seq5 呢？因为发送端并不清楚这连续的三个 Ack 2 是谁传回来的。
根据 TCP 不同的实现，以上两种情况都是有可能的。可⻅，这是⼀把双刃剑。
为了解决不知道该重传哪些 TCP 报⽂，于是就有 SACK ⽅法。
##### 带选择确认的重传（SACK）
为了解决应该重传多少个包的问题? TCP 提供了**带选择确认的重传**（即 SACK，Selective Acknowledgment）。
**SACK 机制**就是，在快速重传的基础上，接收方返回最近收到报文段的序列号范围，这样发送方就知道接收方哪些数据包是没收到的。这样就很清楚应该重传哪些数据包。
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXRFJecib9hM31POtvGK0Rxgln9pI5OiczWU8Bpx1M5M7ViayROw2pGWHwKp7GCFgs3WdK5nY47CSmVA/640?wx_fmt=png&amp;from=appmsg)
如上图中，发送⽅收到了三次同样的 ACK 确认报⽂，于是就会触发快速重发机制，通过 SACK 信息发现只有 200~299 这段数据丢失，则重发时，就只选择了这个 TCP 段进⾏重发。
##### 重复 SACK（D-SACK）
D-SACK，英文是 Duplicate SACK，是在 SACK 的基础上做了一些扩展，主要用来告诉发送方，有哪些数据包，自己重复接受了。
DSACK 的目的是帮助发送方判断，是否发生了包失序、ACK 丢失、包重复或伪重传。让 TCP 可以更好的做网络流控。
例如 ACK 丢包导致的数据包重复：
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXRFJecib9hM31POtvGK0RxgG8onuc1DIUHD3GdguFIen08ldiaGfks6RFk7YZZvpXJSY1x4pFSomBg/640?wx_fmt=png&amp;from=appmsg)

- 接收⽅发给发送⽅的两个 ACK 确认应答都丢失了，所以发送⽅超时后，重传第⼀个数据包（3000 ~

3499）

- 于是接收⽅发现数据是重复收到的，于是回了⼀个 **SACK = 3000~3500**，告诉「发送⽅」 3000~3500 的数据早已被接收了，因为 ACK 都到了 4000 了，已经意味着 4000 之前的所有数据都已收到，所以这个 SACK 就代表着 D-SACK 。这样发送⽅就知道了，数据没有丢，是接收⽅的 ACK 确认报⽂丢了
