---
title: "Looper无限循环的阻塞为什么没有ANR"
published: 2023-06-21
description: "Looper无限循环的阻塞为什么没有ANR"
tags: ["Android","进阶"]
category: "android进阶"
draft: false
slug: "android-adv-025"
---

# Looper无限循环的阻塞为什么没有ANR

一般遇到此类问题我们可以从以下两个方面去回答：

- Handler的内部原理
- ANR发生的原因

## 什么是ANR

首先回答ANR是什么？引起ANR的主要原因有哪些？


**ANR(Application Not Responding)是应用无响应。Android系统对于一些事件需要在一定的时间范围内完成，如果超过预定时间能未能得到有效响应或者响应时间过长，都会造成ANR**。


发生ANR的主要四种情况：
- Service Timeout：前台服务在20s内未执行完成； 
- BroadcastQueue Timeout：前台广播在10s内未执行完成 
- ContentProvider Timeout：内容提供者在publish过超时10s; 
- InputDispatching Timeout：输入事件分发超时5s，包括按键和触摸事件。
-
对于Service、Broadcast、Provider组件类的ANR而言，如果把发生ANR比作是地雷，那么整个流程包含三部分组成：

**埋弹**：中控系统(system_server进程)启动倒计时埋下定时器，在规定时间内如果目标(Servcie、Broadcast、Provider)没有干完所有的活，则中控系统会定向杀进程，就相当于埋下一个雷。 

**拆弹**：在规定的时间内干完工地的所有活，并及时向中控系统报告完成，请求解除定时雷，则一切正常。 

**引爆**：中控系统立即封装现场，抓取快照，搜集目标执行慢的traces，便于后续调试分析，最后是crash目标。

> 对于输入超时，与其他3个组件类ANR是不同的，Input类型的超时机制并非时间到了一定就会引爆，而是处理后续上报事件的过程才会去检测是否该爆炸，所以更像是扫雷过程。具体的逻辑是这样的：对于输入系统而言，即使某次事件执行时间超过预期的时长，只要用户后续没有再生成输入事件，那么也不需要ANR。而只有当新一轮的输入事件到来，此时正在分发事件的窗口（即App应用本身）迟迟无法释放资源给新的事件去分发，这时InputDispatcher才会根据超时时间，动态的判断是否需要向对应的窗口提示ANR信息。


那么明白了ANR的原因后，我们再来看一下Looper的阻塞原理。

## Looper不阻塞

Looper无限循环是Looper不停取MessageQueen中的Message并执行这个message的一种机制。我们的APP中的事件，如Activity的生命周期切换、点击、长按、滑动、都是依赖这种机制。

**如果主线程的MessageQueue中没有消息，便会阻塞在Loop的queue.next()中的nativePollOnce方法。这个时候主线程会进入休眠状态并释放CPU资源，如果下一个消息到达或者有事物发生，通过向pipe管道写入数据来进行唤醒主线程工作。**


Looper循环的阻塞是在消息队列**无消息需要处理时的一种机制**，这种机制就是让CPU停下来去做别的事。而且消息队列无消息，那么就是需要需要让cpu停下来，避免cpu空转，这个机制和ANR是没有关系的，完全不是同一个事，所以自然不会导致ANR