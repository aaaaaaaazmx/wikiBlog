---
title: "Kotlin 中的协程是什么"
published: 2021-03-20
description: "Kotlin 中的协程是什么"
tags: ["Kotlin","Android"]
category: "kotlin"
draft: false
slug: "kotlin-007"
---

与许多其他具有类似功能的语言不同，async 和 await 不是 Kotlin 中的关键字，甚至不是其标准库的一部分。
kotlinx.coroutines是由 JetBrains 开发的丰富的协程库。它包含许多支持协程的高级原语，包括launch等async。Kotlin Coroutines 为您提供了一个 API 来按顺序编写异步代码。

文档说 Kotlin 协程就像轻量级线程。它们是轻量级的，因为创建协程不会分配新线程。相反，它们使用预定义的线程池和智能调度。调度是确定您接下来将执行哪一项工作的过程。

此外，协程可以在执行过程中暂停和恢复。这意味着您可以有一个长时间运行的任务，您可以一点一点地执行它。您可以暂停它任意次数，并在您再次准备好时恢复它

其中

- launch用于触发并忘记协程。这就像开始一个新线程。如果内部的代码因launch异常而终止，则将其视为线程中未捕获的异常——通常在后端 JVM 应用程序中打印到 stderr 并使 Android 应用程序崩溃。join用于等待启动的协程完成，并且不会传播其异常。但是，崩溃的子协程也会取消其父协程，并出现相应的异常。
- async用于启动计算某些结果的协程。结果由 的实例表示Deferred，您必须在其上使用await。异步代码中未捕获的异常存储在结果Deferred中，不会传递到其他任何地方，除非处理，否则它将被静默丢弃。你一定不要忘记你用异步启动的协程。

