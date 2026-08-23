---
title: "说说Cold Flow冷流 和Hot Flow热流？"
published: 2022-03-06
description: "说说Cold Flow冷流 和Hot Flow热流？"
tags: ["Kotlin","Android"]
category: "kotlin"
draft: false
slug: "kotlin-032"
---

#### 说说Cold Flow冷流 和Hot Flow热流？
说起_Flow_可以分为冷流和热流，结合官网和网络上的一些解释，其实分别可以概括成一句话

- 冷流就是**不消费，不生产，多次消费，多次生产，一对一关系**
- 热流就是**只要创建，有无消费，都生产，一对多关系**你说什么，不是特别清晰，那笔者用一个表来展示冷流和热流的区别吧

| 冷流 | 热流 |
| --- | --- |
| 它仅在有收集器的时候才有数据 | 即使没有收集器，它也会发出数据 |
| 它不存储数据 | 它可以存储数据 |
| 它不能有多个收集器 | 它允许有多个收集器 |

在_Cold Flow_中，在多个收集器的情况下，完整的流程将从每个收集器的开始而开始，执行任务并将值发送到它们相应的收集器。这就像一对一的映射。1个收集器的1个生产流量。这意味着冷流不能有多个收集器，因为它将为每个收集器创建一个新流。
在_Hot Flow_中，在多个收集器的情况下，流将继续发出值，收集器从它们开始收集的地方获取值。这就像 1 对 N 映射，N 个收集器对应1个生产流量，这意味着一个热流可以有多个收集器。
如此我们写些伪代码来辅助说明下吧：

- 冷流示例

假设我们有一个_Cold Flow_，它以 1 秒的间隔发出 1 到 5
```
fun getNumbersColdFlow():ColdFlow<Int> {
    return someColdFlow {
        (1..5).forEach {
            delay(1000)
            emit(it)
        }
    }
}
```
我们创建两个收集器进行收集:
```
val numbersColdFlow = getNumbersColdFlow()

numbersColdFlow
    .collect {
        println("1st Collector: $it")
    }

delay(2500)

numbersColdFlow
    .collect {
        println("2nd Collector: $it")
    }
```
那么输出将是：
```
1st Collector: 1
1st Collector: 2
1st Collector: 3
1st Collector: 4
1st Collector: 5

2nd Collector: 1
2nd Collector: 2
2nd Collector: 3
2nd Collector: 4
2nd Collector: 5
```
我们这两个收集器从一开始就会得到所有的值，会从头到尾全部一点不落的拿到

- 热流示例

假设我们有一个_Hot Flow_，它同样以1秒的间隔发出1到5
```
fun getNumbersHotFlow(): HotFlow<Int> {
    return someHotflow {
        (1..5).forEach {
            delay(1000)
            emit(it)
        }
    }
}
```
现在我们继续创建两个收集器进行收集：
```
val numbersHotFlow = getNumbersHotFlow()

numbersHotFlow
    .collect {
        println("1st Collector: $it")
    }

delay(2500)

numbersHotFlow
    .collect {
        println("2nd Collector: $it")
    }
```
输出将是
```
1st Collector: 1
1st Collector: 2
1st Collector: 3
1st Collector: 4
1st Collector: 5

2nd Collector: 3
2nd Collector: 4
2nd Collector: 5
```
可以看到，第一个收集器将会接收到所有的值，由于第二个收集器将会2500毫秒之后开始收集，所以它只会收集那些2500毫秒之后的值。