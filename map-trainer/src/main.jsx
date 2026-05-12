import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Запрещаем зум всей страницы на iOS Safari (gesturestart) и Android (touchmove с 2+ пальцами)
document.addEventListener("gesturestart", (e) => e.preventDefault(), { passive: false });
document.addEventListener("gesturechange", (e) => e.preventDefault(), { passive: false });
document.addEventListener("gestureend", (e) => e.preventDefault(), { passive: false });

// Блокируем pinch-to-zoom на уровне документа (2+ пальца вне карты)
document.addEventListener("touchmove", (e) => {
  if (e.touches.length > 1) {
    // Разрешаем pinch только внутри контейнера карты (.map-col)
    const target = e.target;
    const mapCol = target.closest(".map-col");
    if (!mapCol) {
      e.preventDefault();
    }
  }
}, { passive: false });

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
