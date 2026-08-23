---
title: "Binder线程池的工作过程是什么样"
published: 2024-09-05
description: "Binder线程池的工作过程是什么样"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-013"
---

# Binder线程池的工作过程是什么样 
本题主要考察对于binder线程池的理解

## 核心要点
答题的核心要点有以下几个

1. Binder线程池并非一个传统意义上的线程池结构，它在client进程中只有一个继承自Thread的PoolThread类。而线程的启动以及管理都是由binderDriver来控制的。
2. binder线程有主线程和非主线程之分，主线程是启动的时候才会有的，每个binder线程池只有一个。其他情况下申请的都是非主线程。
3.  binder线程池启动的时候，实际上只是启动了client中的binder主线程。
4.  binder线程(非主线程)有两种情况启动：client进程向binderDriver发送IPC请求，以及 client进程向binderDriver回复IPC请求结果。
5. binder线程池的默认大小是16，1个主线程和15个非主线程。


下面是一些细节 补充

## Binder线程池细节
每个App进程在被Zygote进程fork出以后会调用到app_main.cpp onZygoteInit函数，在此创建该进程ProcessState并开启binder线程池
### onZygoteInit
```
// app_main.cpp
virtual void onZygoteInit() {
    //获取ProcessState对象
    sp<ProcessState> proc = ProcessState::self();
    //启动新binder线程
    proc->startThreadPool();
}

```

ProcessState::self()是单例模式，主要工作是调用open()打开/dev/binder驱动设备，再利用mmap()映射内核的地址空间，将Binder驱动的fd赋值ProcessState对象中的变量mDriverFD，用于交互操作。startThreadPool()是创建一个新的binder线程，不断进行talkWithDriver()。

### PS.startThreadPool
```
// ProcessState.cpp
void ProcessState::startThreadPool()
{
    AutoMutex _l(mLock);    //多线程同步
    if (!mThreadPoolStarted) {
        mThreadPoolStarted = true;
        spawnPooledThread(true);  
    }
}

```
启动Binder线程池后, 则设置mThreadPoolStarted=true. 通过变量mThreadPoolStarted来保证每个应用进程只允许启动一个binder线程池, 且本次创建的是binder主线程(isMain=true). 
其余binder线程池中的线程都是由Binder驱动来控制创建的

- 对于isMain=true的情况下， command为BC_ENTER_LOOPER，代表的是Binder主线程，不会退出的线程；
- 对于isMain=false的情况下，command为BC_REGISTER_LOOPER，表示是由binder驱动创建的线程。


在spawPooledThred#makeBinderThreadName，给binder其他线程设置名称
```
// ProcessState.cpp
String8 ProcessState::makeBinderThreadName() {
    int32_t s = android_atomic_add(1, &mThreadPoolSeq);
    String8 name;
    name.appendFormat("Binder_%X", s);
    return name;
}

```
获取Binder线程名，格式为Binder_x, 其中x为整数。每个进程中的binder编码是从1开始，依次递增; 只有**通过spawnPooledThread方法来创建的线程才符合这个格式**，
对于直接将当前线程通过joinThreadPool加入线程池的线程名则不符合这个命名规则。 
另外,目前Android N中Binder命令已改为Binder:_x格式, 则对于分析问题很有帮忙,通过binder名称的pid字段可以快速定位该binder线程所属的进程p.

### talkWithDriver
talkWithDriver函数的作用是把IPCThreadState类中的mOut变量保存的数据通过ioctl函数发送到驱动，同时把驱动返回的数据放到类的mIn变量中。
```
//mOut有数据，mIn还没有数据。doReceive默认值为true
status_t IPCThreadState::talkWithDriver(bool doReceive)
{
    binder_write_read bwr;
    ...
    // 当同时没有输入和输出数据则直接返回
    if ((bwr.write_size == 0) && (bwr.read_size == 0)) return NO_ERROR;
    ...

    do {
        //ioctl执行binder读写操作，经过syscall，进入Binder驱动。调用Binder_ioctl
        if (ioctl(mProcess->mDriverFD, BINDER_WRITE_READ, &bwr) >= 0)
            err = NO_ERROR;
        ...
    } while (err == -EINTR);
    ...
    return err;
}
```
调用talkWithDriver时，

- 如果mInt还有数据表示还没有处理完驱动发来的消息

本次函数调用将不会从驱动中读取数据

- ioctl函数

使用的命令是BINDER_WRITE_READ 需要binder_write_read结构体作为参数


## 小结
Binder系统中可分为3类binder线程：

- Binder主线程：进程创建过程会调用startThreadPool()过程中再进入spawnPooledThread(true)，来创建Binder主线程。编号从1开始，也就是意味着binder主线程名为binder_1，并且主线程是不会退出的。
- Binder普通线程：是由Binder Driver来根据是否有空闲的binder线程来决定是否创建binder线程，回调spawnPooledThread(false) ，isMain=false，该线程名格式为binder_x。
- Binder其他线程：其他线程是指并没有调用spawnPooledThread方法，而是直接调用IPC.joinThreadPool()，将当前线程直接加入binder线程队列。例如： mediaserver和servicemanager的主线程都是binder线程，但system_server的主线程并非binder线程。

Binder的transaction有3种类型：

1. call: 发起进程的线程不一定是在Binder线程， 大多数情況下，接收者只指向进程，并不确定会有哪个线程来处理，所以不指定线程；
2. reply: 发起者一定是binder线程，并且接收者线程便是上次call时的发起线程(该线程不一定是binder线程，可以是任意线程)。
3. async: 与call类型差不多，唯一不同的是async是oneway方式不需要回复，发起进程的线程不一定是在Binder线程， 接收者只指向进程，并不确定会有哪个线程来处理，所以不指定线程。



