---
title: "Application的理解"
published: 2020-09-26
description: "Application的理解"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-009"
---

# Application的理解
**Application的作用**

- 1. 保存应用进程中的全局变量：Application会横跨进程的生命周期，我们可以在Application中维护一些全局变量
- 2. 应用初始化操作：Application的创建是排在四大组件的前面
- 3. 提供应用的上下文：Application可以提供一个稳定的context，而且因为Application的生命周期横跨整个应用的生命周期，所以不需要担心Application的context内存泄漏的问题

**【注意】**
Application是伴随着进程的，不是伴随着应用的。一个应用中可能开启多个进程，应用开启几个进行，就会同时创建几个Application。
下面看看Application的继承关系
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUauhK67TdzjU54dXicun0EOYMeOVicGYsMmGbRiaeEx29PTas34fBShwiaqHEjZfUMibksfIDT0LicaZcw/640?wx_fmt=png&amp;from=appmsg)
可以看到Application是继承自ContextWrap的，而ContextWrap并不是真正的上下文，真正的上下文是mBase，ContextWrap是mBase的静态代理。ContextWrap中的mBase是通过构造函数或attachBaseContext赋值的。
**Application的生命周期**

- - 构造函数
- - attachBaseContext
- - onCreate

**Application初始化的过程**
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUauhK67TdzjU54dXicun0EOLeJl9dYLVvqtNuulr9c1xukRBx42rX6kZ6L5Ig5fvJHtEoib3eHeBGQ/640?wx_fmt=png&amp;from=appmsg)
上面的代码是应用进程启动之后的main入口，可以看到应用进程的启动之后主要做两件事情：

- 1. 准备主线程的消息循环；
- 2. 向AMS报告，同时将自己的Binder句柄（ActivityThread）上报给AMS（上面的attach方法）

在attach方法中：
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUauhK67TdzjU54dXicun0EOc9sMjZDicibvvS4sS36ZNJaOIJmZhUWFl7zGTSmxGn8ibnQe4yAmcL1dA/640?wx_fmt=png&from=appmsg)
上面从应用的attach方法中可以看到，应用进程首先获得AMS的Binder句柄iActivityManager，通过Binder句柄调用到AMS的Binder线程中的方法。
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUauhK67TdzjU54dXicun0EOL3paHntufHiaxb9WD3ROWEu40h0NI9QsuiaVsAmMAPR2Vc5FbSnVd4Nw/640?wx_fmt=png&from=appmsg)
上面的代码中，AMS在收到来自应用进程的上报之后，拿到了应用进程的Binder句柄thread（IApplicationThread），会立即通过应用进程的Binder句柄调用到应用进程的bindApplication方法。在应用进程内就会封装一个AppBindData消息，丢到应用的主线程中进行处理。
在应用的主线程中，首先通过ClassLoader加载应用的Application类文件，通过Application的构造函数实例化一个Application对象，然后创建一个Context的对象，并通过attachBaseContext赋值给Application中的mBase，最后调用Application对象的onCreate方法。
**所以应用中Application初始化的过程：**
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUauhK67TdzjU54dXicun0EOUwMibbDtiaaB93pKWQgIWLCYJzOjCqczTxYwHF5VPR9Awr8STSrypFUg/640?wx_fmt=png&from=appmsg)
首先是Application的构造函数初始化一个Application实例，然后创一个Context对象，并通过Application对象的attachBaseContext方法赋值给application的mBase，最后调用application对象的生命周期onCreate。
通过上面Application初始化的过程可以知道，在Application的构造函数中，不要使用与Context相关的方法（比如getResource），Context（也就是mBase）是在attachBaseContext中才初始化好的。

**【注意】**
不要在Application的生命周期中做耗时操作，因为Application的生命周期都是在UI线程中进行的，Application初始化完成之后，就会立即初始化四大组件，要是我们在Application的生命周期中做了耗时操作，就会阻塞四大组件的初始化。
