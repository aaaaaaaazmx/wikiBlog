---
title: "handler使用epoll机制"
published: 2024-11-16
description: "handler使用epoll机制"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-019"
---

# handler使用epoll机制


- **类似问题：Looper#loop()** 为什么不会卡死主线程背后的原因


epoll机制在Android中使用非常的广泛，比如Handler的MessageQueue在没有Message的情况下进入阻塞，以及input事件从systemserver进程传递到app进程，甚至vsyn信号从surfaceflinger传递到app进程都用到了epoll机制。
epoll和select都是在Linux系统上使用的I/O多路复用机制，用于在一个线程中同时监听多个文件描述符（包括套接字）的可读、可写和异常等事件。它们可以用于实现高效的事件驱动的网络编程。

**使用原因**
从 Android 2.3 开始，Google 把 Handler 的阻塞/唤醒方案从 **Object#wait() / notify()**，改成了用 **Linux epoll** 来实现
原因是 Native 层也引入了一套消息管理机制，用于提供给 C/C++ 开发者使用，而现有的阻塞/唤醒方案是为 Java 层准备的，只支持 Java
Native 希望能够像 Java 一样：**main 线程在没有消息时进入阻塞状态，有到期消息需要执行时，main 线程能及时醒过来处理**。
其实如果只是将 Java 层的阻塞/唤醒移植到 Native 层，倒也不用祭出 **epoll** 这个大杀器 ，Native 调用 **pthread_cond_wait** 也能达到相同的效果
选择 **epoll** 的另一个原因是， Native 层支持监听 **自定义 Fd** （_比如 Input 事件就是通过 epoll 监听 socketfd 来实现将事件转发到 APP 进程的_），而一旦有监听多个流事件的需求，那就只能使用 Linux I/O 多路复用技术

**消息的循环与阻塞**
Java 和 Native 的消息队列都创建完以后，整个线程就会阻塞到 **Looper#loop()** 方法中，在 Java 层的的调用链大致是这样的：

```java
Looper#loop()
    -> MessageQueue#next()
        -> MessageQueue#nativePollOnce()
}
```
MessageQueue 最后一步调用的 nativePollOnce() 是一个 jni 方法，具体实现在 Native 
**nativePollOnce()** 接受到请求后，随手转发到 NativeMessageQueue 的 **pollOnce()** 方法
而 **NativeMessageQueue#pollOnce()** 中什么都没做，只是又把请求转发给了 **Looper#pollOnce(）**

**pollOnce()** 会不停的轮询 **pollInner()** 方法，检查它的的返回值 **result**
消息队列中没消息，或者 设定的超时时间没到期，再或者 自定义 fd 没有事件发生，都会导致线程阻塞到 **pollInner()** 方法调用
**pollInner()** 中，则是使用了 **epoll_wait()** 系统调用等待事件的产生
**消息队列在初始化成功以后，Java 层的 Looper#loop() 会开始无限轮询，不停的获取下一条消息。如果消息队列为空，调用 epoll_wait 使线程进入到阻塞态，让出 CPU 调度**