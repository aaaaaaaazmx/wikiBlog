---
title: "Android应用进程是怎么启动的吗(简单版)"
published: 2023-12-20
description: "Android应用进程是怎么启动的吗(简单版)"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-008"
---


# Android应用进程是怎么启动的吗(简单版)

- [你知道Android应用进程是怎么启动的吗](https://mp.weixin.qq.com/s/A62rEZ93mYDRHTRmr7rqzg)

**进程启动的方式**
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUGHgUuYAt58jImv3hCgck1U5nEaqiagpw3GHOt9ECZmxj5CSNCMs5plWRTVHYSK7ok5CWzxD1ibibKQ/640?wx_fmt=png&from=appmsg)
进程启动方式有两种，通过fork启动一个进程的，fork会返回两次pid，

- 当pid等于0说明当前在子进程中
- 当pid大于0说明当前是在父进程中，返回的pid是子进程的pid。

上面两种进程启动的方式不同的地方在于第二种启动方式会在子进程中调用execve，第一种方式启动的子进程会继承父进程的系统资源，而第二种进程启动方式会将父进程的资源进行替换，execve中传递的path就是系统资源替换的二进制文件。

**应用进程是什么时候启动的**
Android中应用进程的启动都是被动的启动的， 当我们在启动组件的时候，如果发现组件所在的进程没有被启动，这时候才会去启动进程。
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUGHgUuYAt58jImv3hCgck1Ziap2D99iaw7Q0nUMiaLXE652cjayhIiczdUvIqEaOMTuicUF7CjbL81H5Q/640?wx_fmt=png&from=appmsg)
每个进程都会对应一个ProcessRecord，在启动一个组件的时候会首先进行上面的判断，通过getProcessRecordLocked判断当前组件所在的进程是否启动，要是没有启动，就会调用startProcessLocked进行进程启动
**首先我们来看一下应用和AMS之间的关系图：**
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUGHgUuYAt58jImv3hCgck1r95k1dDqZnQrOdpHNIDW0SKGOwJWFLZFzdPVictmOISsP2SpHBicic4gQ/640?wx_fmt=png&from=appmsg)
应用是可以通过ServiceManager查询并拿到AMS的Binder句柄IActivityManager的，应用拿到AMS的Binder句柄之后，就可以通过Binder向AMS发起服务调用，但这样只能是应用主动调AMS的服务，而有时候AMS也需要通过Binder通知应用或调用应用的生命周期，所以AMS也需要获得应用的Binder句柄，而应用的Binder句柄就是IApplicationThread。

我们知道应用想要获得AMS的Binder句柄可以通过ServiceManager进行查询申请，那么AMS是如何获得应用的Binder句柄的呢？应用在启动初始化的时候，会通过AMS的Binder通知AMS，一方面告诉AMS当前进程已经启动了，另一方面就会将当前应用进程的Binder句柄注册到AMS中，以便AMS通过Binder调用应用进程。
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUGHgUuYAt58jImv3hCgck1ia1aMRoricYFCnh2VO6zh7IH0mxPaSdUolsGqg6EvfibDJJT1kYhmjASA/640?wx_fmt=png&from=appmsg)

上面的代码是一个应用进程启动的main入口，所有的应用进程启动都是进入这个main入口，需要注意上面的ActivityThread与线程无关，上面的代码中thread.attach中，获取了iActivityManager对象，这个对象就是AMS的Binder句柄，应用进程拿到这个Binder句柄之后，调用attachApplication向AMS进行报告，并将mAppThread传递给AMS，而mAppThread就是当前应用的Binder句柄，也就是Framework层启动应用进程的时候app的thread属性。

从上面的分析可以看到，一个应用进程的启动分为两步：

- 1. AMS向Zygote发起应用进程启动的请求，Zygote在启动了应用进程之后，会给AMS返回应用进程的pid；
- 2. 应用进程启动好之后，获得AMS的Binder句柄，通过Binder调用告诉AMS应用进程启动完成，并将应用进程的Binder句柄注册到AMS中。

经过上面的两步，一个进程才会认为真正的启动了，在之后的组件调用中就不会重复启动该进程。

我们知道AMS在通知Zygote启动进程完成之后，Zygote会返回子进程的pid，所以startProcessLocked为了防止进程的重复启动，会判断app已经app的pid是否正常，要是进程已启动，那么app的pid大于0，此处就不会重复启动该进程
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUGHgUuYAt58jImv3hCgck1MepKDIumqefVYhcgJR2iafibnhJjmfhOlUgE0CESlEmFkhrXXnNAg0Mg/640?wx_fmt=png&from=appmsg)
startProcessLocked并不会直接启动一个进程，它是通过本地的socket向Zygote发送请求参数，发送完成之后，等待Zygote启动进程，Zygote通过fork启动成功之后，就会将子进程的pid通过本地socket返回给startProcessLocked。

Zygote在自身启动之后，会启动一个for循环socket信息，当监听到新的消息的时候，就会处理当前消息。

