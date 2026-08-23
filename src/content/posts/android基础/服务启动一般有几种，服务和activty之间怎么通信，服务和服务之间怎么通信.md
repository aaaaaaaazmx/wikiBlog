---
title: "服务启动一般有几种，服务和activty之间怎么通信，服务和服务之间怎么通信"
published: 2022-06-23
description: "服务启动一般有几种，服务和activty之间怎么通信，服务和服务之间怎么通信"
tags: ["Android","基础"]
category: "android基础"
draft: false
slug: "android-basic-057"
---

# 服务启动一般有几种，服务和activty之间怎么通信，服务和服务之间怎么通信

**方式：**

- 1、startService：

onCreate()--->onStartCommand() ---> onDestory()

如果服务已经开启，不会重复的执行onCreate()， 而是会调用onStartCommand()。一旦服务开启跟调用者(开启者)就没有任何关系了。
开启者退出了，开启者挂了，服务还在后台长期的运行。
开启者不能调用服务里面的方法。

- 2、bindService：

onCreate() --->onBind()--->onunbind()--->onDestory()

bind的方式开启服务，绑定服务，调用者挂了，服务也会跟着挂掉。
绑定者可以调用服务里面的方法。

**通信：**

- 1、通过Binder对象。

- 2、通过broadcast(广播)。