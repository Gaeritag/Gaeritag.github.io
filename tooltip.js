function initTooltips() {
  document.querySelectorAll(".tooltip-container").forEach((container) => {
    const trigger = container.querySelector(".tooltip-trigger");
    const bubble = container.querySelector(".tooltip-bubble");
    if (!trigger || !bubble || trigger.dataset.tooltipInit) return;

    trigger.dataset.tooltipInit = "true";

    const showBubble = () => bubble.classList.add("visible");
    const hideBubble = () => bubble.classList.remove("visible");

    trigger.addEventListener("mouseenter", showBubble);
    bubble.addEventListener("mouseenter", showBubble);

    trigger.addEventListener("mouseleave", () => {
      setTimeout(() => {
        if (!bubble.matches(":hover")) hideBubble();
      }, 50);
    });

    bubble.addEventListener("mouseleave", () => {
      setTimeout(() => {
        if (!trigger.matches(":hover")) hideBubble();
      }, 50);
    });
  });
}


const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    mutation.addedNodes.forEach((node) => {
      if (!(node instanceof HTMLElement)) return;

      if (node.classList?.contains("tooltip-container")) {
        initTooltips();
      }

      if (node.querySelectorAll) {
        const hasTooltips = node.querySelectorAll(".tooltip-container");
        if (hasTooltips.length > 0) initTooltips();
      }
    });
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});