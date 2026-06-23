document.addEventListener("DOMContentLoaded", () => {

  const path = window.location.pathname;

  if (path.endsWith("/login/")) {
    return;
  }

  const ok = sessionStorage.getItem(
    "authenticated"
  );

  if (!ok) {
    location.href = "/login/";
  }

});