---
title: "Handler连环问能过几关"
published: 2022-07-15
description: "Handler连环问能过几关"
tags: ["Android","基础"]
category: "android基础"
draft: false
slug: "android-basic-022"
---

# Handler连环问能过几关

# 1. 说说你理解的Handler
handler代码主要在以下几个类
```
//\frameworks\base\core\java\android\os\Handler.java
//\frameworks\base\core\java\android\os\Looper.java
//\frameworks\base\core\java\android\os\Message.java
//\frameworks\base\core\java\android\os\MessageQueue.java
```

1. Android Handler 是一套 **异步消息传递机制**（异步通信机制）。主要适用于同一个组件（或者说是同一个文件中）不同线程之间的信息传递。
2. 在子线程中进行耗时的 IO 操作，这可能是读取文件或者访问网络等，当耗时操作完成以后可能需要在 UI上做一些改变，由于 Android 开发规范的限制，我们并不能在子线程中访问 UI 控件，否则就会触发程序异常，这个时候通过 Handler 就可以将更新 UI 的操作切换到主线程中执行。
3. [Handler机制](https://link.juejin.cn?target=https%3A%2F%2Fblog.csdn.net%2Fguolin_blog%2Farticle%2Fdetails%2F9991569) 由**Handler**，**Message**，**MessageQueue**和**Looper**四个组件组成

![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1693499591905-281be4e3-30f6-49d2-859f-3b26e40cdd9d.webp)
**其中**

- **Message** 是线程之间传递的信息，

它可以在内部携带少量的信息，用于在不同线程之间交换数据，一般通过obatin获取

- **Handler** 顾名思义也就是处理者

它主要是用于发送和处理消息的。发送消息一般是使用 Handler.sendMessage()，而发出的消息经过一系列地辗转处理后，最终会传递到Handler.handleMessage()；

- **MessageQueue** 是消息队列，

它主要用于存放所有通过 Handler 发送的消息。这部分消息会一直存在于消息队列中，等待被处理，其本质上是一个按时间排序的单向链表；

- **Looper** 是每个线程中的 MessageQueue 的管家

调用 Looper 的 loop() 方法后，就会进入到一个无限循环当中，然后每当发现 MessageQueue 中存在一条消息，就会将它取出，并传递到 Handler.handleMessage() 方法中。

# 2. 一个线程有几个Looper？有几个messageQueue？
**一个线程只有一个 Looper对象和一个 MessageQueue 对象。**

在创建 Handler 之前，内部需要调用 **Looper.prepare()** ，该函数保证了每个线程只有一个 Looper 对象。
```
public static void prepare() {
    prepare(true);
}

private static void prepare(boolean quitAllowed) {
    if (sThreadLocal.get() != null) {
        throw new RuntimeException("Only one Looper may be created per thread");
    }
    sThreadLocal.set(new Looper(quitAllowed));
}
```
而 MessageQueue 又是在 Looper 的构造函数中创建的，**保证了一个 Looper 对应一个 MessageQueue**
```
private Looper(boolean quitAllowed) {
    mQueue = new MessageQueue(quitAllowed);
    mThread = Thread.currentThread();
}
```
# 3. 一个线程可以有几个handler？之间是如何处理正确的Msg的
因为Handler可以在Activity里创建，在Service里面也可以创建，而Activity全部都跑在了主线程里面，这就证明了**主线程中可以有多个Handler。**

Handler 在 sendMessageAtTime() 时，会把自身填入 **msg.target，因此msg是跟handler绑定起来的**

然后在 Looper.loop() 不断从 MessageQueue 中获取 Message 处理的时候，**会根据 msg.target 去调用对应的 dispatchMessage ， 这边的 msg.target 就是前面的 handler**
# 4. MessageQueue 的数据结构？多个线程往MessageQueue添加数据，如何保证线程安全？
MessageQueue 是一种先进先出的数据结构，底层实现是按时排序的**单向链表**，当有 Message 入队时，按照 Message 的 when 值排序插入，然后出队时则去表头的 Message；

在MessageQueue.enqueueMessage() 和MessageQueue.next() 的时候都会用到同步锁[synchronized](https://link.juejin.cn?target=https%3A%2F%2Fwww.wolai.com%2Friveryoung%2FpyMRri9RiZEhrYQ1whzZpT)保证线程安全
https://link.juejin.cn?target=https%3A%2F%2Fwww.wolai.com%2Friveryoung%2FpyMRri9RiZEhrYQ1whzZpT
# 5. 为什么主线程可以直接new Handler？如果子线程想要new handler需要做哪些工作？
因为在主线程中已经提前添加了 Looper.prepareMainLooper() 和Looper.loop()，
如果子线程想要调用new handler，需要调用 Looper.prepare() 和Looper.loop()
```
 *  class LooperThread extends Thread {
  *      public Handler mHandler;
  *
  *      public void run() {
  *          Looper.prepare();
  *
  *          mHandler = new Handler(Looper.myLooper()) {
  *              public void handleMessage(Message msg) {
  *                  // process incoming messages here
  *              }
  *          };
  *
  *          Looper.loop();
  *      }
  *  }
```
Looper.prepare() 本质是去创建Looper, 而创建Looper的核心要义就是创建一个MessageQueue。可以将Looper看成是流水线的引擎，而MessageQueue就是流水线皮带上的托盘
prepare主要是把线程和looper绑定起来，并且设置了是否允许轮询退出，
> 其中主线程的looper是默认不退出的

```
public static void prepare() {
    prepare(true);
}

private static void prepare(boolean quitAllowed) {
    if (sThreadLocal.get() != null) {
        throw new RuntimeException("Only one Looper may be created per thread");
    }
    sThreadLocal.set( new Looper(quitAllowed) );
}

private Looper(boolean quitAllowed) {
    mQueue =  new MessageQueue(quitAllowed) ;
    mThread = Thread.currentThread();
}
```

# 6. Handler.postDelayed() 消息时间准确吗？实现原理？
实际上，这个问题与线程安全性为同一个问题，**多线程中线程一旦安全，时间就不能准确；时间一旦准确，线程就一定不安全。** 
因为多个线程去访问这个队列的时候，在放入队列和取出消息的时候都会加锁，当第一个线程还没有访问完成的时候，第二个线程就无法使用，所以他实际的时间会被延迟。
所以，Handler所发送的Delayed消息时间**基本准确，但不完全准确**。

[实现原理](https://link.juejin.cn?target=https%3A%2F%2Fwww.jianshu.com%2Fp%2F66fa1a8396ad)：
(https://link.juejin.cn?target=https%3A%2F%2Fwww.jianshu.com%2Fp%2F66fa1a8396ad)
postDelayed最终会调用一个**带延迟参数的 sendMessageAtTime**，然后通过MessageQueue.enqueueMessage将带延迟时间参数的msg按照时间排序插入到MessageQueue。
> MessageQueue是一个按时间排序的单向链表，

Looper 从 MessageQueue取msg的时候，会判断当前时间是否到达链表头第一个msg 的延迟时间，如果还没到，就会通过比较延迟时间和当前时间计算出还需要等待的时间，然后通过native函数nativePollOnce进行一个阻塞等待，直到等待时间到达再唤醒线程执行msg;
![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1693499591983-ebb2f7da-4c6c-4b73-8bfa-683749b4d626.webp)
# 7. MessageQueue中没有消息的时候会发生什么？为什么Looper.loop不会阻塞主线程？
MessageQueue 队列为空时，Looper.loop() 的死循环不会退出也不会执行，而是阻塞在MessageQueue.next() 中的 nativePollOnce() 方法中，进入休眠状态，等待新消息到来重新唤醒。这边会涉及到底层linux 的 pipe 和 epoll 机制实现。
# 8. 为什么Handler死循环不会卡死？和ANR有什么区别
**应用出现ANR卡死和Looper的死循环其实是没有关系的**。应用没有消息需要处理的时候，它是在休眠，释放线程了；
而ANR是指消息没来得及处理，比如按键和触摸事件在5s内没有处理掉，或者前台广播在10s内没有处理掉等，导致卡死；
# 9. IdleHandler 了解么？
[IdelHandler](https://link.juejin.cn?target=https%3A%2F%2Fblog.csdn.net%2Faugfun%2Farticle%2Fdetails%2F124534116)是MessageQueue中的一个静态内部接口，当 Looper 从 MessageQueue中获取的msg为空，或者执行时间未到时，也就是 MessageQueue空闲时就会去回调 IdleHandler.queueIdle()。
```
// MessageQueue.java
public static interface IdleHandler {
    boolean queueIdle();
}
```

- 如果 queueIdle() 返回 false，则执行完后，该idlehandler会被剔除，也就是只执行一次，
- 如果返回true，则保留，下次MessageQueue进入空闲状态继续执行；

**系统源码中使用例子**：ActivityThread.handleResumeActivity()中，在 onResume 方法执行完毕后，调用 Looper.myQueue().addIdleHandler(new Idler()) ，去执行一些资源回收，日志打印等不那么着急的任务。除此之外，在做项目 **性能优化** 的时候也可以使用 IdleHandler，它在主线程空闲时执行任务，而不影响其他任务的执行。
# 10. 同步屏障了解么？
可以理解为[同步屏障](https://link.juejin.cn?target=https%3A%2F%2Fblog.csdn.net%2Fu012165769%2Farticle%2Fdetails%2F117781031) 
（https://link.juejin.cn?target=https%3A%2F%2Fblog.csdn.net%2Fu012165769%2Farticle%2Fdetails%2F117781031）
是为Handler消息机制提供的一种 **优先级策略，能提高异步消息的优先级**。

**Handler机制中有三种消息：同步消息，异步消息和屏障消息。**

我们正常使用的消息都是同步消息，异步消息可以在Handler构造时设置，也可以通过setAsynchronous进行设置，而屏障消息跟同步消息的区别是**target属性为null**。
平时我们发送消息时，这个target是不可以为null的。但是在发送屏障消息的时候，target是可以为空的，它本身仅仅是起屏蔽普通消息的作用，所以不需要target。MessageQueue中提供了 **postSyncBarrier()** 方法用于插入屏障消息

Looper从MessageQueue中取消息时，如果没有遇到屏障消息，那么同步消息和异步消息是一样的，如果遇到屏障消息，则会屏蔽掉该消息之后的所有同步消息，只执行异步消息。
```
@UnsupportedAppUsage
Message next() {
    for (;;) {
        nativePollOnce(ptr, nextPollTimeoutMillis);
        synchronized (this) {
            Message msg = mMessages;
             //如果msg.target为空，也就是说是一个同步屏障消息，则进入这个判断里面
            if (msg != null && msg.target == null) {
                // Stalled by a barrier.  Find the next asynchronous message in the queue.
                //在这个while循环中，找到最近的一个异步消息
                do {
                    prevMsg = msg;
                    msg = msg.next;
                } while (msg != null && !msg.isAsynchronous()); 
            }
            //找到了异步消息
            if (msg != null) {
                //如果消息的处理时间小于当前时间 则等待
                if (now < msg.when) {
                    // Next message is not ready.  Set a timeout to wake up when it is ready.
                    nextPollTimeoutMillis = (int) Math.min(msg.when - now, Integer.MAX_VALUE);
                } else {
                    // Got a message.
                    //处理消息
                    mBlocked = false;
                    //将异步消息移除
                    if (prevMsg != null) {
                        prevMsg.next = msg.next;
                    } else {
                        mMessages = msg.next;
                    }
                    msg.next = null;
                    if (DEBUG) Log.v(TAG, "Returning message: " + msg);
                    msg.markInUse();
                    //返回异步消息
                    return msg;
                }
            } else {
                // No more messages.
                //没有找到异步消息则进入阻塞状态，等待被唤醒
                nextPollTimeoutMillis = -1;
            }
            ...
}

```

在**UI绘制流程**中，就会使用同步屏障和异步消息，保证在Vsync信号过来时，异步任务能被优先处理，从而让绘制任务被及时执行，避免界面卡顿。

另外需要注意的是：同步屏障不会自动移除，使用完成之后需要手动移除，不然会造成同步消息无法处理。也就是上边提到的，通过removeSyncBarrier(int token) 方法进行移除，token就是之前添加屏障时返回的token。

小结下：

- 屏障消息和普通消息区别在于屏幕没有target，普通消息有target是因为它需要将消息分发给对应的target，而屏幕不需要被分发，它就是用来挡住普通消息来保证异步消息优先处理的
- 屏障和普通消息一样可以根据时间来插入到消息队列中的适当位置，并且只会挡住它后面的同步消息的分发
- postSyncBarrier会返回一个token，利用这个token可以撤销屏障
- postSyncBarrier是hide的，使用它得用反射
- 插入普通消息会唤醒消息对了，但插入屏障不会
# 11. Handler为什么内存泄漏？如何解决？
**原因**
Handler的Message被存储在MessageQueue中，有些Message并不能马上被处理，它们在MessageQueue中存在的时间会很长，这就会导致Handler无法被回收。因为[Handler是非静态的匿名内部类的实例，它会隐形的持有外部类Activity，从而导致Activity不能被回收，导致Activity泄漏内存](https://link.juejin.cn?target=https%3A%2F%2Fwww.jianshu.com%2Fp%2Fd892afd3b3a1)
**解决方法**

1. 使用static 修饰的handler，使用弱引用activity对象，因为要使用activity对象中的成员（因为静态内部类不持有外部类的引用，所以使用静态的handler不会导致activity的泄露）；
2. 单独定义handler，同样可以弱引用activity；
3. 使用内部类的handler，在onDestroy方法中removeCallbacksAndMessages；
4. 还有一种方法是直接使用避免内存泄漏的Handler开源库WeakHandler；
# 12. 如何创建Message？为什么？
[创建 Message 建议使用](https://link.juejin.cn?target=https%3A%2F%2Fblog.csdn.net%2Fbraintt%2Farticle%2Fdetails%2F88850189)[Message.obtain()](https://link.juejin.cn?target=https%3A%2F%2Fblog.csdn.net%2Fbraintt%2Farticle%2Fdetails%2F88850189)[，不要使用](https://link.juejin.cn?target=https%3A%2F%2Fblog.csdn.net%2Fbraintt%2Farticle%2Fdetails%2F88850189)[new message()](https://link.juejin.cn?target=https%3A%2F%2Fblog.csdn.net%2Fbraintt%2Farticle%2Fdetails%2F88850189)。因为 Message 类里维护了一个 sPool 的对象，可以理解为一个 Message 链表，这个链表的默认最大长度为 50。

在 Android 消息机制中，每当一个 Message 对象被处理完成之后，就会被放入这个池中，为我们提供了复用。

当我们调用 Message.obtain()方法时，如果复用池中存在的 Message 对象，我们就不会去创建一个新的 Message 对象。这样就**避免频繁创建和销毁 Message 对象带来的性能开销**。减小内存的抖动和OOM。
# 13. HandlerThread
[Handlerthread](https://link.juejin.cn?target=https%3A%2F%2Fblog.csdn.net%2Fwcsbhwy%2Farticle%2Fdetails%2F108447502) 是继承于Thread的一个类，用于开启一个带有looper的新线程，可以使用这个looper来创建Handler。

需要注意的是必须调用start() 方法开启线程。因为 start() 可以调用线程的 run() 方法，而 HandlerThread.run()中会调用 Looper.prepare() 和 Looper.loop()，从而为子线程绑定 Looper，相当于做了一层封装，方便用户使用Handler。

通常Handler 和 HandlerThread 的配合使用方式
# 14. IntentService
[IntentService](https://link.juejin.cn?target=http%3A%2F%2Friveryoung.cn%2F2020%2F10%2F15%2FAndroid-Handler%2F%23IntentService) 是继承于 Service 的基础类， 本质上是一个 Service。主要是用于响应基于 Intent 的异步请求。
客户端通过 startService(Intent) 发送请求，IntentService 接收到请求后开启，并在新建的子线程中按序处理异步的 Intent 请求，在同一时间只有一个请求会被处理。
**当完成所有请求后，IntentService 会自行关闭**

**为什么官方提供了 Service 之后，又提供 IntentService呢？**
Service 默认是运行在主线程的，如果我们需要在 Service 中处理一些耗时任务，那么我们还需要去手动的创建线程或者使用线程池去处理耗时任务（否则会出现ANR），然后在处理完以后手动关闭Service，

而 IntentService 已经帮我们做好了这些工作，我们只需要在**onHandleIntent中写上耗时任务的代码**，就可以在子线程中去执行，因为 onHandleIntent是运行在子线程中的，并且在任务执行完以后，IntentService 会自己执行stopSelf(startId)方法，自行关闭。

**用 IntentService 有什么好处呢？**
首先，我们省去了在 Service 中手动开线程的麻烦，第二，当操作完成时，我们不用手动停止 Service。
ServiceIntent 的使用例子，可参考 [源码](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2FRiverYoung%2FAndroidUtils%2Ftree%2Fmaster%2FIntentServiceDemo)；执行效果如下图：
(https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2FRiverYoung%2FAndroidUtils%2Ftree%2Fmaster%2FIntentServiceDemo)
![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1693499591953-a815c572-2929-4cf6-91ea-e8d305f1e150.webp)
(https://cdn.nlark.com/yuque/0/2023/webp/215777/1693499591953-a815c572-2929-4cf6-91ea-e8d305f1e150.webp#averageHue=%233e3e39&clientId=u1dae0b6f-b45a-4&from=paste&id=ude1a7ba3&originHeight=165&originWidth=1188&originalType=url&ratio=2&rotation=0&showTitle=false&status=done&style=none&taskId=u0c04f7d7-5e85-41a2-95ee-8098110c542&title=)
```
//\frameworks\base\core\java\android\app\IntentService.java

/**
 * IntentService is an extension of the {@link Service} component class that
 * handles asynchronous requests (expressed as {@link Intent}s) on demand.
 * Clients send requests
 * through {@link android.content.Context#startService(Intent)} calls; the
 * service is started as needed, handles each Intent in turn using a worker
 * thread, and stops itself when it runs out of work.
 */
@Deprecated
public abstract class IntentService extends Service {
    private volatile Looper mServiceLooper;
    @UnsupportedAppUsage
    private volatile ServiceHandler mServiceHandler;
    private String mName;
    private boolean mRedelivery;

    private final class ServiceHandler extends Handler {
        public ServiceHandler(Looper looper) {
            super(looper);
        }

        @Override
        public void handleMessage(Message msg) {
            onHandleIntent((Intent)msg.obj);
            stopSelf(msg.arg1);
        }
    }

    public IntentService(String name) {
        super();
        mName = name;
    }
    ...

    @Override
    public void onCreate() {
        super.onCreate();
        //这边就使用到了 HandlerThread 的工具类
        HandlerThread thread = new HandlerThread("IntentService[" + mName + "]");
        thread.start();

        mServiceLooper = thread.getLooper();
        // mServiceHandler 本质是 Handler，使用了 mServiceLooper 去创建
        mServiceHandler = new ServiceHandler(mServiceLooper);
    }

    @Override
    public void onStart(@Nullable Intent intent, int startId) {
        Message msg = mServiceHandler.obtainMessage();
        msg.arg1 = startId;
        msg.obj = intent;
        mServiceHandler.sendMessage(msg);
    }

    @Override
    public int onStartCommand(@Nullable Intent intent, int flags, int startId) {
        onStart(intent, startId);
        return mRedelivery ? START_REDELIVER_INTENT : START_NOT_STICKY;
    }

    @Override
    public void onDestroy() {
        mServiceLooper.quit();
    }

    /**
     * This method is invoked on the worker thread with a request to process.
     * Only one Intent is processed at a time, but the processing happens on a
     * worker thread that runs independently from other application logic.
     * So, if this code takes a long time, it will hold up other requests to
     * the same IntentService, but it will not hold up anything else.
     * When all requests have been handled, the IntentService stops itself,
     * so you should not call {@link #stopSelf}.
     *
     * @param intent The value passed to {@link
     *               android.content.Context#startService(Intent)}.
     *               This may be null if the service is being restarted after
     *               its process has gone away; see
     *               {@link android.app.Service#onStartCommand}
     *               for details.
     */
    @WorkerThread
    protected abstract void onHandleIntent(@Nullable Intent intent);
}

```

- linux的epoll机制
   - epoll机制，是一种IO多路复用机制，可以同时监控多个描述符，当某个描述符就绪(读或写就绪)，则立刻通知相应程序进行读或写操作，本质同步I/O，即读写是阻塞的。 所以说，主线程大多数时候都是处于休眠状态，并不会消耗大量CPU资源。


# 15 Handler 的同步和异步消息机制
在 Android 开发中，`Handler` 是线程间通信的重要组件，主要用于在不同线程间发送和处理消息。`Handler` 支持同步和异步两种消息处理方式。
## 1. 同步消息
同步消息是指消息按照发送顺序依次处理，默认情况下 Handler 发送的消息都是同步消息。
### 特点：
- 消息按照发送顺序(FIFO)处理
- 会阻塞后续消息的处理直到当前消息完成
- 使用 `sendMessage()` 或 `post()` 系列方法发送
### 示例代码：
```java
Handler handler = new Handler(Looper.getMainLooper()) {
    @Override
    public void handleMessage(Message msg) {
        // 处理消息
    }
};
// 发送同步消息
handler.sendMessage(handler.obtainMessage(1));
handler.post(() -> {
    // 同步 Runnable
});
```

### 2. 异步消息
异步消息允许消息不按照严格的发送顺序处理，可以通过设置消息为异步来提高处理效率。
#### 特点：
- 消息可能不严格按照发送顺序处理
- 不会阻塞后续消息的处理
- 需要显式设置为异步消息
- 使用 `setAsynchronous(true)` 或 `postAtFrontOfQueue()`

#### 设置异步消息的几种方式：
##### 方式1：创建异步 Handler
```
Handler handler = new Handler(Looper.getMainLooper(), null, true) {
    @Override
    public void handleMessage(Message msg) {
        // 处理异步消息
    }
};
```
##### 方式2：设置 Message 为异步
```
Message msg = handler.obtainMessage();
msg.setAsynchronous(true);
handler.sendMessage(msg);
```
##### 方式3：使用 postAtFrontOfQueue
```
handler.postAtFrontOfQueue(() -> {
    // 这个 Runnable 会被优先处理
});
```
### 
### 3. 同步与异步消息对比
| 特性 | 同步消息 | 异步消息 |
| --- | --- | --- |
| 处理顺序 | 严格按发送顺序 | 可能不按顺序 |
| 阻塞性 | 会阻塞后续消息 | 不会阻塞 |
| 设置方式 | 默认 | 需要显式设置 |
| 典型使用场景 | 常规消息处理 | 需要优先处理或并行处理的消息 |
### 4. 使用建议
1. UI 更新：通常使用同步消息，保证UI更新的顺序性
2. 高优先级任务：使用异步消息确保及时处理
3. 避免ANR：长时间任务应考虑使用异步处理
4. 消息屏障：结合同步屏障(`postSyncBarrier()`)可以实现消息的优先级调度
### 5. 注意事项
- 异步消息不能完全替代多线程，复杂任务仍应考虑使用线程池
- 过度使用异步消息可能导致消息处理混乱
- Android 4.1(API 16)及以上版本才完全支持异步消息特性