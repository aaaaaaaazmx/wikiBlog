---
title: "为什么调用 start()方法时会执行 run()方法，那怎么不直接调用 run()方法？"
published: 2023-12-24
description: "为什么调用 start()方法时会执行 run()方法，那怎么不直接调用 run()方法？"
tags: ["Java","并发","多线程"]
category: "java并发"
draft: false
slug: "java-concurrent-019"
---

## 为什么调用 start()方法时会执行 run()方法，那怎么不直接调用 run()方法？
JVM 执行 start 方法，会先创建一条线程，由创建出来的新线程去执行 thread 的 run 方法，这才起到多线程的效果。
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUibHk3eNVqcUb1D6wrHC1LazwnMDaWFjibwhKK4YjzyhakxmUH9ic5uPfhyGb1grlx38lFVf4IEM0yw/640?wx_fmt=png&from=appmsg)
start方法
为什么我们不能直接调用 run()方法？也很清楚， 如果直接调用 Thread 的 run()方法，那么 run 方法还是运行在主线程中，相当于顺序执行，就起不到多线程的效果。