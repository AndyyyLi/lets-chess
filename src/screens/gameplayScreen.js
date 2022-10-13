import "./styles/gameplayScreen.scss";
import ScreenBase from "./screenBase";
import { ChessEngine } from "../chessEngine";

import { ASSETS, LAYOUTS, SOUNDS } from "../const";
import { isCreatorMode, isAudienceMode, setupPuzzleDetails } from "../util";

import LayoutManagerInstance from "../layoutManager";
import SoundManagerInstance from "../soundManager";

export default class GameplayScreen extends ScreenBase {
    constructor(app) {
        super("Gameplay", document.querySelector("#gameplayScreen"), LAYOUTS.EMPTY_LAYOUT, app);

        document.querySelector("#gameplayScreen .next").addEventListener("click", () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);

            let puzzle = this.app.getChosenPuzzle();
            setupPuzzleDetails(puzzle, "#recordingScreen", "puzzleRecord");

            if (this.app.getIsCompete()) {
                const attempts = ChessEngine.getAttempts();
                let msg = attempts == 1 ? "Flawless solve!" : "Solved in " + attempts + " attempts!"

                document.querySelector("#recordingScreen .attemptCount").innerHTML = msg;
                document.querySelector("#recordingScreen .attempts").classList.remove("hidden");
            }

            // audience will always have the replay stepper
            if (isAudienceMode()) {
                document.querySelector("#recordingScreen .prevMove").addEventListener("click", () => {
                    SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
                    ChessEngine.prevMoveReplay();
                });

                document.querySelector("#recordingScreen .nextMove").addEventListener("click", () => {
                    SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
                    ChessEngine.nextMoveReplay();
                });

                document.querySelector("#recordingScreen .skipMoves").addEventListener("click", () => {
                    SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
                    ChessEngine.skipToNextCorrectMove();
                });

                document.querySelector("#recordingScreen .lower").classList.remove("hidden");

                ChessEngine.initPuzzleReplay("puzzleRecord", puzzle.FEN);
            } else {
                // creators can only go back if they are not competing
                if (!this.app.getIsCompete()) {
                    document.querySelector("#recordingScreen .backButton").addEventListener("click", () => {
                        SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
                        this.app.showDetails();
                    });
                    document.querySelector("#recordingScreen .backbutton").classList.remove("hidden");
                }

                // otherwise they record with their chosen puzzle at its initial position
                ChessEngine.buildPuzzle("puzzleRecord", puzzle.FEN, true);
            }

            document.querySelector(".body").lastElementChild.remove();

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
                const creatorPuzzle = replayProperties.puzzle;

                this.app.setChosenPuzzle(creatorPuzzle);

                ChessEngine.initPuzzle("myBoard", creatorPuzzle);
            }
        });
    }

    show() {
        super.show();
        this.app.systemSettingsService.showSystemSettings();
    }

    hide() {
        // The camera and audio toggles should be hidden after the screen before gameplay
        this.app.systemSettingsService.hideSystemSettings();

        if (isCreatorMode()) {
            // Set attempts to shared variable in App
            this.app.setAttempts(ChessEngine.getAttempts());
        }

        super.hide();
    }
}
