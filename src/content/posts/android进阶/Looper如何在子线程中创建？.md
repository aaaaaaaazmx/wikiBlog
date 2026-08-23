---
title: "Looper如何在子线程中创建？"
published: 2024-12-05
description: "Looper如何在子线程中创建？"
tags: ["Android","进阶"]
category: "android进阶"
draft: false
slug: "android-adv-024"
---

# Looper如何在子线程中创建？

## 核心api
创建子线程的looper必须要通过 **Looper.prepare()** 初始化looper,然后再通过Looper.loop()方法让Loop运行起来。

那么具体的细节请看下面的说明：

首先我们要知道Looper相关的几个重要方法：
- Looper.prepare()：Looper 初始化, 同时会初始化MessageQueue， Looper消息机制必须要初始化Looper。
- Looper.myLooper()： 获取当前调用线程中ThreadLocal缓存的Looper对象。
- Looper.loop()：让Loop进入死循环。
- getLooper()： Handler中的方法, 获取Handler中缓存的Looper对象。
- Looper.quit(): 终止 Looper.looper() 死循环, 执行 quit后Handler机制将失效, 执行时如果MessageQueue中还有Message未执行, 将不会执行未执行Message, 直接退出, 调用quit后将不能发消息给Handler。
- Looper.quitSafely(): 作用同 quit(), 但终止Looper之前会先执行完消息队列中所有非延时任务, 调用quit后将不能发消息给Handler。

## 子线程使用Looper
```
    Handler mHandler;
    new Thread(new Runnable() {
        @Override
        public void run() {
            Looper.prepare();//Looper初始化
            //Handler初始化 需要注意, Handler初始化传入Looper对象是子线程中缓存的Looper对象
            mHandler = new Handler(Looper.myLooper());
            Looper.loop();//死循环
            //注意: Looper.loop()之后的位置代码在Looper退出之前不会执行,(并非永远不执行)
        }
    }).start();
```

其中主要需要注意的就是Handler的初始化，**需要传入当前线程的 Looper 对象**。然而，一般情况下我们并不会这样去给子线程创建looper，因为这样的方式只能创建一个handler对象。我们最正确的创建子线程 Looper的方法一般是调用HandlerThread。

