---
title: "volatile"
published: 2025-06-06
description: "volatile"
tags: ["Java","基础"]
category: "java基础"
draft: false
slug: "java-basic-042"
---

# volatile
## volatile原理。

- 只能用来修饰变量，适用修饰可能被多线程同时访问的变量
- 相当于轻量级的 synchronized，volatitle 能保证有序性（禁用指令重排序）、可见性
- 变量位于主内存中，每个线程还有自己的工作内存，变量在自己线程的工作内存中有份拷贝，线程直接操作的是这个拷贝
- 被 volatile 修饰的变量改变后会立即同步到主内存，保持变量的可见性

### 双重检查单例，为什么要加 violate？

volatile想要解决的问题是，在另一个线程中想要使用instance，发现instance!=null，但是实际上instance还未初始化完毕这个问题。将instance = newInstance();拆分为3句话是。1.分配内存2.初始化3.将instance指向分配的内存空间，volatile可以禁止指令重排序，确保先执行2，后执行3

在《Java并发编程：核心理论》一文中，我们已经提到可见性、有序性及原子性问题，通常情况下我们可以通过Synchronized关键字来解决这些个问题，不过如果对Synchonized原理有了解的话，应该知道Synchronized是一个较重量级的操作，对系统的性能有比较大的影响，所以如果有其他解决方案，我们通常都避免使用Synchronized来解决问题。
    
而volatile关键字就是Java中提供的另一种解决可见性有序性问题的方案。对于原子性，需要强调一点，也是大家容易误解的一点：对volatile变量的单次读/写操作可保证原子性的，如long和double类型变量，但是并不能保证i++这种操作的原子性，因为本质上i++是读、写两次操作。

volatile也是互斥同步的一种实现，不过它非常的轻量级。

### volatile 的意义？

- 防止CPU指令重排序

volatile有两条关键的语义：

保证被volatile修饰的变量对所有线程都是可见的

禁止进行指令重排序

要理解volatile关键字，我们得先从Java的线程模型开始说起。如图所示：

![image](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWCiaEXFDRIoE2dsoo0oicIA8G4ib8XFeiczEuRUz7U83JFcibmIDljO9ficMyic6X4vY1cOm5jrnQAtAeNQ/640?wx_fmt=png)

Java内存模型规定了所有字段（这些字段包括实例字段、静态字段等，不包括局部变量、方法参数等，因为这些是线程私有的，并不存在竞争）都存在主内存中，每个线程会 有自己的工作内存，工作内存里保存了线程所使用到的变量在主内存里的副本拷贝，线程对变量的操作只能在工作内存里进行，而不能直接读写主内存，当然不同内存之间也 无法直接访问对方的工作内存，也就是说主内存是线程传值的媒介。

我们来理解第一句话：

    保证被volatile修饰的变量对所有线程都是可见的

如何保证可见性？

被volatile修饰的变量在工作内存修改后会被强制写回主内存，其他线程在使用时也会强制从主内存刷新，这样就保证了一致性。

关于“保证被volatile修饰的变量对所有线程都是可见的”，有种常见的错误理解：

- 由于volatile修饰的变量在各个线程里都是一致的，所以基于volatile变量的运算在多线程并发的情况下是安全的。

这句话的前半部分是对的，后半部分却错了，因此它忘记考虑变量的操作是否具有原子性这一问题。

举个例子：

    private volatile int start = 0;

    private void volatile Keyword() {

        Runnable runnable = new Runnable() {
            @Override
            public void run() {
                for (int i = 0; i < 10; i++) {
                    start++;
                }
            }
        };

        for (int i = 0; i < 10; i++) {
            Thread thread = new Thread(runnable);
            thread.start();
        }
        Log.d(TAG, "start = " + start);
    }

![image](https://github.com/guoxiaoxing/android-open-source-project-analysis/raw/master/art/native/process/volatile_thread_safe.png)

这段代码启动了10个线程，每次10次自增，按道理最终结果应该是100，但是结果并非如此。

为什么会这样？

仔细看一下start++，它其实并非一个原子操作，简单来看，它有两步：

1、取出start的值，因为有volatile的修饰，这时候的值是正确的。

2、自增，但是自增的时候，别的线程可能已经把start加大了，这种情况下就有可能把较小的start写回主内存中。
所以volatile只能保证可见性，在不符合以下场景下我们依然需要通过加锁来保证原子性：

- 运算结果并不依赖变量当前的值，或者只有单一线程修改变量的值。（要么结果不依赖当前值，要么操作是原子性的，要么只要一个线程修改变量的值）
- 变量不需要与其他状态变量共同参与不变约束
比方说我们会在线程里加个boolean变量，来判断线程是否停止，这种情况就非常适合使用volatile。

我们再来理解第二句话。

禁止进行指令重排序

什么是指令重排序？

- 指令重排序是指指令乱序执行，即在条件允许的情况下直接运行当前有能力立即执行的后续指令，避开为获取一条指令所需数据而造成的等待，通过乱序执行的技术提供执行效率。

- 指令重排序会在被volatile修饰的变量的赋值操作前，添加一个内存屏障，指令重排序时不能把后面的指令重排序移到内存屏障之前的位置。


## synchronized 和 volatile 关键字的作用和区别。

### Volatile

1）保证了不同线程对这个变量进行操作时的可见性即一个线程修改了某个变量的值，这新值对其他线程来是立即可见的。

2）禁止进行指令重排序。

### 作用

volatile 本质是在告诉jvm当前变量在寄存器（工作内存）中的值是不确定的，需从主存中读取；synchronized则是锁定当前变量，只有当前线程可以访问该变量，其它线程被阻塞住。

### 区别

1.volatile 仅能使用在变量级别；synchronized则可以使用在变量、方法、和类级别的。

2.volatile 仅能实现变量的修改可见性，并不能保证原子性；synchronized 则可以保证变量的修改可见性和原子性。

3.volatile 不会造成线程的阻塞；synchronized 可能会造成线程的阻塞。

4.volatile 标记的变量不会被编译器优化；synchronized标记的变量可以被编译器优化。