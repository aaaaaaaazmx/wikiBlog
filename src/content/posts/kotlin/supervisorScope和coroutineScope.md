---
title: "supervisorScope和coroutineScope"
published: 2020-08-12
description: "supervisorScope和coroutineScope"
tags: ["Kotlin","Android"]
category: "kotlin"
draft: false
slug: "kotlin-013"
---

# supervisorScope和coroutineScope



### supervisorScope
官方解释如下：
使用 SupervisorJob 创建一个 CoroutineScope 并使用此范围调用指定的挂起块。提供的作用域从外部作用域继承其coroutineContext ，但用 SupervisorJob 覆盖上下文的 Job 。一旦给定块及其所有子协程完成，此函数就会返回。
通俗点就是，我们帮你创建了一个 CoroutineScope ,初始化作用域时，使用 SupervisorJob 替代默认的Job,然后将其的作用域扩展至外部调用。如下代码所示:
```
val scope = CoroutineScope(CoroutineExceptionHandler { _, _ -> })
scope.launch() {
    supervisorScope {
      	// launch A ❎
        launch(CoroutineName("A")) {
            delay(10)
            throw RuntimeException()
        }
      
				// launch B 👍
        launch(CoroutineName("B")) {
            delay(100)
            Log.e("petterp", "正常执行,我不会收到影响")
        }
    }
}
```
当 supervisorScope 里的所有子协程执行完成时，其就会正常退出作用域。
需要注意的是，supervisorScope 内部的 Job 为 SupervisorJob ，所以当作用域中子协程异常时，异常不会主动层层向上传递，而是由子协程自行处理，所以意味着我们也可以为子协程增加 CoroutineExceptionHandler 。如下所示：
![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUXibptpdqHnnoVWNOuSBuRqLvkOnkicsuCKqtyyyX82hicbJUXeDIyPva98pH5icjdXq7lccBnUG0gxQ/640?wx_fmt=png&amp;from=appmsg)
当子协程异常时,因为我们使用了 supervisorScope ,所以异常此时不会主动传递给外部，而是由子类自行处理。
当我们在内部 launch 子协程时，**其实也就是类似 scope.launch ,所以此时子协程A相也就是根协程**，所以我们使用 CoroutineExceptionHandler 也可以正常拦截异常。但如果我们子协程不增加 CoroutineExceptionHandler ,则此时异常会被supervisorScope 抛出,然后被外部的 CoroutineExceptionHandler 拦截(也就是初始化scope作用域时使用的 ExceptionHandler)。
相应的，与 supervisorScope 相似的,还有一个 coroutineScope ,下面我们也来说一下这个。

---

### coroutineScope
其主要用于并行分解协程子任务时而使用，当其范围内任何子协程失败时，其所有的子协程也都将被取消，一旦内部所有的子协程完成，其也会正常返回。
如下示例：
![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUXibptpdqHnnoVWNOuSBuRqCf5sib7WJaUG8x4yylmJC4znw8XjmmAr5rVcoUy25ia9tjLBUobzHkfg/640?wx_fmt=png&amp;from=appmsg)
当子协程A 异常未被捕获时，此时 子协程B 和整个 协程作用域 都将被异常取消，此时异常将传递到顶级 CoroutineExceptionHandler 。

## 场景推荐
严格意义上来说，所有异常都可以用 tryCatch 去处理，只要我们的处理位置得当。但这并不是所有方式的最优解，特别是如果你想更优雅的处理异常时，此时就可以考虑 CoroutineExceptionHandler 。下面我们通过实际需求来举例，从而体会异常处理的的一些实践。
**什么时候该用 SupervisorJob ，什么时候该用 Job?**
引用官方的一句话就是：想要避免取消操作在异常发生时被传播，记得使用 SupervisorJob ；反之则使用 Job。
**对于一个普通的协程，如何处理我的异常？**
对于一个普通的协程，你可以在其**协程作用域内使用 tryCatch(runCatching) **,如果其是根协程，你也可以使用 CoroutineExceptionHandler 作为最后的拦截手段 ，如下所示：
```
val scope = CoroutineScope(Job())
scope.launch {
    runCatching { }
}

scope.launch(CoroutineExceptionHandler { _, throwable -> }) {  
}
```

---

**在某个子协程中,想使用 SupervisorJob 的特性去作为某个作用域去执行？**
```
val scope = CoroutineScope(Job())
scope.launch(CoroutineExceptionHandler { _, _ -> }) {
    supervisorScope {
        launch(CoroutineName("A")) {
            throw NullPointerException()
        }
        launch(CoroutineName("B")) {
            delay(1000)
            Log.e("petterp", "依然会正常执行")
        }
    }
}
```
