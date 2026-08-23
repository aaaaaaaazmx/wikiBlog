---
title: "HashMap相关"
published: 2020-04-06
description: "HashMap相关"
tags: ["Java","基础"]
category: "java基础"
draft: false
slug: "java-basic-015"
---

# HashMap相关

## HashSet与TreeSet的区别和适用场景

1. TreeSet 是**二叉树**（红黑树的树据结构）实现的，Treest中的数据是自动排好序的，不允许放入null值。

2. HashSet 是**哈希表**实现的，HashSet中的数据是无序的可以放入null，但只能放入一个null，两者中的值都不重复，就如数据库中唯一约束。

3. HashSet要求放入的对象必须实现HashCode()方法，放的对象，是以hashcode码作为标识的，而具有相同内容的String对象，hashcode是一样，所以放入的内容不能重复但是同一个类的对象可以放入不同的实例。

> 适用场景分析:

HashSet是基于Hash算法实现的，其性能通常都优于TreeSet。为快速查找而设计的Set，我们通常都应该使用HashSet，在我们需要排序的功能时，我们才使用TreeSet。

## HashMap与TreeMap、HashTable的区别及适用场景

- HashMap 非线程安全  

HashMap：基于哈希表(散列表)实现。使用HashMap要求的键类明确定义了hashCode()和equals()[可以重写hasCode()和equals()]，为了优化HashMap空间的使用，您可以调优初始容量和负载因子。其中散列表的冲突处理主分两种，**一种是开放定址法**，另一种是**链表法**。HashMap实现中采用的是链表法。

TreeMap：非线程安全基于红黑树实现。TreeMap没有调优选项，因为该树总处于平衡状态。

>适用场景分析：

HashMap和HashTable:HashMap去掉了HashTable的contain方法，但是加上了containsValue()和containsKey()方法。HashTable是同步的，而HashMap是非同步的，效率上比HashTable要高。HashMap允许空键值，而HashTable不允许。
    
HashMap：适用于Map中插入、删除和定位元素。

Treemap：适用于按自然顺序或自定义顺序遍历键(key)。
(ps:其实我们工作的过程中对集合的使用是很频繁的,稍注意并总结积累一下,在面试的时候应该会回答的很轻松)


## HashMap 、HashTable、HashSet

- HashMap（允许 key/value 为 null）

- 基于数组和单向链表实现，数组是 HashMap 的主体；链表是为解决哈希冲突而存在的，存放的是key和value结合的实体
- 数组索引通过 key.hashCode（还会二次 hash） 得到，在链表上通过 key.equals 索引
- 哈希冲突落在同一个桶中时，直接放在链表头部（java1.8后放到尾部）
- JAVA 8 中链表数量大于 8 时会转为红黑树存储，查找时间由 O(n) 变为 O(logn)
- 数组长度总是2的n次方：这样就能通过位运算实现取余，从而让 index 能落在数组长度范围内
- 加载因子（默认0.75）表示添加到多少填充比时进行扩容，填充比大：链表较长，查找慢；填充比小：链表短，查找快
- 扩容时直接创建原数组两倍的长度，然后将原有对象再进行hash找到新的index，重新放

- HashTable（不允许 key/value 为 null)

- 数据结构和 HashMap 一样
- 线程安全

- HashSet

- 基于 HashMap 实现，元素就是 HashMap 的 key，Value 传入了一个固定值

## set集合从原理上如何保证不重复？

1）在往set中添加元素时，如果指定元素不存在，则添加成功。

2）具体来讲：当向HashSet中添加元素的时候，首先计算元素的hashcode值，然后用这个（元素的hashcode）%（HashMap集合的大小）+1计算出这个元素的存储位置，如果这个位置为空，就将元素添加进去；如果不为空，则用equals方法比较元素是否相等，相等就不添加，否则找一个空位添加。


## HashMap和HashTable的主要区别是什么？，两者底层实现的数据结构是什么？

HashMap和HashTable的区别：

二者都实现了Map 接口，是将唯一的键映射到特定的值上，主要区别在于：

1)HashMap 没有排序，允许一个null 键和多个null 值,而Hashtable 不允许；

2)HashMap 把Hashtable 的contains 方法去掉了，改成containsvalue 和containsKey, 因为contains 方法容易让人引起误解；

3)Hashtable 继承自Dictionary 类，HashMap 是Java1.2 引进的Map 接口的实现；

4)Hashtable 的**方法是Synchronized 的，而HashMap 不是**，在多个线程访问Hashtable 时，不需要自己为它的方法实现同步，而HashMap 就必须为之提供额外的同步。Hashtable 和HashMap 采用的hash/rehash 算法大致一样，所以性能不会有很大的差异。

HashMap和HashTable的底层实现数据结构：

HashMap和Hashtable的底层实现都是数组 + 链表结构实现的（jdk8以前）


## HashMap、ConcurrentHashMap、hash()相关原理解析？

### HashMap 1.7的原理：

HashMap 底层是基于 数组 + 链表 组成的，不过在 jdk1.7 和 1.8 中具体实现稍有不同。

负载因子：

- 给定的默认容量为 16，负载因子为 0.75。Map 在使用过程中不断的往里面存放数据，当数量达到了 16 * 0.75 = 12 就需要将当前 16 的容量进行扩容，而扩容这个过程涉及到 rehash、复制数据等操作，所以非常消耗性能。
- 因此通常建议能提前预估 HashMap 的大小最好，尽量的减少扩容带来的性能损耗。

其实真正存放数据的是 Entry<K,V>[] table，Entry 是 HashMap 中的一个静态内部类，它有key、value、next、hash（key的hashcode）成员变量。

put 方法：

- 判断当前数组是否需要初始化。
- 如果 key 为空，则 put 一个空值进去。
- 根据 key 计算出 hashcode。
- 根据计算出的 hashcode 定位出所在桶。
- 如果桶是一个链表则需要遍历判断里面的 hashcode、key 是否和传入 key 相等，如果相等则进行覆盖，并返回原来的值。
- 如果桶是空的，说明当前位置没有数据存入，新增一个 Entry 对象写入当前位置。（当调用 addEntry 写入 Entry 时需要判断是否需要扩容。如果需要就进行两倍扩充，并将当前的 key 重新 hash 并定位。而在 createEntry 中会将当前位置的桶传入到新建的桶中，如果当前桶有值就会在位置形成链表。）

get 方法：

- 首先也是根据 key 计算出 hashcode，然后定位到具体的桶中。
- 判断该位置是否为链表。
- 不是链表就根据 key、key 的 hashcode 是否相等来返回值。
- 为链表则需要遍历直到 key 及 hashcode 相等时候就返回值。
- 啥都没取到就直接返回 null 。

### HashMap 1.8的原理：

当 Hash 冲突严重时，在桶上形成的链表会变的越来越长，这样在查询时的效率就会越来越低；时间复杂度为 O(N)，因此 1.8 中重点优化了这个查询效率。

TREEIFY_THRESHOLD 用于判断是否需要将链表转换为红黑树的阈值。

HashEntry 修改为 Node。

put 方法：

- 判断当前桶是否为空，空的就需要初始化（在resize方法 中会判断是否进行初始化）。
- 根据当前 key 的 hashcode 定位到具体的桶中并判断是否为空，为空表明没有 Hash 冲突就直接在当前位置创建一个新桶即可。
- 如果当前桶有值（ Hash 冲突），那么就要比较当前桶中的 key、key 的 hashcode 与写入的 key 是否相等，相等就赋值给 e,在第 8 步的时候会统一进行赋值及返回。
- 如果当前桶为红黑树，那就要按照红黑树的方式写入数据。
- 如果是个链表，就需要将当前的 key、value 封装成一个新节点写入到当前桶的后面（形成链表）。
- 接着判断当前链表的大小是否大于预设的阈值，大于时就要转换为红黑树。
- 如果在遍历过程中找到 key 相同时直接退出遍历。
- 如果 e != null 就相当于存在相同的 key,那就需要将值覆盖。
- 最后判断是否需要进行扩容。

get 方法：

- 首先将 key hash 之后取得所定位的桶。
- 如果桶为空则直接返回 null 。
- 否则判断桶的第一个位置(有可能是链表、红黑树)的 key 是否为查询的 key，是就直接返回 value。
- 如果第一个不匹配，则判断它的下一个是红黑树还是链表。
- 红黑树就按照树的查找方式返回值。
- 不然就按照链表的方式遍历匹配返回值。

修改为红黑树之后查询效率直接提高到了 O(logn)。但是 HashMap 原有的问题也都存在，比如在并发场景下使用时容易出现死循环：

- 在 HashMap 扩容的时候会调用 resize() 方法，就是这里的并发操作容易在一个桶上形成环形链表；这样当获取一个不存在的 key 时，计算出的 index 正好是环形链表的下标就会出现死循环：在 1.7 中 hash 冲突采用的头插法形成的链表，在并发条件下会形成循环链表，一旦有查询落到了这个链表上，当获取不到值时就会死循环。

### ConcurrentHashMap 1.7原理：

ConcurrentHashMap 采用了分段锁技术，其中 Segment 继承于 ReentrantLock。不会像 HashTable 那样不管是 put 还是 get 操作都需要做同步处理，理论上 ConcurrentHashMap 支持 CurrencyLevel (Segment 数组数量)的线程并发。每当一个线程占用锁访问一个 Segment 时，不会影响到其他的 Segment。

put 方法:

首先是通过 key 定位到 Segment，之后在对应的 Segment 中进行具体的 put。

- 虽然 HashEntry 中的 value 是用 volatile 关键词修饰的，但是并不能保证并发的原子性，所以 put 操作时仍然需要加锁处理。
- 首先第一步的时候会尝试获取锁，如果获取失败肯定就有其他线程存在竞争，则利用 scanAndLockForPut() 自旋获取锁:


    尝试自旋获取锁。
    如果重试的次数达到了 MAX_SCAN_RETRIES 则改为阻塞锁获取，保证能获取成功。
    
- 将当前 Segment 中的 table 通过 key 的 hashcode 定位到 HashEntry。
- 遍历该 HashEntry，如果不为空则判断传入的 key 和当前遍历的 key 是否相等，相等则覆盖旧的 value。
- 为空则需要新建一个 HashEntry 并加入到 Segment 中，同时会先判断是否需要扩容。
- 最后会使用unlock()解除当前 Segment 的锁。

get 方法：

- 只需要将 Key 通过 Hash 之后定位到具体的 Segment ，再通过一次 Hash 定位到具体的元素上。
- 由于 HashEntry 中的 value 属性是用 volatile 关键词修饰的，保证了内存可见性，所以每次获取时都是最新值。
- ConcurrentHashMap 的 get 方法是非常高效的，因为整个过程都不需要加锁。

### ConcurrentHashMap 1.8原理：

1.7 已经解决了并发问题，并且能支持 N 个 Segment 这么多次数的并发，但依然存在 HashMap 在 1.7 版本中的问题：那就是查询遍历链表效率太低。和 1.8 HashMap 结构类似：其中抛弃了原有的 Segment 分段锁，而采用了 CAS + synchronized 来保证并发安全性。

CAS：

如果obj内的value和expect相等，就证明没有其他线程改变过这个变量，那么就更新它为update，如果这一步的CAS没有成功，那就采用自旋的方式继续进行CAS操作。

问题：

- 目前在JDK的atomic包里提供了一个类AtomicStampedReference来解决ABA问题。这个类的compareAndSet方法作用是首先检查当前引用是否等于预期引用，并且当前标志是否等于预期标志，如果全部相等，则以原子方式将该引用和该标志的值设置为给定的更新值。
- 如果CAS不成功，则会原地自旋，如果长时间自旋会给CPU带来非常大的执行开销。

put 方法：

- 根据 key 计算出 hashcode 。
- 判断是否需要进行初始化。
- 如果当前 key 定位出的 Node为空表示当前位置可以写入数据，利用 CAS 尝试写入，失败则自旋保证成功。
- 如果当前位置的 hashcode == MOVED == -1,则需要进行扩容。
- 如果都不满足，则利用 synchronized 锁写入数据。
- 最后，如果数量大于 TREEIFY_THRESHOLD 则要转换为红黑树。

get 方法：

- 根据计算出来的 hashcode 寻址，如果就在桶上那么直接返回值。
- 如果是红黑树那就按照树的方式获取值。
- 就不满足那就按照链表的方式遍历获取值。

1.8 在 1.7 的数据结构上做了大的改动，采用红黑树之后可以保证查询效率（O(logn)），甚至取消了 ReentrantLock 改为了 synchronized，这样可以看出在新版的 JDK 中对 synchronized 优化是很到位的。

[HashMap、ConcurrentHashMap 1.7/1.8实现原理](https://crossoverjie.top/2018/07/23/java-senior/ConcurrentHashMap/)

[hash()算法全解析](https://www.hollischuang.com/archives/2091)

### HashMap何时扩容：

当向容器添加元素的时候，会判断当前容器的元素个数，如果大于等于阈值---即大于当前数组的长度乘以加载因子的值的时候，就要自动扩容。

### 扩容的算法是什么：

扩容(resize)就是重新计算容量，向HashMap对象里不停的添加元素，而HashMap对象内部的数组无法装载更多的元素时，对象就需要扩大数组的长度，以便能装入更多的元素。当然Java里的数组是无法自动扩容的，方法是使用一个新的数组代替已有的容量小的数组。

### Hashmap如何解决散列碰撞（必问）？

Java中HashMap是利用**拉链法**处理HashCode的碰撞问题。在调用HashMap的put方法或get方法时，都会首先调用hashcode方法，去查找相关的key，当有冲突时，再调用equals方法。hashMap基于hasing原理，我们通过put和get方法存取对象。当我们将键值对传递给put方法时，他调用键对象的hashCode()方法来计算hashCode，然后找到bucket（哈希桶）位置来存储对象。当获取对象时，通过键对象的equals()方法找到正确的键值对，然后返回值对象。HashMap使用链表来解决碰撞问题，当碰撞发生了，对象将会存储在链表的下一个节点中。hashMap在每个链表节点存储键值对对象。当两个不同的键却有相同的hashCode时，他们会存储在同一个bucket位置的链表中。键对象的equals()来找到键值对。

### Hashmap底层为什么是线程不安全的？

- 并发场景下使用时容易出现死循环，在 HashMap 扩容的时候会调用 resize() 方法，就是这里的并发操作容易在一个桶上形成环形链表；这样当获取一个不存在的 key 时，计算出的 index 正好是环形链表的下标就会出现死循环；
- 在 1.7 中 hash 冲突采用的头插法形成的链表，在并发条件下会形成循环链表，一旦有查询落到了这个链表上，当获取不到值时就会死循环。


### 5、ArrayMap跟SparseArray在HashMap上面的改进？

HashMap要存储完这些数据将要不断的扩容，而且在此过程中也需要不断的做hash运算，这将对我们的内存空间造成很大消耗和浪费。

### ArrayMap:

- 基于两个数组实现，一个存放 hash；一个存放键值对
- 存放 hash 的数组是有序的，查找时使用二分法查找
- 发生哈希冲突时键值对数组里连续存放，查找时也是通过 key.equals索引，找不到时先向后再向前遍历相同hash值的键值对数组
- 扩容时不像 HashMap 直接 double，内存利用率高；也不需要重建哈希表，只需要调用 system.arraycopy 数组拷贝，性能较高
- 不适合存大量数据（1000以下），因为数据量大的时候二分查找相比红黑树会慢很多

ArrayMap利用两个数组，mHashes用来保存每一个key的hash值，mArrray大小为mHashes的2倍，依次保存key和value。

    mHashes[index] = hash;
    mArray[index<<1] = key;
    mArray[(index<<1)+1] = value;
    
当插入时，根据key的hashcode()方法得到hash值，计算出在mArrays的index位置，然后利用二分查找找到对应的位置进行插入，当出现哈希冲突时，会在index的相邻位置插入。

### SparseArray:

基于 ArrayMap，key 只能是特定类型。

SparseArray比HashMap更省内存，在某些条件下性能更好，主要是因为它避免了对key的自动装箱（int转为Integer类型），它内部则是通过两个数组来进行数据存储的，一个存储key，另外一个存储value，为了优化性能，它内部对数据还采取了压缩的方式来表示稀疏数组的数据，从而节约内存空间，我们从源码中可以看到key和value分别是用数组表示：

    private int[] mKeys;
    private Object[] mValues;
    
    
同时，SparseArray在存储和读取数据时候，使用的是二分查找法。也就是在put添加数据的时候，会使用二分查找法和之前的key比较当前我们添加的元素的key的大小，然后按照从小到大的顺序排列好，所以，SparseArray存储的元素都是按元素的key值从小到大排列好的。 
而在获取数据的时候，也是使用二分查找法判断元素的位置，所以，在获取数据的时候非常快，比HashMap快的多。

### 假设数据量都在千级以内的情况下：

1、如果key的类型已经确定为int类型，那么使用SparseArray，因为它避免了自动装箱的过程，如果key为long类型，它还提供了一个LongSparseArray来确保key为long类型时的使用

2、如果key类型为其它的类型，则使用ArrayMap。