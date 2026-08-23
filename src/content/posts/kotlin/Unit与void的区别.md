---
title: "Unit与void的区别"
published: 2023-07-28
description: "Unit与void的区别"
tags: ["Kotlin","Android"]
category: "kotlin"
draft: false
slug: "kotlin-014"
---

在Kotlin中，如果一个方法没有声明返回类型，那么它的返回类型会被默认设置为**Unit**，但是**Unit并不等同于Java中的void**关键字，void代表没有返回值，而Unit是有返回值的，如下
```kotlin
fun main() {
    val foo = foo()
    println(foo.javaClass)
}

fun foo() {

}

// 输出结果：class kotlin.Unit
```
继续跟进下看看Unit的实现
```kotlin
public object Unit {
    override fun toString() = "kotlin.Unit"
}
```
在Kotlin中是函数作为一等公民，而不是对象。这一个特性就决定了它可以使用函数进行传递和返回。因此，Kotlin中的高阶函数应用就很广。高阶函数至少就需要一个函数作为参数，或者返回一个函数。如果我们没有在明明函数声明中明确的指定返回类型，或者没有在Lambda函数中明确返回任何内容，它就会返回Unit。
比如 如下实现实际是相同的
```kotlin
fun funcionNoReturnAnything(){
	
}
fun funcionNoReturnAnything():Unit{
	
}
```
或者是在lambda函数体中最后一个值会作为返回值返回，如果没有明确返回，就会默认返回Unit
```kotlin
view.setOnclickListener{
	
}
view.setOnclickListener{
	Unit	
}

```
