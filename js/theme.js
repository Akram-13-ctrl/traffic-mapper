// Theme Manager for Global Light/Dark Mode
export function getTheme() {
  const saved = localStorage.getItem("app_theme");
  if (saved === "dark" || saved === "light") {
    return saved;
  }
  // Default to system preference if user hasn't explicitly chosen
  if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  localStorage.setItem("app_theme", theme);
  window.dispatchEvent(new CustomEvent("themeChange", { detail: { theme } }));
}

export function toggleTheme() {
  const current = getTheme();
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}

export function initTheme() {
  const saved = getTheme();
  applyTheme(saved);
}

// Auto-run initTheme on module execution
initTheme();
