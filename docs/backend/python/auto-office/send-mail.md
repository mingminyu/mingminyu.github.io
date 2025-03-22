# 发送邮件

本文章主要介绍下，如何使用 SMTPLib 库发送具有正文、表格、图片以及附件的邮件。

## 1. 发送简单文本内容

```python linenums="1"
import smtplib
from email.mime.text import MIMEText


subject = "测试邮件"
sender = "robot@ai.com"
reciver = "mingminyu@ai.com"
content = "测试下邮箱是否能发送"
password = "something"

message = MIMEText(content, "plain", "utf8")
message["Subject"] = subject
message["To"] = reciver
message["From"] = sender

smtp = smtplib.SMTP_SSL("smtphz.qiye.163.com", 465, timeout=300)
smtp.login(sender, password)
smtp.sendmail(sender, [reciver], message.as_string())
smtp.close()
```

> 适用于网易云犀企业邮箱。
