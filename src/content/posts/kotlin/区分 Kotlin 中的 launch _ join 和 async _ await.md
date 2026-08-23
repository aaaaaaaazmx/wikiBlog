---
title: "区分 Kotlin 中的 launch _ join 和 async _ await"
published: 2024-05-30
description: "区分 Kotlin 中的 launch _ join 和 async _ await"
tags: ["Kotlin","Android"]
category: "kotlin"
draft: false
slug: "kotlin-020"
---


#  区分 Kotlin 中的 launch / join 和 async / await

- **launch/join：**

_launch_用于启动和停止协程。如果_launch_ 中的代码抛出异常，它会被视为线程中的未捕获异常，通常会在_JVM_程序中写入 _stderr_ 并导致 _Android_ 应用程序崩溃。_join_ 用于在传播其异常之前等待启动的协程完成。另一方面，崩溃的子协程会用匹配的异常取消其父协程。

- **async/await：**

_async_ 关键字用于启动计算返回结果的协程。我们必须对结果使用 _await_，它由_Deferred_ 的实例表示。异步代码中未捕获的异常保存在生成的 _Deferred_中，不会传输到其他任何地方。它们在处理之前不会被执行。