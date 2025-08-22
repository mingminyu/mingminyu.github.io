---
date: 2025-08-22
authors:
  - mingminyu
categories:
  - LeetCode
tags:
  - 算法
readtime: 2
---

# 两数之和

> LeetCode原题地址: https://leetcode-cn.com/problems/add-two-numbers

给出两个**非空**的链表用来表示两个非负的整数。其中，它们各自的位数是按照**逆序**的方式存储的，并且它们的每个节点只能存储**一位**数字。

如果，我们将这两个数相加起来，则会返回一个新的链表来表示它们的和。您可以假设除了数字 0 之外，这两个数都不会以 0 开头。

!!! example "示例"

    - **输入**: (2 -> 4 -> 3) + (5 -> 6 -> 4)
    - **输出**: 7 -> 0 -> 8
    - **原因**: 342 + 465 = 807

<!-- more -->

## 1. 自我尝试

```python linenums="1"
class ListNode:
    def __init__(self, x: int):
        self.val = x
        self.next = None


def add_two_numbers(l1: ListNode, l2: ListNode) -> ListNode:
    """将两个逆序链表相加，返回新的逆序链表

    :param l1: 逆序链表 l1, 示例 [2, 4, 3]
    :param l2: 逆序链表 l2, 示例 [5, 6, 4]
    :return: 逆序链表
    """
    def gen_list_node(i):
        if i == (len(result) - 1):
            return ListNode(result[i])
            
        a = ListNode(result[i])
        a.next = gen_list_node(i + 1)
        return a
                
    str_l1, str_l2 = '', ''
    while hasattr(l1, 'val'):
        str_l1 += str(l1.val)
        l1 = l1.next

    while hasattr(l2, 'val'):
        str_l2 += str(l2.val)
        l2 = l2.next

    sum1 = int(str_l1[::-1]) + int(str_l2[::-1])
    result = []

    if sum1 != 0:
        sum2 = str(sum1)
        for i in range(len(sum2) - 1, -1, -1):
            result.append(int(sum2[i]))
    else:
        return ListNode(0)

    res_ = gen_list_node(0)

    return res_
```

## 2. 其他解法

=== "解法一"

    ```python linenums="1"
    class ListNode:
        def __init__(self, x: int):
            self.val = x
            self.next = None

    def add_two_numbers(l1: ListNode, l2: ListNode) -> ListNode:
        """
        将两个逆序链表相加，返回新的逆序链表
        :param l1: 逆序链表 l1, 示例 [2, 4, 3]
        :param l2: 逆序链表 l2, 示例 [5, 6, 4]
        :return: 逆序链表
        """
        new_node = ListNode(0)
        ans_node = new_node

        flag = 0
        while l1.val >= 0 or l2.val >= 0:
            x = l1.val if l1.val >= 0 else 0
            y = l2.val if l2.val >= 0 else 0
            sum = x + y + flag
            flag = sum // 10
            new_node.val = sum % 10
            l1 = l1.next if l1.next else ListNode(-1)
            l2 = l2.next if l2.next else ListNode(-1)

            if l1.val >= 0 or l2.val >= 0 or flag:
                new_node.next = ListNode(0)
                new_node = new_node.next
        
        if flag == 1:
            new_node.val = 1
        
        return ans_node
    ```

=== "解法二"

    ```python linenums="1"
    class ListNode:
        def __init__(self, x: int):
            self.val = x
            self.next = None

    def add_two_numbers(l1: ListNode, l2: ListNode) -> ListNode:
        """
        将两个逆序链表相加，返回新的逆序链表
        :param l1: 逆序链表 l1, 示例 [2, 4, 3]
        :param l2: 逆序链表 l2, 示例 [5, 6, 4]
        :return: 逆序链表
        """
        new_node = ListNode(0)
        ans_node = new_node
        
        flag = -1
        while l1 or l2 or flag:
            if flag != -1:
                new_node.next = ListNode(0)
                new_node = new_node.next
            else:
                flag = 0
            
            if l1 and l2:
                sum_ = l1.val+l2.val
                l1 = l1.next
                l2 = l2.next
            elif l1:
                sum_ = l1.val
                l1 = l1.next
            elif l2:
                sum_ = l2.val
                l2 = l2.next
            else:
                sum_ = 0
            
            new_node.val = (sum_ + 1) % 10 if flag == 1 else sum_ % 10
            flag = 1 if sum_ + flag > 9 else 0
            
        return ans_node
    ```

=== "解法三"

    ```python linenums="1"
    class ListNode:
        def __init__(self, x: int):
            self.val = x
            self.next = None

    def add_two_numbers(l1: ListNode, l2: ListNode) -> ListNode:
        """
        将两个逆序链表相加，返回新的逆序链表
        :param l1: 逆序链表 l1, 示例 [2, 4, 3]
        :param l2: 逆序链表 l2, 示例 [5, 6, 4]
        :return: 逆序链表
        """
        re = ListNode(0)
        r = re
        carry = 0
        
        while (l1 or l2):
            x = l1.val if l1 else 0
            y = l2.val if l2 else 0
            s = carry + x + y
            carry = s // 10
            r.next = ListNode(s % 10)
            r = r.next
            if (l1 != None): l1 = l1.next
            if (l2 != None): l2 = l2.next
        
        if (carry > 0):
            r.next = ListNode(1)

        return re.next
    ```