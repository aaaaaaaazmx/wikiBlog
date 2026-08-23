---
title: "如果初始化 HashMap，传一个 17 的值new HashMap__，它会怎么处理？"
published: 2024-04-03
description: "如果初始化 HashMap，传一个 17 的值new HashMap__，它会怎么处理？"
tags: ["Java","集合","数据结构"]
category: "java集合"
draft: false
slug: "java-collection-015"
---

### 如果初始化 HashMap，传一个 17 的值new HashMap<>，它会怎么处理？
简单来说，就是初始化时，传的不是 2 的倍数时，HashMap 会向上寻找离得最近的2的倍数，所以传入 17，但 HashMap 的实际容量是 32。
我们来看看详情，在 HashMap 的初始化中，有这样⼀段⽅法；

```java
public HashMap(int initialCapacity, float loadFactor) {
 ...
 this.loadFactor = loadFactor;
 this.threshold = tableSizeFor(initialCapacity);
}
```

- 阀值 threshold ，通过⽅法 tableSizeFor 进⾏计算，是根据初始化传的参数来计算的。
- 同时，这个⽅法也要要寻找⽐初始值⼤的，最⼩的那个 2 进制数值。⽐如传了 17，我应该找到的是 32。

```java
static final int tableSizeFor(int cap) {
 int n = cap - 1;
 n |= n >>> 1;
 n |= n >>> 2;
 n |= n >>> 4;
 n |= n >>> 8;
 n |= n >>> 16;
 return (n < 0) ? 1 : (n >= MAXIMUM_CAPACITY) ? MAXIMUM_CAPACITY : n + 1; }
```

- MAXIMUM_CAPACITY = 1 << 30，这个是临界范围，也就是最⼤的 Map 集合。
- 计算过程是向右移位 1、2、4、8、16，和原来的数做|运算，这主要是为了把⼆进制的各个位置都填上 1，当⼆进制的各个位置都是 1 以后，就是⼀个标准的 2 的倍数减 1 了，最后把结果加 1 再返回即可。

以 17 为例，看一下初始化计算 table 容量的过程：
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUiaU5ZLPSGibccpzhq12eP1SuYWoyuSot4ap9rXc8SqebgmzdAOqkNFM3h3ic8dCIVBxm9GjiaYghmJg/640?wx_fmt=png&from=appmsg)