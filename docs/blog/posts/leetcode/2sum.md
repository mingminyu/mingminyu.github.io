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

> LeetCode原题地址: https://leetcode-cn.com/problems/two-sum

给定一个整数数组 `nums` 和一个目标值 `target`，请在该数组中找出和为目标值的那 **两个** 整数，并返回他们的数组下标。你可以假设每种输入只会对应一个答案。但是，你不能重复利用这个数组中同样的元素。

!!! example "示例"

    给定 `nums = [2, 7, 11, 15]`, `target = 9`，因为 `nums[0] + nums[1] = 2 + 7 = 9`，所以返回 `[0, 1]`。

## 1. 暴力解法

```python linenums="1"
def two_sum(nums: list[int], target: int) -> list[int]:
    for i, e in enumerate(nums):
        if target - e in nums[i + 1:]:
            return([i, i + 1 + nums[i + 1:].index(target - e)])
```

## 2. 列表推导式

```python linenums="1"
def two_sum(nums: list[int], target: int) -> list[int]:
    result = [
        [i, i + 1 + nums[i + 1:].index(target - e)] 
        for i, e in enumerate(nums) if target - e in nums[i + 1:]
    ]
    return  result[0] if len(result) > 0 else None
```

## 3. 排序

思路：先对数组进行排序，然后使用双指针进行查找。

```python linenums="1"
def two_sum(nums: list[int], target: int) -> list[int]:
    sorted_id_nums = sorted(range(len(nums)), key=lambda x: nums[x])
    left = 0
    right = len(nums) - 1

    while left < right:
        two_sum = nums[sorted_id_nums[left]] + nums[sorted_id_nums[right]]
        if two_sum == target:
            return [sorted_id_nums[left], sorted_id_nums[right]]
        elif two_sum < target:
            left += 1
        elif two_sum > target:
            right -= 1
```

## 4. 哈希求解

```python linenums="1"
def two_sum(nums: list[int], target: int) -> list[int]:
    hashmap = {}

    for i, e in enumerate(nums):
        diff = target - e

        if diff in hashmap:
            return [hashmap.get(diff), i]

        hashmap[e] = i
```

### 5. 排序+哈希

```python linenums="1"
def two_sum(nums: list[int], target: int) -> list[int]:
    hashmap = {}
    sorted_id_nums = sorted(range(len(nums)), key=lambda x: nums[x])
    left, right = 0, len(nums) - 1

    while left <= right:
        lv = nums[sorted_id_nums[left]]
        rv = nums[sorted_id_nums[right]]
        ldiff = target - lv
        rdiff = target - rv

        if ldiff in hashmap:

            return [hashmap.get(ldiff), sorted_id_nums[left]]
        else:
            hashmap[lv] = sorted_id_nums[left]

        if rdiff in hashmap:
            return [hashmap.get(rdiff), sorted_id_nums[right]]
        else:
            hashmap[rv] = sorted_id_nums[right]

        left += 1
        right -= 1
```