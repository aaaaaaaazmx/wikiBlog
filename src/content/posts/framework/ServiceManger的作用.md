---
title: "ServiceManger的作用"
published: 2020-10-11
description: "ServiceManger的作用"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-027"
---


# ServiceManger的作用
ServiceManager是在系统启动之后解析init.rc 文件 fork出来的关键守护进程之一，是为了解决binder服务的查询和注册而诞生的。
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWHLmREemjAnUQiaSCXEWib11Q3VpXDCQQprSL27T3Gj5oYNvJRg7I9paiacNZxichzbZXhokkicGOS7VA/640?wx_fmt=png&from=appmsg)

**在binder进程通信中起一个获取/保存各种服务（比如AMS，WMS，PMS等）控制中心的作用，并且它是binder进程通信的服务端**

由于binder进程通信模型是一个C/S模式，就如socket通信一样，clientSocket需要先知道serverSocket的ip地址和端口号，这样他们才能建立通信链接，
那binder进程通信的c端同样也需要拿到s端的“引用”（**指BinderProxy或BpBinder**）才能进行通信，那怎么样拿到这个引用呢？这就是问题所在。

这个问题的解决其实跟域名解析过程比较类似，我们在浏览器中输入网址后会到设备上设置的DNS服务器处获取域名对应的ip地址；同理binder的c端会携带一个name值（对应s端）到某个地方获取s端的"引用"。
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWHLmREemjAnUQiaSCXEWib11GFSYFJlz17OxIkHlDv8lYR0ubXEguoRyicxicJ95CTsb9K2K48oUMibVQ/640?wx_fmt=png&from=appmsg)

ServiceManager 本身也是一个binder服务 handle值为0，初始化时候先注册，代表是ServiceManager的"引用"，这样大家就可以默认值找到它，再交由这个管家来处理后续服务的注册和查询

Android 进程间通信运用最广泛的是Binder机制，而ServiceManager进程与Binder息息相关。
DNS 存储着域名和ip的映射关系，类似的ServiceManager存储着Binder客户端和服务端的映射。
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWHLmREemjAnUQiaSCXEWib11vNnlWn9sZlyRuarAuxibffv3s2qYjDIzOQVjITBZfUxNNCdTy3M2ibgQ/640?wx_fmt=png&from=appmsg)
App1作为Binder Client端，App2 作为Binder Server端，App2 开放一个接口给App1使用（通常称为服务），此时步骤如下：

- App2 向ServiceManager注册服务，过程为：App2 获取ServiceManager的Binder引用，通过该Binder引用将App2 的Binder对象（实现了接口）添加到Binder驱动，Binder驱动记录对象与生成handle并返回给ServiceManager，ServiceManager记录关键信息（如服务名，handle）。
- App1 向ServcieManager查询服务，过程为： App1 获取ServiceManager的Binder引用，通过该Binder引用发送查询命令给Binder驱动，Binder驱动委托ServiceManager进行查询，ServiceManager根据服务名从自己的缓存链表里查出对应服务，并将该服务的handle写入驱动，进而转为App1的Binder代理。
- App1 拿到App2 的Binder代理后，App1 就可以通过Binder与App2进行IPC通信了，此时ServiceManager已经默默退居幕后，深藏功与名。

由上可知，ServiceManager进程扮演着中介的角色。
