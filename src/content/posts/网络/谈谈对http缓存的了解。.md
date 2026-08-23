---
title: "谈谈对http缓存的了解。"
published: 2025-11-30
description: "谈谈对http缓存的了解。"
tags: ["网络","HTTP"]
category: "网络"
draft: false
slug: "network-057"
---

# 谈谈对http缓存的了解。

HTTP的缓存机制也是依赖于请求和响应header里的参数类实现的，最终响应式从缓存中去，还是从服务端重新拉取，HTTP的缓存机制的流程如下所示：

![image](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUw9BicVvmviceybO8w5pgneyjcIt3FialgFvJUolGCKCX3x2HmZEGtaO3Ruib1xVx5nvic68PadLvIcVw/640?wx_fmt=png)

HTTP的缓存可以分为两种：

强制缓存：需要服务端参与判断是否继续使用缓存，当客户端第一次请求数据是，服务端返回了缓存的过期时间（Expires与Cache-Control），没有过期就可以继续使用缓存，否则则不适用，无需再向服务端询问。
对比缓存：需要服务端参与判断是否继续使用缓存，当客户端第一次请求数据时，服务端会将缓存标识（Last-Modified/If-Modified-Since与Etag/If-None-Match）与数据一起返回给客户端，客户端将两者都备份到缓存中 ，再次请求数据时，客户端将上次备份的缓存 标识发送给服务端，服务端根据缓存标识进行判断，如果返回304，则表示通知客户端可以继续使用缓存。
强制缓存优先于对比缓存。

上面提到强制缓存使用的的两个标识：

Expires：Expires的值为服务端返回的到期时间，即下一次请求时，请求时间小于服务端返回的到期时间，直接使用缓存数据。到期时间是服务端生成的，客户端和服务端的时间可能有误差。
Cache-Control：Expires有个时间校验的问题，所有HTTP1.1采用Cache-Control替代Expires。
Cache-Control的取值有以下几种：

private: 客户端可以缓存。
public: 客户端和代理服务器都可缓存。
max-age=xxx: 缓存的内容将在 xxx 秒后失效
no-cache: 需要使用对比缓存来验证缓存数据。
no-store: 所有内容都不会缓存，强制缓存，对比缓存都不会触发。
我们再来看看对比缓存的两个标识：

Last-Modified/If-Modified-Since

Last-Modified 表示资源上次修改的时间。

当客户端发送第一次请求时，服务端返回资源上次修改的时间：

    Last-Modified: Tue, 12 Jan 2016 09:31:27 GMT
客户端再次发送，会在header里携带If-Modified-Since。将上次服务端返回的资源时间上传给服务端。

    If-Modified-Since: Tue, 12 Jan 2016 09:31:27 GMT 
服务端接收到客户端发来的资源修改时间，与自己当前的资源修改时间进行对比，如果自己的资源修改时间大于客户端发来的资源修改时间，则说明资源做过修改， 则返回200表示需要重新请求资源，否则返回304表示资源没有被修改，可以继续使用缓存。

上面是一种时间戳标记资源是否修改的方法，还有一种资源标识码ETag的方式来标记是否修改，如果标识码发生改变，则说明资源已经被修改，ETag优先级高于Last-Modified。

    Etag/If-None-Match

ETag是资源文件的一种标识码，当客户端发送第一次请求时，服务端会返回当前资源的标识码：

    ETag: "5694c7ef-24dc"
客户端再次发送，会在header里携带上次服务端返回的资源标识码：

If-None-Match:"5694c7ef-24dc"
服务端接收到客户端发来的资源标识码，则会与自己当前的资源吗进行比较，如果不同，则说明资源已经被修改，则返回200，如果相同则说明资源没有被修改，返回 304，客户端可以继续使用缓存。
