---
title: "线程池提交 execute 和 submit 有什么区别？"
published: 2022-08-02
description: "线程池提交 execute 和 submit 有什么区别？"
tags: ["Java","并发","多线程"]
category: "java并发"
draft: false
slug: "java-concurrent-036"
---

### 线程池提交 execute 和 submit 有什么区别？

1. execute 用于提交不需要返回值的任务

```java
threadsPool.execute(new Runnable() {
    @Override public void run() {
        // TODO Auto-generated method stub }
    });
```

1. submit()方法用于提交需要返回值的任务。线程池会返回一个 future 类型的对象，通过这个 future 对象可以判断任务是否执行成功，并且可以通过 future 的 get()方法来获取返回值

```java
Future<Object> future = executor.submit(harReturnValuetask);
try { Object s = future.get(); } catch (InterruptedException e) {
    // 处理中断异常
} catch (ExecutionException e) {
    // 处理无法执行任务异常
} finally {
    // 关闭线程池 executor.shutdown();
}
```