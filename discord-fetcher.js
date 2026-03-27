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

function handleDiscordUpdate(data) {
    if (!data || Object.keys(data).length === 0) return;

    const { id, avatar, avatar_decoration_data } = data.discord_user;

    const discordPfp = document.querySelector(".discord-pfp");
    const decorationImg = document.querySelector(".discord-decoration");

    // ---------- AVATAR ----------
    const isAnimatedAvatar = avatar && avatar.startsWith("a_");

    const staticAvatar = avatar
        ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`
        : "https://cdn.discordapp.com/embed/avatars/4.png";

    const gifAvatar = isAnimatedAvatar
        ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.gif`
        : null;

    discordPfp.src = staticAvatar;

    if (isAnimatedAvatar) {
        discordPfp.addEventListener("mouseenter", () => {
            discordPfp.src = gifAvatar;
        });

        discordPfp.addEventListener("mouseleave", () => {
            discordPfp.src = staticAvatar;
        });
    }

    // ---------- DECORATION ----------
    if (avatar_decoration_data?.asset) {
        const asset = avatar_decoration_data.asset;

        const decorationUrl = `https://cdn.discordapp.com/avatar-decoration-presets/${asset}`;

        decorationImg.src = decorationUrl;
    } else {
        decorationImg.style.display = "none";
    }

    // STATUS ICON
    discordStatus.src = `./assets/discord/${data.discord_status}.png`;

    // GUILD TAG
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

    // USERNAME & ID
    discordUsername.textContent = data.discord_user.username;
    discordID.textContent = data.discord_user.id;
    
    const priority = ["Spotify", "YouTube Music"];

    // ACTIVITY EXTRACTION
    const activities = data.activities || [];

    activities.sort((a, b) => {
        const aIndex = priority.indexOf(a.name);
        const bIndex = priority.indexOf(b.name);

        const aScore = aIndex === -1 ? 999 : aIndex;
        const bScore = bIndex === -1 ? 999 : bIndex;

        return aScore - bScore;
    });

    const customActivity = activities.find((a) => a.type === 4) || null;
    
    const mediaActivity = priority.includes(activities[0]?.name) ? activities[0] : null;

    if (customActivity) {
        discordActivity.textContent = customActivity.state || "Custom Status";
    } else if (data.listening_to_spotify && mediaActivity?.name === "Spotify") {
        discordActivity.textContent = data.spotify.song;
    } else if (mediaActivity && mediaActivity.name === "YouTube Music") {
        discordActivity.textContent = mediaActivity.details;
    } else if (activities.length > 0) {
        discordActivity.textContent = activities[0].name;
    } else {
        discordActivity.textContent = "Currently doing nothing";
    }

    // CLEAR OLD ACTIVITY CARD
    document.querySelectorAll('.activity-container').forEach(e => e.remove());

    // DO WE SHOW THE CARD?
    const showCard = data.listening_to_spotify || activities.length > 0;

    if (!showCard) {
        return; // NO CARD DISPLAYED
    }

    // CREATE ACTIVITY CARDS
    for (const activity of activities) {
        if (activity.type === 4) continue; // SKIP CUSTOM STATUS (ALREADY SHOWN)
        const activityContainer = document.createElement("div");
        activityContainer.className = "activity-container";
        activityContainer.style = `
        flex-direction: column;
        display: flex;
        width: 100%;
        justify-content: center;
        align-items: center;
        `;

        const hr = document.createElement("hr");
        hr.style = "width: 85%; color: rgba(252, 232, 232, 0.3); margin: 10px;";

        const activityLayout = document.createElement("div");
        activityLayout.className = "activity-layout";
        activityLayout.style = `
        flex-direction: row;
        display: flex;
        width: 100%;
        justify-content: left;
        align-items: center;
        gap: 1rem;
        padding: 6px;
        `;

        const activityContent = document.createElement("div");
        activityContent.className = "activity-content";
        activityContent.style = `
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 4px;
        `;

        // Image containers
        const imageContainer = document.createElement("div");
        imageContainer.className = "activity-content";
        imageContainer.style = `
        display: flex;
        flex-direction: column;
        justify-content: center;
        position: relative;
        `;

        // Large picture (main)
        const largeContainer = document.createElement("div");
        largeContainer.className = "large-activity-content tooltip-container";
        largeContainer.style = `
        display: flex;
        flex-direction: column;
        justify-content: center;
        position: relative;
        `;

        const largeImg = document.createElement("img");
        largeImg.className = "large-activity-image tooltip-trigger";
        largeImg.style = "max-width: 70px; border-radius: 6px; cursor: pointer;";

        const largeTooltip = document.createElement("div");

        // Small picture (corner)
        const smallContainer = document.createElement("div");
        const smallImg = document.createElement("img");
        const smallTooltip = document.createElement("div");

        const line1 = document.createElement("span");
        const line2 = document.createElement("span");
        const line3 = document.createElement("span");

        // SPOTIFY CASE
        if (activity.name === "Spotify") {
            largeImg.src = data.spotify.album_art_url;
            largeImg.onclick = () => {
                window.open(
                    `https://open.spotify.com/track/${data.spotify.track_id}`, // to open app: `spotify:track:${data.spotify.track_id}`
                );
            };
            line1.textContent = "Listening to Spotify";
            line1.style =
                "font-weight: bold; color: rgba(0,240,30,0.8); font-family: var(--secondaryFont);";

            line2.textContent = data.spotify.song;
            line2.style =
                "font-weight: bold; opacity: 0.8; font-family: var(--secondaryFont);";

            line3.textContent = data.spotify.artist;
            line3.style =
                "color: rgba(252,232,232,0.8); font-family: var(--secondaryFont);";

            largeTooltip.className = "large-activity-tooltip tooltip-bubble";
            largeTooltip.style = "bottom: 95%;";
            largeTooltip.innerHTML =
                data.spotify.song + "<br>" + data.spotify.artist;

            // APPEND STRUCTURE
            activityContent.append(line1, line2, line3);
            largeContainer.append(largeImg, largeTooltip);

            imageContainer.append(largeContainer);
            activityLayout.append(imageContainer, activityContent);
            activityContainer.append(hr, activityLayout);

            discordCard.appendChild(activityContainer);
        }

        else if (activity.name === "YouTube Music") {
            url = activity.assets?.large_image;
            const match = url.match(/https\/(.+)/);
            if (match) url = "https://" + match[1];
            largeImg.src = url;
            largeImg.onclick = () => {
                window.open(
                    activity.details_url
                );
            };

            line1.textContent = "Listening to Youtube Music";
            line1.style =
                "font-weight: bold; color: rgba(240, 16, 0, 0.8); font-family: var(--secondaryFont);";

            line2.textContent = activity.details;
            line2.style =
                "font-weight: bold; opacity: 0.8; font-family: var(--secondaryFont);";

            line3.textContent = activity.state;
            line3.style =
                "color: rgba(252,232,232,0.8); font-family: var(--secondaryFont);";

            largeTooltip.className = "large-activity-tooltip tooltip-bubble";
            largeTooltip.style = "bottom: 95%;";
            largeTooltip.innerHTML =
                activity.details + "<br>" + activity.state;

            // APPEND STRUCTURE
            activityContent.append(line1, line2, line3);
            largeContainer.append(largeImg, largeTooltip);

            imageContainer.append(largeContainer);
            activityLayout.append(imageContainer, activityContent);
            activityContainer.append(hr, activityLayout);

            discordCard.appendChild(activityContainer);
        }
        // NORMAL ACTIVITY CASE
        else {

            // LARGE IMAGE
            if (activity.assets?.large_image) {
                if (activity.assets.large_text !== "") {
                    largeTooltip.className =
                        "large-activity-tooltip tooltip-bubble";
                    largeTooltip.style = "bottom: 95%;";
                    largeTooltip.innerHTML = activity.assets.large_text;
                }

                const appId = activity.application_id;
                const imgId = activity.assets.large_image;

                largeImg.src = imgId.includes("mp:")
                    ? extractAndSanitizeUrl(imgId)
                    : `https://cdn.discordapp.com/app-assets/${appId}/${imgId}.webp`;
                if (activity.assets?.small_image) {
                    largeImg.style.cssText += `
                    mask-image: radial-gradient(
                        circle 14px at calc(100% - 10px) calc(100% - 10px),
                        transparent 0 14px,
                        black 15px
                    );
                        -webkit-mask-image: radial-gradient(
                        circle 14px at calc(100% - 10px) calc(100% - 10px),
                        transparent 0 14px,
                        black 15px
                    );
                    `;
                }
            }

            // SMALL IMAGE
            if (activity.assets?.small_image) {
                smallContainer.className =
                    "small-activity-container tooltip-container";
                smallContainer.style = `
                display: flex;
                flex-direction: column;
                justify-content: center;
                position: absolute;
                bottom: -2px;
                right: -2px;
                `;

                smallImg.className = "small-activity-image tooltip-trigger";
                smallImg.style = `
                width: 24px;
                height: 24px;
                object-fit: cover;
                border-radius: 50%;
                `;

                if (activity.assets.small_text !== "") {
                    smallTooltip.className =
                        "small-activity-tooltip tooltip-bubble";
                    smallTooltip.style = "bottom: 110%;";
                    smallTooltip.innerHTML = activity.assets.small_text;
                }

                const appId = activity.application_id;
                const imgId = activity.assets.small_image;

                smallImg.src = imgId.includes("mp:")
                    ? extractAndSanitizeUrl(imgId)
                    : `https://cdn.discordapp.com/app-assets/${appId}/${imgId}.webp`;
            }

            // TEXT LINES
            line1.textContent = activity.name;
            line1.style =
                "font-weight: bold; color: rgba(0,160,255,0.8); font-family: var(--secondaryFont);";

            line2.textContent = activity.details || "";
            line2.style = "opacity: 0.8; font-family: var(--secondaryFont);";

            line3.textContent = activity.state || "";
            line3.style =
                "color: rgba(252,232,232,0.8); font-family: var(--secondaryFont);";

            // APPEND STRUCTURE
            activityContent.append(line1, line2, line3);
            largeContainer.append(largeImg, largeTooltip);
            smallContainer.append(smallImg, smallTooltip);

            imageContainer.append(largeContainer, smallContainer);
            activityLayout.append(imageContainer, activityContent);
            activityContainer.append(hr, activityLayout);

            discordCard.appendChild(activityContainer);
        }
    }
}
