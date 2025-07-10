---
date: 2025-05-11
authors:
  - mingminyu
categories:
  - 环境搭建
slug: simplest-build-bigdata-dev-envs
readtime: 10
---

# 最简单的大数据开发环境搭建

作为一名程序员，很多时候我们希望在本地能搭建一套大数据环境作为测试开发环境，以便快速地开发一些库和接口服务，能无缝地切换到生产环境上去。本篇文章主介绍如何通过 Docker 镜像快速高效地创建一个大数据开发环境。

!!! note "参考文档"

    - Hue 镜像：https://hub.docker.com/r/gethue/hue
    - Kudu Impala 镜像：https://gethue.com/blog/quickstart-sql-editor-for-apache-impala

## 1. Apache Impala

在 [gethue](https://hub.docker.com/r/gethue/hue) 介绍了如何集成一个 [Kudu Impala 服务](https://gethue.com/blog/quickstart-sql-editor-for-apache-impala)，我们按照文档介绍来创建一个容器。

```bash
docker run -d --name kudu-impala -p 0.0.0.0:21000:21000 -p 0.0.0.0:21050:21050 -p 0.0.0.0:25000:25000 -p 0.0.0.0:25010:25010 -p 0.0.0.0:25020:25020 --memory=4096m apache/kudu:impala-latest impala
```

进入容器内 `/opt` 目录下，你会发现该镜像已经集成了 Hadoop 和 Hive 服务。如果后续你会使用到 WebHDFS 和 Hive 接口服务，这里建议将这些端口 8020、9000、9870、9864、10000 也先暴露出来，后面我们配置会用到相关接口，建议看完全部文档后再操作。

### 1.1 Windows宿主机对外开放接口

这里我们使用闲置的 Windows 电脑作为容器的宿主机，开启服务后在局域网内可供其他机器访问。实践过程中有时间会出现这样的一个问题，通过 Python 连接 `localhost` 是正常的，但换成 `127.0.0.1` 或者实际 IP4 地址，都无法正确连接（尤其是在配置其他服务后重启服务的时候）。网上有一些解决办法是采用端口的转发的操作，但验证下来此方法无效，且对删除容器重新创建也会有影响，非常不建议这么操作。

??? "Window端口转发与重置"

    === "端口转发"

      ```bash
      netsh interface portproxy add v4tov4 listenport=21050 listenaddress=0.0.0.0 connectport=21050 connectaddress=localhost
      ```
      
    === "查看端口转发的列表"

      ```bash
      netsh interface portproxy show all
      ```
    
    === "端口转发重置"

      ```bash
      netsh interface portproxy reset
      ```

## 2. Apache Hadoop

进入 kudu-impala 容器内你会发现 `/opt` 目录下已经有 hadoop 和 hive 的目录，但是直接运行 `hadoop version` 命令会提示错误信息，告诉我们 `JAVA_HOME` 环境变量没有设置：

```bash
WARNING: log4j.properties is not found. HADOOP_CONF_DIR may be incomplete.
ERROR: JAVA_HOME is not set and could not be found.
```

使用 `java -version` 能看到当前容器中已经安装了 JDK 服务，下面先找一下 JDK 的安装目录：

```bash linenums="1" hl_lines="12"
$ which java
/usr/bin/java

$ ls -la /usr/bin |grep java
lrwxrwxrwx root root    22 B  Fri May  1 18:19:05 2020 java ⇒ /etc/alternatives/java
lrwxrwxrwx root root    23 B  Fri May  1 18:19:06 2020 javac ⇒ /etc/alternatives/javac
lrwxrwxrwx root root    25 B  Fri May  1 18:19:06 2020 javadoc ⇒ /etc/alternatives/javadoc
lrwxrwxrwx root root    23 B  Fri May  1 18:19:06 2020 javah ⇒ /etc/alternatives/javah
lrwxrwxrwx root root    23 B  Fri May  1 18:19:06 2020 javap ⇒ /etc/alternatives/javap

$ ls -la /etc/alternatives |grep java
lrwxrwxrwx root root  46 B Fri May  1 18:19:05 2020 java ⇒ /usr/lib/jvm/java-8-openjdk-amd64/jre/bin/java
lrwxrwxrwx root root  56 B Fri May  1 18:19:05 2020 java.1.gz ⇒ /usr/lib/jvm/java-8-openjdk-amd64/jre/man/man1/java.1.gz
lrwxrwxrwx root root  43 B Fri May  1 18:19:06 2020 javac ⇒ /usr/lib/jvm/java-8-openjdk-amd64/bin/javac
lrwxrwxrwx root root  53 B Fri May  1 18:19:06 2020 javac.1.gz ⇒ /usr/lib/jvm/java-8-openjdk-amd64/man/man1/javac.1.gz
lrwxrwxrwx root root  45 B Fri May  1 18:19:06 2020 javadoc ⇒ /usr/lib/jvm/java-8-openjdk-amd64/bin/javadoc
```

??? info "配置环境变量（无效）"

    `HADOOP_CONF_DIR` 目录比较简单，通常是 Hadoop 安装目录下的 `etc/hadoop` 目录，接下来需要设置相关环境变量：

    ```bash
    export JAVA_HOME="/usr/lib/jvm/java-8-openjdk-amd64/jre"
    export HADOOP_CONF_DIR="/opt/hadoop/etc/hadoop"
    export PATH=$PATH:$JAVA_HOME/bin:$HADOOP_CONF_DIR
    ```

    尝试此操作后，发现在 `/etc/profile`、`~/.bashrc`、`~/.zshrc` 这些文件中加入上述内容，配置都没有生效，==此方法不适用==。

这里我们先删除容器，通过如下命令重新创建一个容器（区别在于通过 `--env` 直接设置了环境变量），容器内再次执行 `hadoop version` 命令就正常了。

```bash
docker run -d --name kudu-impala -p 0.0.0.0:21000:21000 -p 0.0.0.0:21050:21050 -p 0.0.0.0:25000:25000 -p 0.0.0.0:25010:25010 -p 0.0.0.0:25020:25020 --env "JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/jre" --env "HADOOP_CONF_DIR=/opt/hadoop/etc/hadoop" --memory=4096m apache/kudu:impala-latest impala
```

关于 Hadoop 接口应用，目前我用到最多的通过 WebHDFS 服务上传下载 HDFS 文件，并结合 Hive 和 Impala 建立外部分区表。这里以 Hadoop 3.x 为例，说明下 WebHDFS 服务开启操作。

=== "/opt/hadoop/etc/hadoop/core-site.xml"

    ```xml linenums="1"
    <configuration>
      <property>
        <name>fs.defaultFS</name>
        <!-- 替换为你的NameNode主机名或IP，例如我的 kudu-impala 的 IP 为 172.17.0.2 -->
        <value>hdfs://172.17.0.2:9000</value>  
      </property>
      <!-- 不添加的话，会导致无法提交文件到 HDFS 上 -->
      <property>
        <name>dfs.client.use.datanode.hostname</name>
        <value>true</value>
      </property>
      <property>
        <name>hadoop.proxyuser.root.hosts</name>
        <value>*</value>  <!-- 允许所有主机访问 -->
      </property>
      <property>
        <name>hadoop.proxyuser.root.groups</name>
        <value>*</value>  <!-- 允许所有用户组 -->
      </property>
      <property>
        <name>hadoop.proxyuser.impala.hosts</name>
        <value>*</value>  <!-- 允许所有主机访问 -->
      </property>
      <property>
        <name>hadoop.proxyuser.impala.groups</name>
        <value>*</value>  <!-- 允许所有用户组 -->
      </property>
    </configuration>
    ```

=== "/opt/hadoop/etc/hadoop/hdfs-site.xml"

    ```xml linenums="1" hl_lines="9 14 20"
    <configuration>
      <property>
        <name>dfs.webhdfs.enabled</name>
        <value>true</value>
      </property>
      <!-- NameNode HTTP 地址（Hadoop 3.x 默认端口：9870） -->
      <property>
        <name>dfs.namenode.http-address</name>
        <value>0.0.0.0:9870</value>
      </property>
      <!-- DataNode HTTP 地址（Hadoop 3.x 默认端口：9864） -->
      <property>
        <name>dfs.datanode.http.address</name>
        <value>0.0.0.0:9864</value>
      </property>
      <!-- 不添加的会导致无法提交文件到 hdfs 上 -->
      <property>
        <name>dfs.datanode.hostname</name> 
        <!-- 填写 Windows 宿主机的 IP 地址 (1) -->
        <value>10.166.99.61</value>
      </property>
    </configuration>
    ```

    1. 需要设置下 DataNode 的 hostname，否则会报错 `Failed to resolve 'f38ea60d2b3a' ([Errno 11001] getaddrinfo failed)"))`


接下来，我们需要先使用 `hdfs name -format` 格式化 NameNode，然后启动 NameNode 和 DataNode 服务后，就可以通过 WebHDFS 服务访问 HDFS 了：

```bash title="启动 NameNode 和 DataNode"
# 关闭将 start 修改为 stop 即可
$ hdfs --daemon start namenode
$ hdfs --daemon start datanode
```

!!! warning "PyHDFS 无法上传文件" 

      如果使用 PyHDFS 可以创建和删除文件夹，但无法将本地文件上传到 HDFS，报错信息为 `HdfsIOException: Failed to find datanode, suggest to check cluster health. excludeDatanodes=null`。

      **解决办法**：上述问题通常是 HDFS NameNode 多次格式化导致，先删除 `/tmp/hadoop-impala/dfs/data` 目录所有文件，再重新格式化 NameNode。


该容器默认用户为 impala，如果后面需要使用到 Hue 的话，这里我们先需要先创建对应的 HDFS 目录：

```bash hl_lines="3"
# 以下不操作，会出现 User: impala is not allowed to impersonate root 报错信息
$ hdfs dfs  -mkdir /tmp
$ hdfs dfs  -mkdir -p /user/impala
```

如果你之前没有将 8020、9000、9870、9864、10000 这些端口暴露出来，那么需要删除容器重新创建，且再走一遍文档的操作：

```bash
docker run -d --name kudu-impala -p 0.0.0.0:21000:21000 -p 0.0.0.0:21050:21050 -p 0.0.0.0:25000:25000 -p 0.0.0.0:25010:25010 -p 0.0.0.0:25020:25020 -p 0.0.0.0:8020:8020 -p 0.0.0.0:9000:9000 -p 0.0.0.0:9870:9870 -p 0.0.0.0:9864:9864 -p 0.0.0.0:10000:10000 --env "JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/jre" --env "HADOOP_CONF_DIR=/opt/hadoop/etc/hadoop" --memory=4096m apache/kudu:impala-latest impala
```

如果希望容器启动时默认开启 WebHDFS 服务，在 `/impala-entrypoint.sh` 文件中添加如下内容，其中 `start_hive_hs2` 为后面开启 Hive 连接端口所用，这里先写上相关内容：

```bash title="/impala-entrypoint.sh" linenums="1" hl_lines="1-8 14-15"
function start_hive_hs2() {
  hive --service hiveserver2 &
}

function start_hdfs() {
  hdfs --daemon start namenode
  hdfs --daemon start datanode
}

if [[ "$1" == "impala" ]]; then
  mkdir -p $DATA_DIR
  mkdir -p $LOG_DIR
  start_hive_metastore
  start_hdfs
  start_hive_hs2
  start_statestored
  start_catalogd
  start_impalad
  tail -F ${LOG_DIR}/impalad.INFO
elif [[ "$1" == "help" ]]; then
  print_help
  exit 0
fi
```

## 3. Apache Hive

开启 Hive Metastore 需要先设置好 `JAVA_HOME` 以及 `HADOOP_CONF_DIR` 环境变量。在创建容器时就将 10000 接口暴露出来：

```bash
docker run -d --name kudu-impala -p 0.0.0.0:21000:21000 -p 0.0.0.0:21050:21050 -p 0.0.0.0:25000:25000 -p 0.0.0.0:25010:25010 -p 0.0.0.0:25020:25020 -p 0.0.0.0:8020:8020 -p 0.0.0.0:9000:9000 -p 0.0.0.0:9870:9870 -p 0.0.0.0:9864:9864 -p 0.0.0.0:10000:10000 --env "JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/jre" --env "HADOOP_CONF_DIR=/opt/hadoop/etc/hadoop" --memory=4096m apache/kudu:impala-latest impala
```

接下来执行以下命令开启 HiveServer2 服务，==需要注意的是，要求 HDFS 的 NameNode 和 Datanode 服务需要先启动==：

```bash
nohup hive --service hiveserver2 > /dev/null 2>&1 &
```

当然我们可以直接在 `/impala-entrypoint.sh` 进行设置，不必每次进入容器手动开启：

```bash title="/impala-entrypoint.sh" linenums="1" hl_lines="1-8 14-15"
function start_hive_hs2() {
  hive --service hiveserver2 &
}

function start_hdfs() {
  hdfs --daemon start namenode
  hdfs --daemon start datanode
}

if [[ "$1" == "impala" ]]; then
  mkdir -p $DATA_DIR
  mkdir -p $LOG_DIR
  start_hive_metastore
  start_hdfs
  start_hive_hs2
  start_statestored
  start_catalogd
  start_impalad
  tail -F ${LOG_DIR}/impalad.INFO
elif [[ "$1" == "help" ]]; then
  print_help
  exit 0
fi
```

## 4. Hue

我们可以通过 Hue 的镜像快速创建容器，

```bash
docker run -it -p 8888:8888 gethue/hue:latest
```

### 4.1 配置 Impala 服务

```ini title="/usr/share/hue/desktop/conf/hue.ini" linenums="1"
[desktop]
default_user=impala
default_hdfs_superuser=impala

[impala]
server_host=<宿主机IP>
server_port=21050
```

### 4.2 配置 WebHDFS 服务

```ini title="/usr/share/hue/desktop/conf/hue.ini" linenums="1"
[desktop]
default_user=impala
default_hdfs_superuser=impala

[hadoop]
[[hdfs_clusters]]
[[[default]]]
webhdfs_url = http://<宿主机IP>:9870/webhdfs/v1
```

### 4.3 配置 Hive 服务

```bash
Thrift version configured by property thrift_version might be too high. Request failed with "Required field 'client_protocol' is unset! Struct:TOpenSessionReq(client_protocol:null, username:hue, configuration:{hive.server2.proxy.user=yumingmin})" (code OPEN_SESSION): None
```

打开 Hue 的 Hive Editor，出现如上错误，需要在 hue.ini 文件中修改 `thrift_version=7`。

```ini title="/usr/share/hue/desktop/conf/hue.ini" linenums="1" hl_lines="4"
[beeswax]
hive_server2_host=<宿主机IP>
hive_server_port=10000
thrift_version=7
```

## 5. 参考文档

- Windows宿主机无法通过IP访问docker桌面里的容器: https://blog.csdn.net/qq_41951305/article/details/125971902
