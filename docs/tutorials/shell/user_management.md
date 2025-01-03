# 用户管理

## 1. 添加用户

Linux 中使用 `useradd` 或者 `adduser` 命令来添加用户，新手建议使用 `adduser` 命令来添加用户。

### 1.1 useradd

`useradd` 是一个低级工具，通过直接修改系统文件（如 `/etc/password`、`/etc/shadow`、`/etc/group` 等）来添加用户。使用 `useradd` 需要手动指定许多选项，例如用户的主目录、SHEll、用户 ID 等，更适合在复杂场景下用户管理脚本中使用。

!!! warning "默认情况"
    默认情况下，使用 `useradd mingminyu` 命令只会创建一个用户，而不会创建用户主目录。

`useradd` 有一些常用命令:

- `-m`: 自动创建用户的主目录
- `-d`: 指定用户的主目录路径
- `-s`: 指定用户登录的 Shell
- `-u`: 指定用户 ID
- `-p`: 设定用户密码
- `-g`: 指定用户所属的主组
- `-G`: 指定用户所属的附加组

我们添加一个 mingminyu 账户，并指定用户主目录，所属 root 组：

```bash
useradd -m mingminyu -p test@1234 -g root
```

### 1.2 adduser

`adduser` 则是相对高级的工具，它提供了更加用户友好的交互界面，提示用户输入必要的信息，比如用户名、密码、用户ID等。默认情况下会自动创建用户的主目录，并设置必要的权限。

```bash
adduser mingminyu
passwd mingminyu
```

添加后的用户是没有 sudo 权限的，我们可以在 /etc/sudoers 中以下一行，给当前用户添加下 root 权限:

```bash
%wheel  ALL=(ALL)       ALL
mingminyu ALL=(ALL)       NOPASSWD: ALL
```

## 2. 更改用户信息

### 2.1 更改用户密码

### 2.2 更改用户组

```bash
usermod -aG root mingminyu
```

### 2.3 更改文件夹所属组

某些情况下，一些文件夹是 root 群组才有权限更改，这个时候可以通过更改当前文件夹的所属群组来更改读写权限。

```bash title="当前登录账号须为 root"
chown -R mingminyu:root bigdata/
```

## 3. 删除用户
