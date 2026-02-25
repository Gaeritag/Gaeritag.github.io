function initTooltip(container) {
    const trigger = container.querySelector(".tooltip-trigger");
    const bubble = container.querySelector(".tooltip-bubble");
    if (!trigger || !bubble || trigger.dataset.tooltipInit) return;

    trigger.dataset.tooltipInit = "true";

    let hideTimeout;

    const hideBubble = () => {
        hideTimeout = setTimeout(() => {
            bubble.classList.remove("visible");
        }, 100);
    };

    const showBubble = () => {
        clearTimeout(hideTimeout);
        bubble.classList.add("visible");
    };

    trigger.addEventListener("mouseenter", showBubble);
    bubble.addEventListener("mouseenter", showBubble);

    trigger.addEventListener("mouseleave", () => {
        if (!bubble.matches(":hover")) hideBubble();
    });

    bubble.addEventListener("mouseleave", () => {
        if (!trigger.matches(":hover")) hideBubble();
    });
}

// Init initial
document.querySelectorAll(".tooltip-container").forEach(initTooltip);

// Observer optimisé
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
            if (!(node instanceof HTMLElement)) return;

            // Si le node EST un tooltip
            if (node.classList?.contains("tooltip-container")) {
                initTooltip(node);
            }

            // Si le node CONTIENT des tooltips
            node.querySelectorAll?.(".tooltip-container").forEach(initTooltip);
        });
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
});