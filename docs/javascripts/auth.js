document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

  // 1. 如果当前已经在登录页，直接放行，避免死循环
  if (path.endsWith("/login/")) {
    return;
  }

  // 2. 从 localStorage 获取认证状态和过期时间
  const auth = localStorage.getItem("authenticated");
  const expiryTime = localStorage.getItem("expiryTime");

  // 3. 定义一个辅助函数用于清除登录状态
  const clearAuth = () => {
    localStorage.removeItem("authenticated");
    localStorage.removeItem("expiryTime");
  };

  // 4. 判断是否允许访问
  let isAllowed = false;

  if (auth === "true" && expiryTime) {
    // 检查当前时间是否小于过期时间（即未过期）
    if (Date.now() < parseInt(expiryTime, 10)) {
      isAllowed = true;
    } else {
      // 已过期，清除状态
      clearAuth();
    }
  } else {
    // 状态或时间戳缺失，清除状态
    clearAuth();
  }

  // 5. 如果没有访问权限，重定向到登录页
  if (!isAllowed) {
    location.href = "/login/";
  }
});