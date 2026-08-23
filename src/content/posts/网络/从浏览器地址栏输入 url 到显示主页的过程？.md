---
title: "从浏览器地址栏输入 url 到显示主页的过程？"
published: 2024-05-20
description: "从浏览器地址栏输入 url 到显示主页的过程？"
tags: ["网络","HTTP"]
category: "网络"
draft: false
slug: "network-037"
---

### 从浏览器地址栏输入 url 到显示主页的过程？

从在浏览器地址栏输入 URL 到显示主页的过程包括多个步骤，涵盖了 DNS 解析、TCP 连接、发送 HTTP 请求、服务器处理请求并返回 HTTP 响应、浏览器处理响应并渲染页面等多个环节。

1. **DNS 解析**：浏览器发起一个 DNS 请求到 DNS 服务器，将域名解析为服务器的 IP 地址。
2. **TCP 连接**：浏览器通过解析得到的 IP 地址与服务器建立 TCP 连接（通常是通过 443 端口进行 SSL 加密的 HTTPS 连接）。这一步涉及到 TCP 的三次握手过程，确保双方都准备好进行数据传输。
3. **发送 HTTP 请求**：浏览器构建 HTTP 请求消息，包括请求行（如 GET / HTTP/1.1）、请求头（包含用户代理、接受的内容类型等信息）和请求体（如果有）；将请求发送到服务器。
4. **服务器处理请求**：服务器接收到 HTTP 请求后，根据请求的资源路径，经过后端处理（可能包括数据库查询等），生成 HTTP 响应消息；响应消息包括状态行（如 HTTP/1.1 200 OK）、响应头（内容类型、缓存控制等信息）和响应体（请求的资源内容）。
5. **浏览器接收 HTTP 响应**：浏览器接收到服务器返回的 HTTP 响应数据，开始解析响应体中的 HTML 内容；然后构建 DOM 树、解析 CSS 和 JavaScript 文件等，最终渲染页面。
6. **断开连接**：TCP 四次挥手，连接结束

我们以输入 [www.baidu.com](http://www.baidu.com/)为例：
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXRFJecib9hM31POtvGK0RxgjHibpAEXk3rrAsrE4tFf8RibiaH3bkibibpGsKd1jJHmwl2fMLBBhicM6GEw/640?wx_fmt=png&from=appmsg)
[www.baidu.com](http://www.baidu.com/)URL 到显示主页
**各个过程都使用了哪些协议？**
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXRFJecib9hM31POtvGK0RxggW5KlrDX3licc02HicP6ibZTNUPpbVQt8OFYxG1iccoSdMe34JT9VTZb1w/640?wx_fmt=png&amp;from=appmsg)

