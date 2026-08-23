---
title: "Kotlin泛型中的out和in关键字？"
published: 2020-12-06
description: "Kotlin泛型中的out和in关键字？"
tags: ["Kotlin","Android"]
category: "kotlin"
draft: false
slug: "kotlin-008"
---

#### Kotlin泛型中的out和in关键字？
提起Kotlin泛型不得不说到这两个关键字：in(逆变)和 out(协变)，字面意思上就是_in_表示这个参数/变量只能用来输入，不能读取，_out_就反过来，只能用来输出，不能读取。具体怎么体现呢，下面我们来简单说说
##### out（协变型）
如果我们的泛型类仅仅使用泛型类型作为函数的输出，那么就使用out
```
listOf(1, 2, 3).fold(0) { sum, element -> sum + element }
```
这样意味着，我传了初始值是0，那么第一次调用的初始值参数为0，同理，传了初始值是10，第一次调用的初始值参数为10；所以如果有时候需求必须指定默认值或参数，那么_fold_绝对是很好的选择。
```
listOf(1, 2, 3).reduce { sum, element -> sum + element }
```
```
interface Production<out T> {
    fun produce():T
}
```
这就是典型的生产者类接口，主要用来生产通用类型的输出，我们就记住 **（生产 = 输出 = out）**
##### in(逆变型)
如果我们的泛型类仅使用泛型类型作为函数的输入，那么就使用in
```
interface Consumer<in T> {
    fun consume(item: T)
}
```
这就是典型的消费者类接口，主要使用的都是泛型类型，我们就记住 **（消费 = 输入 = in）**
##### 什么时候使用in和out？
上面我们已经知道了in和out的基本描述，但是它们的意义是什么呢？举个经典的例子，我们定义一个炸鸡类对象
![](https://cdn.nlark.com/yuque/0/2024/webp/215777/1712563966496-fd07aaf7-f288-4382-a45d-430f91ab178e.webp)
```
open class Food
open class FastFood : Food()
class Checken: FastFood()
```
###### 炸鸡生产
可以进一步扩展它们分别进行生产食物，快餐KFC，炸鸡，如下代码所示：
```
class FoodStore : Production<Food> {
    override fun produce(): Food {
        println ("Produce 食物")
        return Food()
    }
}

class FastFoodStore : Production<FastFood> {
    override fun produce(): FastFood {
        println("Produce 快餐")
        return FastFood()
    }
}

class InOutChecken : Production<Checken> {
    override fun produce(): Checken {
        println ("Produce 炸鸡")
        return Checken()
    }
}
```
接着我们让食品生产持有者，可以将这些全部都分配给它
```
val production1 : Production<Food> = FoodStore() 
val production2 : Production<Food> = FastFoodStore() 
val production3 : Production<Food> = InOutChecken()
```
可以看到无论是炸鸡还是快餐生产，它们都属于食品生产，因此就可以得出结论
 **使用了 out 关键字，我们可以将子类型的类分配给超类型的类**
注意一下，反过来就会出错，因为食物或者快餐不仅仅只有炸鸡进行生产
###### 炸鸡消费者
根据上述的_Consumer_通用接口，我们来消费下食物，快餐和炸鸡，如下代码所示：
```
class Everybody : Consumer<Food> {
    override fun consume(item: Food) {
        println("Eat 食物")
    }
}

class ChinesePeople : Consumer<FastFood> {
    override fun consume(item: FastFood) {
        println("Eat 快餐")
    }
}

class Cantonese : Consumer<Checken> {
    override fun consume(item: Checken) {
        println("Eat 炸鸡")
    }
}
```
现在我们让消费者持有炸鸡，然后将上面的类全部分配给它
```
val consumer1 : Consumer<Checken> = Everybody() 
val consumer2 : Consumer<Checken> = ChinesePeople() 
val consumer3 : Consumer<Checken> = Cantonese()
```
在这里，炸鸡的消费者是广东人，他也是中国人的一部分，同时也属于世界上的每一个人，由此我们可以得出结论：
**使用了in关键字，我们可以将超类型的类分配给子类型的类**
如果反过来就有会出错，食物的消费者可能是中国人或广东人，但它不仅仅只有中国人或广东人，有可能是美国人，韩国人呢...
总结一下，关于什么时候使用in/out

- _SuperType 可以分配SubType，使用 in_
- _SubType 可以分配给 SuperType，使用 out_

![](https://cdn.nlark.com/yuque/0/2024/webp/215777/1712563966494-f3a1f455-0e6e-4c54-9377-0aa2865127eb.webp)