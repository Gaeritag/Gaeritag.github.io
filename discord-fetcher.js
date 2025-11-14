const discordContainer = document.querySelector(
    ".discord-infos-user-container"
);
const discordCard = document.querySelector(".discord-card");
const discordPfp = document.querySelector(".discord-pfp");
const discordUsername = document.getElementById("discord-username");
const discordID = document.getElementById("discord-id");
const discordActivity = document.getElementById("activity");
const discordStatus = document.querySelector(".discord-icon-status");

lanyard({
    userId: "1278421106122031206",
    socket: true,
    onPresenceUpdate: handleDiscordUpdate,
});

function extractAndSanitizeUrl(input) {
    const urlPattern = /(https?\/[^\s]+)/;
    const match = input.match(urlPattern);
    return match ? match[0].replace("https/", "https://") : null;
}

function isEmpty(obj) {
    for (const prop in obj) {
        if (Object.hasOwn(obj, prop)) return false;
    }
    return true;
}

function handleDiscordUpdate(data) {
    if (!data || Object.keys(data).length === 0) return;

    // --- Update profile picture ---
    discordPfp.src = data.discord_user.avatar
        ? `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.webp`
        : "https://cdn.discordapp.com/embed/avatars/4.png";

    // --- Update status ---
    discordStatus.src = `./assets/discord/${data.discord_status}.png`;

    // --- Handle guild tag ---
    const discordBadgeExisting = discordContainer.querySelector(
        ".discord-infos-user-guild-tag"
    );

    if (
        data.discord_user.primary_guild &&
        data.discord_user.primary_guild.identity_enabled
    ) {
        if (!discordBadgeExisting) {
            const div = document.createElement("div");
            div.className = "discord-infos-user-guild-tag";

            const img = document.createElement("img");
            img.alt = "Guild Tag Icon";
            img.src = `https://cdn.discordapp.com/clan-badges/${data.discord_user.primary_guild.identity_guild_id}/${data.discord_user.primary_guild.badge}.png`;

            const span = document.createElement("span");
            span.textContent = data.discord_user.primary_guild.tag;

            div.append(img, span);
            discordContainer.appendChild(div);
        }
    } else if (discordBadgeExisting) {
        discordBadgeExisting.remove();
    }

    // --- Update username and ID ---
    discordUsername.textContent = data.discord_user.username;
    discordID.textContent = data.discord_user.id;

    // --- Update main activity text ---
    if (data.activities?.length) {
        const activity =
            data.activities[0]?.id === "custom"
                ? data.activities[1] ?? data.activities[0]
                : data.activities[0];
        console.log(data)

        if (data.listening_to_spotify) {
            discordActivity.textContent = data.activities[0]?.id === "custom"
                ? data.activities[0].state
                : data.spotify.song
        } else {
            discordActivity.textContent = data.activities[0]?.id === "custom"
                ? data.activities[0].state
                : "Currently doing nothing"
        }
    } else {
        discordActivity.textContent = "Currently doing nothing";
    }

    // --- Remove old activity container ---
    document
        .querySelectorAll(".activity-container")
        .forEach((el) => el.remove());

    // --- Create new activity container ---
    const activityContainer = document.createElement("div");
    activityContainer.className = "activity-container";
    activityContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      width: 100%;
      justify-content: center;
      align-items: center;
    `;

    const hr = document.createElement("hr");
    hr.style.cssText = "width: 85%; color: rgba(252, 232, 232, 0.3); margin: 10px;";

    const activityLayout = document.createElement("div");
    activityLayout.className = "activity-layout";
    activityLayout.style.cssText = `
      display: flex;
      flex-direction: row;
      width: 100%;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      padding: 6px;
    `;

    const activityContent = document.createElement("div");
    activityContent.className = "activity-content";
    activityContent.style.cssText = `
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 4px;
    `;

    // --- Images container ---
    const activityImageContainer = document.createElement("div");
    activityImageContainer.className = "activity-image-container";
    activityImageContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
    `;

    // --- Create lines ---
    const line1 = document.createElement("span");
    const line2 = document.createElement("span");
    const line3 = document.createElement("span");

    // --- Large activity ---
    const largeActivityContainer = document.createElement("div");
    largeActivityContainer.className = "large-activity-container tooltip-container";
    largeActivityContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
    `;

    const largeActivityImage = document.createElement("img");
    largeActivityImage.className = "large-activity-image tooltip-trigger";
    largeActivityImage.style.cssText = "max-width: 70px; border-radius: 6px;";

    const largeActivityTooltip = document.createElement("div");
    largeActivityTooltip.className = "tooltip-bubble";

    // --- Small activity ---
    const smallActivityContainer = document.createElement("div");
    const smallActivityImage = document.createElement("img");
    const smallActivityTooltip = document.createElement("div");
    smallActivityTooltip.className = "tooltip-bubble";

    // --- Fill content based on activity ---
    if (data.listening_to_spotify) {
        // Spotify
        largeActivityImage.src = data.spotify.album_art_url;

        line1.textContent = "Listening to Spotify";
        line1.style.cssText = "font-weight: bold; color: rgba(0,240,30,0.8); font-family: var(--secondaryFont);";

        line2.textContent = data.spotify.song;
        line2.style.cssText = "font-weight: bold; opacity: 0.8; font-family: var(--secondaryFont);";

        line3.textContent = data.spotify.artist;
        line3.style.cssText = "color: rgba(252,232,232,0.8); font-family: var(--secondaryFont);";

        largeActivityTooltip.textContent = `${data.spotify.song}\n${data.spotify.artist}`;
    } else if (data.activities?.length) {
        const activity =
            data.activities[0]?.id === "custom"
                ? data.activities[1] ?? data.activities[0]
                : data.activities[0];

        // Large image
        if (activity.assets?.large_image) {
            largeActivityImage.src = activity.assets.large_image.includes("mp:")
                ? extractAndSanitizeUrl(activity.assets.large_image)
                : `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.large_image}.webp`;

            if (activity.assets.large_text) {
                largeActivityTooltip.textContent = activity.assets.large_text;
            }
        }

        // Small image
        if (activity.assets?.small_image) {
            smallActivityContainer.className = "small-activity-container tooltip-container";
            smallActivityContainer.style.cssText = `
              display: flex;
              flex-direction: column;
              justify-content: center;
              position: absolute;
              bottom: -2px;
              right: -2px;
            `;

            smallActivityImage.className = "small-activity-image tooltip-trigger";
            smallActivityImage.style.cssText = `
              width: 24px;
              height: 24px;
              object-fit: cover;
              border-radius: 50%;
            `;

            if (activity.assets.small_text) {
                smallActivityTooltip.textContent = activity.assets.small_text;
            }

            smallActivityImage.src = activity.assets.small_image.includes("mp:")
                ? extractAndSanitizeUrl(activity.assets.small_image)
                : `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.small_image}.webp`;

            smallActivityContainer.append(
                smallActivityImage,
                smallActivityTooltip
            );
        }

        // Text lines
        line1.textContent = activity.name;
        line1.style.cssText = "font-weight: bold; color: rgba(0,160,255,0.8); font-family: var(--secondaryFont);";
        line2.textContent = activity.details || "";
        line2.style.cssText = "opacity: 0.8; font-family: var(--secondaryFont);";
        line3.textContent = activity.state || "";
        line3.style.cssText = "color: rgba(252,232,232,0.8); font-family: var(--secondaryFont);";
    }

    // --- Append elements ---
    if (data.activities?.length > 0) {
        if ((data.activities.length > 0 && data.activities[0].id != "custom") || data.listening_to_spotify) {
            activityContent.append(line1, line2, line3);
            largeActivityContainer.append(largeActivityImage, largeActivityTooltip);
            activityImageContainer.append(largeActivityContainer);
        }
    }

    if (smallActivityContainer.childNodes.length > 0) {
        activityImageContainer.append(smallActivityContainer);
    }

    if (data.activities?.length > 0) {
        if (data.activities.length > 0 && data.activities[0].id != "custom" || data.listening_to_spotify) {
            activityLayout.append(activityImageContainer, activityContent);
            activityContainer.append(hr, activityLayout);

            // --- Add to card ---
            discordCard.appendChild(activityContainer);
        }
    }
    console.error(data)

    // --- Initialize tooltips ---
    initTooltips();
}

// --- Helper function for tooltips ---
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
