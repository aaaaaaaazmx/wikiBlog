---
title: "Thread,AsyncTask与IntentService的使用场景与特点"
published: 2022-12-25
description: "Thread,AsyncTask与IntentService的使用场景与特点"
tags: ["Android","基础"]
category: "android基础"
draft: false
slug: "android-basic-035"
---

# Thread,AsyncTask与IntentService的使用场景与特点

1. Thread线程，独立运行与于 Activity 的，当Activity 被 finish 后，如果没有主动停止 Thread或者 run 方法没有执行完，其会一直执行下去。

2. AsyncTask 封装了两个线程池和一个Handler（SerialExecutor用于排队，THREAD_POOL_EXECUTOR为真正的执行任务，Handler将工作线程切换到主线程），其必须在 UI线程中创建，execute 方法必须在 UI线程中执行，一个任务实例只允许执行一次，执行多次抛出异常，用于网络请求或者简单数据处理。

3. IntentService：处理异步请求，实现多线程，在onHandleIntent中处理耗时操作，多个耗时任务会依次执行，执行完毕自动结束。

