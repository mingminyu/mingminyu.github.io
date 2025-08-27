---
date: 2025-05-25
authors:
  - mingminyu
categories:
  - 版本控制
slug: git_simple_cookbook
readtime: 2
---

# Git 常用操参考

## 1. 删除大文件

不知道你有没有遇到这样一种情况，一些大文件我们未在 `.gitignore` 文件声明，导致这些大文件和其他一起被误添加且提交，但更改还未被提交到远程仓库中。显然，我们不希望提交这些文件到远程仓库中，且其他文件内容还能保持当前最新的状态，可以执行如下命令：

```bash
git reset --mixed HEAD^1
```

执行完成后，在 `.gitignore` 文件中先添加好忽略的内容 ，再通过 `git add`、`git commit` 命令重新操作。

!!! danger "谨慎使用 `--hard` 参数"

    请谨慎使用 `--hard` 参数，`git reset --hard HEAD^1` 虽然可以恢复到文件添加前的状态，但需要注意的是，本地文件变更内容也会清除掉，这意味着如果你做了大量的内容变更将会丢失。

## 2. 强制提交变更

## 3. 强制拉取最新内容

