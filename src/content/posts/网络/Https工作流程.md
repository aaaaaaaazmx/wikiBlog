---
title: "Https工作流程"
published: 2021-04-15
description: "Https工作流程"
tags: ["网络","HTTP"]
category: "网络"
draft: false
slug: "network-010"
---

# Https工作流程
这道题有几个要点：**公私钥、数字证书、加密、对称加密、非对称加密**。
HTTPS 主要工作流程：

1. 客户端发起 HTTPS 请求，连接到服务端的 443 端口。
2. 服务端有一套数字证书（证书内容有公钥、证书颁发机构、失效日期等）。
3. 服务端将自己的数字证书发送给客户端（公钥在证书里面，私钥由服务器持有）。
4. 客户端收到数字证书之后，会验证证书的合法性。如果证书验证通过，就会生成一个随机的对称密钥，用证书的公钥加密。
5. 客户端将公钥加密后的密钥发送到服务器。
6. 服务器接收到客户端发来的密文密钥之后，用自己之前保留的私钥对其进行非对称解密，解密之后就得到客户端的密钥，然后用客户端密钥对返回数据进行对称加密，酱紫传输的数据都是密文啦。
7. 服务器将加密后的密文返回到客户端。
8. 客户端收到后，用自己的密钥对其进行对称解密，得到服务器返回的数据。

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXRFJecib9hM31POtvGK0RxgcDq5W9369h2ZBU1WuIK7NtosWjunRERQMs8DWdO95ib5Z6w4qZJh1ibA/640?wx_fmt=png&from=appmsg)
这里还画了一张更详尽的图：
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXRFJecib9hM31POtvGK0RxgFN8Bmib6BUthZcGPpgTicorGePSjDiaQovu3dQIdNQfobW55WpfV3bpqg/640?wx_fmt=png&from=appmsg)

