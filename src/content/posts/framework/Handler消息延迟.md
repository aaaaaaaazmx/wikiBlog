---
title: "Handler消息延迟"
published: 2023-11-11
description: "Handler消息延迟"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-021"
---



# Handler消息延迟

- 消息延时做了什么特殊处理？
- 是发送延时，还是消息处理延时？
- 延时的精度如何？

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUauhK67TdzjU54dXicun0EOdPmrSrHIceWjcr1jRCoJh4zNEsYzQ6LR4qPK5VSAlTNAwn6nfNib2NQ/640?wx_fmt=png&from=appmsg)
通常我们使用Handler的消息延时都是调用sendMessageDelayed函数实现的，其中delayMillis是需要延时的毫秒。
![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUauhK67TdzjU54dXicun0EOcDUqiaOhe898Nb31yk7C4ovMZw04ibdKFia3ibSc33JygJcOLltouUQlkQ/640?wx_fmt=png&from=appmsg)
最终是调用到了上面这个enqueueMessage方法，其中消息队列mMessages是单链表数据结果。

从上面的源码中可以看到，当前出入的消息msg时，首先判断mMessages消息队列中的第一个消息mMessages.prev，要是当前队列中消息为空，或者msg立即发送，则将该消息插到消息队列mMessages的头部；
反之，则会在一个for的死循环中遍历消息队列并将传入消息msg插到单链表中合适的位置。事实上，消息队列是按照消息处理的时间when，按照从近到远的顺序排列的，最先要执行的任务放在消息队列的头部，依次排列。

> 从上面可以看到，Handler中sendMessageDelayed方法只是将消息按照要执行的先后顺序插入到消息队列中的，插入好了并不意味着就会按照设定的延时时间处理消息，那Handler时如何延时处理该消息的呢？



当Looper.loop()之后，线程就进入了消息监听的阶段：
![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUauhK67TdzjU54dXicun0EOajGk2UVPXKbhrc7c4m4kWQQSjBZys6GGEWmEicyZ0AWTRslrOHzGLnw/640?wx_fmt=png&from=appmsg)
当Handler中没有可用消息的时候，上面代码会一直阻塞在queue.next()的地方，直到消息返回，才会调用dispatchMessage进行消息的处理，要是返回的msg为空，那么Handler就会结束消息监听，不再监听任何消息。

我们来看看**queue.next**函数：
![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUauhK67TdzjU54dXicun0EOwspOD2oyedGlZK7jicKicmKicOjFtL6XYuFrd4iaTL2oevS1YQReYuWWHg/640?wx_fmt=png&from=appmsg)
上面是阻塞的从消息队列中获取可用消息的过程。其中nativePollOnce方法是一个native方法，其内部会根据传入的nextPollTimeoutMillis，在延迟这么长时间之后唤醒线程从消息队列中读取消息，内部调用的是epoll_wait方法。

我们知道当线程中没有新消息要处理的时候，线程处于休眠状态，当其他线程向Handler的消息队列中写入消息，这一动作并不会唤醒当前线程处理该消息，还需要向线程的eventfd中写入数据，从而唤醒休眠的线程开始处理数据，此处也是一样的，nativePollOnce函数内部会调用epoll_wait方法，设置超时时间为nextPollTimeoutMillis，epoll_wait在这个超时时间之后，就会唤醒线程，开始处理消息队列中的消息。

next方法中，每次会从消息队列mMessages中获取链表中头部的消息，要是头部消息的设定执行的时间要比当前时间大，说明消息队列中所有的消息都还没有到可执行的时间，这是因为消息队列中消息在插入消息队列的时候，按照执行时间的先后顺序已经排序好了。这种情况下，会计算出一个等待时间，传递到nativePollOnce函数中，让native层在这个等待时间之后再唤醒线程读取消息队列中的消息，进行消息处理。

**Handler的消息延时的实现：**
消息队列在插入消息的时候是按照消息的触发时间顺序排序的，先执行的消息放在单链表的头部，最后执行的消息放在单链表的尾部；
在消息执行的过程中，通过native层设置epoll_wait的超时事件，使其在特定时间唤醒线程开始出现消息。

关于延时精度：Handler的延时精度并不高，会受到前一个消息处理时间的影响，因为在Looper.loop()方法中，只有上一个消息被处理完之后，才会去queue中读取下一个消息。