import LayoutManagerInstance from "./layoutManager";

/**
 * Handles showing, hiding, and waiting for screens to be ready to change.
 */
class ScreenManager {
    constructor() {
        this.activeScreen = null;
        this.activeLayoutName = null;
        this.loadingCover = document.querySelector("#loading");
    }

    /**
     * Hides the current screen, shows the loading interstitial, and shows the new screen when ready.
     * @param {ScreenBase} screen - The new screen
     */
    async showScreen(screen) {
        if (this.activeScreen) {
            this.showLoadingCover();
            this.activeScreen.hide();
        }

        this.activeScreen = screen;
        await this.activeScreen.getPreloadList().loadAll();

        const newLayoutName = this.activeScreen.getLayoutName();
        if (newLayoutName !== this.activeLayoutName) {
            this.activeLayoutName = newLayoutName;
            await LayoutManagerInstance.showLayout(this.activeLayoutName);
        }

        this.activeScreen.show();
        this.hideLoadingCover();
    }

    /**
     * Shows a loading screen while screens load in the background.
     */
    showLoadingCover() {
        this.loadingCover.classList.remove("hidden");
    }

    /**
     * Hides the loading screen
     */
    hideLoadingCover() {
        this.loadingCover.classList.add("hidden");
    }
}

const ScreenManagerInstance = new ScreenManager();
export default ScreenManagerInstance;
