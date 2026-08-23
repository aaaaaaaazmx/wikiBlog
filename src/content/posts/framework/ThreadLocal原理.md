---
title: "ThreadLocal原理"
published: 2024-12-12
description: "ThreadLocal原理"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-034"
---

# ThreadLocal原理


- ThreadLocal的适用的场景？
- ThreadLocal的使用方式？
- ThreadLocal的实现原理？

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUauhK67TdzjU54dXicun0EOHGic3kfvksJoGQyEInND2GhT5DzZLav5I8wPATKBR3rjNic67bQFKJHg/640?wx_fmt=png&from=appmsg)
在线程中使用Handler之前，需要调用Looper的prepare方法进行Looper初始化，否则会抛出异常，说Looper不存在，
其实我们在调用prepare方法的时候，就是为当前的线程创建一个Looper对象，并存储到这个线程的ThreadLocal变量中，
在后续创建Handler的时候，会从当前线程的ThreadLocal变量中读取这个Looper，进行消息传递。**一个线程中只有一个sThreadLocal变量，因此也只有一个Looper对象**（对应着只有一个MessageQuque消息队列）
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUauhK67TdzjU54dXicun0EOaQ8bibQu1IW5n9jBIrFk2iaXzuEon3xiakxtnOicNcdAL2qqiahmNveAHCQ/640?wx_fmt=png&from=appmsg)
所以线程中声明多个Handler对象处理消息的时候，都是使用同一个Looper和同一个MessageQueue消息队列。

需要注意的是，不同的线程获取Looper对象都是通过myLooper()方法获得的，因为不同线程的sThreadLocal是不同的，所以不同线程中调用myLooper()方法获得的Looper也是不同的。
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUauhK67TdzjU54dXicun0EOQSVic1XlsHQCZMREWL4KIIQBDv2GIlM9wVlGIXGX82vIdP4ibSdBHZPQ/640?wx_fmt=png&from=appmsg)

在Android屏幕刷新机制中用的Choreographer对象也是放在线程的ThreadLocal中的，不同的线程同样拥有不同的sThreadInstance，通过Choreographer的getInstance方法获取到的对象也是不同的
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUauhK67TdzjU54dXicun0EO4jPvCJ8jibsyzE2cuLO2Yvic0xrV7SNN6KYSN3pjWc7kzhy7K9fzQwbg/640?wx_fmt=png&from=appmsg)

**ThreadLocal原理**
每个线程里面都有一个Thread对象，Thread对象中保存了一张表，以key-value的方法存储ThreadLocal数据，其中key是ThreadLocal的WeakReference，value是ThreadLocal中保存的数据对象，比如上面的Looper和Choreographer，但是这张表和HashMap不同，在这张表中是将所有的key和value依次存在一个数组中，每个key-value都有一个hash值，每个key-valeu的hash值是按照上面的hashCounter来计算的，而每个key-value在数组中的下标也是通过数组的长度和该hash值取余获得的；
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUauhK67TdzjU54dXicun0EOmTZvUSs6tcz3Gc0SrErkCS9ENR9xUdHc1CibBBtkrTTLEibh1SdAr0xQ/640?wx_fmt=png&from=appmsg)

要是两个不同的key-value计算获得的hash值一样，则会从计算得到的下标位置向后遍历，直到遍历到第一个为null的位置，将该key-value存储下来；

在从Thread的ThreadLocal数组中获取key-value的时候，首先计算hash值，从而获得在数组中存储的下标，然后从该下标位置开始向后遍历，直到遍历获得第一个key-value为止，将遍历到的value返回。

**ThreadLocal的原理总结**

- ThreadLocal对象，在不同的线程中get返回的是不同的value；
- Thread对象中保存着一张表，表中保存着ThreadLocal到value数据对象的映射关系；
- 这张表是以数组的方式存储的，每个key-value的存储下标都是按照hash值进行计算获得的；
- 两个key-value的hash值有冲突的时候，会从计算获得的下标位置向后遍历到首个为null的位置进行key-value的存储