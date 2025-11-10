document.addEventListener("DOMContentLoaded", () => {
    const word = "gaeritag";
    const typingSpeed = 400;
    const pauseTime = 0;
    let i = 0;
    let direction = 1;

    function updateTitle() {
        const visible = word.substring(0, i);
        document.title = "@" + visible;

        if (direction === 1 && i === word.length) {
            direction = -1;
            setTimeout(updateTitle, pauseTime);
            return;
        }
        if (direction === -1 && i === 0) {
            direction = 1;
            setTimeout(updateTitle, pauseTime);
            return;
        }

        i += direction;
        setTimeout(updateTitle, document.hidden ? 1000 : typingSpeed);
    }

    updateTitle();
});