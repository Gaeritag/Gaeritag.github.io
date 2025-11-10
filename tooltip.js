document.querySelectorAll(".tooltip-container").forEach((container) => {
    const trigger = container.querySelector(".tooltip-trigger");
    const bubble = container.querySelector(".tooltip-bubble");

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
