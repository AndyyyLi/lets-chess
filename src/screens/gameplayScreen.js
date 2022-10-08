import "./styles/gameplayScreen.scss";
import "../chessEngine.css";
import ScreenBase from "./screenBase";
import { ChessEngine } from "../chessEngine";

import { ASSETS, LAYOUTS, SOUNDS } from "../const";
import { isAudienceMode, setupPuzzleDetails } from "../util";

import LayoutManagerInstance from "../layoutManager";
import SoundManagerInstance from "../soundManager";

export default class GameplayScreen extends ScreenBase {
    constructor(app) {
        super("Gameplay", document.querySelector("#gameplayScreen"), LAYOUTS.EMPTY_LAYOUT, app);

        document.querySelector("#gameplayScreen .controls button").addEventListener("click", () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);

            let puzzle = this.app.getChosenPuzzle();
            ChessEngine.buildPuzzle("puzzleRecord", puzzle.FEN, true);
            setupPuzzleDetails(puzzle, "#recordingScreen", "puzzleRecord");

            if (this.app.getIsCompete()) {
                const attempts = ChessEngine.getAttempts();
                let msg = attempts == 1 ? "Flawless solve!" : "Solved in " + attempts + " attempts!"
                
                document.querySelector("#recordingScreen .attemptCount").innerHTML = msg;
                document.querySelector("#recordingScreen .attempts").classList.remove("hidden");
            }
            
            this.app.showRecording();
        });

        document.querySelector("#undoButton").addEventListener('click', () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
            ChessEngine.undoMove();
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
        
        // if (isCreatorMode()) {
        //     const creatorMessage = document.querySelector("#gameplayScreen input").value;
        //     // Set the message written by the creator to a shared variable in App
        //     this.app.message = creatorMessage;
        // }

        super.hide();
    }
}
