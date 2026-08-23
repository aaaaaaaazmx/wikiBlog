---
title: "什么是 CSRF 攻击？如何避免"
published: 2023-08-26
description: "什么是 CSRF 攻击？如何避免"
tags: ["网络","HTTP"]
category: "网络"
draft: false
slug: "network-036"
---

# 什么是 CSRF 攻击？如何避免
> **什么是 CSRF 攻击？**

CSRF，跨站请求伪造（英文全称是 Cross-site request forgery），是一种挟持用户在当前已登录的 Web 应用程序上执行非本意的操作的攻击方法。
> **CSRF 是如何攻击的呢？**

来看一个例子：
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXRFJecib9hM31POtvGK0RxgyNMVbfEarTdqcnY0VlwIQNibTBvdHicoicDRTgxO9Xt1sqGbmoCwA4D8g/640?wx_fmt=png&amp;from=appmsg)

1. 用户登陆银行，没有退出，浏览器包含了 用户 在银行的身份认证信息。
2. 攻击者将伪造的转账请求，包含在在帖子
3. 用户在银行网站保持登陆的情况下，浏览帖子
4. 将伪造的转账请求连同身份认证信息，发送到银行网站
5. 银行网站看到身份认证信息，以为就是 用户的合法操作，最后造成用户资金损失。

**怎么应对 CSRF 攻击呢？**

- **检查 Referer 字段**

HTTP 头中的 Referer 字段记录了该 HTTP 请求的来源地址。在通常情况下，访问一个安全受限页面的请求来自于同一个网站，而如果黑客要对其实施 CSRF 攻击，他一般只能在他自己的网站构造请求。因此，可以通过验证 Referer 值来防御 CSRF 攻击。

- **添加校验 token**

以在 HTTP 请求中以参数的形式加入一个随机产生的 token，并在服务器端建立一个拦截器来验证这个 token，如果请求中没有 token 或者 token 内容不正确，则认为可能是 CSRF 攻击而拒绝该请求。

- **敏感操作多重校验**

对一些敏感的操作，除了需要校验用户的认证信息，还可以通过邮箱确认、验证码确认这样的方式多重校验。
