class ItemCardElement extends HTMLElement {
    constructor() {
        super();
        
    }

    connectedCallback() {
        const src = this.getAttribute("src")
        const name = this.getAttribute("name")
        const categoryName = this.getAttribute("category-name")
        const href = this.getAttribute("href") || "#"
        this.innerHTML = `
            <div
                tabindex="0"
                aria-disabled="true"
                aria-roledescription="sortable"
                class="item-card"
            >
                <div class="item-background">
                    <div style="aspect-ratio: 1/1">
                        <img
                            class="item-image"
                            alt="${name} image"
                            loading="lazy"
                            width="164"
                            height="164"
                            decoding="async"
                            data-nimg="1"
                            style="
                                color: transparent;
                            "
                            src="${src}"
                        />
                    </div>
                </div>
                <div class="record-icon">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="arrow"
                    >
                        <path
                            d="M17 7l-10 10"
                        ></path>
                        <path
                            d="M8 7l9 0l0 9"
                        ></path>
                    </svg>
                </div>
                <p class="item-category">${categoryName}</p>
                <p class="item-name">${name}</p>
            </div>
        `;

        this.querySelector(".item-card").addEventListener("click", () => {
            window.open(href, "_blank");
        });
    }
}

window.customElements.define("item-card", ItemCardElement);


/*

*/