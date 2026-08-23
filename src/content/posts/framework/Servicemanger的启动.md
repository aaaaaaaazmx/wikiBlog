---
title: "Servicemanger的启动"
published: 2022-12-16
description: "Servicemanger的启动"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-028"
---

# Servicemanger的启动

在Android系统启动时会先启动init进程，进而去读取init.rc（这部分可以关注开机启动部分这里不再赘述）文件，同时还会读取其他的rc文件，这里的其他rc文件包含servicemanager.rc文件，启动servicemanager进程
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWHLmREemjAnUQiaSCXEWib11Q3VpXDCQQprSL27T3Gj5oYNvJRg7I9paiacNZxichzbZXhokkicGOS7VA/640?wx_fmt=png&from=appmsg)

servicemanager进程启动后，会执行/frameworks/native/cmds/servicemanager/service_manager.c的main方法，准备工作主要是在main方法中进行的，主要完成以下核心操作

1. **binder_open**方法 初始化binder链接

 打开binder驱动、mmap(内存映射)
通过 mmap 在 servicemanager 进程分配一块虚存用以后续使用（对应 binder 驱动的 binder_mmap）

2. **become_context_manager** 主要是在driver层它注册为context manager，
```
int binder_become_context_manager(struct binder_state *bs)
{
    //通过ioctl，传递BINDER_SET_CONTEXT_MGR指令
    return ioctl(bs->fd, BINDER_SET_CONTEXT_MGR, 0);
}
```
通过 ioctl(BINDER_SET_CONTEXT_MGR_EXT) 在 binder driver 将自己注册为服务管理器 binder_context_mgr_node，handle == 0
将 ServiceManager 注册为本地进程响应 binder 消息的服务管理器
> 服务管理器的作用后面会讲到，主要是处理 handle == 0 的情况，client 查找和注册 server 时得先获取 service_manager


3. **binder_loop** 起了一个循环，不断的读取别的进程的命令

servicemanager成功注册成为Binder机制的上下文管理者后，servicemanager就是Binder机制的“总管”了，它需要在系统运行期间处理client端的请求，由于client端的请求不确定何时发送，因此需要通过无限循环来实现，实现这一需求的函数就是binder_loop。

具体来说发送BC_ENTER_LOOPER给driver层 ，然后启动一个for循环，在循环中不断重复：发送消息给driver层，和读取driver层返回的消息(BINDER_WRITE_READ类型)，调用binder_parse解析返回的消息。（这部分是binder的知识暂不赘述）

到此ServiceManager的准备工作结束，它可以等待driver层的数据了。

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWHLmREemjAnUQiaSCXEWib11P9UeQibAnySU6XsOOACAqicOHkVXicj1FnKppichHhhZPibh8fV5woavEHg/640?wx_fmt=png&from=appmsg)


**补充知识：**
这些服务是以链表的数据结构存储在servicemanger中，服务的添加和注册都是操作这个svclist链表，svclist是svcinfo的链表，注册的服务存储在svcinfo中后，最终会以链表的形式存在

1. svcinfo

ServiceManager里面维护这个一个链表，name是服务名称，handle是BpBinder的值，是服务的真正对象引用。
```
struct svcinfo
{   
    //指向下个节点
    struct svcinfo *next;
    //handle值
    uint32_t handle;
    //死亡相关d的结构体
    struct binder_death death;
    int allow_isolated;
    //bpBinder服务的名称
    size_t len;
    uint16_t name[0];
};
```

