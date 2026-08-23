---
title: "inline来帮你性能优化"
published: 2021-09-27
description: "inline来帮你性能优化"
tags: ["Kotlin","Android"]
category: "kotlin"
draft: false
slug: "kotlin-004"
---

在高阶函数在调用时总会创建新的Function对象，当被频繁调用，那么就会有大量的对象被创建，除此之外还可能会有基础类型的装箱拆箱问题，不可避免的就会导致性能问题，为此，**Kotlin为我们提供了inline关键字**。
inline的作用**内联**，通过inline，我们可以把**函数调用替换到实际的调用处**，从而避免Function对象的创建，进一步避免性能损耗，看下代码以及
![image.png](https://cdn.nlark.com/yuque/0/2023/png/215777/1688061695488-05447bf2-08fb-4f51-a1a9-f9bbdc6506b5.png)
main方法的调用不再直接调用foo函数，而是把foo函数的函数体直接拷贝了过来进行调用，
不过也不能滥用inline，因为inline是在编译时进行代码的替换，那么就意味着你inline的函数体里的代码，会被替换到每一个调用的地方，从而导致字节码的膨胀，如果对产物对产物大小有严格的要求，需要关注下这个副作用。


**关于内联类的一些注意事项**

- 在主构造函数中初始化单个属性是内联类的基本要求
- 内联类允许我们像普通类一样定义属性和函数
- 不允许初始化块、内部类和_backing field_
- 内联类只能从接口中继承
- 内联类也是有效的 _final_

