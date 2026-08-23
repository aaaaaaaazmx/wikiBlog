---
title: "CoroutineScope.launch {} 中的异常如何工作？"
published: 2020-10-24
description: "CoroutineScope.launch {} 中的异常如何工作？"
tags: ["Kotlin","Android"]
category: "kotlin"
draft: false
slug: "kotlin-002"
---

# CoroutineScope.launch {} 中的异常如何工作？
假设我们从一个_CoroutineScope_作用域中启动了 3 个协程
![](https://cdn.nlark.com/yuque/0/2024/webp/215777/1712506253586-dacfe729-e10f-435c-a30f-ce8d77b13c66.webp)
在这里，_Coroutine3_抛出一个使用_launch {}_ 构建器的异常
![](https://cdn.nlark.com/yuque/0/2024/webp/215777/1712506253585-2b368366-fd2e-4984-aadd-dbbb1294bd06.webp)
然后Coroutine3会被取消
![](https://cdn.nlark.com/yuque/0/2024/webp/215777/1712506253618-f36fc51a-1b6e-4db0-a4c4-db5ab7c3b07e.webp)
这个取消操作最终会被传输到_CoroutineScope_，那么它也将取消关闭
![](https://cdn.nlark.com/yuque/0/2024/webp/215777/1712506253752-c4de89f9-d033-40a7-994b-cf10fab2d7b9.webp)

我们都知道，**如果_CoroutineScope_被取消的话，那么它的所有子协程也会被取消**

并且这个时候异常也会传播到异常处理程序当中，我们可以添加自定义的异常处理程序，默认情况下协程会提供一个异常处理程序，这个默认的异常处理程序会导致应用程序崩溃。
![](https://cdn.nlark.com/yuque/0/2024/webp/215777/1712506253616-59fb04f5-e338-4c08-8744-e5099db2a433.webp)