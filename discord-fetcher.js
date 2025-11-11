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
    if (isEmpty(data)) return;

    // Update profile picture
    if (data.discord_user.avatar == null) {
        discordPfp.src = "https://cdn.discordapp.com/embed/avatars/4.png";
    } else {
        discordPfp.src = `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.webp`;
    }

    // Update status
    discordStatus.src = `./assets/discord/${data.discord_status}.png`;

    // Handle guild tag logic
    const discordBadgeExisting = discordContainer.querySelector(
        ".discord-infos-user-guild-tag"
    );
    console.log(data);
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

    // Handle username and id
    discordUsername.innerHTML = data.discord_user.username;
    discordID.innerHTML = data.discord_user.id;
    console.log(data.activities.length != 0);
    // Handle activities
    if (data.activities.length != 0) {
        if (data.activities[0]?.id == "custom") {
            discordActivity.innerHTML = data.activities[0]?.state;
        } else if (data.listening_to_spotify) {
            discordActivity.innerHTML = data.spotify.song;
        } else {
            discordActivity.innerHTML = data.activities[0]?.name;
        }
    } else {
        discordActivity.innerHTML = "Currently doing nothing";
    }

    const existing = document.querySelector(".activity-container");
    if (existing) existing.remove();

    // Create base container
    const activityContainer = document.createElement("div");
    activityContainer.className = "activity-container"; // keep name for consistency
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
      justify-content: center;
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

    const activityImage = document.createElement("img");
    activityImage.className = "activity-image";
    activityImage.style = "max-width: 70px; border-radius: 6px;";

    const line1 = document.createElement("span"); // Title (app name)
    const line2 = document.createElement("span"); // State or artist
    const line3 = document.createElement("span"); // Details or song title

    // --- Handle Spotify case ---
    if (data.listening_to_spotify) {
        activityImage.src = data.spotify.album_art_url;

        line1.textContent = "Listening to Spotify";
        line1.style =
            "font-weight: bold; color: rgba(0,240,30,0.8); font-family: var(--secondaryFont);";

        line2.textContent = data.spotify.song;
        line2.style =
            "font-weight: bold; opacity: 0.8; font-family: var(--secondaryFont);";

        line3.textContent = data.spotify.artist;
        line3.style =
            "color: rgba(252,232,232,0.8); font-family: var(--secondaryFont);";
    }

    // --- Handle any other activity ---
    else if (data.activities && data.activities.length > 0) {
        const activity =
            data.activities[data.activities[0].id == "custom" ? 1 : 0];

        // Large image
        if (activity.assets?.large_image) {
            const appId = activity.application_id;
            const imgId = activity.assets.large_image; // clean
            activityImage.src = imgId.includes("mp:")
                ? extractAndSanitizeUrl(imgId)
                : `https://cdn.discordapp.com/app-assets/${appId}/${imgId}.webp`;
        } else {
            activityImage.src =
                "https://cdn.discordapp.com/embed/avatars/0.png"; // fallback
        }

        // Title line — app name
        line1.textContent = activity.name;
        line1.style =
            "font-weight: bold; color: rgba(0,160,255,0.8); font-family: var(--secondaryFont);";

        // State line (optional)
        line2.textContent = activity.details || "";
        line2.style = "opacity: 0.8; font-family: var(--secondaryFont);";

        // Details line (optional)
        line3.textContent = activity.state || "";
        line3.style =
            "color: rgba(252,232,232,0.8); font-family: var(--secondaryFont);";

        activityContent.append(line1, line2, line3);
        activityLayout.append(activityImage, activityContent);
        activityContainer.append(hr, activityLayout);

        // Add to your card
        discordCard.appendChild(activityContainer);
    }
}


