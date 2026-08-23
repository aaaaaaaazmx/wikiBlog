---
title: "聊聊Job和SupervisorJob的区别"
published: 2021-07-21
description: "聊聊Job和SupervisorJob的区别"
tags: ["Kotlin","Android"]
category: "kotlin"
draft: false
slug: "kotlin-031"
---

# 聊聊Job和SupervisorJob的区别


## 1. 前言
随着协程的普及，协程知识越来越被面试官青睐。首先，协程的面试题一般都很简洁，一两句简单的话就能把问题描述清楚，其次于面试官而言，协程框架中精妙的数据结构与算法可以很好的考察应聘者对基础知识的掌握程度。相对于烂大街的Android八股文，它又能很好的考察应聘者的主动学习能力。所谓行家一伸手便知有没有。协程知识便是面试场景中的行家和试金石。闲话少叙，本文带大家聊聊Job和SupervisorJob的区别。
## 2. Job和SupervisorJob的区别
如果你看过协程的官方文档或视频。你应该会知道Job和SupervisorJob的一个区别是，Job的子协程发生异常被取消会同时取消Job的其它子协程，而SupervisorJob不会。
Job启动了3个子协程job1、job2、job3。job1 delay 100毫秒后发生异常，协程被取消了，job2和job3也同样被取消了。
![](https://cdn.nlark.com/yuque/0/2024/webp/215777/1712546835581-8b746421-0858-4c59-8466-3c34b4f085aa.webp)
SupervisorJob启动了3个子协程job1、job2、job3。job1 delay 100毫秒后发生异常，协程被取消了，job2和job3并不受影响。
![](https://cdn.nlark.com/yuque/0/2024/webp/215777/1712546835550-8e8c5bf7-6f5b-4b2a-9e22-5504e28f4ae8.webp)
## 3. 原理
有过面试经历的朋友应该都知道，面试官喜欢问原理。为什么Job和SupervisorJob有这样的区别呢？
![](https://cdn.nlark.com/yuque/0/2024/webp/215777/1712546835620-cbc04849-440e-43b4-af48-7749934bd9bc.webp)
源码中寻找答案。Job()返回的是JobImpl对象，SupervisorJob()返回的SupervisorJobImpl对象。而SupervisorJobImpl是JobImpl的子类，并且重写了childCancelled方法，返回值为false。JobImpl继承自JobSupport，它的childCancelled方法源码如下：
![](https://cdn.nlark.com/yuque/0/2024/webp/215777/1712546835561-ba9b96b9-1831-4502-a5c0-ff152d96994f.webp)
启动协程的Job会和协程本身的Job形成父子关系。当协程被取消时，会调用父Job的childCancelled方法。SupervisorJobImpl直接返回false，表示父Job不会因为子Job被取消而跟随取消。而JobSupport会调用cancelImpl方法，该方法的作用是取消父Job和父Job的所有子Job。
## 4. 异常处理的区别
恭喜你，前面的问题你都幸运的过关了，正当你暗自庆幸的时候。面试官可能会追问，请问除了子Job的取消不同，还有其它的区别吗？**当然有了，比如异常处理机制不一样，Job方式启动的协程如果发生异常，异常会沿着Job树一直往上传递，而SupervisorJob方式启动的协程发生异常，SupervisorJob会将异常交由给协程处理**。 这么一说有点抽象，看个例子。
演示协程嵌套，中间有Job类型启动的协程时，如果子协程发生异常，异常会交由根协程处理。
![](https://cdn.nlark.com/yuque/0/2024/webp/215777/1712546835618-e57d2adf-a56d-4801-be52-360862090cd1.webp)
演示协程嵌套，中间有SupervisorJob类型启动的协程时，如果子协程发生异常，异常会交由子协程处理。
![](https://cdn.nlark.com/yuque/0/2024/webp/215777/1712546836600-1f08c90b-2a6e-4688-9107-cb9e3bdf8510.webp)
回答自此，暗自心想，这下挑不出毛病吧，哪知面试官接着追问，请问原理是什么呢？答案当然要从源码中找寻了。
![](https://cdn.nlark.com/yuque/0/2024/webp/215777/1712546836647-b007f8fa-6dd9-48a1-859b-61d85f8cc947.webp)
代码1处，是处理异常的核心逻辑，它首先判断cancelParent的返回值，如果返回false，就调用handleJobException。
cancelParent方法的含义是，当子协程处发生异常，那么它会尝试取消它的父协程，如果返回true表示父协程也被取消，反之表示不能取消父协程，而cancelParent最终也有可能调用代码2处的parent.childCancelled方法。
**异常的处理逻辑可以用职场的例子解释。假设职场的潜规则是，任何员工出错了，首要是要向上级报告，如果上级愿意处理你的错误，那员工就不用管了，如果上级将问题打回给员工，那错误就得由员工自己处理**
**那么回到问题本身，Job就相当于一个好老板，子协程犯的错，它愿意处理，SupervisorJob就相当于一个严厉的老板，子协程自己犯的错，自己解决。**

