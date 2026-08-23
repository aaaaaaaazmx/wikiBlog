---
title: "TCP 是如何保证可靠性的"
published: 2022-01-25
description: "TCP 是如何保证可靠性的"
tags: ["网络","HTTP"]
category: "网络"
draft: false
slug: "network-022"
---

# TCP 是如何保证可靠性的
TCP 主要提供了检验和、序列号/确认应答、超时重传、最大消息长度、滑动窗口控制等方法实现了可靠性传输。
![image.png](https://cdn.nlark.com/yuque/0/2024/png/215777/1712313880285-e623ddab-43e6-4997-b29c-19e5e723baf6.png)

1. **连接管理**：TCP 使用三次握手和四次挥手保证可靠地建立连接和释放连接，这里就不用多说了。
2. **校验和**：TCP 将保持它首部和数据的检验和。这是一个端到端的检验和，目的是检测数据在传输过程中的任何变化。如果接收端的检验和有差错，TCP 将丢弃这个报文段和不确认收到此报文段。

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXRFJecib9hM31POtvGK0RxgibzkxN8CUM8LHvib85wytibDgjjp6l51szzic03ogQq25icEY0jHafbiaXDg/640?wx_fmt=png&from=appmsg)
TCP 校验和

3. **序列号/确认应答**：TCP 给发送的每一个包进行编号，接收方会对收到的包进行应答，发送方就会知道接收方是否收到对应的包，如果发现没有收到，就会重发，这样就能保证数据的完整性。就像老师上课，会问一句，这一章听懂了吗？没听懂再讲一遍。

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXRFJecib9hM31POtvGK0RxgsBdNeNjPKgYXwJWrNTfeJZeZjG2jVFEx3icMvcKibneo1mKIUubhtiaiaA/640?wx_fmt=png&from=appmsg)

4. **流量控制**：TCP 连接的每一方都有固定大小的缓冲空间，TCP 的接收端只允许发送端发送接收端缓冲区能接纳的数据。当接收方来不及处理发送方的数据，能提示发送方降低发送的速率，防止包丢失。TCP 使用的流量控制协议是可变大小的滑动窗口协议。（TCP 利用滑动窗口实现流量控制）

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXRFJecib9hM31POtvGK0Rxgj61tlJmU5f7KCXrAauQEUCbHWYABcWff4qHaTd8XwCVsQ9GXHY0mIA/640?wx_fmt=png&from=appmsg)

5. **最大消息长度**：在建立 TCP 连接的时候，双方约定一个最大的长度（MSS）作为发送的单位，重传的时候也是以这个单位来进行重传。理想的情况下是该长度的数据刚好不被网络层分块。

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXRFJecib9hM31POtvGK0Rxg6Sibgp9guKr4EtZkyphQsm5UH8ujiaPTx4ias6uYslaicVcibvTAlxzxF7A/640?wx_fmt=png&amp;from=appmsg)

6. **超时重传**超时重传是指发送出去的数据包到接收到确认包之间的时间，如果超过了这个时间会被认为是丢包了，需要重传。

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXRFJecib9hM31POtvGK0RxgkaePUxkfEnvOXIxvqJlgSWlMDticnSOKLv4BUr8ymCOBSSJTR5ViafAQ/640?wx_fmt=png&amp;from=appmsg)

7. **拥塞控制**如果网络非常拥堵，此时再发送数据就会加重网络负担，那么发送的数据段很可能超过了最大生存时间也没有到达接收方，就会产生丢包问题。为此 TCP 引入慢启动机制，先发出少量数据，就像探路一样，先摸清当前的网络拥堵状态后，再决定按照多大的速度传送数据。

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXRFJecib9hM31POtvGK0RxgH3sYaz1J6cEOLbPicAF2RaOgQ6Z1HcP374Xg14aYI9QS9MajgFMlLnQ/640?wx_fmt=png&amp;from=appmsg)


