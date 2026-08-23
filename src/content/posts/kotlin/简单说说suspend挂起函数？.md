---
title: "简单说说suspend挂起函数？"
published: 2024-03-27
description: "简单说说suspend挂起函数？"
tags: ["Kotlin","Android"]
category: "kotlin"
draft: false
slug: "kotlin-029"
---

# 简单说说suspend挂起函数？
从字面意思上理解，可以启动、暂停然后恢复的函数称为挂起函数。



协程被挂起的意思是，这个正在线程上运行的协程体代码，将要从当前线程脱离开来，即剩下的协程代码不往下执行了。脱离开后，协程和线程会怎么样呢？线程这边比较好理解，如果有其他的任务需要处理，操作系统肯定会安排线程去执行其他的任务；如果暂时没有什么任务需要处理，可能就会被回收掉，或者放入线程池中；协程这一边，则将会在指定的线程中，继续执行之前被中断的代码。至于被指定的线程具体是哪个，是由 suspend 函数具体实现决定的。常见的可以调用 withContext 方法去指定线程。
suspend 关键字本身没有挂起的作用，需要在方法内部直接或者间接地调用 Kotlin 协程框架中的 suspend 函数才可以。所以，suspend 关键字更多的是给调用者一个提示，提示调用者被它修饰的方法是个耗时方法，需要在协程或者其他 suspend 函数中处理，限制这个方法只能在协程或其他 suspend 函数中被调用。



关于挂起函数要记住的最重要的事情之一是它们只能从另一个挂起函数或在协程中调用。

挂起函数只是标准的_Kotlin_函数加上了_suspend_修饰符，表示它们可以在不阻塞当前线程的情况下挂起协程执行。这意味着我们正在查看的代码可能会在调用暂停函数时暂停执行，并在稍后重新开始执行，但是需要注意的是，它没有提及与此同时当前线程会发生什么。

日常开发中，我们经常使用的**delay()**_函数就是一个典型的挂起函数，我们尝试从协程外部调用_**delay()**函数，会发生什么呢？直接会抛出如下错误：
> Suspend function 'delay' should be called only from a coroutine or another suspend function

![](https://cdn.nlark.com/yuque/0/2024/webp/215777/1712506253027-538db794-a167-47df-b1d4-b8501e1d69c5.webp)
由于dely函数本身就是一个挂起函数，我们需要在一个协程中或者在另一个挂起函数中才能调用delay()函数，它在不阻塞线程的情况下将协程延迟给定时间，并在指定时间后恢复，所以我们可以这么写：
```
GlobalScope.launch(Dispatchers.Main) {
            delay(5000L)
        }
 suspend fun doDelayTask(time: Long) {
        delay(time)
        Log.d("Test","start")
    }
```

