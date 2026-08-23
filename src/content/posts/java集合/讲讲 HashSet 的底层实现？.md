---
title: "讲讲 HashSet 的底层实现？"
published: 2021-05-30
description: "讲讲 HashSet 的底层实现？"
tags: ["Java","集合","数据结构"]
category: "java集合"
draft: false
slug: "java-collection-023"
---

### 讲讲 HashSet 的底层实现？
HashSet 其实是由 HashMap 实现的，只不过值由一个固定的 Object 对象填充，而键用于操作。

```java
public class HashSet<E>
    extends AbstractSet<E>
    implements Set<E>, Cloneable, java.io.Serializable
{
    static final long serialVersionUID = -5024744406713321676L;
    private transient HashMap<E,Object> map;
    // Dummy value to associate with an Object in the backing Map
    private static final Object PRESENT = new Object();
    // ……
}
```
实际开发中，HashSet 并不常用，比如，如果我们需要按照顺序存储一组元素，那么 ArrayList 和 LinkedList 可能更适合；如果我们需要存储键值对并根据键进行查找，那么 HashMap 可能更适合。
HashSet 主要用于去重，比如，我们需要统计一篇文章中有多少个不重复的单词，就可以使用 HashSet 来实现。

```java
// 创建一个 HashSet 对象
HashSet<String> set = new HashSet<>();

// 添加元素
set.add("沉默");
set.add("王二");
set.add("陈清扬");
set.add("沉默");

// 输出 HashSet 的元素个数
System.out.println("HashSet size: " + set.size()); // output: 3

// 遍历 HashSet
for (String s : set) {
    System.out.println(s);
}
```
HashSet 会自动去重，因为它是用 HashMap 实现的，HashMap 的键是唯一的（哈希值），相同键的值会覆盖掉原来的值，于是第二次 set.add("沉默") 的时候就覆盖了第一次的 set.add("沉默")。
![](https://cdn.nlark.com/yuque/0/2024/png/215777/1712901906950-3dbc2e19-bb9c-40fd-9b0e-af0458c5fd34.png)
HashSet套娃
#### HashSet 和 ArrayList 的区别

- ArrayList 是基于动态数组实现的，HashSet 是基于 HashMap 实现的。
- ArrayList 允许重复元素和 null 值，可以有多个相同的元素；HashSet 保证每个元素唯一，不允许重复元素，基于元素的 hashCode 和 equals 方法来确定元素的唯一性。
- ArrayList 保持元素的插入顺序，可以通过索引访问元素；HashSet 不保证元素的顺序，元素的存储顺序依赖于哈希算法，并且可能随着元素的添加或删除而改变。