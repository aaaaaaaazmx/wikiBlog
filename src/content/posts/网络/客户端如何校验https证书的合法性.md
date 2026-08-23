---
title: "客户端如何校验https证书的合法性"
published: 2021-02-11
description: "客户端如何校验https证书的合法性"
tags: ["网络","HTTP"]
category: "网络"
draft: false
slug: "network-040"
---

# 客户端如何校验https证书的合法性
服务端的证书从哪来的呢？
为了让服务端的公钥被⼤家信任，服务端的证书都是由 CA （_Certificate Authority_，证书认证机构）签名的，CA 就是⽹络世界⾥的公安局、公证中⼼，具有极⾼的可信度，所以由它来给各个公钥签名，信任的⼀⽅签发的证书，那必然证书也是被信任的。
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXRFJecib9hM31POtvGK0Rxgg4L4CtGK1FESr5OTe5lrkmBxNvyXsbS9tWN93wMEKnia3EzqokrJyibA/640?wx_fmt=png&from=appmsg)
CA 签发证书的过程，如上图左边部分：

- ⾸先 CA 会把持有者的公钥、⽤途、颁发者、有效时间等信息打成⼀个包，然后对这些信息进⾏ Hash 计算，得到⼀个 Hash 值；
- 然后 CA 会使⽤⾃⼰的私钥将该 Hash 值加密，⽣成 Certificate Signature，也就是 CA 对证书做了签名；
- 最后将 Certificate Signature 添加在⽂件证书上，形成数字证书；

客户端校验服务端的数字证书的过程，如上图右边部分：

- ⾸先客户端会使⽤同样的 Hash 算法获取该证书的 Hash 值 H1；
- 通常浏览器和操作系统中集成了 CA 的公钥信息，浏览器收到证书后可以使⽤ CA 的公钥解密 Certificate
- Signature 内容，得到⼀个 Hash 值 H2 ；
- 最后⽐较 H1 和 H2，如果值相同，则为可信赖的证书，否则则认为证书不可信。

假如在 HTTPS 的通信过程中，中间人篡改了证书原文，由于他没有 CA 机构的私钥，所以 CA 公钥解密的内容就不一致
