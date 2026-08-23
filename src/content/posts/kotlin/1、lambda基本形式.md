---
title: "1、lambda基本形式"
published: 2025-07-20
description: "1、lambda基本形式"
tags: ["Kotlin","Android"]
category: "kotlin"
draft: false
slug: "kotlin-001"
---


lambda表达式是Kotlin`函数式编程`的一个重要概念，是函数式编程的基础，在kotlin中函数是一等公民，而lambda则是其灵魂。lambda _本质上是可以传递给函数的一小段代码_, 是一个函数类型的对象，本文主要从浅入深介绍下kotlin中的lambda以及跟java lambda的区别。
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
2. 表达式返回值类型可自动推断形式
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
匿名函数是为后面高阶函数的使用提供准备，不过这里要注意下 kotlin的匿名函数其实是个对象，（Lambda 其实也是一个函数类型的对象而已）

# 2、高阶函数
高阶函数其实就是在_函数里面继续调用其他函数，lambda可以更加优雅的简化这个过程_
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
之前也说了 lambda可以用来向函数中传递一段代码
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
直接将_lambda作为参数传入_即可，如果最后一个参数为lambda表达式，可以将lambda表达式写在外面，而且如果没有其他参数的话，小括号也是可以省略的
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
_变量可以等于一个lambda表达式，也可以等于另一个_，lambda表达式变量可以等于一个普通函数，但是需要在普通函数前面加上双冒号(::)来获取函数引用，这个再强调下，双冒号、匿名函数、lambda表达式，都是一个函数类型的对象，你能怎么使用双冒号加函数名，就能怎么使用匿名函数，以及怎么使用 Lambda 表达式。
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


# 8、kotlin Lambda 与 Java Lambda的区别
就是 Kotlin 的匿名函数和 Lambda 表达式的本质，它们都是函数类型的对象。Kotlin 的 Lambda 跟 Java 8 的 Lambda 是不一样的，Java 8 的 Lambda 只是一种便捷写法，本质上并没有功能上的突破，而 Kotlin 的 Lambda 是实实在在的对象。

1. 匿名类上
- Java 的 lambda 表达式不生成匿名类文件，而是采用 LambdaMetafactory.metafactory 的方式在类加载生成一个动态的匿名类实例；并且在非static的上下文中创建 都会持有 this引用，很多内存泄漏就是这么来的
-  kotlin的Lambda 表达式都会生成匿名类，但是在static和非static场景下有所不同，如果非 static 上下文使用了外部实例变量，会把外部类实例的 this 传进来否则不会持有外部的this，从而减少了内存泄漏

举个例子🌰：
```kotlin
class LambdaTest {
    
    companion object { 
        // 相当于 static 成员
        private fun Int.toBoolean(predicate: (Int) -> Boolean) = predicate(this)
        
        private fun testStaticLambda() {
            val x = 1;
            val y = 2;
            val b = 1.toBoolean {
                // 引用局部变量 x 和 y
                println("$x and $y") 
                it % 2 == 0
            }
            println(b)
        }
    }
    
    private var x = 1;

    private fun testNonStaticLambda() {
        //非static
        val y = 2;
        val b = 1.toBoolean {
            // 引用实例变量 x 和局部变量 y
            println("$x and $y") 
            it % 2 == 0
        }
        println(b)
    }
}
```
编译后得到字节码文件
```kotlin
// LambdaTest.class
public final class LambdaTest {
	// companion object 被编译成静态 final 变量，并生成匿名类
	public static final LambdaTest$Companion Companion = new LambdaTest$Companion(null);
	
    private int x;
    
    private final void testNonStaticLambda() {
        int y = 2;
		boolean b = LambdaTest$Companion.access$toBoolean(
			new LambdaTest$Companion(), 
			1, // lambda 表达式编译成 Fuction1 接口的匿名类，注意这里传入了 this！！！
			(Function1) new LambdaTest$testNonStaticLambda$b$1(this, y))；
		System.out.println(b);
	}
    
    /* x 的 setter 和 getter */
	public LambdaTest() { this.x = 1; }
    public static final int access$getX$p(LambdaTest $this) {/**/}
    public static final void access$setX$p(LambdaTest $this, int n) { /**/}
}

```
看下伴随对象生成的匿名类 _LambdaTest$Companion.class_，生成 static 方法。
```kotlin
// LambdaTest$Companion.class
public final class LambdaTest$Companion {	
    private final boolean toBoolean(int $this$intToBoolean, Function1<? super Integer, Boolean> predicate) {
        return predicate.invoke($this$intToBoolean); // AutoBox
    }

    private final void testStaticLambda() {
        int x = 1;
        int y = 2;
        // lambda 表达式编译为 Function1 接口的匿名类
        boolean b = toBoolean(1, (Function1) new LambdaTest$Companion$testStaticLambda$b$1(x, y));
        System.out.println(b);
    }

    public static final boolean access$toBoolean(LambdaTest$Companion $this, int $this$access_u24toBoolean, Function1 predicate) {
        return $this.toBoolean($this$access_u24toBoolean, (Function1<? super Integer, Boolean>)predicate);
    }

    private LambdaTest$Companion() {}
    public LambdaTest$Companion(DefaultConstructorMarker $constructor_marker) {
        this();
    }
}

```
静态上下文中的 Lambda 表达式生成匿名类 LambdaTest\$CompanionCompaniontestStaticLambda$b\$1.class，将捕获的局部变量保存为内部 final 属性。该匿名类实现了 Function1 接口。
```kotlin
// LambdaTest$Companion$testStaticLambda$b$1.class
static final class LambdaTest$Companion$testStaticLambda$b$1
				extends Lambda implements Function1<Integer, Boolean> {
    final int $x;
    final int $y;

    public final boolean invoke(int it) {
        String string = this.$x + " and " + this.$y;
        System.out.println((Object)string);
        return it % 2 == 0;
    }

	// 引用的局部变量作为内部 final 属性传入
    LambdaTest$Companion$testStaticLambda$b$1(int n, int n2) {
        this.$x = n;
        this.$y = n2;
        super(1);
    }
}

```
而非静态上下文的 Lambda 表达式，也是生成实现 Function1 接口的匿名类，但是把捕获的实例对象引用也保存在 final 属性中。
```kotlin
// LambdaTest$testNonStaticLambda$b$1.class
static final class LambdaTest$testNonStaticLambda$b$1
extends Lambda
implements Function1<Integer, Boolean> {
    final LambdaTest this$0; // 实例对象的引用，注意哦，某些场景会内存泄露！！！
    final int $y; // 局部变量

    public final boolean invoke(int it) {
        String string = this.this$0.x + " and " + this.$y;
        boolean bl = false;
        System.out.println((Object)string);
        return it % 2 == 0;
    }

    LambdaTest$testNonStaticLambda$b$1(LambdaTest lambdaTest, int n) {
        this.this$0 = lambdaTest;
        this.$y = n;
        super(1);
    }
}

```

2. 引用上下文的变量
- Java Lambda 表达式引用方法上下文中的变量，必须为 final 或者等效 final 的变量，否则编译报错,
- Kotlin 对此进行编译时优化：val 变量，同 Java 一样，作为参数直接传入匿名类对象；var 变量，自动提升为引用类型，如 Int -> Ref.IntRef
```kotlin
    var num = 0
    val result = myForEach(fruits) {
        println("#$num: $it")
    }
    println(num)

```
编译后可以看到
```kotlin
    Ref.IntRef intRef = new Ref.IntRef();
    intRef.element = 0; // 包装在引用对象的 element 字段中
    String result2 = myForEach(fruits, new Function1<String, Unit>((Ref.IntRef)num) {});
    System.out.println(intRef.element);
```
# 9、小结
本文主要系统性的介绍kotlin中的lambda一些用法，函数是kotlin的一等公民，lambda则是其灵魂，特别是高阶函数、带接受者的lambda需要在实际使用中细细体会。


