# 用户验证

NiceGUI 官方文档上给出了一个[用户登录验证](https://github.com/zauberzeug/nicegui/blob/main/examples/authentication)的简单示例，接下来我们剖析一下源码，并在原有基础上做一下完善。

!!! warning "切勿应用于生产环境"

    该示例为非常简单的用户登录验证操作，实际生产环境要业务验证逻辑要复杂的多，建议可以参考 FastAPI [Simple-OAuth2](https://fastapi.tiangolo.com/tutorial/security/simple-oauth) 或者 [Authlib](https://docs.authlib.org/en/v0.13/client/starlette.html#using-fastapi)。

## 1. 验证中间件

我们肯定是想要在很多路由上都添加上用户登录验证的国功能（类似于装饰器），这样防止用户能通过浏览器输入 URL 就能直接访问的具体页面内容。示例通过封装 **`AuthMiddleware` 中间件**，来限制所有 NiceGUI 所有页面必须满足验证要求。

```python linenums="1"
from typing import Optional, Callable
from fastapi import Request
from fastapi.responses import RedirectResponse
from starlette.middleware.base import BaseHTTPMiddleware
from nicegui import app, ui


class AuthMiddleware(BaseHTTPMiddleware):
    """如果用户登录验证不成功，那么直接跳转到登录页面"""

    unrestricted_page_routes = {'/login'}

    async def dispatch(self, request: Request, call_next: Callable):
        if not app.storage.user.get('authenticated', False):

            if not request.url.path.startswith('/_nicegui') and 
                request.url.path not in self.unrestricted_page_routes:
                # 存储用户真正想要访问的 URL 信息
                app.storage.user['referrer_path'] = request.url.path
                return RedirectResponse('/login')

        return await call_next(request)


app.add_middleware(AuthMiddleware)
```

## 2. 登录验证页


```python linenums="1"
userinfo = [
    {"name": "admin", "mail": "", "password": "admin", "role": "admin", "dept": ""}
]  # (1)!


@ui.page('/login')
def login() -> Optional[RedirectResponse]:
    def _try_login():  # local function to avoid passing username and password as arguments
        if passwords.get(username.value) == password.value:
            app.storage.user.update({'username': username.value, 'authenticated': True})
            ui.navigate.to(app.storage.user.get('referrer_path', '/'))  # go back to where the user wanted to go
        else:
            ui.notify("用户或密码错误！", color='negative')

    if app.storage.user.get('authenticated', False):
        return RedirectResponse('/')
    
    with ui.card().classes('absolute-center'):
        username = ui.input('账号或邮箱').on('keydown.enter', try_login)
        password = ui.input('密码', password=True, password_toggle_button=True).on('keydown.enter', _try_login)
        ui.button('登录', on_click=try_login)
    
    return None
```

    1. 这里我们将用户信息以字典的方式直接写死，实际业务中还是需要根据输入账号以及密码信息去数据库中进行查询，返回验证结果信息。
