---
title: "这个算是个加餐，应对完整binder通信中的一些细节问题"
published: 2020-10-15
description: "这个算是个加餐，应对完整binder通信中的一些细节问题"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-058"
---

# 这个算是个加餐，应对完整binder通信中的一些细节问题

还是这张图
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWHLmREemjAnUQiaSCXEWib11f5cYibMfUYfbNU8S1mNuaf2ib2Za31X5bbibe4bcuHLrE6Ileeiavd701g/640?wx_fmt=png&from=appmsg)
## AIDL生成代码分析
### AIDL使用
首先写一个IHelloInterface.aidl文件如下
```
interface IHelloInterface {
    void hello(String msg);
}
```
build之后会生成 IHelloInterface.java文件，然后创建一个远程服务
```
class RemoteService : Service() {
    private val serviceBinder = object : IHelloInterface.Stub() {
        override fun hello(msg: String) {
            Log.e("remote", "hello from client: $msg")
        }
    }
    override fun onBind(intent: Intent): IBinder = serviceBinder
}
```
绑定远程服务，调用服务方法
```
class MainActivity : AppCompatActivity() {
    private val conn = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName, service: IBinder) {
            // 这里的service就是一个BinderProxy
            // asInterface返回一个IHelloInterface.Stub.Proxy实例
            val proxy = IHelloInterface.Stub.asInterface(service)
            proxy.hello("client msg")
        }

        override fun onServiceDisconnected(name: ComponentName?) {
        }
    }
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        bindService(Intent("com.test.RemoteService"), conn, Service.BIND_AUTO_CREATE)
    }
}
```

远程服务在onBind中返回服务端Binder实例，
客户端通过binserService绑定服务后由AMS创建一个对应此服务端Binder的BinderProxy实例，回调到ServiceConnection.onServiceConnected方法中，
客户端可以通过IHelloInterface.Stub.asInterface根据该BinderProxy得到一个IHelloInterface.Stub.Proxy实例，调用其中的方法进行IPC通信。

### IHelloInterface分析
此文件内容主要分为三部分，这里简单拆分方便看

- IHelloInterface接口，是远程服务的功能抽象 
```
public interface IHelloInterface extends android.os.IInterface {
    public void hello(java.lang.String msg) throws android.os.RemoteException;
}
```

- IHelloInterface.Stub类表示服务端实现，它本身是一个继承于Binder的抽象类，**hello方法由我们使用的时候重写实现（在远程Service onBind方法中返回该类实现，重写hello方法）**
```
public static abstract class Stub extends android.os.Binder implements com.lyj.bindertest.IHelloInterface {
    // 类型标识
    private static final java.lang.String DESCRIPTOR = "com.lyj.bindertest.IHelloInterface";
    // 客户端服务端以此code标识hello方法
    static final int TRANSACTION_hello = (android.os.IBinder.FIRST_CALL_TRANSACTION + 0);

    public Stub() {
        this.attachInterface(this, DESCRIPTOR);
    }
    
    // 此方法一般在ServiceConnection.onServiceConnected回调中调用，
    public static com.lyj.bindertest.IHelloInterface asInterface(android.os.IBinder obj) {
        if ((obj == null)) {
            return null;
        }
        android.os.IInterface iin = obj.queryLocalInterface(DESCRIPTOR);
        if (((iin != null) && (iin instanceof com.lyj.bindertest.IHelloInterface))) {
            return ((com.lyj.bindertest.IHelloInterface) iin);
        }
        return new com.lyj.bindertest.IHelloInterface.Stub.Proxy(obj);
    }

    @Override
    public android.os.IBinder asBinder() {
        return this;
    }
    
    // 解析客户端的调用
    @Override
    public boolean onTransact(int code, android.os.Parcel data, android.os.Parcel reply, int flags) throws android.os.RemoteException {
        java.lang.String descriptor = DESCRIPTOR;
        switch (code) {
            case INTERFACE_TRANSACTION: {
                reply.writeString(descriptor);
                return true;
            }
            case TRANSACTION_hello: {
                // code为TRANSACTION_hello时调用hello方法
                data.enforceInterface(descriptor);
                java.lang.String _arg0;
                // 从parcel中读取数据
                _arg0 = data.readString();
                this.hello(_arg0);
                reply.writeNoException();
                return true;
            }
            default: {
                return super.onTransact(code, data, reply, flags);
            }
        }
    }
}

```

- IHelloInterface.Stub.Proxy类表示远程服务在客户端的代理，**成员mRemote代表远程服务Binder对应的BinderProxy**
```
private static class Proxy implements com.lyj.bindertest.IHelloInterface {
  // 远程服务Binder对应的BinderProxy
  private android.os.IBinder mRemote;

  Proxy(android.os.IBinder remote) {
      mRemote = remote;
  }

  @Override
  public android.os.IBinder asBinder() {
      return mRemote;
  }

  @Override
  public void hello(java.lang.String msg) throws android.os.RemoteException {
      android.os.Parcel _data = android.os.Parcel.obtain();
      android.os.Parcel _reply = android.os.Parcel.obtain();
      try {
          // 写类型标识
          _data.writeInterfaceToken(DESCRIPTOR);
          // 写参数
          _data.writeString(msg);
          // 调用BinderProxy.transact开始通讯
          boolean _status = mRemote.transact(Stub.TRANSACTION_hello, _data, _reply, 0);
          if (!_status && getDefaultImpl() != null) {
              getDefaultImpl().hello(msg);
              return;
          }
          _reply.readException();
      } finally {
          _reply.recycle();
          _data.recycle();
      }
  }
```

总结一下IHelloInterface.Stub 和 IHelloInterface.Stub.Proxy的关系：
IHelloInterface.Stub本身就是一个Binder，代表服务端，通过**onTransact**方法接收来自客户端的调用，判断code=TRANSACTION_hello调用IHelloInterface.hello接口方法。

IHelloInterface.Stub.Proxy代表客户端，持有一个名为mRemote的BinderProxy（内部持有服务端Binder句柄），Proxy.hello调用到**BinderProxy.transact**，传入code=TRANSACTION_hello，也即服务端收到的code

**由此可见真正发起通信的是BinderProxy.transact，而服务端接收消息的是Binder.onTransact**，AIDL只是对此简单封装。

## Java层到native层的过渡
从BinderProxy.transact方法开始，调用JNI方法transactNative进入native层，BinderProxy.transactNative对应native函数是android_util_Binder.cpp中的android_os_BinderProxy_transact
```
final class BinderProxy implements IBinder {
    public boolean transact(int code, Parcel data, Parcel reply, int flags) throws RemoteException {
        // 检查parcel数据是否大于800k
        Binder.checkParcel(this, code, data, "Unreasonably large binder buffer");
        // 调用native层
        return transactNative(code, data, reply, flags);
    }
}
```
> frameworks\base\core\jni\android_util_Binder.cpp

```
static jboolean android_os_BinderProxy_transact(JNIEnv* env, jobject obj,
        jint code, jobject dataObj, jobject replyObj, jint flags) // throws RemoteException
{
    // Java Parcel转为native Parcel
    Parcel* data = parcelForJavaObject(env, dataObj);
    Parcel* reply = parcelForJavaObject(env, replyObj);
    // 从Java BinderProxy对象获取BpBinder指针
    IBinder* target = (IBinder*) env->GetLongField(obj, gBinderProxyOffsets.mObject);
    // 调用BpBinder.transact
    status_t err = target->transact(code, *data, reply, flags);
    return JNI_FALSE;
}
```
android_os_BinderProxy_transact函数中通过传入的BinderProxy对象获取对应的BpBinder指针，然后调用BpBinder::transact
> frameworks\native\libs\binder\BpBinder.cpp

```
status_t BpBinder::transact(
    uint32_t code, const Parcel& data, Parcel* reply, uint32_t flags)
{
    if (mAlive) {
        // mHandle是接收端BBinder的句柄
        status_t status = IPCThreadState::self()->transact(
            mHandle, code, data, reply, flags);
        if (status == DEAD_OBJECT) mAlive = 0;
        return status;
    }
    return DEAD_OBJECT;
}
```
**BpBinder调用到IPCThreadState.transact**，IPCThreadState::self获取当前线程IPCThreadState单例，不存在则创建。在[上一篇文章](https://juejin.cn/post/6987595923543031821)中提到过，进行Binder通信的线程在native层对应一个IPCThreadState对象。

### 创建IPCThreadState
IPCThreadState::self做的事很简单，获取**当前线程IPCThreadState单例对象**（pthread_getspecific可以看做从ThreadLocal.get），不存在则调用空参构造函数创建
frameworks\native\libs\binder\IPCThreadState.cpp
```
IPCThreadState* IPCThreadState::self()
{
    // 是否已创建
    if (gHaveTLS) {
restart:
        const pthread_key_t k = gTLS;
        // 从线程私有空间获取
        IPCThreadState* st = (IPCThreadState*)pthread_getspecific(k);
        if (st) return st;
        return new IPCThreadState;
    }
    if (gShutdown) {
        return NULL;
    }
    // 线程同步锁
    pthread_mutex_lock(&gTLSMutex);
    if (!gHaveTLS) {
        int key_create_value = pthread_key_create(&gTLS, threadDestructor);
        if (key_create_value != 0) {
            pthread_mutex_unlock(&gTLSMutex);
            return NULL;
        }
        gHaveTLS = true;
    }
    pthread_mutex_unlock(&gTLSMutex);
    goto restart;
}
```
```
IPCThreadState::IPCThreadState()
    // 赋值ProcessState
    : mProcess(ProcessState::self()),
      mStrictModePolicy(0),
      mLastTransactionBinderFlags(0)
{
    // 当前对象存到当前线程私有空间
    pthread_setspecific(gTLS, this);
    clearCaller();
    // mIn、mOut两个parcel对象用于从binder驱动读写数据
    mIn.setDataCapacity(256);
    mOut.setDataCapacity(256);
}
```
IPCThreadState构造函数中我们主要关注ProcessState实例的获取赋值，它是一个进程范围内的单例对象，ProcessState::self获取该对象，不存在则创建。**实际上在此调用处ProcessState单例已经存在了**，[上一篇文章](https://juejin.cn/post/6987595923543031821)提到过，**每个App进程在被Zygote进程fork出以后会调用到app_main.cpp onZygoteInit函数，在此创建该进程ProcessState并开启binder线程池**。关于应用进程启动过程本文不加赘述，可以自行看源码，下面我们直接从onZygoteInit函数来看看Binder的初始化。

## 进程中的Binder初始化
frameworks\base\cmds\app_process\app_main.cpp
```
virtual void onZygoteInit()
{
    sp<ProcessState> proc = ProcessState::self();
    // 启动binder线程池
    proc->startThreadPool();
}
```
### 创建ProcessState
frameworks\native\libs\binder\ProcessState.cpp
```
sp<ProcessState> ProcessState::self()
{
    // 同步锁
    Mutex::Autolock _l(gProcessMutex);
    if (gProcess != NULL) {
        return gProcess;
    }
    gProcess = new ProcessState("/dev/binder");
    return gProcess;
}
```
ProcessState构造函数中先调用open_driver打开binder驱动，然后通过mmap系统调用到Binder驱动中binder_mmap方法开启用于接收数据的内存映射

```
ProcessState::ProcessState(const char *driver)
    // 打开binder，mDriverFD保存该文件描述符
    : mDriverFD(open_driver(driver))
    ......
    // 最大binder线程数，值为15
    : mMaxThreads(DEFAULT_MAX_BINDER_THREADS)
{
    if (mDriverFD >= 0) {
        // 调用binder_mmap建立（1M-8k）内存映射区
        mVMStart = mmap(0, BINDER_VM_SIZE, PROT_READ, MAP_PRIVATE | MAP_NORESERVE, mDriverFD, 0);
        if (mVMStart == MAP_FAILED) {
            close(mDriverFD);
            mDriverFD = -1;
            mDriverName.clear();
        }
    }
}
```
open_driver中主要调用到内核层Binder进行初始化

1. **open系统调用对应到driver层binder_open**，返回的fd是一个文件描述符，后续操作需要传递此fd
2. **ioctl BINDER_VERSION调用到driver层binder_ioctl BINDER_VERSION case**，用于获取内核binder版本
3. **ioctl BINDER_SET_MAX_THREADS调用到driver层binder_ioctl BINDER_SET_MAX_THREADS case**，在驱动中设置该进程的线程数量限制
```
static int open_driver(const char *driver)
{
    int fd = open(driver, O_RDWR | O_CLOEXEC);
    if (fd >= 0) {
        int vers = 0;
        // 获取内核binder版本
        status_t result = ioctl(fd, BINDER_VERSION, &vers);
        if (result == -1) {
=            close(fd);
            fd = -1;
        }
        // 对比内核binder版本和framework中binder版本
        if (result != 0 || vers != BINDER_CURRENT_PROTOCOL_VERSION) {
            close(fd);
            fd = -1;
        }
        // 设置驱动binder_proc.max_threads = DEFAULT_MAX_BINDER_THREADS
        size_t maxThreads = DEFAULT_MAX_BINDER_THREADS;
        result = ioctl(fd, BINDER_SET_MAX_THREADS, &maxThreads);
        if (result == -1) {
        }
    }
    return fd;
}
```

#### driver层binder初始化
driver层binder_open根据当前进程信息创建一个binder_proc，插入全局链表；然后将此binder_proc指针装入用户空间fd对应的file指针中，以便下次使用 [drivers/android/binder.c](https://link.juejin.cn?target=https%3A%2F%2Fwww.androidos.net.cn%2Fandroidkernel%2F4.4%2Fxref%2Fdrivers%2Fandroid%2Fbinder.c)
```
static int binder_open(struct inode *nodp, struct file *filp)
{
    // binder实例所属进程对象，对应ProcessState
    struct binder_proc *proc;
    // 申请内核空间创建binder_proc指针
    proc = kzalloc(sizeof(*proc), GFP_KERNEL);
    if (proc == NULL)
        return -ENOMEM;
    // 获取当前进程进程描述符
    get_task_struct(current);
    proc->tsk = current;
    // 初始化进程任务队列
    INIT_LIST_HEAD(&proc->todo);
    // 等待队列
    init_waitqueue_head(&proc->wait);
    proc->default_priority = task_nice(current);

    binder_lock(__func__);

    binder_stats_created(BINDER_STAT_PROC);
    // 该binder_proc节点插入一个全局链表
    hlist_add_head(&proc->proc_node, &binder_procs);
    proc->pid = current->group_leader->pid;
    INIT_LIST_HEAD(&proc->delivered_death);
    // binder_proc指针存储到file指针的private_data，这样下次用户空间通过fd调用到driver，可以重新获取到这个指针
    filp->private_data = proc;
    binder_unlock(__func__);
    return 0;
}

```
**binder_mmap中为当前进程开启内存映射**

- vm_area_struct结构体表示用户空间中一段虚拟地址空间，vm_struct表示内核空间一段虚拟地址
- **之前在用户空间调用mmap时指定了映射空间大小为1M-8KB**，内核自动为用户空间分配此大小地址段，指针存储在vm_area_struct结构体中，调用到binder_mmap后**根据用户空间地址段在内核中分配同样大小的内核空间虚拟地址段，存储在area指针**
- 创建一个binder_buffer，记录用户/内核映射区起始地址和大小，以便后续存储通讯数据
- 用户虚拟空间和内核虚拟空间此时还未产生联系，通过binder_update_page_range先分配一个页(4KB)大小的物理内存，使两个虚拟空间指针同时指向该物理页完成映射


**这里仅分配了一个物理页，在后面调用binder_transaction真正产生通讯时会按需分配更多内存**

/
```
static int binder_mmap(struct file *filp, struct vm_area_struct *vma)
{
    int ret;
    //内核虚拟空间
    struct vm_struct *area;
    struct binder_proc *proc = filp->private_data;
    const char *failure_string;
    // 每一次Binder传输数据时，都会先从Binder内存缓存区中分配一个binder_buffer来存储传输数据
    struct binder_buffer *buffer;

    if (proc->tsk != current)
            return -EINVAL;
    // 保证内存映射大小不超过4M
    if ((vma->vm_end - vma->vm_start) > SZ_4M)
        vma->vm_end = vma->vm_start + SZ_4M;
    ......
    // 采用IOREMAP方式，分配一个连续的内核虚拟空间，与用户进程虚拟空间大小一致
    // vma是从用户空间传过来的虚拟空间结构体
    area = get_vm_area(vma->vm_end - vma->vm_start, VM_IOREMAP);
    if (area == NULL) {
            ret = -ENOMEM;
            failure_string = "get_vm_area";
            goto err_get_vm_area_failed;
    }
    // 指向内核虚拟空间的地址
    proc->buffer = area->addr;
    // 用户虚拟空间起始地址 - 内核虚拟空间起始地址
    proc->user_buffer_offset = vma->vm_start - (uintptr_t)proc->buffer;
    ......
    // 分配物理页的指针数组，数组大小为vma的等效page个数
    proc->pages = kzalloc(sizeof(proc->pages[0]) * ((vma->vm_end - vma->vm_start) / PAGE_SIZE), GFP_KERNEL);
    if (proc->pages == NULL) {
            ret = -ENOMEM;
            failure_string = "alloc page array";
            goto err_alloc_pages_failed;
    }
    proc->buffer_size = vma->vm_end - vma->vm_start;

    vma->vm_ops = &binder_vm_ops;
    vma->vm_private_data = proc;
    // 分配物理页面，同时映射到内核空间和进程空间，先分配1个物理页
    if (binder_update_page_range(proc, 1, proc->buffer, proc->buffer + PAGE_SIZE, vma)) {
            ret = -ENOMEM;
            failure_string = "alloc small buf";
            goto err_alloc_small_buf_failed;
    }
    buffer = proc->buffer;
    // 创建buffers链表，buffer插入proc链表
    INIT_LIST_HEAD(&proc->buffers);
    list_add(&buffer->entry, &proc->buffers);
    buffer->free = 1;
    binder_insert_free_buffer(proc, buffer);
    // oneway异步可用大小为总空间的一半
    proc->free_async_space = proc->buffer_size / 2;
    barrier();
    proc->files = get_files_struct(current);
    proc->vma = vma;
    proc->vma_vm_mm = vma->vm_mm;
    return 0;
}

```


### 开启Binder线程池
由于每次完整的Binder通讯都需要循环读写驱动，在此过程中会阻塞当前线程，所以开启多个线程处理多任务是必然的选择。ProcessState创建时会开启一个新线程无限循环读binder驱动，每当读到一个**来自其他进程的通讯请求**，当前线程处理该请求，然后在当前进程binder线程不超过最大限制时会额外创建另一个线程准备处理后续请求，提高响应速度，我们来看代码验证下。
rameworks\native\libs\binder\ProcessState.cpp
```
void ProcessState::startThreadPool()
{
    AutoMutex _l(mLock);
    if (!mThreadPoolStarted) {
        mThreadPoolStarted = true;
        // 启动binder主线程
        spawnPooledThread(true);
    }
}
```
```
void ProcessState::spawnPooledThread(bool isMain)
{
    if (mThreadPoolStarted) {
    	// 线程名称Binder:pid_序号  序号从1开始
        String8 name = makeBinderThreadName();
        // isMain Binder主线程
        sp<Thread> t = new PoolThread(isMain);
        // PoolThread::run最后会调用到PoolThread::threadLoop
        t->run(name.string());
    }
}
```
Thread::run经过一系列调用最后会调用到PoolThread::threadLoop
```
virtual bool threadLoop()
{
    // 此时已经运行在新线程中，将新线程注册为binder主线程
    IPCThreadState::self()->joinThreadPool(mIsMain);
    return false;
}
```
IPCThreadState::joinThreadPool中**无限循环调用getAndExecuteCommand读写Binder驱动**，先写入BC_ENTER_LOOPER，然后无限读，无任务则休眠

## 发送端发起通讯
分析了Binder的初始化，我们接着看IPCThreadState.transact

1. writeTransactionData对将要发送的数据进行封装
2. waitForResponse向接收端发送数据并等待回复（接收端收到数据处理完后会给发送端发送一个BR_REPLY的回复），如果是oneway(异步模式)，则不需要等待接收端的回复

client发起之后waitForResponse函数中循环调用talkWithDriver读mIn Parcel中数据
```
status_t IPCThreadState::waitForResponse(Parcel *reply, status_t *acquireResult)
{
    uint32_t cmd;
    int32_t err;

    while (1) {
        // 构造binder_write_read，先将
        if ((err=talkWithDriver()) < NO_ERROR) break;
        .....处理从驱动读到的数据部分后面分析
    return err;
}
```

talkWithDriver函数中真正开始通过driver通讯

1. 将mIn mOut中数据封装到一个binder_write_read结构体
2. 然后通过ioctl调用到driver层binder_ioctl_write_read，此时mOut有数据，mIn无数据，先写后读，先到 binder_thread_write BC_TRANSACTION case
3. 后到binder_thread_read，处理BINDER_WORK_TRANSACTION_COMPLETE case

最终写入到driver层的数据是一个binder_write_read结构体，结构如下
![](https://mmbiz.qpic.cn/mmbiz_jpg/LrDMVD5bqLWHLmREemjAnUQiaSCXEWib1133bQvuW0V9XjsJnDViaicgicJnTkRQUX4Rlh9NAw94WrVvRxCfqbQib0ag/640?wx_fmt=webp&from=appmsg)
### driver层处理BC_TRANSACTION
binder_ioctl_write_read函数中先写后读，可以看到，
这里先从用户空间将binder_write_read参数的指针拷贝过来，将write_buffer和read_buffer分别交给binder_thread_write/binder_thread_read处理，
最后将它拷贝回去用户空间

binder_thread_write函数中读取判断binder_transaction_data.cmd，进入BC_TRANSACTION case，然后从用户空间拷贝binder_transaction_data指针，调用binder_transaction开始一个binder事务
```
static int binder_thread_write(struct binder_proc *proc,
			struct binder_thread *thread,
			binder_uintptr_t binder_buffer, size_t size,
			binder_size_t *consumed)
{
    uint32_t cmd;
    // bwr->write_buffer
    void __user *buffer = (void __user *)(uintptr_t)binder_buffer;
    // 跳过消费过的数据
    void __user *ptr = buffer + *consumed;
    void __user *end = buffer + size;
    ......
    while (ptr < end && thread->return_error == BR_OK) {
        // 获取mOut中的cmd
        if (get_user(cmd, (uint32_t __user *)ptr))
            return -EFAULT;
        ......
        switch (cmd) {
        case BC_TRANSACTION:
        case BC_REPLY: {
            struct binder_transaction_data tr;
            // 从用户空间拷贝数据，即mOut中tr
            if (copy_from_user(&tr, ptr, sizeof(tr)))
                return -EFAULT;
            ptr += sizeof(tr);
            // 开始一个binder_transaction
            binder_transaction(proc, thread, &tr, cmd == BC_REPLY);
            break;
        }
    }
}

```
**binder_transaction函数非常关键，涉及的内容比较多，这里归纳一下**

1. biner_ref对应native层BpBinder，binder_node对应native层BBinder
2. 根据native层传过来的BpBinder.handle找到接收端对应的binder_ref，然后得到相应binder_node和binder_proc。
3. 创建一个binder_transaction，调用为binder_alloc_buf为接收端进程创建一个binder_buffer，分配物理内存并映射到接收端进程和内核空间，将它插入接收端进程buffer链表；并赋值给binder_transaction.buffer，**此buffer用于接收端接收发送端数据**。**之前说过binder_mmap时仅创建分配了一页物理内存的binder_buffer，剩下的在通讯时分配，就是此处。**
4. 将binder_transaction_data.code等字段装入binder_transaction，从用户空间拷贝binder_transaction_data.data.ptr.buffer到上面创建的binder_buffer.data中，**此buffer.data对应的物理内存是接收端进程和内核共享的，这样就完成了从发送端进程到接收端进程的数据传递**
5. binder_transaction.from设为发送端线程binder_thread，并将binder_transaction**插入发送端线程binder_thread.transaction_stack栈**
6. 将binder_transaction.work类型设为BINDER_WORK_TRANSACTION，**将它插入接收端进程binder_proc.todo队列**，唤醒目标进程处理该work
7. 创建一个BINDER_WORK_TRANSACTION_COMPLETE类型的binder_work，此work用于告知发送端发送已经完成，**将它插入发送端线程binder_thread.todo队列**



### 发送端处理 BINDER_WORK_TRANSACTION_COMPLETE
发送端处理完binder_thread_write后接着到binder_thread_read，此时thread.todo中存在一个BINDER_WORK_TRANSACTION_COMPLETE work，进入对应分支，写回一个cmd=BR_TRANSACTION_COMPLETE的消息到用户空间，代表此次发送端的发送已经完成

driver层处理完返回，IPCThreadState::talkWithDriver处理完此次通讯也返回，回到IPCThreadState::waitForResponse，读取处理mIn（bwr read_buffer）中driver写入的BR_TRANSACTION_COMPLETE对应数据。
处理完BR_TRANSACTION_COMPLETE后，由于需要等待接收端的reply，所以继续循环调用到talkWithDriver，然后到driver binder_thread_read中休眠，等待reply

## 接收端处理请求
在Binder初始化时提到过，进程开启Binder线程池后循环读driver，无任务时在binder_thread_read中休眠，binder_proc.todo不为空时被唤醒。这里发送端往接收端binder_proc.todo中塞入了BINDER_WORK_TRANSACTION work，所以接收端被唤醒处理此work。

根据发送端塞入的binder_work获取对应binder_transaction，然后取出其中的数据装入binder_transaction_data，**cmd设为BR_TRANSACTION**，将它拷贝回用户空间。**target_node->ptr表示BBinder的弱引用指针，target_node->cookie表示BBinder的指针。**

接收端driver层处理完返回，回到IPCThreadState::getAndExecuteCommand，接着talkWithDriver()往下执行，读取mIn（bwr read_buffer）中来自driver的数据，调用IPCThreadState::executeCommand处理。

进入BR_TRANSACTION case
binder_transaction_data.cookie转为BBinder指针，调用BBinder.transact将数据回传给Java层，最后调用sendReply向客户端发送reply

### 回调数据到Java层
由于此处BBinder指针实际上是一个JavaBBinder，所以BBinder::transact调用到JavaBBinder::onTransact。
至于为什么是JavaBBinder，可以看一看java层Binder对象的初始过程，最终会通过jni在native层创建对应JavaBBinder。

JavaBBinder::onTransact反射调用到Binder.java中的execTransact方法，

回到Java层，Binder.execTransact调用Binder.onTransact，我们这里的Binder是IHelloInterface.Stub，所以最后到IHelloInterface.Stub.onTransact，判断code调用远程服务中匿名IHelloInterface.Stub类hello方法
```
private boolean execTransact(int code, long dataObj, long replyObj,
            int flags) {
        Parcel data = Parcel.obtain(dataObj);
        Parcel reply = Parcel.obtain(replyObj);
        final boolean tracingEnabled = Binder.isTracingEnabled();
        try {
            res = onTransact(code, data, reply, flags);
        }
        ......
```


### 服务端向客户端发送reply
还有最后一步，客户端还在等待回应，回到IPCThreadState::sendReply，还是熟悉的配方，向驱动写入了BC_REPLY，最后一路到driver层binder_thread_write BC_REPLY case

```
status_t IPCThreadState::sendReply(const Parcel& reply, uint32_t flags)
{
    status_t err;
    status_t statusBuffer;
    err = writeTransactionData(BC_REPLY, flags, -1, 0, reply, &statusBuffer);
    if (err < NO_ERROR) return err;

    return waitForResponse(NULL, NULL);
}
```

接下来**服务端**线程binder_thread_read处理BINDER_WORK_TRANSACTION_COMPLETE，cmd变为BR_TRANSACTION_COMPLETE返回到IPCThreadState::waitForResponse，结束服务端逻辑。
**客户端**线程binder_thread_read处理BINDER_WORK_TRANSACTION，cmd变为BR_REPLY也返回到IPCThreadState::waitForResponse，结束客户端逻辑，自此整个通讯过程结束。

最后放一张图，这张图来自[# 彻底理解Android Binder通信架构](https://link.juejin.cn?target=http%3A%2F%2Fgityuan.com%2F2016%2F09%2F04%2Fbinder-start-service%2F)，只不过大佬分析的是app进程调用系统服务的通讯过程，而我分析的是两个应用进程通讯的过程，总体大同小异，这里把图中system_server看作另一个app process就好了。 ![](https://mmbiz.qpic.cn/mmbiz_jpg/LrDMVD5bqLWHLmREemjAnUQiaSCXEWib11hUqZe91OV25W0VuBicNdhuYebb5EwlykuPN1QcYvoPI2ZflfCPvYeHw/640?wx_fmt=webp&from=appmsg)

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWHLmREemjAnUQiaSCXEWib11zf44icdbFwEvVtco6vszI6KXicxEW5XXvPCv0EJ8lcqu2VJsFWG6nSXA/640?wx_fmt=png&from=appmsg)

