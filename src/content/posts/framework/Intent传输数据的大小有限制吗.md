---
title: "Intent传输数据的大小有限制吗"
published: 2020-07-23
description: "Intent传输数据的大小有限制吗"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-023"
---

# Intent传输数据的大小有限制吗
## 限制原因
Intent 中的 Bundle 是使用 Binder 机制进行数据传送的, 数据会写到内核空间, Binder 缓冲区域;
Binder 的缓冲区是有大小限制的, 有些 ROM 是 1M, 有些 ROM 是 2M;
这个限制定义在 frameworks/native/libs/binder/processState.cpp 类中, 如果数据或返回值比传递buffer大，则此次传递调用失败并抛出 TransactionTooLargeException异常
通常说的 1M-8k 如下创建
```
#define BINDER_VM_SIZE ((1*1024*1024) - (4096 *2)) ;
```

因为 Binder 本身就是为了进程间频繁-灵活的通信所设计的, 并不是为了拷贝大量数据;
## 解除限制

1. 如果非 ipc 就很简单了, static 变量, eventBus 之类的都可以;
2. 如果是 ipc, 一定要一次性传大文件, 
- 可以用匿名共享内存 file比如通过MemoryFile开辟一片共享内存，然后传递FileDescriptor，接收端用这个fd读，
- 使用Socket

