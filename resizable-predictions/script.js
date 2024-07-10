const resizeHandle = document.querySelector(".resize-handle");
const menuContent = document.querySelector(".menu-content");
let startY, startHeight;

resizeHandle.addEventListener("mousedown", initResize, false);

function initResize(e) {
  startY = e.clientY;
  startHeight = parseInt(document.defaultView.getComputedStyle(menuContent).height, 10);
  document.documentElement.addEventListener("mousemove", resize, false);
  document.documentElement.addEventListener("mouseup", stopResize, false);
}

function resize(e) {
  const newHeight = startHeight + e.clientY - startY;
  menuContent.style.height = newHeight + "px";
}

function stopResize() {
  document.documentElement.removeEventListener("mousemove", resize, false);
  document.documentElement.removeEventListener("mouseup", stopResize, false);
  adjustHeight();
}

function adjustHeight() {
  const items = menuContent.querySelectorAll("a");
  const menuHeight = menuContent.clientHeight;
  let totalHeight = 0;
  let lastFullyVisibleIndex = -1;

  for (let i = 0; i < items.length; i++) {
    const itemHeight = items[i].offsetHeight;
    if (totalHeight + itemHeight <= menuHeight) {
      totalHeight += itemHeight;
      lastFullyVisibleIndex = i;
    } else {
      const visiblePortion = menuHeight - totalHeight;
      const visibilityPercentage = visiblePortion / itemHeight;
      if (visibilityPercentage >= 0.5) {
        totalHeight += itemHeight;
        lastFullyVisibleIndex = i;
      }
      break;
    }
  }

  menuContent.style.height = totalHeight + "px";
}
