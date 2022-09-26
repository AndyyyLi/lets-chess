import { PreloadList } from "../libs/Preloader";
import { LAYOUTS } from "../const";

/**
 * Base class for all screens.  A screen is a clean way to organize sections of your module.
 * Examples would be a splash screen, tutorial screen, and gameplay screen.
 */
export default class ScreenBase {
    /**
     * @constructor
     * @param {document} hostElement - The base DOM element  of the sceen
     * @param {string} layoutName - Identifier of the layout used for this screen
     */
    constructor(identifier, hostElement, layoutName = LAYOUTS.EMPTY_LAYOUT, app) {
        this.identifier = identifier;
        this.hostElement = hostElement;

        // todo in each subclass:
        // populate the preloadList

        this.layoutName = layoutName;
        this.preloadList = new PreloadList();

        this.app = app;
    }

    /**
     * Returns the name of the layout this screen uses
     */
    getLayoutName() {
        return this.layoutName;
    }

    /**
     * Returns the preloadList instance
     */
    getPreloadList() {
        return this.preloadList;
    }

    /**
     * Performs any startup tasks needed (like beginning face tracking, full screen recording, etc) and makes the
     * screen's html elements visible.
     */
    show() {
        this.hostElement.classList.remove("hidden");

        if (this.identifier) {
            this.app.analyticService.setPage(this.identifier);
        }
    }

    /**
     * Performs any pause/shutdown tasks needed (like pausing face tracking, full screen recording, etc) and makes the
     * screen's html elements invisible.
     */
    hide() {
        this.hostElement.classList.add("hidden");
    }

    /**
     * Adds the recording class to the screen to hide any interface elements
     */
    startRecording() {
        this.hostElement.classList.add("recording");
    }

    /**
     * Removes the recording class from the screen to show interface elements
     */
    stopRecording() {
        this.hostElement.classList.remove("recording");
    }
    
}
