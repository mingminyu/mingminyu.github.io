# 其他函数


## 1. hash

## 2. md5

## 3. crc32

## 4. sha2

Hive SHA2 函数支持对字段进行 SHA224、SHA256、SHA384 以及 SHA512 算法加密。

```sql linenums="1"
SELECT sha2('ABC', 0);  -- 表示不做加密

SELECT sha2('ABC', 224);

SELECT sha2('ABC', 256);

SELECT sha2('ABC', 384);

SELECT sha2('ABC', 512);
```

## 5. AES_DECRYPT


## 7. XPATH

## 8. get_json_object

`get_json_object` 函数主要用于从 JSON 格式的字符串中提取想要的信息。

```json linenums="1"
{"store":
  {"fruit": [
    {"weight": 8, "type": "apple"},
    {"weight": 9, "type": "pear"}
    ],
   "bicycle": {"price": 19.95, "color": "red"}
  },
 "email": "amy@only_for_json_udf_test.net",
 "owner": "amy"
}
```

我们通过 `$.` 来提取 JSON 对象的关键词信息，通过 `[0]` 以及 `[1]` 获取列表元素信息。

```sql linenums="1"
> SELECT get_json_object(src_json.json, '$.owner') FROM src_json;
amy

> SELECT get_json_object(src_json.json, '$.store.fruit[0]') FROM src_json;
{"weight": 8, "type": "apple"}

> SELECT get_json_object(src_json.json, '$.non_exist_key') FROM src_json;
NULL
···
