---
title: "Apk安装过程"
published: 2022-11-30
description: "Apk安装过程"
tags: ["Android","进阶"]
category: "android进阶"
draft: false
slug: "android-adv-009"
---

# Apk安装过程

为了学习这个过程,真的是陷入了pms的源码很久,也看了很多前人的博文,才算是有了些思路,所以此处先把主要步骤列出来,后面再慢慢分析细节。

1. 将apk文件复制到`data/app`目录
2. 解析apk信息
3. dexopt操作
4. 更新权限信息
5. 完成安装,发送`Intent.ACTION_PACKAGE_ADDED`广播

下面将具体步骤列张图出来:

![](https://mmbiz.qpic.cn/mmbiz_jpg/LrDMVD5bqLVL3hMlxFAX8574YC0p4uLNMIX47QhhUlOkRH2k3GTb9zLO25rWdbY7q9yRCNaCbEanCibyNicxLjXg/640?wx_fmt=webp&amp;from=appmsg)



由图可见安装过程中流转的步骤还是比较多的,下面具体分析

Android APK 安装是一个多阶段的过程，涉及系统多个组件的协作。以下是完整的安装流程分析：
### 1. 安装触发阶段
#### 1.1 安装来源
- 应用商店安装：通过PackageInstaller系统组件处理
- ADB安装：通过`adb install`命令
- 文件管理器安装：用户点击APK文件
- 系统预装：厂商在系统镜像中预置
#### 1.2 安装入口
```
// 核心安装入口类
frameworks/base/core/java/android/content/pm/PackageManager.java
frameworks/base/services/core/java/com/android/server/pm/PackageManagerService.java
```
### 2. 安装流程核心阶段
#### 2.1 拷贝APK文件
```
// 将APK拷贝到目标目录
/data/app/<package-name>-<random-suffix>/
/data/app/~~<random-string>/<package-name>-<random-suffix>/
```
特点：
- 采用随机后缀防止路径猜测攻击
- Android 8.0+使用二级随机目录增强安全
#### 2.2 解析APK
PackageManagerService通过`PackageParser`解析：
```
// 解析AndroidManifest.xml
frameworks/base/core/java/android/content/pm/PackageParser.java
// 关键解析内容：
- 包名(packageName)
- 版本号(versionCode)
- 权限(permissions)
- 组件信息(activities/services等)
- 签名信息
```
#### 2.3 签名验证
验证流程：
1. 检查V1签名(JAR签名)
2. 检查V2/V3签名(APK签名方案)
3. 验证证书链和签名文件
4. 与已安装版本签名比对(升级时)
关键代码：
```
frameworks/base/core/java/android/util/apk/ApkSignatureVerifier.java
```
#### 2.4 依赖检查
- 检查sharedUserId是否匹配
- 验证安装包是否满足：
```
<uses-library android:name="..." android:required="true/false"/>
```
#### 2.5 优化阶段
DEX优化：
```
# 生成优化后的ODEX文件
/data/dalvik-cache/arm64/[email protected]@classes.dex
```
ART编译流程：
1. 将DEX转换为OAT格式
2. 生成机器码(Android 5.0+)
3. 优化后的代码存入：
```
/data/app/~~[random]/[package]/oat/[arch]/base.odex
```
#### 2.6 数据库更新
更新以下系统数据库：
```
/data/system/packages.xml    # 包基本信息
/data/system/packages.list   # 包目录映射
/data/system/users/<user-id>/packages.xml # 用户级配置
```
### 3. 安装后处理
#### 3.1 组件注册
向系统注册：
- Activity
- Service
- BroadcastReceiver
- ContentProvider
#### 3.2 资源加载
创建`AssetManager`加载：
- APK中的/resources.arsc
- 资源表映射
#### 3.3 权限处理
- 处理`<uses-permission>`
- 处理`<permission>`声明
- 授予运行时权限(根据targetSdkVersion)
### 4. 安装流程优化 (Android 8.0+)
#### 4.1 流式安装
```
// 增量安装支持
PackageInstaller.SessionParams params = new PackageInstaller.SessionParams(
    PackageInstaller.SessionParams.MODE_FULL_INSTALL);
params.setSize(apkSize);
// 分块写入
try (OutputStream out = session.openWrite("base.apk", 0, -1)) {
    out.write(apkData);
}
```
#### 4.2 并行处理
Android 10+引入：
- 并行解析多个APK
- 后台优化处理
### 5. 安装错误处理
常见错误代码：
| 错误码 | 常量名 | 原因 |
| --- | --- | --- |
| -1 | INSTALL_FAILED_ALREADY_EXISTS | 包已存在 |
| -2 | INSTALL_FAILED_INVALID_APK | 无效APK文件 |
| -3 | INSTALL_FAILED_INVALID_URI | 无效安装源 |
| -4 | INSTALL_FAILED_INSUFFICIENT_STORAGE | 存储空间不足 |
| -5 | INSTALL_FAILED_DUPLICATE_PACKAGE | 重复包名 |
| -6 | INSTALL_FAILED_NO_SHARED_USER | 共享用户不存在 |
| -7 | INSTALL_FAILED_UPDATE_INCOMPATIBLE | 版本不兼容 |
| -8 | INSTALL_FAILED_SHARED_USER_INCOMPATIBLE | 共享用户不兼容 |
| -9 | INSTALL_FAILED_MISSING_SHARED_LIBRARY | 缺少共享库 |
| -10 | INSTALL_FAILED_REPLACE_COULDNT_DELETE | 旧版本删除失败 |
### 6. 系统安装服务架构
```
PackageInstaller (UI层)
       ↓
PackageManager (API接口)
       ↓
PackageManagerService (系统服务)
       ↓
Installer (与installd通信)
       ↓
installd (native守护进程)
       ↓
文件操作/DEX优化等
```
### 7. 特殊安装场景
#### 7.1 即时应用(Instant Apps)
- 免安装运行
- 限制功能访问
- 临时存储空间
#### 7.2 分包安装
```
// 创建多APK会话
PackageInstaller.Session multiSession = packageInstaller.createSession(params);
// 添加各分卷
multiSession.addSplit("split_config.hdpi.apk", hdpiApkSize);
multiSession.addSplit("split_config.en.apk", langApkSize);
```
#### 7.3 系统应用更新
- 需要平台签名
- 写入`/system/priv-app`目录
- 需要重启或热加载
### 8. 安全机制
#### 8.1 安装来源验证
- 验证安装包签名
- 检查`INSTALL_NON_MARKET_APPS`设置
- 扫描病毒(通过Google Play Protect)
#### 8.2 密封模式(Sealed)
Android 11+特性：
- 阻止安装后修改APK文件
- 验证`/data/app`目录完整性
#### 8.3 受限安装
- 企业策略限制
- 家长控制
- 设备管理员限制
Android APK安装过程经过多年演进，已形成一套兼顾效率与安全的复杂机制，不同Android版本的具体实现细节可能有所差异。All REFPeople SearchDocument Summary