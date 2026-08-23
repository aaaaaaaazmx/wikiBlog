---
title: "SystemServer 进程作用"
published: 2021-04-28
description: "SystemServer 进程作用"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-033"
---


# SystemServer 进程作用
system_server 为所有App提供服务，可以说是系统的核心进程之一，它主要的功能如下：
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUGHgUuYAt58jImv3hCgck1icmicnNA8QicZiaz4a1E8r6uV99pj5lEfebztepib9pBwjiaWESib1WzSMibGQ/640?wx_fmt=png&from=appmsg)
可以看出，它创建并启动了许多服务，常见的AMS、PMS、WMS，我们常说系统某某服务返回了啥，往细的说这里的"系统"可以认为是system_server进程。
需要注意的是，这里所说的服务并不是Android四大组件的Service，而是某一类功能。
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUGHgUuYAt58jImv3hCgck11kJSsVic0l7YE8sDpExtgEzGibJVzouxlGDIZobXG98oOvBLbricmjhLA/640?wx_fmt=png&from=appmsg)
实际调用流程如下：
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUGHgUuYAt58jImv3hCgck1765s6fjgNlbmw4AgVZZ31vz7ibScKnqia3ggggibniaBhlibuEsKTands3Q/640?wx_fmt=png&from=appmsg)

由上图可知，不管是同一进程内的通信亦或是不同进程间的通信，都需要system_server介入。 
App 和 system_server 是属于不同的进程，App进程如何找到system_server呢？
还是要借助ServiceManager进程：
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUGHgUuYAt58jImv3hCgck1xCdVZ9mAj2v6Rbg458Ak3OibpiadQGXgzLNvBgOHjelyjA2icFqPF0hSQ/640?wx_fmt=png&from=appmsg)
system_server 在启动时候不仅开启了各种服务，同时还将需要暴露的服务注册到ServiceManager里，其它进程想要使用system_server的功能时只需要从SystemManager里查询即可。