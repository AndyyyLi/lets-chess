import "./styles/gameplayScreen.scss";
import ScreenBase from "./screenBase";

import { ASSETS, LAYOUTS, SOUNDS } from "../const";
import { isAudienceMode, isCreatorMode } from "../util";

import LayoutManagerInstance from "../layoutManager";
import SoundManagerInstance from "../soundManager";

export default class GameplayScreen extends ScreenBase {
    constructor(app) {
        super("Gameplay", document.querySelector("#gameplayScreen"), LAYOUTS.EMPTY_LAYOUT, app);

        document.querySelector("#gameplayScreen button").addEventListener("click", () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
            this.app.showRecording();
        });

        this.preloadList.addLoad(() => LayoutManagerInstance.createEmptyLayout());

        this.preloadList.addLoad(async () => {
            if (isAudienceMode()) {
                const assetManager = o3h.Instance.getAssetManager();

                const replayData = assetManager.getInputAsset(ASSETS.REPLAY_DATA);
                const replayPlayer = await replayData.createReplayPlayer();

                const replayProperties = await replayPlayer.getProperties();
                const creatorMessage = replayProperties.message;

                document.querySelector("#gameplayScreen h2.message").innerText = creatorMessage;
            }
        });

        this.preloadList.addLoad(async () => {
            if (isAudienceMode()) {
                const userDataService = o3h.Instance.getUserDataService();
                const creatorUserInfo = await userDataService.getCreatorUserInformation();

                document.querySelector("#gameplayScreen #creatorName").innerText = creatorUserInfo.Name;
            }
        });

        const hiddenMode = isAudienceMode() ? "creator" : "audience";
        document.querySelector(`#gameplayScreen .${hiddenMode}`).classList.add("hidden");
    }

    show() {
        super.show();
        this.app.systemSettingsService.showSystemSettings();
    }

    hide() {
        // The camera and audio toggles should be hidden after the screen before gameplay
        this.app.systemSettingsService.hideSystemSettings();
        
        if (isCreatorMode()) {
            const creatorMessage = document.querySelector("#gameplayScreen input").value;
            // Set the message written by the creator to a shared variable in App
            this.app.message = creatorMessage;
        }

        super.hide();
    }
}
