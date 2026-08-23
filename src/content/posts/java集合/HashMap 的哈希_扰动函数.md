---
title: "HashMap 的哈希_扰动函数"
published: 2021-03-05
description: "HashMap 的哈希_扰动函数"
tags: ["Java","集合","数据结构"]
category: "java集合"
draft: false
slug: "java-collection-007"
---

### HashMap 的哈希/扰动函数

- 作用

HashMap 的哈希函数是先拿到 key 的 hashcode，是一个 32 位的 int 类型的数值，然后让 hashcode 的高 16 位和低 16 位进行异或操作。

```java
static final int hash(Object key) {
        int h;
        // key的hashCode和key的hashCode右移16位做异或运算
        return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
    }
```
这么设计是为了降低哈希碰撞的概率。

- 为什么哈希/扰动函数能降 hash 碰撞？

因为 key.hashCode() 函数调用的是 key 键值类型自带的哈希函数，返回 int 型散列值。int 值范围为 **-2147483648~2147483647**，加起来大概 40 亿的映射空间。
只要哈希函数映射得比较均匀松散，一般应用是很难出现碰撞的。但问题是一个 40 亿长度的数组，内存是放不下的。
假如 HashMap 数组的初始大小才 16，就需要用之前需要对数组的长度取模运算，得到的余数才能用来访问数组下标。
源码中模运算就是把散列值和数组长度 - 1 做一个 "与&" 操作，位运算比取余 % 运算要快。

```java
bucketIndex = indexFor(hash, table.length);

static int indexFor(int h, int length) {
     return h & (length-1);
}
```
顺便说一下，这也正好解释了为什么 HashMap 的数组长度要取 2 的整数幂。因为这样（数组长度 - 1）正好相当于一个 “低位掩码”。与 操作的结果就是散列值的高位全部归零，只保留低位值，用来做数组下标访问。以初始长度 16 为例，16-1=15。2 进制表示是 0000 0000 0000 0000 0000 0000 0000 1111。和某个散列值做 与 操作如下，结果就是截取了最低的四位值。
![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUiaU5ZLPSGibccpzhq12eP1SDUYdhvic3oKLM49ia7zYzgMbpqS3cutY3PKhZnrsP9PLDNAuOemHjmsw/640?wx_fmt=png&from=appmsg)
哈希&运算
这样是要快捷一些，但是新的问题来了，就算散列值分布再松散，要是只取最后几位的话，碰撞也会很严重。如果散列本身做得不好，分布上成等差数列的漏洞，如果正好让最后几个低位呈现规律性重复，那就更难搞了。
这时候 扰动函数 的价值就体现出来了，看一下扰动函数的示意图：
![](https://mmbiz.qpic.cn/mmbiz_jpg/LrDMVD5bqLUiaU5ZLPSGibccpzhq12eP1SBdiatwb2hxSP9PsbV4yfDmia9UjAhktiajWIEExxsLPenZE6bbkCFjxJw/640?wx_fmt=webp&from=appmsg)
扰动函数示意图
右移 16 位，正好是 32bit 的一半，自己的高半区和低半区做异或，就是为了混合原始哈希码的高位和低位，以此来加大低位的随机性。而且混合后的低位掺杂了高位的部分特征，这样高位的信息也被变相保留下来。