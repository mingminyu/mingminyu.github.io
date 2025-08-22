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

# 三数之和

> LeetCode原题地址: https://leetcode-cn.com/problems/3sum

给你一个包含 `n` 个整数的数组 `nums`，判断 `nums` 中是否存在三个元素 `a`，`b`，`c` ，使得 `a + b + c = 0`，请你找出所有满足条件且不重复的三元组。**注意**，答案中不可以包含重复的三元组。

!!! example "示例"
    
    示例: 给定数组 `nums = [-1, 0, 1, 2, -1, -4]`，满足要求的三元组集合为：

    ```python linenums="1"
    [
        [-1, 0, 1],
        [-1, -1, 2]
    ]
    ```

<!-- more -->

## 1. 暴力循环

```python linenums="1"
def three_sum(nums: list[int]) -> list[list[int]]:
    """返回一个列表，包含所有符合的三元组，且不重复"""    
    sorted_nums = sorted(nums)    
    result = []

    for left in range(0, len(nums) - 2):
        for left2 in range(left + 1, len(nums) - 1):
            diff = 0 - sorted_nums[left] - sorted_nums[left2]
            
            if diff in sorted_nums[left2 + 1:] and [sorted_nums[left], sorted_nums[left2], diff] not in result:
                result.append([sorted_nums[left], sorted_nums[left2], diff])
    
    return result
```

## 2. 双向指针

```python linenums="1"
def threeSum(nums: list[int]) -> list[list[int]]:
    """返回一个列表，包含所有符合的三元组，且不重复"""
    n, result = len(nums), []

    if n < 3 or (n == 3 and sum(nums) != 0):
        return result
    elif n == 3 and sum(nums) == 0:
        result.append(nums)
        return result

    nums = sorted(nums)

    for i in range(n - 2):
        if nums[i] > 0:
            return result
        if i > 0 and nums[i] == nums[i-1]:
            continue
        left = i + 1
        right = n - 1

        while left < right:
            v, lv, rv = nums[i], nums[left], nums[right]
            if v + lv + rv == 0:
                result.append([v, lv, rv])

                while left < right and nums[left] == nums[left + 1]:
                    left += 1

                while left < right and nums[right] == nums[right - 1]:
                    right -= 1

                left += 1
                right -= 1
            elif v + lv + rv > 0:
                right -= 1
            else:
                left += 1

    return result
```
