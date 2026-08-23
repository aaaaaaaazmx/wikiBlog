---
title: "AIDL 中的 in out inout oneway关键字"
published: 2021-02-18
description: "AIDL 中的 in out inout oneway关键字"
tags: ["Android","进阶"]
category: "android进阶"
draft: false
slug: "android-adv-002"
---

# AIDL 中的 in out inout oneway关键字
## 关键字的作用
in out inout 是 aidl 中的 directional tag，表示了在跨进程通信中数据的流向：

- **in** 表示数据只能由客户端流向服务端，服务端会获取到客户端完整的数据，但客户端不会同步服务端你对该对象的修改，不写的话，默认的 tag 就是 in。
- **out** 表示数据只能由服务端流向客户端，从服务端端接受该对象不为空，但字段内容为空，服务端修改对象后，binder 远程调用返回后，客户端会收到修改后的对象。
- **inout** 则表示数据可在服务端与客户端之间双向流通。
- 默认情况下，我们在 AIDL 中定义的接口方法是同步的，如果 AIDL 中的接口方法被 oneway 修饰了，那么这些方法就变成异步的了。

# 源码解析
这里就不赘述了,可以通过下面链接查看
- https://mp.weixin.qq.com/s/AL2Ge14A5esNl2Bko4kZrg

