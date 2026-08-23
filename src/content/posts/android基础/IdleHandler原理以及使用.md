---
title: "IdleHandler原理以及使用"
published: 2020-11-28
description: "IdleHandler原理以及使用"
tags: ["Android","基础"]
category: "android基础"
draft: false
slug: "android-basic-023"
---

# IdleHandler原理以及使用

本文就来聊聊 Handler 中的 IdleHandler，这个我们比较少用的功能。它能干什么？有什么合适的使用场景？


##  简单说说 Handler 机制

在说 IdleHandler 之前，先简单了解一下 Handler 机制。

Handler 是标准的事件驱动模型，存在一个消息队列 MessageQueue，它是一个基于消息触发时间的优先级队列，还有一个基于此消息队列的事件循环 Looper，Looper 通过循环，不断的从 MessageQueue 中取出待处理的 Message，再交由对应的事件处理器 Handler/callback 来处理。

其中 MessageQueue 被 Looper 管理，Looper 在构造时同步会创建 MessageQueue，并利用 ThreadLocal 这种 TLS，将其与当前线程绑定。而 App 的主线程在启动时，已经构造并准备好主线程的 Looper 对象，开发者只需要直接使用即可。

Handler 类中封装了大部分「Handler 机制」对外的操作接口，可以通过它的 send/post 相关的方法，向消息队列 MessageQueue 中插入一条 Message。在 Looper 循环中，又会不断的从 MessageQueue 取出下一条待处理的 Message 进行处理。

**IdleHandler 使用相关的逻辑，就在 MessageQueue 取消息的 next() 方法中。**

## IdleHandler是什么

Handler 机制提供的一种，可以在 Looper 事件循环的过程中，当出现空闲的时候，允许我们执行任务的一种机制

IdleHandler 是 **MessageQueue内定义的一个接口**，一般可用于做性能优化。

当消息队列内没有需要立即执行的 message时，会主动触发 IdleHandler 的 queueIdle方法。返回值为 false，即只会执行一次；返回值为 true，即每次当消息队列内没有需要立即执行的消息时，都会触发该方法。

> 当队列空闲时，会循环执行一遍 mIdleHandlers 数组并执行 IdleHandler.queueIdle() 方法。而如果数组中有一些 IdleHander 的 queueIdle() 返回了 true，则会保留在 mIdleHanders 数组中，下次依然会再执行一遍。

**具体的细节说明如下**：

IdleHandler 是 闲时Handler 机制，可以在 Looper 事件循环的过程中，当出现空闲的时候，允许我们执行任务。 IdleHandler 被定义在 MessageQueue 中，它是一个接口。

```
// MessageQueue.java
public static interface IdleHandler {
    boolean queueIdle();
}

```


可以看出，定义时需要实现其 queueIdle() 方法。同时返回值为 true 表示重复使用 IdleHandler，返回 false 表示是一个一次性的 。 既然 IdleHandler 被定义在 MessageQueue 中，使用它也需要借用 MessageQueue。在 MessageQueue 中申明了对应的 add 和 remove 方法。


## Handler的空闲的解读

MessageQueue 是一个基于消息触发时间的优先级队列，所以队列出现空闲存在两种场景。

- MessageQueue 为空，没有消息；
- MessageQueue 中最近需要处理的消息，是一个延迟消息（when>currentTime），需要滞后执行；
这两个场景，都会尝试执行 IdleHandler。

处理 IdleHandler 的场景，就在 **Message.next()** 这个获取消息队列下一个待执行消息的方法中



## IdleHandler能解决什么问题？
通过上面的分析我们不难发现，IdleHandler是在主线程空闲的时候被执行。因此基于这个点，我们可以将一些**相对耗时或者一些影响整个线程运行的事务放到IdleHandler里面处理**，譬如当我们需要收到调用GC的时候，GC一般会带来STW问题，于是我们可以将这个动作在IdleHandler里面执行，而android源码确实也是这样进行的。

> 题外话已经，Android系统中 onStop和onPause就是就是在idleHandler中执行的

# 面试题合集

- **Q：IdleHandler 有什么用？**

IdleHandler 是 Handler 提供的一种在消息队列空闲时，执行任务的时机；
当 MessageQueue 当前没有立即需要处理的消息时，会执行 IdleHandler；
Q：MessageQueue 提供了 add/remove IdleHandler 的方法，是否需要成对使用？

不是必须；
IdleHandler.queueIdle() 的返回值，可以移除加入 MessageQueue 的 IdleHandler；

- **Q：是否可以将一些不重要的启动服务，搬移到 IdleHandler 中去处理？**

不建议；
IdleHandler 的处理时机不可控，如果 MessageQueue 一直有待处理的消息，那么 IdleHander 的执行时机会很靠后；

- **Q：IdleHandler 的 queueIdle() 运行在那个线程？**

queueIdle() 运行的线程，只和当前 MessageQueue 的 Looper 所在的线程有关；
子线程一样可以构造 Looper，并添加 IdleHandler；


