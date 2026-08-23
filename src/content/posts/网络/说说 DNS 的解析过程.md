---
title: "说说 DNS 的解析过程"
published: 2025-04-10
description: "说说 DNS 的解析过程"
tags: ["网络","HTTP"]
category: "网络"
draft: false
slug: "network-054"
---

# 说说 DNS 的解析过程
DNS，英文全称是 **domain name system**，域名解析系统，它的作用也很明确，就是域名和 IP 相互映射。
DNS 的解析过程如下图：
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXRFJecib9hM31POtvGK0Rxgs0QlgRlZk6TUOv0c3Ks6SkqibI5PveP3BeDAkm14r54GYOicGO8u365w/640?wx_fmt=png&from=appmsg)
DNS 解析流程
假设你要查询 [www.baidu.com](http://www.baidu.com/) 的 IP 地址:

- 首先会查找浏览器的缓存,看看是否能找到[www.baidu.com](http://www.baidu.com/)对应的 IP 地址，找到就直接返回；否则进行下一步。
- 将请求发往给本地 DNS 服务器，如果查找到也直接返回，否则继续进行下一步；

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXRFJecib9hM31POtvGK0RxgM75a0TWXeC2P4MISk4JuE8uvHOWIpbulMHLtiaOPduFfF31RFoR6aeQ/640?wx_fmt=png&from=appmsg)
域名服务器层级

- 本地 DNS 服务器向**根域名服务器**发送请求，根域名服务器返回负责com的顶级域名服务器的 IP 地址的列表。
- 本地 DNS 服务器再向其中一个负责com的顶级域名服务器发送一个请求，返回负责baidu.com的权限域名服务器的 IP 地址列表。
- 本地 DNS 服务器再向其中一个权限域名服务器发送一个请求，返回[www.baidu.com](http://www.baidu.com/)所对应的 IP 地址。
