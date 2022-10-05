import "./styles/instructionsScreen.scss";
import ScreenBase from "./screenBase";

import { LAYOUTS, SOUNDS } from "../const";
import { isCreatorMode } from "../util";

import LayoutManagerInstance from "../layoutManager";
import PersistentDataManagerInstance from "../persistentDataManager";
import SoundManagerInstance from "../soundManager";

export default class InstructionsScreen extends ScreenBase {
    constructor(app) {
        super("Instructions", document.querySelector("#menuScreen"), LAYOUTS.EMPTY_LAYOUT, app);

        document.querySelector("#instructionsScreen button").addEventListener("click", () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);

            this.app.showGameplay();
        });

        // if (isCompete()) {
        //     document.querySelector("#instructionsScreen .compete").classList.remove("hidden");
        // } else {
        //     document.querySelector("#instructionsScreen .choose").classList.remove("hidden");
        // }

        this.preloadList.addLoad(() => LayoutManagerInstance.createEmptyLayout());

        this.preloadList.addLoad(async () => {
            if (isAudienceMode()) {
                const userDataService = o3h.Instance.getUserDataService();
                const creatorUserInfo = await userDataService.getCreatorUserInformation();

                document.querySelectorAll("#instructionsScreen .creatorName").forEach(header => {
                    header.innerText = creatorUserInfo.Name;
                });
            }
        });
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
