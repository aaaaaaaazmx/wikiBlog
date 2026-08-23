---
title: "Https 请求慢的解决办法"
published: 2020-04-17
description: "Https 请求慢的解决办法"
tags: ["网络","HTTP"]
category: "网络"
draft: false
slug: "network-008"
---

# Https 请求慢的解决办法
#### 1、不通过DNS解析，直接访问IP

#### 2、解决连接无法复用
http/1.0协议头里可以设置Connection:Keep-Alive或者Connection:Close，选择是否允许在一定时间内复用连接（时间可由服务器控制）。但是这对App端的请求成效不大，因为App端的请求比较分散且时间跨度相对较大。

方案1.基于tcp的长连接 (主要）
移动端建立一条自己的长链接通道，通道的实现是基于tcp协议。基于tcp的socket编程技术难度相对复杂很多，而且需要自己定制协议。但信息的上报和推送变得更及时，请求量爆发的时间点还能减轻服务器压力（避免频繁创建和销毁连接）

方案2.http long-polling
客户端在初始状态发送一个polling请求到服务器，服务器并不会马上返回业务数据，而是等待有新的业务数据产生的时候再返回，所以链接会一直被保持。一但结束当前连接，马上又会发送一个新的polling请求，如此反复，保证一个连接被保持。
存在问题：
1）增加了服务器的压力
2）网络环境复杂场景下，需要考虑怎么重建健康的连接通道
3）polling的方式稳定性不好
4）polling的response可能被中间代理cache住
……

方案3.http streaming
和long-polling不同的是，streaming方式通过再server response的头部增加“Transfer Encoding:chuncked”来告诉客户端后续还有新的数据到来
存在问题：
1）有些代理服务器会等待服务器的response结束之后才将结果推送给请求客户端。streaming不会结束response
2）业务数据无法按照请求分割
……

方案4.web socket
和传统的tcp socket相似，基于tcp协议，提供双向的数据通道。它的优势是提供了message的概念，比基于字节流的tcp socket使用更简单。技术较新，不是所有浏览器都提供了支持。

#### 3、解决head of line blocking
它的原因是队列的第一个数据包（队头）受阻而导致整列数据包受阻

使用**http pipelining**，确保几乎在同一时间把request发向了服务器

