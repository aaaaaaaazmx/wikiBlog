---
title: "Handler的同步屏障机制"
published: 2023-11-06
description: "Handler的同步屏障机制"
tags: ["Android","进阶"]
category: "android进阶"
draft: false
slug: "android-adv-022"
---



# Handler的同步屏障机制
Handler 的 Messgae 种类分为三种：

- 普通消息
- 异步消息
- 屏障消息
## 异步消息
通常我们使用 Handler 想消息队列中添加的 Message 都是同步的，如果我们想要添加一个异步的 Message，有以下两种方式：

1. Handler 的构造方法有个 async 参数，默认的构造方法此参数是 false，只要我们在构造 handler 对象的时候，把该参数设置为 true 就可以了。
```
public Handler(Callback callback, boolean async) {
       ......省略代码
        mQueue = mLooper.mQueue;
        mCallback = callback;
        mAsynchronous = async;
}
```
可以看到，async 设置为 true 后，对全局的 mAsynchronous 设置为 true。然后在 enqueueMessage() 方法里，调用 msg.setAsynchronous(true)，将 message 设置为异步的。

1. 在创建 Message 对象时，直接调用 Message 的 setAsynchronous() 方法

在一般情况下，异步消息和同步消息没有什么区别，**但是一旦开启了同步屏障以后就有区别了**。
## 同步屏障
一般来说，MessageQueue 里面的所有 Message 是**按照时间从前往后有序排列的**。
**同步屏障消息就是在消息队列中插入一个屏障**，在屏障之后的所有普通消息都会被挡着，不能被处理。
**不过异步消息却例外，屏障不会挡住异步消息**，
因此可以认为，**屏障消息就是为了确保异步消息的优先级**，设置了屏障后，只能处理其后的异步消息，同步消息会被挡住，除非撤销屏障。
**同步屏障是通过 MessageQueue 的 postSyncBarrier 方法开启的**。
```
private int postSyncBarrier(long when) {
    // Enqueue a new sync barrier token.
    // We don't need to wake the queue because the purpose of a barrier is to stall it.
    synchronized (this) {
            // 1
        final int token = mNextBarrierToken++;
        // 2
        final Message msg = Message.obtain();
        msg.markInUse();
        msg.when = when;
        msg.arg1 = token;
                // 3
                // 指向前一个Message
        Message prev = null;
        // 消息队列中的第一个Message赋值给p
        Message p = mMessages;
        if (when != 0) {
        // 4 通过p的时间和屏障的时间，确定屏障消息插入的位置
            while (p != null && p.when <= when) {
                prev = p;
                p = p.next;
            }
        }
        // 5 说明屏障消息不是插入消息队列的头部
        if (prev != null) { // invariant: p == prev.next
            msg.next = p;
            prev.next = msg;
        } else {
        // 6 屏障消息在消息队列的头部
            msg.next = p;
            mMessages = msg;
        }
        return token;
    }
}
```

1. 获取屏障的的唯一标示，标示从 0 开始，自加 1。
2. 从 Message 消息对象池中获取一个 msg，设置 msg 为正在使用状态，并且重置 msg 的 when 和 arg1，arg1 的值设置为 token 值。但是这里并没有给tareget 赋值。所以 msg 的 target 是否为空是判断这个 msg 是否是屏障消息的标志。
3. 创建变量 pre 和 p，为下一步做准备。其中 p 被赋值为 mMessages，mMessages 指向消息队列中的第一个元素，所以此时p指向消息队列中的第一个元素。
4. 通过对队列中的第一个 Message 的 when 和屏障的 when 进行比较，决定屏障消息在整个消息队列中的位置，因为消息队列中的消息都是按时间排序的。 第五步，prev != null，代表不是消息的头部，把 msg 插入到消息队列中。 第六步，prev == null，代表是消息队列的头部，把 msg 插入消息的头部。

我们通常通过 Handler 发送消息 handler.sendMessage(),最终都会调用Handler.java 中的 enqueueMessage() 方法。
```
private boolean enqueueMessage(MessageQueue queue, Message msg, long uptimeMillis) {
    msg.target = this;
    if (mAsynchronous) {
        msg.setAsynchronous(true);
    }
    return queue.enqueueMessage(msg, uptimeMillis);
}
```
可以看到，enqueueMessage() 方法里为 msg 设置了 target 字段。 而上面的 postSyncBarrier()，也是从 Message 消息对象池中获取一个 msg,插入到消息队列中，唯一的不同是没有设置 target 字段。
**所以从代码层面上讲，屏障消息就是一个 target 为空的 Message。**
## 屏障消息的工作原理
通过 postSyncBarrier 方法屏障就被插入到消息队列中了，那么屏障是如何挡住普通消息只允许异步消息通过的呢？
我们知道 Handler 的消息处理是在 Looper.loop() 从消息队列中获取消息，并交给 Handler 处理的，其中是通过 MessageQueue 是通过 next 方法来获取消息的。查看一下 next() 的源码，
```
Message next() {
   // .....省略代码
    int pendingIdleHandlerCount = -1; // -1 only during first iteration
    int nextPollTimeoutMillis = 0;
    for (;;) {
        if (nextPollTimeoutMillis != 0) {
            Binder.flushPendingCommands();
        }

        nativePollOnce(ptr, nextPollTimeoutMillis);

        synchronized (this) {
            // Try to retrieve the next message.  Return if found.
            final long now = SystemClock.uptimeMillis();
            // 指向前一个 message
            Message prevMsg = null;
            // 初始时指向第一个 message
            Message msg = mMessages;
            // 1 msg.target == null 说明遇到消息屏障
            if (msg != null && msg.target == null) {
                    // 能进入这个if，说明此时的msg是屏障消息
                    // 循环遍历，退出循环的条件是，message到末尾了，或者
                    // msg是异步消息
                do {
                    prevMsg = msg;
                    msg = msg.next;
                } while (msg != null && !msg.isAsynchronous());
            }
   
}

if (msg != null) {
    if (now < msg.when) {
        nextPollTimeoutMillis = (int) Math.min(msg.when - now, Integer.MAX_VALUE);
        } else {
          // Got a message.
          mBlocked = false;
          if (prevMsg != null) {
          // 将msg从消息链表中移除
                 prevMsg.next = msg.next;
              } else {
                mMessages = msg.next;
              }
            msg.next = null;
           if (DEBUG) Log.v(TAG, "Returning message: " + msg);
            msg.markInUse();
            // 返回msg
            return msg;
         }
```
从上面的代码可以看出，
**msg.target == null 时说明此时的 msg 是屏障消息，**
**此时会进入到循环，遍历移动 msg 的位置，知道移动到的 msg 是异步 message 则退出循环，也就是说，循环的代码会过滤掉所有的同步消息，直到取出异步消息为止。**
当设置了同步屏障之后，next 函数将会忽略所有的同步消息，返回异步消息。
换句话说就是，

- 设置了同步屏障之后，Handler 只会处理异步消息。
- 再换句话说，同步屏障为 Handler 消息机制增加了一种简单的优先级机制，异步消息的优先级要高于同步消息。
## 移除同步屏障
同步屏障的移除是在 MessageQueue.java 的 removeSyncBarrier() 方法。
```
public void removeSyncBarrier(int token) {
    // Remove a sync barrier token from the queue.
    // If the queue is no longer stalled by a barrier then wake it.
    synchronized (this) {
        Message prev = null;
        Message p = mMessages;
        // 循环遍历，直到遇到屏障消息时推退出循环
        while (p != null && (p.target != null || p.arg1 != token)) {
            prev = p;
            p = p.next;
        }
        if (p == null) {
            throw new IllegalStateException("The specified message queue synchronization "
                    + " barrier token has not been posted or has already been removed.");
        }
        final boolean needWake;
        if (prev != null) {
        // 删除屏障消息p
            prev.next = p.next;
            needWake = false;
        } else {
            mMessages = p.next;
            needWake = mMessages == null || mMessages.target != null;
        }
        p.recycleUnchecked();

        // If the loop is quitting then it is already awake.
        // We can assume mPtr != 0 when mQuitting is false.
        if (needWake && !mQuitting) {
            nativeWake(mPtr);
        }
    }
}
```
removeSyncBarrier 方法需要传入一个参数 token，这个参数可以从 postSyncBarrier 添加屏障方法的返回值中获取到。
删除屏障消息的方法很简单，就是不断遍历消息队列，知道找到屏障消息，退出循环的条件有两个，一是 p.target == null，说明是屏障消息，二是 p.arg1 == token，也说明 p 是屏障消息，因为在屏障消息入队的时候，设置过 msg.arg1 = token。找到屏障消息后，把它从消息队列中删除并回收。
## 屏障消息用在哪里
系统把插入屏障和构造异步 Handler 这些东西标记为  **@UnsupportedAppUsage**，意思就是这些 API 是系统自己用的，不想让开发者调用呗。那系统是什么时候用的呢？
异步消息需要同步屏障的辅助，但同步屏障我们无法手动添加，因此了解系统何时添加和删除同步屏障是必要的。只有这样才能更好地运行异步消息这个功能，知道为什么要用和如何用。了解同步屏障需要简单了解一点屏幕刷新机制的内容。
手机屏幕刷新屏幕有不同的类型，60Hz、120Hz等。屏幕会在每次刷新的时候发出一个 Vsync 信号，通知 CPU 进行绘制计算。具体到我们代码中，可以认为是执行onMeasure、onLayout、onDraw这些方法。
View 绘制的起点是 ViewRootImpl 的 requestLayout() 开始的，这个方法会去执行上面的三大绘制任务：测量、布局、绘制。
**调用 requestLayout() 方法之后，并不会马上开始进行绘制任务，而是会给主线程设置一个同步屏障，并设置Vsync信号监听。**
**当Vsync信号的到来，会发送一个异步消息到主线程 Handler，执行我们上一步设置的绘制监听任务，并移除同步屏障**。
```
//ViewRootImpl.java
@Override
public void requestLayout() {
    if (!mHandlingLayoutInLayoutRequest) {
        checkThread();
        mLayoutRequested = true;
        scheduleTraversals();
    }
}
void scheduleTraversals() {
    if (!mTraversalScheduled) {
        mTraversalScheduled = true;
        //插入屏障
        mTraversalBarrier = mHandler.getLooper().getQueue().postSyncBarrier();
        //监听Vsync信号，然后发送异步消息 -> 执行绘制任务
        mChoreographer.postCallback(
                Choreographer.CALLBACK_TRAVERSAL, mTraversalRunnable, null);
        if (!mUnbufferedInputDispatch) {
            scheduleConsumeBatchedInput();
        }
        notifyRendererOfFramePending();
        pokeDrawLockIfNeeded();
    }
}
```
在等待 Vsync 信号的时候主线程什么事都没干，这样的好处是保证在 Vsync 信号到来时，绘制任务可以被及时执行，不会造成界面卡顿。
这样的话，我们发送的普通消息可能会被延迟处理，在 Vsync 信号到了之后，移除屏障，才得以处理普通消息。
**改善这个问题的办法是使用异步消息**，发送异步消息之后，即时是在等待 Vsync 期间也可以执行我们的任务，让我们设置的任务可以更快得被执行（如有必要才这样搞，UI绘制高于一切）且减少主线程的 Looper 压力。
