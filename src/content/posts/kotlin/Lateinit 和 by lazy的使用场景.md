---
title: "Lateinit 和 by lazy的使用场景"
published: 2021-11-21
description: "Lateinit 和 by lazy的使用场景"
tags: ["Kotlin","Android"]
category: "kotlin"
draft: false
slug: "kotlin-009"
---

这两个经常会被使用到用来实现变量的延迟初始化，不过二者还是有些区别的

- lateinit

在声明变量时不知道它的初始值是多少，依赖后续的流程来赋值，可以节省变量判空带来的便利。不过需要确保后续是会对其赋值的，不然会有异常出现


显而易见，_lateinit_表示延迟初始化。如果我们不想在构造函数中初始化一个变量，而是想稍后对其进行初始化，当然需要保证在使用它之前进行初始化，这个时候就可以使用_lateinit_关键字声明该变量。它在初始化之前不会分配内存。我们不能将_lateinit_用于原始类型属性，如 Int、Long 等。
```
lateinit var test: String

fun doSomething() {
    test = "Some value"
    println("Length of string is "+test.length)
    test = "change value"
}
```

其实在日常开发中，对一些用例会非常有用，例如

- Android：在生命周期方法中初始化的变量；
- 使用 Dagger 进行 DI：注入的类变量在构造函数外部独立初始化；
- 单元测试设置：测试环境变量在 - 注释方法中初始化@Before；
- Spring Boot 注释（例如。@Autowired）；

- lazy

**一个对象的创建需要消耗大量的资源而我不知道它到底会不会被用到** 的场景，并且只有在第一次被调用的时候才会去赋值。
```kotlin
fun main() {
    val lazyTest by lazy {
        println("create lazyTest instance")
    }

    println("before create")
    val value = lazyTest
    println("after create")
}
// before create
// create lazyTest instance
// after create
```

有一些类的对象初始化非常耗时，导致整个类的创建过程被延迟。而**by lazy惰性初始化**有助于解决这类问题。当我们使用惰性初始化声明一个对象时，该对象仅在使用该对象时初始化一次。如果该对象没有被使用，则该对象不会被初始化。这使得代码更高效、更快速。
例如，假设我们有一个_SlowClass_类，并且需要一个名为_FastClass_ 的不同类中的该_SlowClass_ 的对象：
```
class FastClass {
   private val slowObject: SlowClass = SlowClass()
}
```
我们这里生成的是一个大对象，会导致_FastClass_的开发变慢或者延迟。有时可能不需_SlowClass_对象。因此，_by lazy_关键字可以在这种情况下为我们提供帮助：
```
class FastClass {
   private val slowObject: SlowClass by lazy {
       println("Slow Object initialised")
       SlowClass()
   } 
   
   fun access() {
       println(slowObject)
   }
}
fun main() {
   val fastClass = FastClass()
   println("FastClass initialised")
   fastClass.access()
   fastClass.access()
}
```
在上面的代码中，我们使用惰性初始化by lazy在 FastClass 的类结构中实例化了一个 SlowClass 的对象。SlowClass的对象只有在上面的代码中被访问时才会生成，也就是我们调用FastClass对象的access()方法时，整个main()方法中都存在同一个对象


还是用一个表格来展示lateinit和by lazy的区别:

| lateinit | by lazy |
| --- | --- |
| 主要目的是将初始化延迟到稍后的时间节点 | 主要目的是仅在稍后使用对象时才初始化对象。此外，在整个程序中维护对象的单个副本。 |
| 可以从项目程序中任何地方初始化对象 | 只有初始化器 lambda可用于初始化它 |
| 在这种情况下可以进行多次初始化 | 在这种情况下只能进行一次初始化。 |
| 它不是线程安全的。在多线程的环境中，是否正确初始化取决于开发者。 | 默认情况下启用线程安全，确保初始化程序只被调用一次。 |
| 仅适用于var | 仅适用于val |
| 添加了 isInitialized 方法以验证该值之前是否已被初始化。 | 不可能取消初始化一个属性。 |
| 不允许原始类型的属性 | 运行使用原始类型属性 |

我们在决定是使用lateinit还是延迟初始化来进行初始化的时候，需要我们去遵循一些原则：

- 如果属性是可变的，之后可能会更改，那么推荐使用_lateinit_
- 如果属性是在外部设置的（例如，如果您需要传入一个外部变量来设置它），请使用 _lateinit_。仍然有一种方法可以使用 lazy，但不是那么明显。
- 如果只打算初始化一次并由所有人共享，并且它们更多是在内部设置的（取决于类变量），那么惰性初始化lazy是可行的方法。我们仍然可以在战术意义上使用 _lateinit_，但是使用惰性初始化会更好地封装我们的初始化代码。
- by lazy { ... }的初始化默认是线程安全的，并且能保证by lazy { ... }代码块中的代码最多被调用一次，而lateinit var默认是不保证线程安全的，它的情况完全取决于使用者的代码。

就像有些人说的一样，lateinit是手动档，而lazy是自动档