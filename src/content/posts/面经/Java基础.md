---
title: "Java基础"
published: 2022-02-22
description: "Java基础"
tags: ["面试","面经"]
category: "面经"
draft: false
slug: "interview-007"
---

链接 https://juejin.cn/post/6989059224865079326

> **进技术交流群，添加微信：uestc_xsf，(备注加群)，不定期分享学习资料，前进路上不孤单**

众所周知，在这个内卷化的年代，Android面试题的难度早已今非昔比。大厂的面试除了重视基础外，也更加注重面试者自身的知识广度和深度。作为一个Android开发者，不仅要打好自身基础，更重要的是要建立起自己的知识体系。本篇文章是笔者花费近一年时间总结收集的Android面试题。主要涵盖两块内容：Java基础部分和Android部分，另外还有不太完善的计算机网络专题和算法专题。

## Java基础
Java部分是大厂面试的重点，注重基础考察。以下内容涵盖了面试常问的基础知识、集合、JVM及多线程并发等常见面试题。
### Java面向对象与基础知识

- [Java中“==” 和 equals 有什么](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2F%25E9%259D%25A2%25E5%2590%2591%25E5%25AF%25B9%25E8%25B1%25A1%25E4%25B8%258EJava%25E5%259F%25BA%25E7%25A1%2580%25E7%259F%25A5%25E8%25AF%2586%231java%25E4%25B8%25AD-%25E5%2592%258C-equals-%25E6%259C%2589%25E4%25BB%2580%25E4%25B9%2588)
- [为什么重写 equals 方法必须重写 hashcode 方法](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2F%25E9%259D%25A2%25E5%2590%2591%25E5%25AF%25B9%25E8%25B1%25A1%25E4%25B8%258EJava%25E5%259F%25BA%25E7%25A1%2580%25E7%259F%25A5%25E8%25AF%2586%232%25E4%25B8%25BA%25E4%25BB%2580%25E4%25B9%2588%25E9%2587%258D%25E5%2586%2599-equals-%25E6%2596%25B9%25E6%25B3%2595%25E5%25BF%2585%25E9%25A1%25BB%25E9%2587%258D%25E5%2586%2599-hashcode-%25E6%2596%25B9%25E6%25B3%2595)
- [下面的代码在JVM中生成了几个String对象？JVM是如何对其进行内存分配的？](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2F%25E9%259D%25A2%25E5%2590%2591%25E5%25AF%25B9%25E8%25B1%25A1%25E4%25B8%258EJava%25E5%259F%25BA%25E7%25A1%2580%25E7%259F%25A5%25E8%25AF%2586%233%25E4%25B8%258B%25E9%259D%25A2%25E7%259A%2584%25E4%25BB%25A3%25E7%25A0%2581%25E5%259C%25A8jvm%25E4%25B8%25AD%25E7%2594%259F%25E6%2588%2590%25E4%25BA%2586%25E5%2587%25A0%25E4%25B8%25AAstring%25E5%25AF%25B9%25E8%25B1%25A1jvm%25E6%2598%25AF%25E5%25A6%2582%25E4%25BD%2595%25E5%25AF%25B9%25E5%2585%25B6%25E8%25BF%259B%25E8%25A1%258C%25E5%2586%2585%25E5%25AD%2598%25E5%2588%2586%25E9%2585%258D%25E7%259A%2584)
- [了解String的intern()方法吗？它有什么作用？](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2F%25E9%259D%25A2%25E5%2590%2591%25E5%25AF%25B9%25E8%25B1%25A1%25E4%25B8%258EJava%25E5%259F%25BA%25E7%25A1%2580%25E7%259F%25A5%25E8%25AF%2586%234%25E4%25BA%2586%25E8%25A7%25A3string%25E7%259A%2584intern%25E6%2596%25B9%25E6%25B3%2595%25E5%2590%2597%25E5%25AE%2583%25E6%259C%2589%25E4%25BB%2580%25E4%25B9%2588%25E4%25BD%259C%25E7%2594%25A8)
- [String、StringBuffer与StringBuilder有区别？](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2F%25E9%259D%25A2%25E5%2590%2591%25E5%25AF%25B9%25E8%25B1%25A1%25E4%25B8%258EJava%25E5%259F%25BA%25E7%25A1%2580%25E7%259F%25A5%25E8%25AF%2586%235stringstringbuffer%25E4%25B8%258Estringbuilder%25E6%259C%2589%25E5%258C%25BA%25E5%2588%25AB)
- [访问修饰符public,private,protected,以及不写（默认）时的区别？](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2F%25E9%259D%25A2%25E5%2590%2591%25E5%25AF%25B9%25E8%25B1%25A1%25E4%25B8%258EJava%25E5%259F%25BA%25E7%25A1%2580%25E7%259F%25A5%25E8%25AF%2586%236%25E8%25AE%25BF%25E9%2597%25AE%25E4%25BF%25AE%25E9%25A5%25B0%25E7%25AC%25A6publicprivateprotected%25E4%25BB%25A5%25E5%258F%258A%25E4%25B8%258D%25E5%2586%2599%25E9%25BB%2598%25E8%25AE%25A4%25E6%2597%25B6%25E7%259A%2584%25E5%258C%25BA%25E5%2588%25AB)
- [final有哪几种用法？每种用法是什么含义？](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2F%25E9%259D%25A2%25E5%2590%2591%25E5%25AF%25B9%25E8%25B1%25A1%25E4%25B8%258EJava%25E5%259F%25BA%25E7%25A1%2580%25E7%259F%25A5%25E8%25AF%2586%237final%25E6%259C%2589%25E5%2593%25AA%25E5%2587%25A0%25E7%25A7%258D%25E7%2594%25A8%25E6%25B3%2595%25E6%25AF%258F%25E7%25A7%258D%25E7%2594%25A8%25E6%25B3%2595%25E6%2598%25AF%25E4%25BB%2580%25E4%25B9%2588%25E5%2590%25AB%25E4%25B9%2589)
- [static 关键的作用](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2F%25E9%259D%25A2%25E5%2590%2591%25E5%25AF%25B9%25E8%25B1%25A1%25E4%25B8%258EJava%25E5%259F%25BA%25E7%25A1%2580%25E7%259F%25A5%25E8%25AF%2586%238static-%25E5%2585%25B3%25E9%2594%25AE%25E7%259A%2584%25E4%25BD%259C%25E7%2594%25A8)
- [内部类可以引用外部类的成员吗？有没有什么限制？](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2F%25E9%259D%25A2%25E5%2590%2591%25E5%25AF%25B9%25E8%25B1%25A1%25E4%25B8%258EJava%25E5%259F%25BA%25E7%25A1%2580%25E7%259F%25A5%25E8%25AF%2586%239%25E5%2586%2585%25E9%2583%25A8%25E7%25B1%25BB%25E5%258F%25AF%25E4%25BB%25A5%25E5%25BC%2595%25E7%2594%25A8%25E5%25A4%2596%25E9%2583%25A8%25E7%25B1%25BB%25E7%259A%2584%25E6%2588%2590%25E5%2591%2598%25E5%2590%2597%25E6%259C%2589%25E6%25B2%25A1%25E6%259C%2589%25E4%25BB%2580%25E4%25B9%2588%25E9%2599%2590%25E5%2588%25B6)
- [int和Integer有什么区别？](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2F%25E9%259D%25A2%25E5%2590%2591%25E5%25AF%25B9%25E8%25B1%25A1%25E4%25B8%258EJava%25E5%259F%25BA%25E7%25A1%2580%25E7%259F%25A5%25E8%25AF%2586%2310int%25E5%2592%258Cinteger%25E6%259C%2589%25E4%25BB%2580%25E4%25B9%2588%25E5%258C%25BA%25E5%2588%25AB)
- [Java 面向对象的特征有哪些方面？](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2F%25E9%259D%25A2%25E5%2590%2591%25E5%25AF%25B9%25E8%25B1%25A1%25E4%25B8%258EJava%25E5%259F%25BA%25E7%25A1%2580%25E7%259F%25A5%25E8%25AF%2586%2311java-%25E9%259D%25A2%25E5%2590%2591%25E5%25AF%25B9%25E8%25B1%25A1%25E7%259A%2584%25E7%2589%25B9%25E5%25BE%2581%25E6%259C%2589%25E5%2593%25AA%25E4%25BA%259B%25E6%2596%25B9%25E9%259D%25A2)
- [简述Java反射机制，反射的作用和应用？](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2F%25E9%259D%25A2%25E5%2590%2591%25E5%25AF%25B9%25E8%25B1%25A1%25E4%25B8%258EJava%25E5%259F%25BA%25E7%25A1%2580%25E7%259F%25A5%25E8%25AF%2586%2312%25E7%25AE%2580%25E8%25BF%25B0java%25E5%258F%258D%25E5%25B0%2584%25E6%259C%25BA%25E5%2588%25B6%25E5%258F%258D%25E5%25B0%2584%25E7%259A%2584%25E4%25BD%259C%25E7%2594%25A8%25E5%2592%258C%25E5%25BA%2594%25E7%2594%25A8)
- [Java泛型是什么？泛型的类型擦除是怎么回事？](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2F%25E9%259D%25A2%25E5%2590%2591%25E5%25AF%25B9%25E8%25B1%25A1%25E4%25B8%258EJava%25E5%259F%25BA%25E7%25A1%2580%25E7%259F%25A5%25E8%25AF%2586%2313java%25E6%25B3%259B%25E5%259E%258B%25E6%2598%25AF%25E4%25BB%2580%25E4%25B9%2588%25E6%25B3%259B%25E5%259E%258B%25E7%259A%2584%25E7%25B1%25BB%25E5%259E%258B%25E6%2593%25A6%25E9%2599%25A4%25E6%2598%25AF%25E6%2580%258E%25E4%25B9%2588%25E5%259B%259E%25E4%25BA%258B)
### Java集合框架

- [Hash表与HashMap](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FHash%25E8%25A1%25A8%25E4%25B8%258EHashMap)
- [HashMap的工作原理](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FJava%25E9%259B%2586%25E5%2590%2588%25E6%25A1%2586%25E6%259E%25B6%231hashmap%25E7%259A%2584%25E5%25B7%25A5%25E4%25BD%259C%25E5%258E%259F%25E7%2590%2586)
- [为什么HashMap在多线程并发存在死循环的问题，JDK1.8中做了哪些优化？](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FJava%25E9%259B%2586%25E5%2590%2588%25E6%25A1%2586%25E6%259E%25B6%232%25E4%25B8%25BA%25E4%25BB%2580%25E4%25B9%2588hashmap%25E5%259C%25A8%25E5%25A4%259A%25E7%25BA%25BF%25E7%25A8%258B%25E5%25B9%25B6%25E5%258F%2591%25E5%25AD%2598%25E5%259C%25A8%25E6%25AD%25BB%25E5%25BE%25AA%25E7%258E%25AF%25E7%259A%2584%25E9%2597%25AE%25E9%25A2%2598jdk18%25E4%25B8%25AD%25E5%2581%259A%25E4%25BA%2586%25E5%2593%25AA%25E4%25BA%259B%25E4%25BC%2598%25E5%258C%2596)
- [Hashtable与HashMap有什么区别？](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FJava%25E9%259B%2586%25E5%2590%2588%25E6%25A1%2586%25E6%259E%25B6%233hashtable%25E4%25B8%258Ehashmap%25E6%259C%2589%25E4%25BB%2580%25E4%25B9%2588%25E5%258C%25BA%25E5%2588%25AB)
- [了解ConcurrentHashMap吗？它是怎么实现的?](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FJava%25E9%259B%2586%25E5%2590%2588%25E6%25A1%2586%25E6%259E%25B6%234%25E4%25BA%2586%25E8%25A7%25A3concurrenthashmap%25E5%2590%2597%25E5%25AE%2583%25E6%2598%25AF%25E6%2580%258E%25E4%25B9%2588%25E5%25AE%259E%25E7%258E%25B0%25E7%259A%2584)
- [可以使用CocurrentHashMap来代替Hashtable吗？](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FJava%25E9%259B%2586%25E5%2590%2588%25E6%25A1%2586%25E6%259E%25B6%235%25E5%258F%25AF%25E4%25BB%25A5%25E4%25BD%25BF%25E7%2594%25A8cocurrenthashmap%25E6%259D%25A5%25E4%25BB%25A3%25E6%259B%25BFhashtable%25E5%2590%2597)
- [ConcurrentHashMap有什么缺陷吗？](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FJava%25E9%259B%2586%25E5%2590%2588%25E6%25A1%2586%25E6%259E%25B6%236concurrenthashmap%25E6%259C%2589%25E4%25BB%2580%25E4%25B9%2588%25E7%25BC%25BA%25E9%2599%25B7%25E5%2590%2597)
- [ConcurrentHashMap在JDK 7和8之间的区别](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FJava%25E9%259B%2586%25E5%2590%2588%25E6%25A1%2586%25E6%259E%25B6%237concurrenthashmap%25E5%259C%25A8jdk-7%25E5%2592%258C8%25E4%25B9%258B%25E9%2597%25B4%25E7%259A%2584%25E5%258C%25BA%25E5%2588%25AB)
- [Java中HashMap和HashTable的区别？](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FJava%25E9%259B%2586%25E5%2590%2588%25E6%25A1%2586%25E6%259E%25B6%239java%25E4%25B8%25ADhashmap%25E5%2592%258Chashtable%25E7%259A%2584%25E5%258C%25BA%25E5%2588%25AB)
- [HashMap 和 HashSet 的区别](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FJava%25E9%259B%2586%25E5%2590%2588%25E6%25A1%2586%25E6%259E%25B6%2310hashmap-%25E5%2592%258C-hashset-%25E7%259A%2584%25E5%258C%25BA%25E5%2588%25AB)
- [请说出 ArrayList和LinkedList的区别？](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FJava%25E9%259B%2586%25E5%2590%2588%25E6%25A1%2586%25E6%259E%25B6%2311%25E8%25AF%25B7%25E8%25AF%25B4%25E5%2587%25BA-arraylist%25E5%2592%258Clinkedlist%25E7%259A%2584%25E5%258C%25BA%25E5%2588%25AB)
- [请说出 ArrayList和LinkedList的区别？](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FJava%25E9%259B%2586%25E5%2590%2588%25E6%25A1%2586%25E6%259E%25B6%2311%25E8%25AF%25B7%25E8%25AF%25B4%25E5%2587%25BA-arraylist%25E5%2592%258Clinkedlist%25E7%259A%2584%25E5%258C%25BA%25E5%2588%25AB)
- [Java 中 Set 与 List 有什么不同?](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FJava%25E9%259B%2586%25E5%2590%2588%25E6%25A1%2586%25E6%259E%25B6%2312java-%25E4%25B8%25AD-set-%25E4%25B8%258E-list-%25E6%259C%2589%25E4%25BB%2580%25E4%25B9%2588%25E4%25B8%258D%25E5%2590%258C)
### JVM

- [JVM的内存分配](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FJVM%23jvm%25E7%259A%2584%25E5%2586%2585%25E5%25AD%2598%25E5%2588%2586%25E9%2585%258D)
- [Java的垃圾回收机制](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FJVM%23java%25E7%259A%2584%25E5%259E%2583%25E5%259C%25BE%25E5%259B%259E%25E6%2594%25B6%25E6%259C%25BA%25E5%2588%25B6)
- [JVM类加载的过程](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FJVM%23jvm%25E7%25B1%25BB%25E5%258A%25A0%25E8%25BD%25BD%25E7%259A%2584%25E8%25BF%2587%25E7%25A8%258B)
### 多线程与并发

- [多线程与并发基础](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2F%25E5%25A4%259A%25E7%25BA%25BF%25E7%25A8%258B%25E4%25B8%258E%25E5%25B9%25B6%25E5%258F%2591%25E5%259F%25BA%25E7%25A1%2580)
- [JMM与volatile关键字](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FJMM%25E4%25B8%258Evolatile%25E5%2585%25B3%25E9%2594%25AE%25E5%25AD%2597)
- [synchronized的实现原理](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2Fsynchronized%25E7%259A%2584%25E5%25AE%259E%25E7%258E%25B0%25E5%258E%259F%25E7%2590%2586)
- [CAS、Unsafe类以及Automic并发包](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FCAS%25E3%2580%2581UnSafe%25E7%25B1%25BB%25E5%258D%25B3Automic%25E5%25B9%25B6%25E5%258F%2591%25E5%258C%2585)
- [AQS的实现原理](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FAQS%25E7%259A%2584%25E5%25AE%259E%25E7%258E%25B0%25E5%258E%259F%25E7%2590%2586)
- [ReentrantLock的实现原理](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FReentrantLock%25E5%25AE%259E%25E7%258E%25B0%25E5%258E%259F%25E7%2590%2586)
- [ThreadLoacal的实现原理](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FThreadLoacal%25E7%259A%2584%25E5%25AE%259E%25E7%258E%25B0%25E5%258E%259F%25E7%2590%2586)
- [线程池的实现原理](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2F%25E7%25BA%25BF%25E7%25A8%258B%25E6%25B1%25A0%25E7%259A%2584%25E5%25AE%259E%25E7%258E%25B0%25E5%258E%259F%25E7%2590%2586)
- [Java线程中断机制](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FJava%25E7%25BA%25BF%25E7%25A8%258B%25E4%25B8%25AD%25E6%2596%25AD%25E6%259C%25BA%25E5%2588%25B6)
- [Java等待与唤醒机制](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FJava%25E7%25AD%2589%25E5%25BE%2585%25E4%25B8%258E%25E5%2594%25A4%25E9%2586%2592%25E6%259C%25BA%25E5%2588%25B6)
## Android
Android部分的内容涵盖比较广。主要包含了常问的基础问题、Android消息机制、事件分发机制、View的绘制流程、屏幕刷新机制、性能优化、Framework专题、Jetpack组件原理，以及第三方框架的实现原理等。技术深度基本可以应对国内一线大厂。
### Android基础知识

- [Android基础知识汇总](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FAndroid%25E5%259F%25BA%25E7%25A1%2580%25E7%259F%25A5%25E8%25AF%2586%25E6%25B1%2587%25E6%2580%25BB)
- [SparseArray实现原理](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FSparseArray%25E5%25AE%259E%25E7%258E%25B0%25E5%258E%259F%25E7%2590%2586)
- [ArrayMap的实现原理](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FArrayMap%25E7%259A%2584%25E5%25AE%259E%25E7%258E%25B0%25E5%258E%259F%25E7%2590%2586)
- [SharedPreferences](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FSharedPreferences)
### Android消息机制

- [简述Handler的实现原理](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FHandler%25E7%259B%25B8%25E5%2585%25B3%231%25E7%25AE%2580%25E8%25BF%25B0handler%25E7%259A%2584%25E5%25AE%259E%25E7%258E%25B0%25E5%258E%259F%25E7%2590%2586)
- [一个线程有几个Handler？一个线程有几个Looper？如何保证？](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FHandler%25E7%259B%25B8%25E5%2585%25B3%232%25E4%25B8%2580%25E4%25B8%25AA%25E7%25BA%25BF%25E7%25A8%258B%25E6%259C%2589%25E5%2587%25A0%25E4%25B8%25AAhandler%25E4%25B8%2580%25E4%25B8%25AA%25E7%25BA%25BF%25E7%25A8%258B%25E6%259C%2589%25E5%2587%25A0%25E4%25B8%25AAlooper%25E5%25A6%2582%25E4%25BD%2595%25E4%25BF%259D%25E8%25AF%2581)
- [Handler线程是如何切换的？](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FHandler%25E7%259B%25B8%25E5%2585%25B3%233handler%25E7%25BA%25BF%25E7%25A8%258B%25E6%2598%25AF%25E5%25A6%2582%25E4%25BD%2595%25E5%2588%2587%25E6%258D%25A2%25E7%259A%2584)
- [Handler内存泄漏的原因是什么？如何解决?](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FHandler%25E7%259B%25B8%25E5%2585%25B3%234handler%25E5%2586%2585%25E5%25AD%2598%25E6%25B3%2584%25E6%25BC%258F%25E7%259A%2584%25E5%258E%259F%25E5%259B%25A0%25E6%2598%25AF%25E4%25BB%2580%25E4%25B9%2588%25E5%25A6%2582%25E4%25BD%2595%25E8%25A7%25A3%25E5%2586%25B3)
- [子线程中使用Looper应该注意什么？有什么用？](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FHandler%25E7%259B%25B8%25E5%2585%25B3%235%25E5%25AD%2590%25E7%25BA%25BF%25E7%25A8%258B%25E4%25B8%25AD%25E4%25BD%25BF%25E7%2594%25A8looper%25E5%25BA%2594%25E8%25AF%25A5%25E6%25B3%25A8%25E6%2584%258F%25E4%25BB%2580%25E4%25B9%2588%25E6%259C%2589%25E4%25BB%2580%25E4%25B9%2588%25E7%2594%25A8)
- [MessageQueue是如何保证线程安全的？](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FHandler%25E7%259B%25B8%25E5%2585%25B3%236messagequeue%25E6%2598%25AF%25E5%25A6%2582%25E4%25BD%2595%25E4%25BF%259D%25E8%25AF%2581%25E7%25BA%25BF%25E7%25A8%258B%25E5%25AE%2589%25E5%2585%25A8%25E7%259A%2584)
- [我们使用Message的时候如何创建它？](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FHandler%25E7%259B%25B8%25E5%2585%25B3%237%25E6%2588%2591%25E4%25BB%25AC%25E4%25BD%25BF%25E7%2594%25A8message%25E7%259A%2584%25E6%2597%25B6%25E5%2580%2599%25E5%25A6%2582%25E4%25BD%2595%25E5%2588%259B%25E5%25BB%25BA%25E5%25AE%2583)
- [Looper死循环为什么不会导致应用卡死？](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FHandler%25E7%259B%25B8%25E5%2585%25B3%238looper%25E6%25AD%25BB%25E5%25BE%25AA%25E7%258E%25AF%25E4%25B8%25BA%25E4%25BB%2580%25E4%25B9%2588%25E4%25B8%258D%25E4%25BC%259A%25E5%25AF%25BC%25E8%2587%25B4%25E5%25BA%2594%25E7%2594%25A8%25E5%258D%25A1%25E6%25AD%25BB)
- [能不能让一个Message被加急处理？](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FHandler%25E7%259B%25B8%25E5%2585%25B3%239%25E8%2583%25BD%25E4%25B8%258D%25E8%2583%25BD%25E8%25AE%25A9%25E4%25B8%2580%25E4%25B8%25AAmessage%25E8%25A2%25AB%25E5%258A%25A0%25E6%2580%25A5%25E5%25A4%2584%25E7%2590%2586)
- [Handler的同步屏障是什么？](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FHandler%25E7%259B%25B8%25E5%2585%25B3%2310handler%25E7%259A%2584%25E5%2590%258C%25E6%25AD%25A5%25E5%25B1%258F%25E9%259A%259C%25E6%2598%25AF%25E4%25BB%2580%25E4%25B9%2588)
- [Handler的阻塞唤醒机制是什么？](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FHandler%25E7%259B%25B8%25E5%2585%25B3%2311handler%25E7%259A%2584%25E9%2598%25BB%25E5%25A1%259E%25E5%2594%25A4%25E9%2586%2592%25E6%259C%25BA%25E5%2588%25B6%25E6%2598%25AF%25E4%25BB%2580%25E4%25B9%2588)
- [ThreadLocal的实现原理](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FThreadLoacal%25E7%259A%2584%25E5%25AE%259E%25E7%258E%25B0%25E5%258E%259F%25E7%2590%2586)
- [HandlerThread是什么？](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FHandlerThread%25E5%25AE%259E%25E7%258E%25B0%25E5%258E%259F%25E7%2590%2586)
- [IntentService是什么？](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FIntentService%25E5%25AE%259E%25E7%258E%25B0%25E5%258E%259F%25E7%2590%2586)
- [IdleHandler是什么？](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FHandler%25E7%259B%25B8%25E5%2585%25B3%2315idlehandler%25E6%2598%25AF%25E4%25BB%2580%25E4%25B9%2588)
### View事件分发机制

- [事件分发机制流程](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FView%25E4%25BA%258B%25E4%25BB%25B6%25E5%2588%2586%25E5%258F%2591%25E6%259C%25BA%25E5%2588%25B6)
- [ViewGroup中的mFirstTouchTarget是一个什么东西，它有什么作用？](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FView%25E4%25BA%258B%25E4%25BB%25B6%25E5%2588%2586%25E5%258F%2591%25E6%259C%25BA%25E5%2588%25B6%231viewgroup%25E4%25B8%25AD%25E7%259A%2584mfirsttouchtarget%25E6%2598%25AF%25E4%25B8%2580%25E4%25B8%25AA%25E4%25BB%2580%25E4%25B9%2588%25E4%25B8%259C%25E8%25A5%25BF%25E5%25AE%2583%25E6%259C%2589%25E4%25BB%2580%25E4%25B9%2588%25E4%25BD%259C%25E7%2594%25A8)
- [如果在ViewGroup中拦截了ACTION_DOWN事件会怎样？](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FView%25E4%25BA%258B%25E4%25BB%25B6%25E5%2588%2586%25E5%258F%2591%25E6%259C%25BA%25E5%2588%25B6%232%25E5%25A6%2582%25E6%259E%259C%25E5%259C%25A8viewgroup%25E4%25B8%25AD%25E6%258B%25A6%25E6%2588%25AA%25E4%25BA%2586action_down%25E4%25BA%258B%25E4%25BB%25B6%25E4%25BC%259A%25E6%2580%258E%25E6%25A0%25B7)
- [为什么设置了onTouchListener后onClickListener不会被调用？](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FView%25E4%25BA%258B%25E4%25BB%25B6%25E5%2588%2586%25E5%258F%2591%25E6%259C%25BA%25E5%2588%25B6%233%25E4%25B8%25BA%25E4%25BB%2580%25E4%25B9%2588%25E8%25AE%25BE%25E7%25BD%25AE%25E4%25BA%2586ontouchlistener%25E5%2590%258Eonclicklistener%25E4%25B8%258D%25E4%25BC%259A%25E8%25A2%25AB%25E8%25B0%2583%25E7%2594%25A8)
- [为什么一个View设置了setOnTouchListener会有提示没有引用performClick方法的警告？](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FView%25E4%25BA%258B%25E4%25BB%25B6%25E5%2588%2586%25E5%258F%2591%25E6%259C%25BA%25E5%2588%25B6%233%25E4%25B8%25BA%25E4%25BB%2580%25E4%25B9%2588%25E8%25AE%25BE%25E7%25BD%25AE%25E4%25BA%2586ontouchlistener%25E5%2590%258Eonclicklistener%25E4%25B8%258D%25E4%25BC%259A%25E8%25A2%25AB%25E8%25B0%2583%25E7%2594%25A8)
### View的绘制流程

- [简述View的绘制流程](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FView%25E7%259A%2584%25E7%25BB%2598%25E5%2588%25B6%25E6%25B5%2581%25E7%25A8%258B%231view%25E7%259A%2584%25E7%25BB%2598%25E5%2588%25B6%25E6%25B5%2581%25E7%25A8%258B%25E6%25A6%2582%25E8%25BF%25B0)
- [XML解析原理](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FXML%25E8%25A7%25A3%25E6%259E%2590%25E5%258E%259F%25E7%2590%2586)
- [MeasureSpec是什么？](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FView%25E7%259A%2584%25E7%25BB%2598%25E5%2588%25B6%25E6%25B5%2581%25E7%25A8%258B%232measurespec%25E6%2598%25AF%25E4%25BB%2580%25E4%25B9%2588)
- [requestLayout、invalidate与postInvalidate](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FrequestLayout%25E3%2580%2581invalidate%25E4%25B8%258EpostInvalidate)
### Android屏幕刷新机制

- [屏幕刷新机制概述](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2F%25E5%25B1%258F%25E5%25B9%2595%25E5%2588%25B7%25E6%2596%25B0%25E6%259C%25BA%25E5%2588%25B6%231%25E5%25B1%258F%25E5%25B9%2595%25E5%2588%25B7%25E6%2596%25B0%25E6%259C%25BA%25E5%2588%25B6%25E6%25A6%2582%25E8%25BF%25B0)
- [Choreographer详解](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FChoreographer%25E8%25AF%25A6%25E8%25A7%25A3)
- [SurfaceFlinger](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FSurfaceFlinger)
- [丢帧一般是什么原因引起的？](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2F%25E5%25B1%258F%25E5%25B9%2595%25E5%2588%25B7%25E6%2596%25B0%25E6%259C%25BA%25E5%2588%25B6%232%25E4%25B8%25A2%25E5%25B8%25A7%25E4%25B8%2580%25E8%2588%25AC%25E6%2598%25AF%25E4%25BB%2580%25E4%25B9%2588%25E5%258E%259F%25E5%259B%25A0%25E5%25BC%2595%25E8%25B5%25B7%25E7%259A%2584)
- [如果在屏幕快刷新的时候才去onDraw绘制会丢帧么](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2F%25E5%25B1%258F%25E5%25B9%2595%25E5%2588%25B7%25E6%2596%25B0%25E6%259C%25BA%25E5%2588%25B6%233%25E5%25A6%2582%25E6%259E%259C%25E5%259C%25A8%25E5%25B1%258F%25E5%25B9%2595%25E5%25BF%25AB%25E5%2588%25B7%25E6%2596%25B0%25E7%259A%2584%25E6%2597%25B6%25E5%2580%2599%25E6%2589%258D%25E5%258E%25BBondraw%25E7%25BB%2598%25E5%2588%25B6%25E4%25BC%259A%25E4%25B8%25A2%25E5%25B8%25A7%25E4%25B9%2588)
- [如果快速调用10次requestLayout，会调用10次onDraw吗？](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2F%25E5%25B1%258F%25E5%25B9%2595%25E5%2588%25B7%25E6%2596%25B0%25E6%259C%25BA%25E5%2588%25B6%234%25E5%25A6%2582%25E6%259E%259C%25E5%25BF%25AB%25E9%2580%259F%25E8%25B0%2583%25E7%2594%25A810%25E6%25AC%25A1requestlayout%25E4%25BC%259A%25E8%25B0%2583%25E7%2594%25A810%25E6%25AC%25A1ondraw%25E5%2590%2597)
- [简述UI渲染流程](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2F%25E5%25B1%258F%25E5%25B9%2595%25E5%2588%25B7%25E6%2596%25B0%25E6%259C%25BA%25E5%2588%25B6%235%25E7%25AE%2580%25E8%25BF%25B0ui%25E6%25B8%25B2%25E6%259F%2593%25E6%25B5%2581%25E7%25A8%258B)
- [View 刷新机制](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2F%25E5%25B1%258F%25E5%25B9%2595%25E5%2588%25B7%25E6%2596%25B0%25E6%259C%25BA%25E5%2588%25B6%236view-%25E5%2588%25B7%25E6%2596%25B0%25E6%259C%25BA%25E5%2588%25B6)
### 性能优化

- [内存优化策略](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2F%25E5%2586%2585%25E5%25AD%2598%25E4%25BC%2598%25E5%258C%2596)
- [UI界面及卡顿优化](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FUI%25E7%2595%258C%25E9%259D%25A2%25E5%258F%258A%25E5%258D%25A1%25E9%25A1%25BF%25E4%25BC%2598%25E5%258C%2596)
- [App启动优化](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2F%25E5%2590%25AF%25E5%258A%25A8%25E4%25BC%2598%25E5%258C%2596)
- [ANR问题](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FANR%25E9%2597%25AE%25E9%25A2%2598%25E4%25BC%2598%25E5%258C%2596)
- [包体积优化](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2F%25E5%258C%2585%25E4%25BD%2593%25E7%25A7%25AF%25E4%25BC%2598%25E5%258C%2596)
- [APK打包流程](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FAPK%25E7%259A%2584%25E6%2589%2593%25E5%258C%2585%25E6%25B5%2581%25E7%25A8%258B)
- [电池电量优化](https://link.juejin.cn?target=)
- [Android屏幕适配](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2F%25E5%25B1%258F%25E5%25B9%2595%25E9%2580%2582%25E9%2585%258D)
- [线上性能监控1--线上监控切入点](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2F%25E7%25BA%25BF%25E4%25B8%258A%25E6%2580%25A7%25E8%2583%25BD%25E7%259B%2591%25E6%258E%25A7)
- [线上性能监控2--Matrix实现原理](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2F%25E7%25BA%25BF%25E4%25B8%258A%25E6%2580%25A7%25E8%2583%25BD%25E7%259B%2591%25E6%258E%25A72-Matrix%25E5%25AE%259E%25E7%258E%25B0%25E5%258E%259F%25E7%2590%2586)
### Framework

- [Binder与AIDL](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FBinder%25E4%25B8%258EAIDL)
- [Binder实现原理](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FBinder%25E6%259C%25BA%25E5%2588%25B6%25E7%259A%2584%25E5%25AE%259E%25E7%258E%25B0%25E5%258E%259F%25E7%2590%2586)
- [Android系统启动流程](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FAndroid%25E7%25B3%25BB%25E7%25BB%259F%25E5%2590%25AF%25E5%258A%25A8%25E6%25B5%2581%25E7%25A8%258B)
- [InputManagerService](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FInputManagerService)
- [WindowManagerService](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FWMS%25E6%25A0%25B8%25E5%25BF%2583%25E5%2588%2586%25E6%259E%2590)
- [ActivityManagerService](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FAMS%25E6%25A0%25B8%25E5%25BF%2583%25E5%2588%2586%25E6%259E%2590)
- [SurfaceFlinger](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FSurfaceFlinger)
- [APP启动流程](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FApp%25E7%259A%2584%25E5%2590%25AF%25E5%258A%25A8%25E6%25B5%2581%25E7%25A8%258B)
- [PMS安装与签名校验](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FPMS%25E5%25AE%2589%25E8%25A3%2585%25E4%25B8%258E%25E7%25AD%25BE%25E5%2590%258D%25E6%25A0%25A1%25E9%25AA%258C)
- [Dalvik与ART](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FDalvik%25E4%25B8%258EART)
- [Fragment核心原理](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FFragment%25E6%25A0%25B8%25E5%25BF%2583%25E5%258E%259F%25E7%2590%2586)
### Jetpack&系统View

- [ViewModel的实现原理](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FViewModel%25E7%259A%2584%25E5%25AE%259E%25E7%258E%25B0%25E5%258E%259F%25E7%2590%2586)
- [WorkManager的实现原理](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FWorkManager%25E7%259A%2584%25E5%25AE%259E%25E7%258E%25B0%25E5%258E%259F%25E7%2590%2586)
- [Lifecycle实现原理](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FLifecycle%25E5%25AE%259E%25E7%258E%25B0%25E5%258E%259F%25E7%2590%2586)
- [RecyclerView实现原理](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FRecyclerView%25E5%25AE%259E%25E7%258E%25B0%25E5%258E%259F%25E7%2590%2586)
### 第三方框架实现原理

- [Glide实现原理](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FGlide%25E5%25AE%259E%25E7%258E%25B0%25E5%258E%259F%25E7%2590%2586)
- [OkHttp实现原理](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FOKHttp%25E5%25AE%259E%25E7%258E%25B0%25E5%258E%259F%25E7%2590%2586)
- [Retrofit实现原理](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FRetrofit%25E5%25AE%259E%25E7%258E%25B0%25E5%258E%259F%25E7%2590%2586)
- [RxJava实现原理](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FRxJava%25E5%25AE%259E%25E7%258E%25B0%25E5%258E%259F%25E7%2590%2586)
- [Butterknife实现原理](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FButterknife%25E5%25AE%259E%25E7%258E%25B0%25E5%258E%259F%25E7%2590%2586)
- [ARouter实现原理](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FARouter%25E5%25AE%259E%25E7%258E%25B0%25E5%258E%259F%25E7%2590%2586)
### 计算机网络

- [简述TCP/IP协议](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2F%25E8%25AE%25A1%25E7%25AE%2597%25E6%259C%25BA%25E7%25BD%2591%25E7%25BB%259C%23tcpip%25E5%258D%258F%25E8%25AE%25AE)
- [TCP协议与UDP协议的区别](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2F%25E8%25AE%25A1%25E7%25AE%2597%25E6%259C%25BA%25E7%25BD%2591%25E7%25BB%259C%23tcp%25E5%258D%258F%25E8%25AE%25AE%25E4%25B8%258Eudp%25E5%258D%258F%25E8%25AE%25AE%25E7%259A%2584%25E5%258C%25BA%25E5%2588%25AB)
- [TCP协议的三次握手](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2F%25E8%25AE%25A1%25E7%25AE%2597%25E6%259C%25BA%25E7%25BD%2591%25E7%25BB%259C%23tcp%25E5%258D%258F%25E8%25AE%25AE%25E7%259A%2584%25E4%25B8%2589%25E6%25AC%25A1%25E6%258F%25A1%25E6%2589%258B)
- [TCP协议的四次挥手](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2F%25E8%25AE%25A1%25E7%25AE%2597%25E6%259C%25BA%25E7%25BD%2591%25E7%25BB%259C%23tcp%25E5%258D%258F%25E8%25AE%25AE%25E7%259A%2584%25E5%259B%259B%25E6%25AC%25A1%25E6%258C%25A5%25E6%2589%258B)
- [IP 协议相关技术](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2F%25E8%25AE%25A1%25E7%25AE%2597%25E6%259C%25BA%25E7%25BD%2591%25E7%25BB%259C%23ip-%25E5%258D%258F%25E8%25AE%25AE%25E7%259B%25B8%25E5%2585%25B3%25E6%258A%2580%25E6%259C%25AF)
- [Http的get和post的主要有什么区别？](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2F%25E8%25AE%25A1%25E7%25AE%2597%25E6%259C%25BA%25E7%25BD%2591%25E7%25BB%259C%23http%25E4%25B8%258Ehttps)
- [HTTP协议](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FHttp%25E5%258D%258F%25E8%25AE%25AE)
- [HTTPS的实现原理](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2F%25E8%25AE%25A1%25E7%25AE%2597%25E6%259C%25BA%25E7%25BD%2591%25E7%25BB%259C%23https%25E7%259A%2584%25E5%25AE%259E%25E7%258E%25B0%25E5%258E%259F%25E7%2590%2586)
- [Socket](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FSocket)
### 算法

- [排序算法](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2F%25E6%258E%2592%25E5%25BA%258F%25E7%25AE%2597%25E6%25B3%2595)
- [查找算法](https://link.juejin.cn?target=)
- [链表相关](https://link.juejin.cn?target=)
- [数组相关](https://link.juejin.cn?target=)
- [二叉树](https://link.juejin.cn?target=)
- [字符串](https://link.juejin.cn?target=)
- [递归](https://link.juejin.cn?target=)
### 其它

- [组件化WebView架构搭建](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2F%25E7%25BB%2584%25E4%25BB%25B6%25E5%258C%2596WebView%25E6%259E%25B6%25E6%259E%2584%25E6%2590%25AD%25E5%25BB%25BA)
- [HR常见问题](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fzhpanvip%2FAndroidNote%2Fwiki%2FHR%25E9%259D%25A2%25E5%25B8%25B8%25E9%2597%25AE%25E9%2597%25AE%25E9%25A2%2598)
