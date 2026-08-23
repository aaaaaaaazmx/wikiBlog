---
title: "reified来实现真泛型"
published: 2022-03-08
description: "reified来实现真泛型"
tags: ["Kotlin","Android"]
category: "kotlin"
draft: false
slug: "kotlin-011"
---

在java中我们都知道由于编译时的类型擦除，JVM的泛型其实都是假泛型，如下的代码在编译时往往会报错
```kotlin
fun <T> foo() {
    println(T::class.java) // 会报错
}
```
但是Kotlin为我们提供了**reified关键字**，通过这个关键字，我们就可以让上面的代码成功编译并且运行，不过还需要**搭配inline关键字**
```kotlin
inline fun <reified T> fooReal() {
    println(T::class.java)
}
```
由于inline会把函数体替换到调用处，调用处的泛型类型一定是确定的，那么就可以直接把泛型参数进行替换，从而达成了「真泛型」的效果，比如使用上面的fooReal
```kotlin
fooReal<String>()
//调用它的打印方法时 替换为String类型
println(String::class.java)

```


