---
title: "TCP 四次挥手的过程"
published: 2021-12-17
description: "TCP 四次挥手的过程"
tags: ["网络","HTTP"]
category: "网络"
draft: false
slug: "network-018"
---

# TCP 四次挥手的过程
> PS：问完三次握手，常常也会顺道问问四次挥手，所以也是必须掌握知识点。


![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXRFJecib9hM31POtvGK0RxgB3cfS9Eiae8DX5UmygU1kFDVTBRZrB1YJKlV3woeItr48kGM5yQUkkA/640?wx_fmt=png&from=appmsg)
TCP 四次挥手过程：

- 数据传输结束之后，通信双方都可以主动发起断开连接请求，这里假定客户端发起
- 客户端发送释放连接报文，**第一次挥手** (FIN=1，seq=u)，发送完毕后，客户端进入 **FIN_WAIT_1** 状态。
- 服务端发送确认报文，**第二次挥手** (ACK=1，ack=u+1,seq =v)，发送完毕后，服务器端进入 **CLOSE_WAIT** 状态，客户端接收到这个确认包之后，进入 **FIN_WAIT_2** 状态。
- 服务端发送释放连接报文，**第三次挥手** (FIN=1，ACK1,seq=w,ack=u+1)，发送完毕后，服务器端进入 **LAST_ACK** 状态，等待来自客户端的最后一个 ACK。
- 客户端发送确认报文，**第四次挥手** (ACK=1，seq=u+1,ack=w+1)，客户端接收到来自服务器端的关闭请求，发送一个确认包，并进入 TIME_WAIT 状态，**等待了某个固定时间（两个最大段生命周期，2MSL，2 Maximum Segment Lifetime）之后**，没有收到服务器端的 ACK ，认为服务器端已经正常关闭连接，于是自己也关闭连接，进入 CLOSED 状态。服务器端接收到这个确认包之后，关闭连接，进入 CLOSED 状态。



