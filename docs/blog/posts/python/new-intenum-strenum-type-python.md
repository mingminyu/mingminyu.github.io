---
date: 2025-06-17
authors:
  - mingminyu
categories:
  - 后端开发
tags:
  - Python数据结构
  - Python枚举类型
slug: new-intenum-strenum-type-python
readtime: 5
---

# 新枚举类型：IntEnum与StrEnum

Python 3.11 新增了 `IntEnum` 和 `StrEnum` 两个枚举类型，它们分别继承自 `IntFlag` 和 `Flag` 类，用于创建具有整数或字符串标签的枚举类型。

<!-- more -->

## 1. IntEnum枚举类型

下面代码 `Status` 如果继承的是 `IntEnum`，那么输出的结果是什么？

=== "IntEnum"

    ```python linenums="1" hl_lines="3" title="示例代码"
    from enum import IntEnum

    class Status(IntEnum):
        OK = 200
        NOT_FOUND = 404
        BAD_GETWAY = 502

    status: Status = Status.OK
    print(status)  # 200
    print(status.value)  # 200
    print(status + 100)  # 300
    ```

=== "Enum"

    ```python linenums="1" hl_lines="3" title="示例代码"
    from enum import Enum

    class Status(Enum):
        OK = 200
        NOT_FOUND = 404
        BAD_GETWAY = 502

    status: Status = Status.OK
    print(status)  # Status.OK
    print(status.value)  # 200
    print(status + 100)  # 报错
    ```

## 2. StrEnum枚举类型

类似的，`StrEnum` 类似于 `IntEnum` 类，但是 `StrEnum` 类的成员值必须是字符串，且可以调用字符串自带的方法。

=== "StrEnum"

    可通过使用 `match...case` 语句，避免拼写错误。

    ```python linenums="1" hl_lines="3" title="示例代码"
    from enum import StrEnum

    class Role(StrEnum):
        ADMIN = 'admin'
        EDITOR = 'editor'
        VIEWER = 'viewer'

    role: Role = Role.ADMIN
    print(role)  # admin
    print(role.value)  # admin
    print(role.upper())  # ADMIN

    match role:
        case Role.ADMIN:
            print('Role is Admin')
    ```

=== "auto"

    可通过使用 `match...case` 语句，避免拼写错误。

    ```python linenums="1" hl_lines="3" title="示例代码"
    from enum import StrEnum, auto

    class Role(StrEnum):
        ADMIN = auto()
        EDITOR = auto()
        VIEWER = auto()

    print([r for r in Role])
    ```

=== "Enum"

    ```python linenums="1" hl_lines="3" title="示例代码"
    from enum import Enum

    class Role(Enum):
        ADMIN = 'admin'
        EDITOR = 'editor'
        VIEWER = 'viewer'

    role: Role = Role.ADMIN
    print(role)  # Role.ADMIN
    print(role.value)  # admin
    print(role.upper())  # 报错
    ```