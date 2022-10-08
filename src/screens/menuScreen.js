import "./styles/menuScreen.scss";
import ScreenBase from "./screenBase";

import { LAYOUTS, SOUNDS } from "../const";
import { isCreatorMode } from "../util";

import LayoutManagerInstance from "../layoutManager";
import PersistentDataManagerInstance from "../persistentDataManager";
import SoundManagerInstance from "../soundManager";

export default class MenuScreen extends ScreenBase {
    constructor(app) {
        super("Menu", document.querySelector("#menuScreen"), LAYOUTS.EMPTY_LAYOUT, app);

        document.querySelector("#menuScreen .choose").addEventListener("click", () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
            
            this.app.setIsCompete(false);

            this.app.showSelection();
        });

        document.querySelector("#menuScreen .compete").addEventListener("click", () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);

            this.app.setIsCompete(true);

            this.app.showSelection();
        });

        this.preloadList.addLoad(() => LayoutManagerInstance.createEmptyLayout());
    }

    show() {
        super.show();
        // Shows the camera and audio on/off toggles to the user
        this.app.systemSettingsService.showSystemSettings();
    }

    hide() {        
        super.hide();

        // Set that the tutorial has been seen for this play mode
        const playMode = isCreatorMode() ? "creator" : "audience";
        PersistentDataManagerInstance.setSettingsDataProperty(`${playMode}_tutorial`, true);
    }
}
