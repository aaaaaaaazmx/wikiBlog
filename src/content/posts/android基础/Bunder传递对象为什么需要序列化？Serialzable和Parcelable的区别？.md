---
title: "Bunder传递对象为什么需要序列化？Serialzable和Parcelable的区别？"
published: 2024-01-01
description: "Bunder传递对象为什么需要序列化？Serialzable和Parcelable的区别？"
tags: ["Android","基础"]
category: "android基础"
draft: false
slug: "android-basic-015"
---

# Bunder传递对象为什么需要序列化？Serialzable和Parcelable的区别？


因为bundle传递数据时只支持基本数据类型，所以在传递对象时需要序列化转换成可存储或可传输的本质状态（字节流）。序列化后的对象可以在网络、IPC（比如启动另一个进程的Activity、Service和Reciver）之间进行传输，也可以存储到本地。

## Serializable（Java自带）：

Serializable 是序列化的意思，表示将一个对象转换成存储或可传输的状态。序列化后的对象可以在网络上进传输，也可以存储到本地。

Serializable 「简单易用」
```
    public class TestSerializable       implements Serializable {
    String msg;
    
    List<ItemBean> datas;
    
    public static class ItemBean implements Serializable{
        String name;
        }
    }
```

## Parcelable（android专用）：

Parcelable 速度至上

除了Serializable之外，使用Parcelable也可以实现相同的效果，不过不同于将对象进行序列化，Parcelable方式的实现原理是将一个完整的对象进行分解，而分解后的每一部分都是Intent所支持的数据类型，这也就实现传递对象的功能了。

 ```   
    public class TestParcelable implements Parcelable {
    String msg;

    @Override
    public int describeContents() {
        return 0;
    }

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeString(this.msg);
    }

    TestParcelable(String msg) {
        this.msg = msg;
    }

    private TestParcelable(Parcel in) {
        this.msg = in.readString();
    }

    public static final Creator<TestParcelable> CREATOR = new Creator<TestParcelable>() {
        @Override
        public TestParcelable createFromParcel(Parcel source) {
            return new TestParcelable(source);
        }

        @Override
        public TestParcelable[] newArray(int size) {
            return new TestParcelable[size];
        }
    };
    }
```

## 区别

可以肯定的是，两者都是支持序列化和反序列化的操作。

两者最大的区别在于 存储媒介的不同，Serializable 使用 I/O 读写存储在硬盘上，而 Parcelable 是直接 在内存中读写。很明显，内存的读写速度通常大于 IO 读写，所以在 Android 中传递数据优先选择 Parcelable。

Serializable 会使用反射，序列化和反序列化过程需要大量 I/O 操作， Parcelable 自已实现封送和解封（marshalled &unmarshalled）操作不需要用反射，数据也存放在 Native 内存中，效率要快很多。

## 对象传递注意

对象的大小，对象的大小，对象的大小！！！

重要的事情说三遍，一定要注意对象的大小。Intent 中的 Bundle 是使用 Binder 机制进行数据传送的。
能使用的 Binder 的缓冲区是有大小限制的（有些手机是 2 M），而一个进程默认有 16 个 Binder 线程，所以一个线程能占用的缓冲区就更小了（ 有人以前做过测试，大约一个线程可以占用 128 KB）。所以当你看到 
```
`The Binder transaction failed because it was too large 这类 TransactionTooLargeException `
```
异常时，你应该知道怎么解决了。

