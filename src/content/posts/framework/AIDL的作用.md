---
title: "AIDL的作用"
published: 2022-08-16
description: "AIDL的作用"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-003"
---

## AIDL的作用
内核层的Binder驱动已经提供了IPC功能，
不过还需要在framework native层提供一些**对于驱动层的调用封装，使framework开发者更易于使用，由此封装出了Native Binder**；
同时，由于framework native层是c/c++语言实现，**对于应用开发者，需要更加方便的Java层的封装，衍生出Java Binder**；
最后在此之上，**为了减少重复代码的编写和规范接口，在Java Binder的基础上又封装出了AIDL**。

[AIDL](https://link.juejin.cn?target=https%3A%2F%2Fdeveloper.android.com%2Fguide%2Fcomponents%2Faidl%3Fhl%3Dzh-cn)（Android Interface Definition Language）是一种支持跨进程通信 (IPC) 的接口定义语言。在 Android 系统中，各个进程通常使用 Binder 通信。Android 提供的 AIDL 也是基于 Binder 的。通过 AIDL，我们可以利用其他进程的 Service，调用其他进程的函数。

AIDL 的作用，其实就是为开发者生成两个类：Stub 和 Proxy。这两个类都是一些模板代码，主要目的除了减轻开发者的工作量以外，也是为了隐藏跨进程通信 (IPC) 的各种细节在这两个类中，使得开发者只需要关注实现具体的服务逻辑，而无需关心底层通信的细节。
**Stub 通常用于服务端，Proxy 通常用于客户端。**

经过层层封装，在使用者使用AIDL时对于Binder基本上是无感知的。
这里贴一张架构图。
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWHLmREemjAnUQiaSCXEWib118HNFu8q72Lm02pBcj1bwk7lalM1T8GEu23ERludZPPBBPmxD52iajwA/640?wx_fmt=png&from=appmsg)

## Stub 和 Proxy

**Stub 通常用于服务端，Proxy 通常用于客户端。**

我们以一个具体的case来看下

1. **无论是客户端，还是服务端**，都要定义 AIDL 接口：创建一个后缀为 .aidl 的文件，并在其中定义一个接口。接口中可以声明需要跨进程调用的函数。例如，创建一个名为 IExampleService.aidl 的文件，其内容如下：
2. 编译生成代码：编译项目时，AIDL 编译器会自动为定义的 AIDL 接口生成对应的 Java 文件：[IExampleService.java](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fqiao-coder%2FAIDL%2Fblob%2Fmaster%2Fapp%2Fsrc%2Fmain%2Fjava%2Fcom%2Fexample%2FIExampleService.java)。生成的文件里包括了 IExampleService 接口、Stub 类和 Proxy 类。
3. 在服务端里提供一个 Service，由 Service 提供 Binder 实体：Stub 类继承自 Binder，这意味它本身就是个 Binder 实体，但是它是个抽象类，不提供 getMessage() 的实现。所以，需要我们继承 Stub，然后实现 getMessage()。最后，再创建一个 ExampleService（继承自 Service 类），然后在它的 onBind 里，返回我们的 Binder 实体。
4. 客户端通过 AIDL ，调用服务端里的 getMessage()：先在客户端进程中，bindService() 绑定服务端的 ExampleService 服务。例如：
```
package com.example;

interface IExampleService {
      String getMessage();
}
```
```
package com.example;

public class ExampleService extends Service {
    private final IExampleService.Stub mBinder = new IExampleService.Stub() {
        @Override
        public String getMessage() {
            return "Hello from ExampleService!";
        }
    };

    @Override
    public IBinder onBind(Intent intent) {
        return mBinder;
    }
}
```
当然，不要忘了在服务端的 AndroidManifest.xml 中注册服务：
```
<service android:name=".ExampleService"
    android:exported="true"
    android:enabled="true">
    <intent-filter>
        <action android:name="com.example.IExampleService"/>
    </intent-filter>
</service>
```
```
private IExampleService mExampleService;
private ServiceConnection mConnection = new ServiceConnection() {
    @Override
    public void onServiceConnected(ComponentName className, IBinder service) {
        mExampleService = IExampleService.Stub.asInterface(service);
    }

    @Override
    public void onServiceDisconnected(ComponentName className) {
        mExampleService = null;
    }
};

void bindService() {
    Intent intent = new Intent("com.example.IExampleService");
    intent.setPackage("com.example");
    bindService(intent, mConnection, Context.BIND_AUTO_CREATE);
}

void unbindService() {
    if (mExampleService != null) {
        unbindService(mConnection);
        mExampleService = null;
    }
}
```
这样，在客户端进程可以通过 AIDL 生成的 Proxy 的 getMessage()，调用服务端的 getMessage()：
```
try {
    String message = mExampleService.getMessage();
} catch (RemoteException e) {
    e.printStackTrace();
}
```

在 AIDL 自动生成的 [IExampleService.java](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fqiao-coder%2FAIDL%2Fblob%2Fmaster%2Fapp%2Fsrc%2Fmain%2Fjava%2Fcom%2Fexample%2FIExampleService.java)里，最关键的是 Stub 和 Proxy。它们之间的关系如下图：
![](https://mmbiz.qpic.cn/mmbiz_jpg/LrDMVD5bqLWHLmREemjAnUQiaSCXEWib11LDhUVJaqMLLNcyRsRiaGbKnibV2icY7TWXdLlWgkjfFTibefpfRT5YTxqQ/640?wx_fmt=webp&from=appmsg)
Proxy 通常用于客户端，最关键的是它的 getMessage() ：
```
public String getMessage() throws android.os.RemoteException {
    // _data 是写缓冲区
    android.os.Parcel _data = android.os.Parcel.obtain();
    // _reply 是读缓冲区
    android.os.Parcel _reply = android.os.Parcel.obtain();
    String _result;
    try {
        _data.writeInterfaceToken(DESCRIPTOR);
        // TRANSACTION_getMessage 是函数索引
        // mRemote 是 BinderProxy 的实例
        boolean _status = mRemote.transact(Stub.TRANSACTION_getMessage, _data, _reply, 0);
        if (!_status && getDefaultImpl() != null) {
            return getDefaultImpl().getMessage();
        }
        _reply.readException();
        // 从读缓冲区读取远程调用的结果
        _result = _reply.readString();
    } finally {
        _reply.recycle();
        _data.recycle();
    }
    return _result;
}
```
Stub 通常用于服务端。Stub 继承自 Binder，代表它就是一个 Binder 实体。它是一个抽象类，不会实现 getMessage()，交给子类去实现。我们需要留意一下它的 onTransact()：
```
public boolean onTransact(int code, android.os.Parcel data, android.os.Parcel reply, int flags)
throws android.os.RemoteException {
    String descriptor = DESCRIPTOR;
    switch (code) {
        case INTERFACE_TRANSACTION: {
            reply.writeString(descriptor);
            return true;
        }
        // 目标函数的索引
        case TRANSACTION_getMessage: {
            data.enforceInterface(descriptor);
            // 调用 getMessage()
            String _result = this.getMessage();
            reply.writeNoException();
            // 返回结果给客户端
            reply.writeString(_result);
            return true;
        }
        default: {
            return super.onTransact(code, data, reply, flags);
        }
    }
}
```
在一次 getMessage() 的跨进程调用里，它们的作用如下：
![](https://mmbiz.qpic.cn/mmbiz_jpg/LrDMVD5bqLWHLmREemjAnUQiaSCXEWib11tejXFYicgudgKuIKKYHDjJySfwmTUS3Gwm8eTOEZrmiaASU9f3t4ylHw/640?wx_fmt=webp&from=appmsg)

## transact()
transact() 会向 Binder 驱动发起事务，大致的调用链路是：
BinderProxy.java
└─[transact()](https://link.juejin.cn?target=https%3A%2F%2Fcs.android.com%2Fandroid%2Fplatform%2Fsuperproject%2F%2B%2Fandroid-13.0.0_r1%3Aframeworks%2Fbase%2Fcore%2Fjava%2Fandroid%2Fos%2FBinderProxy.java%3Bbpv%3D1%3Bbpt%3D0%3Bl%3D526)
└──[transactNative()](https://link.juejin.cn?target=https%3A%2F%2Fcs.android.com%2Fandroid%2Fplatform%2Fsuperproject%2F%2B%2Fandroid-13.0.0_r1%3Aframeworks%2Fbase%2Fcore%2Fjava%2Fandroid%2Fos%2FBinderProxy.java%3Bbpv%3D1%3Bbpt%3D0%3Bl%3D614)
└───android_util_Binder.cpp.cpp
└────[android_os_BinderProxy_transact()](https://link.juejin.cn?target=https%3A%2F%2Fcs.android.com%2Fandroid%2Fplatform%2Fsuperproject%2F%2B%2Fandroid-13.0.0_r1%3Aframeworks%2Fbase%2Fcore%2Fjni%2Fandroid_util_Binder.cpp%3Bbpv%3D1%3Bbpt%3D0%3Bl%3D1387)
└─────BpBinder.cpp
└──────[transact()](https://link.juejin.cn?target=https%3A%2F%2Fcs.android.com%2Fandroid%2Fplatform%2Fsuperproject%2F%2B%2Fandroid-13.0.0_r1%3Aframeworks%2Fnative%2Flibs%2Fbinder%2FBpBinder.cpp%3Bl%3D275%3Bbpv%3D1%3Bbpt%3D0)
└───────IPCThreadState.cpp
└────────[self()](https://link.juejin.cn?target=https%3A%2F%2Fcs.android.com%2Fandroid%2Fplatform%2Fsuperproject%2F%2B%2Fandroid-13.0.0_r1%3Aframeworks%2Fnative%2Flibs%2Fbinder%2FIPCThreadState.cpp%3Bbpv%3D1%3Bbpt%3D0%3Bl%3D287)
└─────────[transact()](https://link.juejin.cn?target=https%3A%2F%2Fcs.android.com%2Fandroid%2Fplatform%2Fsuperproject%2F%2B%2Fandroid-13.0.0_r1%3Aframeworks%2Fnative%2Flibs%2Fbinder%2FIPCThreadState.cpp%3Bbpv%3D1%3Bbpt%3D0%3Bl%3D706)
└──────────[writeTransactionData()](https://link.juejin.cn?target=https%3A%2F%2Fcs.android.com%2Fandroid%2Fplatform%2Fsuperproject%2F%2B%2Fandroid-13.0.0_r1%3Aframeworks%2Fnative%2Flibs%2Fbinder%2FIPCThreadState.cpp%3Bbpv%3D1%3Bbpt%3D0%3Bl%3D1104)
└──────────[waitForResponse()](https://link.juejin.cn?target=https%3A%2F%2Fcs.android.com%2Fandroid%2Fplatform%2Fsuperproject%2F%2B%2Fandroid-13.0.0_r1%3Aframeworks%2Fnative%2Flibs%2Fbinder%2FIPCThreadState.cpp%3Bbpv%3D0%3Bbpt%3D0%3Bl%3D897)
└───────────[talkWithDriver()](https://link.juejin.cn?target=https%3A%2F%2Fcs.android.com%2Fandroid%2Fplatform%2Fsuperproject%2F%2B%2Fandroid-13.0.0_r1%3Aframeworks%2Fnative%2Flibs%2Fbinder%2FIPCThreadState.cpp%3Bbpv%3D0%3Bbpt%3D0%3Bl%3D997)
└────────────ioctl.cpp
└─────────────[ioctl()](https://link.juejin.cn?target=https%3A%2F%2Fcs.android.com%2Fandroid%2Fplatform%2Fsuperproject%2F%2B%2Fandroid-13.0.0_r1%3Abionic%2Flibc%2Fbionic%2Fioctl.cpp%3Bl%3D34%3Bbpv%3D1%3Bbpt%3D0)
注意：从 transact() 到 ioctl() ，这个过程都是同步调用。即当我们通过 AIDL 调用远程服务时，客户端会等待服务端完成处理并返回结果。整个过程中，客户端线程会阻塞，直到收到来自服务端的回应。所以，我们千万别在主线程发起调用。
## onTransact()
服务端的 Binder 线程池的线程接收到 BR_TRANSACTION 消息后，会一路调用到 onTransact()：
IPCThreadState.cpp
└─[executeCommand()](https://link.juejin.cn?target=https%3A%2F%2Fcs.android.com%2Fandroid%2Fplatform%2Fsuperproject%2F%2B%2Fandroid-13.0.0_r1%3Aframeworks%2Fnative%2Flibs%2Fbinder%2FIPCThreadState.cpp%3Bbpv%3D1%3Bbpt%3D0%3Bl%3D1147) // 读取服务端的读缓冲区数据，处理 BR_TRANSACTION 消息
└──Binder.cpp
└───[BBinder::transact()](https://link.juejin.cn?target=https%3A%2F%2Fcs.android.com%2Fandroid%2Fplatform%2Fsuperproject%2F%2B%2Fandroid-13.0.0_r1%3Aframeworks%2Fnative%2Flibs%2Fbinder%2FBinder.cpp%3Bbpv%3D1%3Bbpt%3D0%3Bl%3D270) // 根据事务数据里的函数索引、参数，完成函数调用。
└────JavaBBinder.cpp（继承自 BBinder）
└─────[onTransact()](https://link.juejin.cn?target=https%3A%2F%2Fcs.android.com%2Fandroid%2Fplatform%2Fsuperproject%2F%2B%2Fandroid-13.0.0_r1%3Aframeworks%2Fbase%2Fcore%2Fjni%2Fandroid_util_Binder.cpp%3Bbpv%3D1%3Bbpt%3D0%3Bl%3D394)
└──────Binder.java
└───────[execTransact()](https://link.juejin.cn?target=https%3A%2F%2Fcs.android.com%2Fandroid%2Fplatform%2Fsuperproject%2F%2B%2Fandroid-13.0.0_r1%3Aframeworks%2Fbase%2Fcore%2Fjava%2Fandroid%2Fos%2FBinder.java%3Bl%3D1237%3Bbpv%3D1%3Bbpt%3D0)
└────────[execTransactInternal()](https://link.juejin.cn?target=https%3A%2F%2Fcs.android.com%2Fandroid%2Fplatform%2Fsuperproject%2F%2B%2Fandroid-13.0.0_r1%3Aframeworks%2Fbase%2Fcore%2Fjava%2Fandroid%2Fos%2FBinder.java%3Bbpv%3D1%3Bbpt%3D0%3Bl%3D1250)
└─────────onTransact() // Stub 会覆盖父类的 onTransact()
## BpBinder 与 BinderProxy、BBinder 与 Binder
transact() 和 onTransact() 的调用链路里出现了 BpBinder、BinderProxy、BBinder（JavaBBinder）和 Binder。
在 Binder 事务一文，已经提到过，BBinder 即 Binder 实体，而 BpBinder 即 Binder 代理，持有着 Binder 引用。它们两个都是 C++ 里的类。
而 Binder、BinderProxy 则是它们的 Java 层表示。如下图：
![](https://cdn.nlark.com/yuque/0/2024/webp/215777/1710266587701-1c37bf20-1dd7-46b3-8cc9-149961e00a0f.webp)
