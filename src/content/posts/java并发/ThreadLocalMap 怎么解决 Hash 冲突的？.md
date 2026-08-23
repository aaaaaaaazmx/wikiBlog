---
title: "ThreadLocalMap 怎么解决 Hash 冲突的？"
published: 2022-03-03
description: "ThreadLocalMap 怎么解决 Hash 冲突的？"
tags: ["Java","并发","多线程"]
category: "java并发"
draft: false
slug: "java-concurrent-014"
---

### ThreadLocalMap 怎么解决 Hash 冲突的？
我们可能都知道 HashMap 使用了链表来解决冲突，也就是所谓的链地址法。
ThreadLocalMap 没有使用链表，自然也不是用链地址法来解决冲突了，它用的是另外一种方式——**开放定址法**。开放定址法是什么意思呢？简单来说，就是这个坑被人占了，那就接着去找空着的坑。
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUibHk3eNVqcUb1D6wrHC1La2ia0DpRXZg6GLP2x6QMgoQGMbKrzBAsFE3hy1aUiczM7GJKjKLFQZMKA/640?wx_fmt=png&from=appmsg)
ThreadLocalMap解决冲突
如上图所示，如果我们插入一个 value=27 的数据，通过 hash 计算后应该落入第 4 个槽位中，而槽位 4 已经有了 Entry 数据，而且 Entry 数据的 key 和当前不相等。此时就会线性向后查找，一直找到 Entry 为 null 的槽位才会停止查找，把元素放到空的槽中。
在 get 的时候，也会根据 ThreadLocal 对象的 hash 值，定位到 table 中的位置，然后判断该槽位 Entry 对象中的 key 是否和 get 的 key 一致，如果不一致，就判断下一个位置。
