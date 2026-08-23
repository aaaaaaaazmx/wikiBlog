---
title: "说一下 HTTP 的报文结构"
published: 2021-01-28
description: "说一下 HTTP 的报文结构"
tags: ["网络","HTTP"]
category: "网络"
draft: false
slug: "network-049"
---

# 说一下 HTTP 的报文结构
HTTP 报文有两种，HTTP 请求报文和 HTTP 响应报文：
![24-06.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXRFJecib9hM31POtvGK0RxgabVg0lsnqrPUG4IDRLrzvN1WOSOlf1HiaDJeWb9dtsYBHI8iapvlMnbg/640?wx_fmt=png&from=appmsg)
**HTTP 请求报文**
HTTP 请求报文的格式如下：
```
GET / HTTP/1.1
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5)
Accept: */*
```
HTTP 请求报文的第一行叫做请求行，后面的行叫做首部行，首部行后还可以跟一个实体主体。请求首部之后有一个空行，这个空行不能省略，它用来划分首部与实体。
请求行包含三个字段：

- 方法字段：包括 POST、GET 等请方法。
- URL 字段
- HTTP 版本字段。

**HTTP 响应报文**
HTTP 响应报文的格式如下：
```
HTTP/1.0 200 OK
Content-Type: text/plain
Content-Length: 137582
Expires: Thu, 05 Dec 1997 16:00:00 GMT
Last-Modified: Wed, 5 August 1996 15:55:28 GMT
Server: Apache 0.84
<html>
  <body>Hello World</body>
</html>
```
HTTP 响应报文的第一行叫做**状态行**，后面的行是**首部行**，最后是**实体主体**。

- **状态行**包含了三个字段：协议版本字段、状态码和相应的状态信息。
- **实体部分**是报文的主要部分，它包含了所请求的对象。
- **首部行**首部可以分为四种首部，请求首部、响应首部、通用首部和实体首部。通用首部和实体首部在请求报文和响应报文中都可以设置，区别在于请求首部和响应首部。
- 常见的请求首部有 Accept 可接收媒体资源的类型、Accept-Charset 可接收的字符集、Host 请求的主机名。
- 常见的响应首部有 ETag 资源的匹配信息，Location 客户端重定向的 URI。
- 常见的通用首部有 Cache-Control 控制缓存策略、Connection 管理持久连接。
- 常见的实体首部有 Content-Length 实体主体的大小、Expires 实体主体的过期时间、Last-Modified 资源的最后修改时间
