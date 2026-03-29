const discordContainer = document.querySelector(".discord-container");
const discordInfosUserContainer = document.querySelector(".discord-infos-user-container");
const discordCard = document.querySelector(".discord-card");
const discordPfp = document.querySelector(".discord-pfp");
const decorationImg = document.querySelector(".discord-decoration");
const discordUsername = document.getElementById("discord-username");
const discordID = document.getElementById("discord-id");
const discordActivity = document.getElementById("activity");
const discordStatus = document.querySelector(".discord-icon-status");

const id = "1278421106122031206";

lanyard({
    userId: id,
    socket: true,
    onPresenceUpdate: handleDiscordUpdate,
});

function extractAndSanitizeUrl(input) {
    const urlPattern = /(https?\/[^\s]+)/;
    const match = input.match(urlPattern);
    return match ? match[0].replace("https/", "https://") : null;
}

async function fetchDiscordData() {
    let profileData;
    const url = `https://dcdn.dstn.to/profile/${id}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        profileData = await response.json();
    } catch (error) {
        console.error(error.message);
        return;
    }
    return profileData;
}

async function handleDiscordUpdate(data) {
    if (!data || Object.keys(data).length === 0) return;
    const profileData = await fetchDiscordData();

    // Username and ID
    discordUsername.textContent = profileData.user.username;
    discordID.textContent = profileData.user.id;

    // Status
    discordStatus.src = `./assets/discord/${data.discord_status}.png`;

    // Avatar
    const avatar = profileData.user.avatar;

    const isAnimatedAvatar = avatar.startsWith("a_");

    const staticAvatar = `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`;
    const animatedAvatar = `https://cdn.discordapp.com/avatars/${id}/${avatar}.gif`;

    discordPfp.src = isAnimatedAvatar
        ? animatedAvatar
        : staticAvatar;

    if (isAnimatedAvatar) {
        discordPfp.addEventListener("mouseenter", () => {
            discordPfp.src = animatedAvatar;
        });

        discordPfp.addEventListener("mouseleave", () => {
            discordPfp.src = staticAvatar;
        });
    }

    // Decoration
    const avatar_decoration_data = profileData.user.avatar_decoration_data;
    const avatar_decoration_id = avatar_decoration_data?.asset;
    if (avatar_decoration_id) {
        decorationImg.src = `https://cdn.discordapp.com/avatar-decoration-presets/${avatar_decoration_id}`;
    } else {
        decorationImg.style.display = "none";
    }

    // Banner
    // const bannerImg = document.querySelector(".discord-banner-image");
    // const banner = profileData.user_profile.banner;
    // const isAnimatedBanner = banner?.startsWith("a_");
    // if (banner) {
    //     const bannerUrl = isAnimatedBanner
    //     ? `https://cdn.discordapp.com/banners/${id}/${banner}.gif?size=1024`
    //     : `https://cdn.discordapp.com/banners/${id}/${banner}.png?size=1024`;
    //     bannerImg.src = bannerUrl;
    // }

    // Nameplate
    const nameplate = document.createElement("video")
    nameplate.autoplay = true
    nameplate.loop = true
    nameplate.className = "discord-nameplate"
    if (profileData.user.collectibles?.nameplate?.sku_id) {
        nameplate.src = `https://cdn.discordapp.com/media/v1/collectibles-shop/${profileData.user.collectibles?.nameplate?.sku_id}/video`
    }
    if (!discordContainer.querySelector('.discord-nameplate')) {
        discordContainer.appendChild(nameplate)
    }
    // Guild tag
    const discordBadgeExisting = discordInfosUserContainer.querySelector(
        ".discord-infos-user-guild-tag"
    );

    const guild = profileData.user.primary_guild;
    const guildId = guild?.identity_guild_id;
    const guildBadge = guild?.badge;

    if (guildId) {
        if (!discordBadgeExisting) {
            const div = document.createElement("div");
            div.className = "discord-infos-user-guild-tag";

            const img = document.createElement("img");
            img.alt = "Guild Tag Icon";
            img.src = `https://cdn.discordapp.com/clan-badges/${guildId}/${guildBadge}.png`;

            const span = document.createElement("span");
            span.textContent = profileData.user.primary_guild.tag;

            div.append(img, span);
            discordInfosUserContainer.appendChild(div);
        }
    } else if (discordBadgeExisting) {
        discordBadgeExisting.remove();
    }

    // Activities
    const priority = ["Spotify", "YouTube Music"];

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

    document.querySelectorAll('.discord-activity-container').forEach(e => e.remove());

    const showCard = data.listening_to_spotify || activities.length > 0;

    if (!showCard) {
        return;
    }

    for (const activity of activities) {
        if (activity.type === 4) continue; // Skip custom status as it's already displayed
        const activityContainer = document.createElement("div");
        activityContainer.className = "discord-activity-container";

        // Separator
        const hr = document.createElement("hr");
        hr.className = "discord-activity-separator";

        const activityLayout = document.createElement("div");
        activityLayout.className = "discord-activity-layout";

        const activityContent = document.createElement("div");
        activityContent.className = "discord-activity-content";

        // Image containers
        const imageContainer = document.createElement("div");
        imageContainer.className = "discord-activity-image-container tooltip-container";

        const largeImg = document.createElement("img");
        largeImg.className = "discord-activity-large-image tooltip-trigger";

        const largeTooltip = document.createElement("div");
        largeTooltip.className = "discord-activity-large-image-tooltip tooltip-bubble";

        const smallContainer = document.createElement("div");
        const smallImg = document.createElement("img");
        const smallTooltip = document.createElement("div");

        // Text lines
        const line1 = document.createElement("span");
        line1.className = "discord-activity-line1";

        const line2 = document.createElement("span");
        line2.className = "discord-activity-line2";

        const line3 = document.createElement("span");
        line3.className = "discord-activity-line3";

        if (activity.name === "Spotify") { // Spotify has a unique structure and needs to be handled separately
            largeImg.src = data.spotify.album_art_url;
            largeImg.onclick = () => {
                window.open(
                    `https://open.spotify.com/track/${data.spotify.track_id}`, // to open app: `spotify:track:${data.spotify.track_id}`
                );
            };
            line1.textContent = "Listening to Spotify";
            line1.style = "color: rgba(0,240,30,0.8);";

            line2.textContent = data.spotify.song;

            line3.textContent = data.spotify.artist;
            
            largeTooltip.innerHTML = data.spotify.song + "<br>" + data.spotify.artist;
        }

        else if (activity.name === "YouTube Music") { // YouTube Music also has a unique structure
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
            line1.style = "color: rgba(240, 16, 0, 0.8);";

            line2.textContent = activity.details;

            line3.textContent = activity.state;

            largeTooltip.innerHTML = activity.details + "<br>" + activity.state;
        }

        else { // For other activities, we follow the standard structure
            if (activity.assets?.large_image) {
                if (activity.assets.large_text !== "") {
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

            // Small image is optional and only shown if large image is present to avoid layout issues, so we check for it inside the large image block
            if (activity.assets?.small_image) {
                smallContainer.className = "discord-activity-small-image-container tooltip-container";
                smallImg.className = "discord-activity-small-image tooltip-trigger";

                if (activity.assets.small_text !== "") {
                    smallTooltip.className = "discord-activity-small-image-tooltip tooltip-bubble";
                    smallTooltip.innerHTML = activity.assets.small_text;
                }

                const appId = activity.application_id;
                const imgId = activity.assets.small_image;

                smallImg.src = imgId.includes("mp:")
                    ? extractAndSanitizeUrl(imgId)
                    : `https://cdn.discordapp.com/app-assets/${appId}/${imgId}.webp`;
            }

            line1.textContent = activity.name;
            line1.style = "color: rgba(0,160,255,0.8);";

            line2.textContent = activity.details || "";

            line3.textContent = activity.state || "";

            smallContainer.append(smallImg, smallTooltip);
        }
        // Append all elements in the correct order
        activityContent.append(line1, line2, line3);

        imageContainer.append(largeImg, largeTooltip, smallContainer);
        activityLayout.append(imageContainer, activityContent);
        activityContainer.append(hr, activityLayout);

        discordCard.appendChild(activityContainer);
    }
}
