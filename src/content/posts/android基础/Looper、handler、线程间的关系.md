---
title: "Looper、handler、线程间的关系"
published: 2022-12-07
description: "Looper、handler、线程间的关系"
tags: ["Android","基础"]
category: "android基础"
draft: false
slug: "android-basic-029"
---

# Looper、handler、线程间的关系

例如一个线程可以有几个Looper可以对应几个Handler？


**一个线程可以只能创建一个Looper，一个Looper对应一个MessageQueue，
但是可以创建任意多个handler 对象**。

原因如下

## Looper相关
Looper的创建是通过在线程中执行Looper.prepare()方法创建，那么这个方法到底做了什么呢？请看下面的代码：
```
    public static void prepare() {
        prepare(true);
    }
    ​
    private static void prepare(boolean quitAllowed) {
        if (sThreadLocal.get() != null) { //code1
            throw new RuntimeException("Only one Looper may be created per thread");
        }
        sThreadLocal.set(new Looper(quitAllowed));
    }
```

其中关键性的一句，就是sThreadLocal.set(new Looper(quitAllowed))，那我们来看看sThreadLocal。
```
    static final ThreadLocal<Looper> sThreadLocal = new ThreadLocal<Looper>();
```
ThreadLocal：代表了一个线程局部的变量，每个线程中的值都是独立存在、互不影响。
**在这里ThreadLocal是保证了每个线程都有各自的Looper**。而且通过code1 我们知道，一旦sThreadLocal有值，那么再次prepare的时候就会报错，这就保障了每个线程只能有一个Looper可以被创建。

接下来看看建立Looper实例的方法new Looper(quitAllowed)：

```
    private Looper(boolean quitAllowed) {
        mQueue = new MessageQueue(quitAllowed);
        mThread = Thread.currentThread();
    }
```
**即一个Looper中有一个 MessageQueue。**


## Handler相关
当前线程创建了Looper之后，就可以创建Handler用来处理消息，Handler是怎么跟Looper关联上的呢？请看下面的代码：
```
    public Handler(@Nullable Callback callback, boolean async) {
        mLooper = Looper.myLooper();
        if (mLooper == null) {
            throw new RuntimeException(
                "Can't create handler inside thread " + Thread.currentThread()
                        + " that has not called Looper.prepare()");
        }
        mQueue = mLooper.mQueue;
        mCallback = callback;
        mAsynchronous = async;
    }
 ```   
在Handler中有两个全局变量mLooper(当前Handler关联Looper)和mQueue(消息队列)，并在构造函数中进行了初始化，重要的就是调用了：Looper.myLooper()：
```
    public static @Nullable Looper myLooper() {
        return sThreadLocal.get();
    }
```   
从上面代码可以知道handler通过调用线程局部变量sThreadLocal，获取当前线程的Looper，这里需要注意的是，如果当前线程没有关联的Looper，这个方法会返回null。 注意：Handler在哪个线程创建的，就跟哪个线程的Looper关联，也可以在Handler的构造方法中传入指定的Looper。

## 总结

**一个线程 只能有一个 Looper，一个MessageQueue，可以有无数个 Handler。**