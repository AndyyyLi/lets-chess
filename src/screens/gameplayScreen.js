import "./styles/gameplayScreen.scss";
import ScreenBase from "./screenBase";
import { ChessEngine } from "../chessEngine";

import { ASSETS, LAYOUTS, SOUNDS } from "../const";
import { isCreatorMode, isAudienceMode, setupPuzzleDetails, changeBoardColours } from "../util";

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
                // while hosts record with their chosen puzzle at its initial position
                ChessEngine.buildPuzzle("puzzleRecord", puzzle.FEN, true);
            }

            let colour = this.app.getColour();
            let darkColour = "#" + colour.substring(0,6);
            let lightColour = "#" + colour.substring(6,12);
            let bgColour = this.app.getBgColour();

            changeBoardColours("#puzzleRecord .white-1e1d7", lightColour, darkColour);
            changeBoardColours("#puzzleRecord .black-3c85d", darkColour, lightColour);
            document.getElementById("recordingScreen").style.backgroundColor = "#" + bgColour;

            document.querySelector(".body").lastElementChild.remove();

            this.app.showRecording();
        });

        document.querySelector("#undoButton").addEventListener('click', () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
            ChessEngine.undoMove();
        });

        if (isAudienceMode()) {
            document.querySelector("#giveUpButton").addEventListener('click', () => {
                SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
                document.querySelector("#gameplayScreen .giveUpConfirmation").style.transform = "scale(1)";
            });
            
            document.querySelector("#gameplayScreen .cancel").addEventListener('click', () => {
                SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
                document.querySelector("#gameplayScreen .giveUpConfirmation").style.transform = "scale(0)";
            });

            document.querySelector("#gameplayScreen .confirm").addEventListener('click', () => {
                SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);

                let puzzle = this.app.getChosenPuzzle();
                setupPuzzleDetails(puzzle, "#recordingScreen", "puzzleRecord");

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

                let colour = this.app.getColour();
                let darkColour = "#" + colour.substring(0,6);
                let lightColour = "#" + colour.substring(6,12);
                let bgColour = this.app.getBgColour();

                changeBoardColours("#puzzleRecord .white-1e1d7", lightColour, darkColour);
                changeBoardColours("#puzzleRecord .black-3c85d", darkColour, lightColour);
                document.getElementById("recordingScreen").style.backgroundColor = "#" + bgColour;

                document.querySelector(".body").lastElementChild.remove();

                this.app.showRecording();
            });

        }
        

        this.preloadList.addLoad(() => LayoutManagerInstance.createEmptyLayout());

        this.preloadList.addLoad(async () => {
            if (isAudienceMode()) {
                const assetManager = o3h.Instance.getAssetManager();

                const replayData = assetManager.getInputAsset(ASSETS.REPLAY_DATA);
                const replayPlayer = await replayData.createReplayPlayer();

                const replayProperties = await replayPlayer.getProperties();
                const creatorPuzzle = replayProperties.puzzle;
                const colour = replayProperties.colour;
                const bgColour = replayProperties.bgColour;

                this.app.setChosenPuzzle(creatorPuzzle);
                this.app.setColour(colour);
                this.app.setBgColour(bgColour);

                ChessEngine.initPuzzle("myBoard", creatorPuzzle);

                let darkColour = "#" + colour.substring(0,6);
                let lightColour = "#" + colour.substring(6,12);

                changeBoardColours("#myBoard .white-1e1d7", lightColour, darkColour);
                changeBoardColours("#myBoard .black-3c85d", darkColour, lightColour);
                document.getElementById("gameplayScreen").style.backgroundColor = "#" + bgColour;
            }
        });
    }

    show() {
        super.show();

        // The camera and audio toggles should be hidden after the screen before gameplay
        this.app.systemSettingsService.showSystemSettings();
    }

    hide() {
        this.app.systemSettingsService.hideSystemSettings();

        if (isCreatorMode()) {
            // Set attempts to shared variable in App
            this.app.setAttempts(ChessEngine.getAttempts());
        }

        super.hide();
    }
}
