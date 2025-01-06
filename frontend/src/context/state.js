export const appState = {
    currentPage: null,
    isHUDdisplayed: false,
};

export function setPage(page) {
    appState.currentPage = page;
    appState.isHUDdisplayed = true;
    console.debug(`Current page set to: ${page}`);
}

export function clearPage() {
    appState.currentPage = null;
    appState.isHUDdisplayed = false;
    console.debug("Page state cleared.");
}
