import "./styles/instructionsScreen.scss";
import ScreenBase from "./screenBase";

import { LAYOUTS, SOUNDS, ASSETS } from "../const";
import { isAudienceMode } from "../util";

import LayoutManagerInstance from "../layoutManager";
import SoundManagerInstance from "../soundManager";

export default class InstructionsScreen extends ScreenBase {
    constructor(app) {
        super("Instructions", document.querySelector("#instructionsScreen"), LAYOUTS.EMPTY_LAYOUT, app);

        document.querySelector("#instructionsScreen button").addEventListener("click", () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);

            this.app.showGameplay();
        });

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

        this.preloadList.addLoad(async () => {
            if (isAudienceMode()) {
                const assetManager = o3h.Instance.getAssetManager();

                const replayData = assetManager.getInputAsset(ASSETS.REPLAY_DATA);
                const replayPlayer = await replayData.createReplayPlayer();

                const replayProperties = await replayPlayer.getProperties();
                const attempts = replayProperties.attempts;

                if (attempts) {
                    if (attempts == 1) {
                        document.getElementById("creatorAttempts").innerHTML = attempts + " attempt!";
                    } else {
                        document.getElementById("creatorAttempts").innerHTML = attempts + " attempts.";
                    }
                }
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

        this.app.systemSettingsService.hideSystemSettings();
    }
}
