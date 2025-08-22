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

# 无重复字符的最长子串

给定一个字符串，请找出其中不含有重复字符的最长子串的长度。

| 序号 | 输入 | 输出 | 解释 |
| --- | --- | --- | --- |
| 1 | "abcabcbb" | 3 | 因为无重复字符的最长子串是 "abc"，所以其长度为 3。 |
| 2 | "bbbbb" | 1 | 因为无重复字符的最长子串是 "b"，所以其长度为 1。 |
| 3 | "pwwkew" | 3 | 因为无重复字符的最长子串是 "wke"，所以其长度为 3。请注意，你的答案必须是 子串 的长度，"pwke" 是一个子序列，不是子串。 |

<!-- more -->

```python linenums="1"
def lengthOfLongestSubstring(s: str) -> int:
    """根据输入字符串，返回不重复最长子串的长度
    
    :param s: 输入字符串
    :return: 字串长度
    """
    cnt = 0
    if len(s) == 0:
        return 0
    elif len(s) == 1:
        return 1

    for i in range(0, len(s) - 1):
        flag = 0
        sub_s = s[i]
        for j in range(i + 1, len(s)):
            if flag == 0 and s[j] not in sub_s:
                sub_s += s[j]
            else:
                break

    	cnt = len(sub_s) if len(sub_s) > cnt else cnt

    return cnt
```
