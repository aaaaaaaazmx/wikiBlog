---
title: "强引用置为null，会不会被回收"
published: 2023-09-02
description: "强引用置为null，会不会被回收"
tags: ["Android","基础"]
category: "android基础"
draft: false
slug: "android-basic-053"
---

# 强引用置为null，会不会被回收

不会立即释放对象占用的内存。 

如果对象的引用被置为null，只是断开了当前线程栈帧中对该对象的引用关系，

> 而 垃圾收集器是运行在后台的线程，只有当用户线程运行到安全点(safe point)或者安全区域才会扫描对象引用关系，扫描到对象没有被引用则会标记对象，这时候仍然不会立即释放该对象内存，因为有些对象是可恢复的（在 finalize方法中恢复引用 ）。只有确定了对象无法恢复引用的时候才会清除对象内存。


在Java/Android中，将强引用置为null可能会导致对象被回收，但这取决于具体条件，下面我会全面分析各种情况：
### 1. 核心概念：对象回收条件
对象被GC回收必须同时满足两个条件：
1. 没有强引用指向该对象
2. GC执行时发现了这个无引用的对象
```
Object obj = new Object(); // 强引用
obj = null; // 取消强引用
// 此时对象可能被回收，但不一定立即回收
```
### 2. 不同情况分析
#### 2.1 简单情况（会回收）
```
void example1() {
    Object obj = new Object(); // 1. 创建对象
    obj = null;                // 2. 取消引用
    System.gc();               // 3. 建议执行GC（不保证立即执行）
    // 对象很可能在下一次GC时被回收
}
```
#### 2.2 方法内部变量（方法结束时自动回收）
```
void example2() {
    Object obj = new Object();
    // 方法结束后，局部变量obj的引用自动消失
    // 不需要显式置null，对象会被回收
}
```
#### 2.3 集合中的对象（需要从集合移除）
```
List<Object> list = new ArrayList<>();
Object obj = new Object();
list.add(obj);
obj = null; // 仅这样对象不会被回收！
list.clear(); // 必须从集合中移除才能真正取消引用
```
#### 2.4 静态变量的特殊处理
```

static Object staticObj;
void example4() {
    staticObj = new Object();
    staticObj = null; // 这样静态引用才会被清除
}
```
### 3. Android中的注意事项
#### 3.1 Activity泄漏常见场景
```
// 错误示例：匿名内部类隐式持有Activity引用
public class MainActivity extends Activity {
    private static SomeListener listener;
    void onCreate() {
        listener = new SomeListener() {
            @Override
            public void onEvent() {
                // 即使将listener=null，Activity也不会被回收
                // 因为匿名类隐式持有外部类(MainActivity)引用
            }
        };
    }
}
```
#### 3.2 正确释放资源的方式
```
// 正确做法1：使用弱引用
private static WeakReference<SomeListener> weakListener;
// 正确做法2：在生命周期结束时清理
@Override
protected void onDestroy() {
    super.onDestroy();
    if(listener != null) {
        listener.unregister();
        listener = null;
    }
}
```
### 4. 对象回收的验证方法
#### 4.1 使用finalize()验证（不推荐用于生产环境）
```
class TestObject {
    @Override
    protected void finalize() throws Throwable {
        System.out.println("对象被回收了");
        super.finalize();
    }
}
// 测试代码
TestObject obj = new TestObject();
obj = null;
System.gc(); // 可能会看到"对象被回收了"输出
```
#### 4.2 使用Android Profiler
1. 在Android Studio中启动Profiler
2. 执行怀疑泄漏的操作
3. 手动触发GC
4. 观察内存是否下降
### 5. 最佳实践建议
1. 不需要过度使用null：
  - 方法局部变量不需要显式置null
  - 成员变量在对象本身将被回收时也不需要置null
2. 必须置null的情况：
  - 静态变量
  - 集合中长期持有的对象
  - 缓存中的对象引用
3. Android特别注意事项：
  - 避免非静态内部类（包括匿名类）隐式持有Activity引用
  - 使用WeakReference处理可能引起内存泄漏的引用
  - 在Activity/Fragment生命周期结束时清理资源
4. 性能考虑：
  - 频繁置null不会提高性能
  - GC有自己的优化策略，过度置null反而可能影响代码可读性
### 总结
将强引用置为null只是取消了该引用变量与对象的关联，并不保证对象会立即被回收：
- 如果这是对象的最后一个强引用，对象有资格被回收
- 实际回收取决于GC的运行时机
- 在Android中要特别注意Context/Activity的泄漏问题
正确管理对象引用的关键是理解对象可达性规则，而不是简单地到处置null。All REFPeople SearchDocument SummaryInternal Search