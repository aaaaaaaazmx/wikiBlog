---
title: "Kotlin 中伴随对象的用途是什么"
published: 2025-10-02
description: "Kotlin 中伴随对象的用途是什么"
tags: ["Kotlin","Android"]
category: "kotlin"
draft: false
slug: "kotlin-006"
---

与 Java 或 C# 不同，Kotlin 没有static成员或成员函数。如果您需要编写一个可以在没有类实例的情况下调用但需要访问类内部的函数，您可以将其编写为该类中伴随对象声明的成员。
```
class EventManager {

    companion object FirebaseManager {
    } 
}

val firebaseManager = EventManager.FirebaseManager
```
伴随对象是单例。伴生对象本身就是一个合适的对象，并且可以有自己的超类型 - 您可以将它分配给一个变量并传递它。如果您正在与 Java 代码集成并需要一个真正的静态成员，您可以使用@JvmStatic.

