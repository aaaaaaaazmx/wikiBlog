---
title: "StateFlow 和 SharedFlow 之间的区别？"
published: 2023-05-01
description: "StateFlow 和 SharedFlow 之间的区别？"
tags: ["Kotlin","Android"]
category: "kotlin"
draft: false
slug: "kotlin-012"
---

#### StateFlow 和 SharedFlow 之间的区别？
我们已经知道什么是冷流和热流了，而_StateFlow_和_SharedFlow_都属于热流，下面笔者列出一张表来说明_StateFlow_ 和_SharedFlow_之间的区别

| StateFlow | SharedFlow |
| --- | --- |
| 热流 | 热流 |
| 需要一个初始值并在收集器开始收集时立即发出它 | 不需要初始值，因此默认情况下不发出任何值 |
| 写法：val stateFlow = MutableStateFlow(0) | 写法:val sharedFlow = MutableSharedFlow() |
| 仅发出最后一个已知值 | 可以配置为使用重播运算符发出许多以前的值 |
| 它有value属性，可以查看当前值，保留了一个值的历史记录，我们可以直接获取而无需收集 | 它没有 value 属性 |
| 它不会发出连续的重复值。只有当它与前一项不同时，它才会发出值 | 它发出所有值并且不关心与前一项的区别，它还发出连续的重复值 |
| 类似于 LiveData，除了 Android 组件的生命周期感知。我们应该使用带有 StateFlow 的 repeatOnLifecycle 范围来为其添加生命周期感知，然后它就会变得与 LiveData 完全一样 | 和LiveData不同 |

我们分别举个相应的例子看看：

- StateFlow示例假设我们去记录小明的一次数学考试成绩, 一开始的成绩是个鸭蛋，代码如下：
- SharedFlow示例

第二天，小明的妈妈让小明去买些水果回来，于是乎，小明来到了楼下的水果店，开始选些水果并放入自己的购物篮中
```
val gradeStateFlow = MutableStateFlow(0)
```
这个时候老师再去收集这个成绩
```
gradeStateFlow.collect {
    println(it)
}
```
一旦开始收集了，那么我们就会得到，原来小明考了个鸭蛋，回去应该得挨骂了
```
0
```
这是因为小明的初始分数就是0，它会立即发出后来老师发现原来自己算错分了，小明的分数原来是10分，所以就继续设置这个值,但又不小心输了两遍进去
```
gradeStateFlow.value = 10
gradeStateFlow.value = 10
```
此时最后只会得到一个值，那就是10分，因为它不会发出**连续的重复值**
```
10
```
小明回到家了，妈妈问他成绩怎么样，小明怕被打没有告诉她，所以妈妈就亲自打电话问了老师，这个时候，我们就创建了一个新的收集器，用来发送小明的最终成绩
```
gradeStateFlow.collect {
    println(it)
}
```
这个时候妈妈已经知道了小明最终只考了10分，免不了一顿责骂
```
10
```
因为_StateFlow_存储最后一个值并在新的收集器中开始收集时会立即发出它


- SharedFlow
```
val fruitSharedFlow = MutableSharedFlow<String>()
 fruitSharedFlow.collect {
     println(it)
 }
```
这个时候是不会得到任何东西的，小明还没开始购买水果呢，这个时候他拿了1斤苹果，1斤香蕉和1斤葡萄，后面发现葡萄不够又拿了1斤
```

fruitSharedFlow.emit("1斤苹果")
fruitSharedFlow.emit("1斤香蕉")
fruitSharedFlow.emit("1斤葡萄")
fruitSharedFlow.emit("1斤葡萄")
```
最终得到的结果就是
```
1斤苹果
1斤香蕉
1斤葡萄
1斤葡萄
```
可以看到我们可以得到连续的重复值，现在小明买完回到家，将购物篮的水果都交给了妈妈，这时候小明再看购物篮的时候，里面已经空空如也了,他不会得到任何结果，因为_SharedFlow_不存储最后一个值
```
fruitSharedFlow.collect {
    println(it)
}
```
现在通过两个现实中的例子我们就可以理解下面几点

- _StateFlow_是_SharedFlow_的一种，_StateFlow_是_SharedFlow_的特化
- _StateFlow_ 本质是一个具有固定 replay = 1 的_SharedFlow_，并增加了一些内容。这意味着新收集器在开始收集后将立即获得当前状态初始值。怎么说呢，我们还是用一段伪代码看看吧