# 安装

## 1. 自动安装

## 2. 手动安装

## 3. 运行开发服务器


???+ note "补充"

    服务开启后，打开控制台发现出现以下警告：

    ```bash title="Console"
    Warning: Extra attributes from the server: class
    ...
    ```

    这是因为浏览器安装了一些插件导致的，如果想要去除掉该警告，在如下文件中添加 `suppressHydrationWarning={true}`

    ```html title="src/app/layout.tsx" hl_lines="1"
    <html lang="en" suppressHydrationWarning={true}>
        <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
    </html>
    ```

    通常情况下，不建议关闭此警告。


