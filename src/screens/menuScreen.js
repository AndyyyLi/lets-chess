import "./styles/menuScreen.scss";
import ScreenBase from "./screenBase";

import { LAYOUTS, SOUNDS } from "../const";

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

        this.preloadList.addHttpLoad("./img/assets/choose.png");
        document.querySelector("#menuScreen .chooseImg").src = "./img/assets/choose.png";

        this.preloadList.addHttpLoad("./img/assets/compete.png");
        document.querySelector("#menuScreen .competeImg").src = "./img/assets/compete.png";
    }

    show() {
        super.show();
        this.app.systemSettingsService.showSystemSettings();
    }

    hide() {        
        super.hide();
        // Shows the camera and audio on/off toggles to the user
        this.app.systemSettingsService.hideSystemSettings();
    }
}
