---
title: "idlehandler原理"
published: 2020-06-20
description: "idlehandler原理"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-022"
---

# idlehandler原理
**1、IdleHandler是什么？有什么作⽤？**
当消息队列没有消息时或者有待处理的消息但都未到执⾏时间时，就会
回调IdleHandler的queueIdle⽅法，
当 queueIdle 返回 true 时表示回调会⼀直⽣效，
返回 false 则表示回调只会调⽤⼀次，我们可以利⽤它来监听主线程的空闲状态。
调⽤Looper.myQueue().addIdleHandler() 可以将创建的idleHandler加⼊到 idleHandler 列表中。

**2、IdleHandler有哪些使⽤场景？**
1）延迟执⾏：启动优化的延迟初始化优化、数据加载、⽇志上报。
2）批量任务：任务密集，只关注最终结果。

**3、IdleHandler的实现原理是什么？（IdleHandler 的调⽤时机）**
在 ⽅法中的 nativePollOnce ⽅法返回之后，会看消息列表中是否有消息可以分发，如果有，就返回该消息，如果没有，则处理 IdleHandler 的逻辑：
先将 idleHandler 列表转换为对应的idleHandler 数组，然后在遍历中根据下标从数组中取出当前的idleHandler，如果执⾏的 queueIdle 返回 false，则将其从 idleHandler列表中移除


