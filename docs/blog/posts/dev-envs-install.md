---
date: 2025-01-17
authors:
  - mingminyu
categories:
  - 环境搭建
slug: dev-envs-install
readtime: 30
---

# 最简单大数据开发环境搭建


!!! note "参考文档"

    - https://hub.docker.com/r/gethue/hue
    - https://gethue.com/blog/quickstart-sql-editor-for-apache-impala

## 1. Apache Impala

```bash
docker run -d --name kudu-impala \
  -p 21000:21000 -p 21050:21050 -p 25000:25000 -p 25010:25010 -p 25020:25020 \
  --memory=4096m apache/kudu:impala-latest impala
```


> 如果你也要开启 WebHDFS 和 Hive 接口服务，这里建议将 10000 端口以及 9870 端口先暴露出来。

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

关于 `HADOOP_CONF_DIR` 目录比较简单，通常是 Hadoop 安装目录下的 `etc/hadoop` 目录。接下来需要设置下环境变量，但是尝试在 `/etc/profile`、`~/.bashrc`、`~/.zshrc` 文件中加入如下内容，好像都不会没有生效。

```bash
export JAVA_HOME="/usr/lib/jvm/java-8-openjdk-amd64/jre"
export HADOOP_CONF_DIR="/opt/hadoop/etc/hadoop"
export PATH=$PATH:$JAVA_HOME/bin:$HADOOP_CONF_DIR
```

那换个思路，直接在创建 docker 容器时，就把环境变量设置进去。重新创建容器后，再次执行 `hadoop version` 命令就正常了：

```bash
docker run -d --name kudu-impala \
  -p 21000:21000 -p 21050:21050 -p 25000:25000 -p 25010:25010 -p 25020:25020 \
  --env "JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/jre" \
  --env "HADOOP_CONF_DIR=/opt/hadoop/etc/hadoop" \
  --memory=4096m apache/kudu:impala-latest impala
```

工作中 Hadoop 用到最多的可能就是 WebHDFS 服务了，这里以 Hadoop 3.x 为例，说明下 WebHDFS 服务开启操作。

=== "/opt/hadoop/etc/hadoop/core-site.xml"

    ```xml linenums="1"
    <configuration>
      <property>
        <name>fs.defaultFS</name>
        <value>hdfs://127.0.0.1:9000</value>  <!-- 替换为你的NameNode主机名或IP -->
      </property>
      <property>
        <name>hadoop.proxyuser.[http-user].hosts</name>
        <value>*</value>  <!-- 允许所有主机访问 -->
      </property>
      <property>
        <name>hadoop.proxyuser.[http-user].groups</name>
        <value>*</value>  <!-- 允许所有用户组 -->
      </property>
    </configuration>
    ```

=== "/opt/hadoop/etc/hadoop/hdfs-site.xml"

    ```xml linenums="1"
    <configuration>
      <property>property>
        <name>dfs.webhdfs.enabled</name>
        <value>true</value>
      </property>
      <!-- NameNode HTTP 地址（Hadoop 3.x 默认端口：9870） -->
      <property>
        <name>dfs.namenode.http-address</name>
        <value>127.0.0.1:9870</value>
      </property>
      <!-- DataNode HTTP 地址（Hadoop 3.x 默认端口：9864） -->
      <property>
        <name>dfs.datanode.http.address</name>
        <value>0.0.0.0:9864</value>
      </property>
    </configuration>
    ```

接下来，我们还要重启下 NameNode 和 Datanode 服务，然后就可以通过 WebHDFS 服务访问 HDFS 了。

```bash
# 启动 NameNode 和 DataNode 服务
$ /opt/hadoop/bin/hdfs namenode -format
$ /opt/hadoop/bin/hdfs -daemon start namenode
$ /opt/hadoop/bin/hdfs -daemon start datanode

# 停止 NameNode 和 DataNode 服务
$ /opt/hadoop/bin/hdfs stop namenode
$ /opt/hadoop/bin/hdfs stop datanode
```

最后还是重新创建下容器：cd

```bash
docker run -d --name kudu-impala \
  -p 21000:21000 -p 21050:21050 -p 25000:25000 -p 25010:25010 -p 25020:25020 -p 9870:9870 \
  --memory=4096m apache/kudu:impala-latest impala
```

## 3. Apache Hive

开启 Hive Metastore 需要先设置好 `Java_HOME` 以及 `HADOOP_CONF_DIR` 环境变量。在创建容器时就将 10000 接口暴露出来：

```bash
docker run -d --name kudu-impala \
  -p 21000:21000 -p 21050:21050 -p 25000:25000 -p 25010:25010 -p 25020:25020 -p 9870:9870 -p 10000:10000 \
  --env "JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/jre" \
  --env "HADOOP_CONF_DIR=/opt/hadoop/etc/hadoop" \
  --memory=4096m apache/kudu:impala-latest impala
```

接下来

```bash
$ nohup hive --service hiveserve2 > /dev/null 2>&1 &
```

## 4. Hue

```bash
docker network create -d bridge quickstart-network
```


