---
title: "介绍下kotlin中的lambda"
published: 2023-01-24
description: "介绍下kotlin中的lambda"
tags: ["Android","基础"]
category: "android基础"
draft: false
slug: "android-basic-045"
---


# 介绍下kotlin中的lambda
> lambda表达式是Kotlin函数式编程的一个重要概念，是函数式编程的基础

# 1、lambda基本形式
lambda表达式存在于 { }中；参数及参数类型可在 -> 左边，函数体在 -> 右边；lambda表达式返回值总是返回函数体内部最后一行表达式的值

## 1.1、无参数
> val 函数名 = { 函数体 }

```kotlin
val hello = { println("hello kotlin") }

// 等价于函数
fun hello() {
    println("hello kotlin")
}
```
## 1.2、有参数

1. 完整表达方式：
val 函数名 : (参数1类型, 参数2类型, ...) -> 返回值类型 = { 参数1, 参数2, ... -> 函数体 }
1. 表达式返回值类型可自动推断形式
val 函数名 = { 参数1:类型1, 参数2:类型2, ... -> 函数体 }

```kotlin
val sum: (Int, Int) -> Int = { a, b -> a + b }
// 等价于
val sum = { a: Int, b: Int -> a + b }

// 等价于函数
fun sum(a: Int, b: Int): Int {
    return a + b
}
```
> 当只有1个参数的时候,返回值中的参数形参可以省略，引用时通过it进行引用

lambda的调用有2种方式，一种是通过()来进行调用，另一种是通过invoke()函数调用，可以使用下划线表示没有使用的参数
```kotlin
fun main(args: Array<String>) {
    val lambda = { println("test") }
    lambda()
    lambda.invoke()
}
```
## 1.3、匿名函数
匿名函数形式为：
val 函数名 = fun(参数1:类型1, 参数2:类型2, ...): 返回值类型 { 函数体 }

```kotlin
val sum = fun(a: Int, b: Int): Int {
    return a + b
}

// 等价于函数
fun sum(a: Int, b: Int): Int {
    return a + b
}
```
匿名函数是为后面高阶函数的使用提供准备

# 2、高阶函数
高阶函数其实函数里面继续调用其他函数
## 2.1、引用函数
用双冒号去描述函数的引用

```kotlin
fun cal(a: Int, b: Int, f: (c: Int, d: Int) -> Int): Int {
    return f(a, b)
}

fun sum(a: Int, b: Int): Int {
    return a + b
}

fun main(args: Array<String>) {
    val result = cal(2, 3, ::sum)
    println("result = $result")
    // result = 8
}
```
::sum表示sum函数的引用，cal(2, 3, ::sum)这一句就相当于执行了sum(2, 3)，所以输出结果为5。
函数引用还可以进一步简化函数的调用
```kotlin
class Test {
    fun doSomething() {
        println("test")
    }

    fun doTest(f: (Test) -> Unit) {
        f(this)
    }
}

fun main(args: Array<String>) {
    val t = Test()
    // 常规写法 传入函数
    t.doTest { test -> test.doSomething() }
    // 使用引用函数(Test::doSomething实际上是对lambda表达式{test -> test.doSomething()}的简化)
    t.doTest(Test::doSomething)
}
```
## 2.2、参数lambda化
```kotlin
fun cal(a: Int, b: Int, f: (a: Int, b: Int) -> Int): Int {
    return f(a, b)
}

fun main(args: Array<String>) {
    val result = cal(2, 3, { a: Int, b: Int -> a + b })
    println("result = $result")
    // result = 5
}
```
直接将lambda作为参数传入即可，如果最后一个参数为lambda表达式，可以将lambda表达式写在外面，而且如果没有其他参数的话，小括号也是可以省略的

```kotlin
fun cal(a: Int, b: Int, f: (a: Int, b: Int) -> Int): Int {
    return f(a, b)
}

fun main(args: Array<String>) {
    val result = cal(2, 3, { a: Int, b: Int -> a + b })
    // 两种写法等价
    val result2 = cal(2, 3) { a: Int, b: Int -> a + b }
    println("result = $result")
}
```
## 2.3、函数变量
变量可以等于一个lambda表达式，也可以等于另一个，lambda表达式变量可以等于一个普通函数，但是需要在普通函数前面加上双冒号(::)来获取函数引用

```kotlin
fun sum(a: Int, b: Int): Int {
    return a + b
}

fun main(args: Array) {
    val sumLambda = {a: Int, b: Int -> a + b}
    var numFun: (a: Int, b: Int) -> Int
    numFun = {a: Int, b: Int -> a + b}
    numFun = sumLambda
    numFun = ::sum
    numFun(1,2)
}
```
## 2.4、使用场景

高阶函数中的一个重要场景就是集合的操作，通过一些链式操作可以大大简化我们处理的流程，集合中也提供了一些很方便的操作
### fliter&map
filter用于数据的筛选，类似的还有filterIndexed，即带Index的过滤器、filterNot，即过滤所有不满足条件的数据。

map用于对数据进行变换，代表了一种一对一的变换关系，它可以对集合中的数据做一次变换，类似的还有mapIndexed()。

```kotlin
fun main(args: Array<String>) {
    val test = listOf(1, 3, 5, 7, 9)

    // filter函数遍历集合并选出应用给定lambda后会返回true的那些元素
    println("大于5的数 ${test.filter { it > 5 }}")
    // map函数对集合中的每一个元素应用给定的函数并把结果收集到一个新集合
    println("平方操作 ${test.map { it * it }}")

    val testList = listOf(Test("xys", 18), Test("qwe", 12), Test("rty", 10), Test("zxc", 2))
    // 将一个列表转换为另一个列表
    println("只展示name ${testList.map { it.name }}")
    // filter与map链式操作
    println("展示age大于10的name ${testList.filter { it.age > 10 }.map { it.name }}")
}

data class Test(val name: String, val age: Int)
```
### all & any & count & find

```kotlin
fun main(args: Array<String>) {
    val test = listOf(1, 3, 5, 7, 9)

    // all判断是否全部符合lambda表达式的条件
    println("是否全部符合>10 ${test.all { it > 10 }}")
    // any判断是否存在有符合lambda表达式的条件的数据
    println("是否存在>8 ${test.any { it > 8 }}")
    // count获取符合lambda表达式条件的数据个数
    println("大于5的个数 ${test.count { it > 5 }}")
    // find获取符合lambda表达式条件的第一个数据
    println("第一个大于5 ${test.find { it > 5 }}")
    println("最后一个大于5 ${test.findLast { it > 5 }}")
}
```
### groupBy & partition & flatMap
flatMap()代表了一个一对多的关系，可以将每个元素变换为一个新的集合，再将其平铺成一个集合。

groupBy()方法会返回一个Map<K,List>的Map对象，其中Key就是我们分组的条件，value就是分组后的集合。
```kotlin
fun main(args: Array<String>) {
    val test = listOf("a", "ab", "b", "bc")

    // groupBy按照lambda表达式的条件重组数据并分组
    println("按首字母分组 ${test.groupBy(String::first)}")
    // partition按照条件进行分组，该条件只支持Boolean类型条件，first为满足条件的，second为不满足的
    test.partition { it.length > 1 }.first.forEach { print("$it、") }
    println()
    test.partition { it.length > 1 }.second.forEach { print("$it、") }
    println()
    // flatMap首先按照lambda表达式对元素进行变换，再将变换后的列表合并成一个新列表
    println(test.flatMap { it.toList() })
}
//输出
按首字母分组 {a=[a, ab], b=[b, bc]}
ab、bc、
a、b、
[a, a, b, b, b, c]
```
### sortedBy
sortedBy()用于根据指定的规则进行顺序排序，如果要降序排序，则需要使用sortedByDescending()

```kotlin
fun main(args: Array<String>) {
    val test = listOf(3, 2, 4, 6, 7, 1)
    println(test.sortedBy { it })
}
```
### take & slice
take()和slice()用于进行数据切片，从某个集合中返回指定条件的新集合。类似的还有takeLast()、takeIf()等

```kotlin
fun main(args: Array<String>) {
    val test = listOf(3, 2, 4, 6, 7, 1)
    // 获取前3个元素的新切片
    println(test.take(3))
    // 获取指定index组成的新切片
    println(test.slice(IntRange(2, 4)))
}
```
### reduce
实现累加操作

```kotlin
fun main(args: Array<String>) {
    val test = listOf("a", "ab", "b", "bc")

    // reduce函数将一个集合的所有元素通过传入的操作函数实现数据集合的累积操作效果。
    println(test.reduce { acc, name -> "$acc$name" })
}
//输出
aabbbc

```

# 3、函数类型与实例化
函数的类型如下表示

```kotlin
(Type1, Type2, ...) -> Type
// 例如
(Int) -> Int

// 所以才有了这样的函数
fun test(a: Int, f: (Int) -> Int): Int {
    return f(a)
}
```
既然函数是一种类型，那么是可以获取实例化的实例，主要可以通过一下三种方式

- :: 双冒号操作符表示对函数的引用
- lambda表达式
- 匿名函数

```kotlin
fun main(args: Array<String>) {
    // 引用函数
    println(test(1, 2, ::add))
    // 匿名函数
    val add = fun(a: Int, b: Int): Int {
        return a + b
    }
    println(test(3, 4, add))
    // lambda表达式
    println(test(5, 6, { a, b -> a + b }))// lambda作为最后一个参数可以提到括号外
    println(test(5, 6) { a, b -> a + b })
}

fun test(a: Int, b: Int, f: (Int, Int) -> Int): Int {
    return f(a, b)
}

fun add(a: Int, b: Int): Int {
    return a + b
}
```
## 3.1、lambda表达式的类型
除了具体类型外，Kotlin封装了Function0到Funcation22,一共23个Funcation类型

```kotlin
/ 无参，返回String
() -> String

// 两个整型参数，返回字符串类型
(Int, Int) -> String 

// 传入了一个lambda表达式和一个整型，返回Int
(()->Unit, Int) -> Int
```
## 3.2、lambda表达式的return
可以使用标签指定了返回点，否则return从最近的使用fun关键字声明的函数返回。如下

```kotlin
fun main(args: Array<String>) {
    var sum: (Int) -> Unit = tag@{
        print("Test return $it")
        return@tag
    }
    sum(3)
}
```


# 4、带接受者参数的lambd表达式
lambda表达式实际上有2种形式，一种是前面介绍的基本形式，还有一种是带接受者的形式，两种方式如下

- 普通lambda表达式 
```kotlin
{ () -> R }
```

- 带接受者参数的lambda表达式
```kotlin
{ T.() -> R }
```
即声明一个T类型的接受者对象，且无入参，返回值为R类型，Kotlin的扩展函数，实际上就是使用的带接收者的lambda表达式
> 二者的区别在于this的指向区别，T.()->R里的this代表的是T的自身实例，而()->R里 this代表的是外部类的实例


# 5、typealias给lambda表达式设置别名
主要是减少重复lambda表达的重复声明

```kotlin
fun fun1(f: (Int) -> Unit) {
    f(1)
}

fun fun2(f: (Int) -> Unit) {
    f(2)
}

// 使用typealias
typealias intFun = (Int) -> Unit

fun fun3(f: intFun) {
    f(3)
}

fun fun4(f: intFun) {
    f(4)
}

fun main(args: Array<String>) {
    fun1 { println(it) }
    fun2 { println(it) }
    fun3 { println(it) }
    fun4 { println(it) }
}
```

# 6、更优雅的回调
Kotlin中的lambda表达式会使得代码更加的简洁，下面对比下两种写法

- Java 版本


```kotlin
interface ICallback {
    fun onSuccess(msg: String)

    fun onFail(msg: String)
}

class TestCallback {

    var myCallback: ICallback? = null

    fun setCallback(callback: ICallback) {
        myCallback = callback
    }

    fun init() {
        myCallback?.onSuccess("success message")
    }
}

fun main(args: Array<String>) {
    val testCallback = TestCallback()
    testCallback.setCallback(object : ICallback {
        override fun onSuccess(msg: String) {
            println("success $msg")
        }

        override fun onFail(msg: String) {
            println("fail $msg")
        }
    })
    testCallback.init()
}
```

- Kotlin lambda版本


```kotlin
class TestCallback {

    var mySuccessCallback: (String) -> Unit? = {}
    var myFailCallback: (String) -> Unit? = {}

    fun setCallback(successCallback: (String) -> Unit, failCallback: (String) -> Unit) {
        mySuccessCallback = successCallback
        myFailCallback = failCallback
    }

    fun init() {
        mySuccessCallback("success message")
        myFailCallback("fail message")
    }
}

fun main(args: Array<String>) {
    val testCallback = TestCallback()
    testCallback.setCallback({ println("success $it") }, { println("fail $it") })
    testCallback.init()
}
```
# 7、lambda表达式的其他特性

## 惰性序列操作
当一些集合函数进行链式调用的时候，每个函数的调用结果都将保存为一个新的临时列表，因此，大量的链式操作会产生大量的中间变量，从而导致性能问题，为了提高效率，可以把链式操作改为序列（sequance）,一个完整的序列包括两个操作，即中间序列和末端序列，中间序列操作始终都是惰性的，末端序列操作触发所有的惰性计算。
中间操作不会立即执行，它们只是被存储起来，仅当末端操作被调用时，才会按照顺序在每个元素上执行中间操作，然后执行末端操作。
中间操作 (比如 map、distinct、groupBy 等) 会返回另一个Sequence，而末端操作 (比如 first、toList、count 等) 则不会。
同样是map函数，在Sequence中，像map这样的中间操作是将转换函数会存储在一个新的Sequence实例中

```kotlin
                       //中间操作(惰性)       //末端操作(触发所有惰性)
testList.asSequence(). filter {..}.map {..}.toList() 
```
> 调用扩展函数asSequence把任意集合转换成序列，调用toList来做反向的转换

```kotlin
fun main(args: Array<String>) {
    val testList = listOf(Test("xys", 18), Test("qwe", 12), Test("rty", 10), Test("zxc", 2))

    // 函数的链式调用
    println("集合调用 展示age大于10的name ${
    testList.filter { it.age > 10 }
            .map { it.name }}")
    // 函数的序列操作
    println("序列操作 展示age大于10的name ${
    testList.asSequence()
            .filter { it.age > 10 }
            .map { it.name }
            .toList()}")
}

data class Test(val name: String, val age: Int)
```
> 数据量小的时候，其实Collection和Sequence的使用并无差异
数据量大的时候，由于Collection的操作会不断创建中间态，所以会消耗过多资源，这时候，就需要采用Sequence了
对集合的函数式操作太大，例如需要对集合做map、filter、find等等操作，同样是使用Sequence更高效


# 9、一些对比

## kotlin Lambda 与 Java Lambda的区别
这里说下结论，具体可以参考 [Kotlin 和 Java 中的 Lambda 表达式的区别](https://blog.csdn.net/weixin_40255793/article/details/115412763)


1. 匿名类上

Java 的 lambda 表达式不生成匿名类文件，而是采用 LambdaMetafactory.metafactory 的方式在类加载生成一个动态的匿名类实例；Kotlin 匿名内部类的实现和 Java 一致也是在编译期生成一个 class，lambda 的实现也是同样创建一个 class，但是该 class 继承 Lambda 类并实现了 Function 接口。编译时匿名内部类会转化为具体的类类型，而 lamdba 则是转化为 Function 类型

2. 引用上下文的变量

Java Lambda 表达式引用方法上下文中的变量，必须为 final 或者等效 final 的变量，否则编译报错,Kotlin 对此进行编译时优化：val 变量，同 Java 一样，作为参数直接传入匿名类对象；var 变量，自动提升为引用类型，如 Int -> Ref.IntRef

# 小结
 本文主要系统性的介绍kotlin中的lambda一些用法，函数是kotlin的一等公民，lambda则是其灵魂，特别是高阶函数、带接受者的lambda需要在实际使用中细细体会。