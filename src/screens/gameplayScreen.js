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
            let background = this.app.getBackground();
            let darkColour = "#" + colour.substring(0,6);
            let lightColour = "#" + colour.substring(6,12);

            changeBoardColours("#puzzleRecord .white-1e1d7", lightColour, darkColour);
            changeBoardColours("#puzzleRecord .black-3c85d", darkColour, lightColour);
            if (background.includes("blob")) {
                document.getElementById("recordingScreen").style.backgroundImage = "url(" + background + ")";
            } else {
                document.getElementById("recordingScreen").style.backgroundColor = "#" + background;
            }

            this.app.showRecording();
        });

        document.querySelector("#undoButton").addEventListener('click', () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
            ChessEngine.undoMove();
        });

        if (isAudienceMode()) {
            document.querySelector("#giveUpButton").addEventListener('click', () => {
                SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
                document.querySelector("#gameplayScreen .giveUp").style.transform = "scale(1)";
            });
            
            document.querySelector("#gameplayScreen .cancel").addEventListener('click', () => {
                SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
                document.querySelector("#gameplayScreen .giveUp").style.transform = "scale(0)";
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
                let background = this.app.getBackground();

                changeBoardColours("#puzzleRecord .white-1e1d7", lightColour, darkColour);
                changeBoardColours("#puzzleRecord .black-3c85d", darkColour, lightColour);
                if (background.includes("blob")) {
                    document.getElementById("recordingScreen").style.backgroundImage = "url(" + background + ")";
                } else {
                    document.getElementById("recordingScreen").style.backgroundColor = "#" + background;
                }

                document.querySelector(".body").lastElementChild.remove();

                this.app.showRecording();
            });
        } else {
            document.querySelector("#gameplayScreen .backButton").addEventListener("click", () => {
                SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);

                document.getElementById("notif").innerHTML = "Your turn!";
                document.getElementById("giveUpButton").style.transform = "scale(0)";
                document.getElementById("undoButton").style.transform = "scale(0)";
                document.querySelector("#gameplayScreen .next").style.transform = "scale(0)";

                this.app.showCustomization();
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
                const background = replayProperties.background;

                this.app.setChosenPuzzle(creatorPuzzle);
                this.app.setColour(colour);
                this.app.setBackground(background);

                ChessEngine.initPuzzle("myBoard", creatorPuzzle);

                let darkColour = "#" + colour.substring(0,6);
                let lightColour = "#" + colour.substring(6,12);

                changeBoardColours("#myBoard .white-1e1d7", lightColour, darkColour);
                changeBoardColours("#myBoard .black-3c85d", darkColour, lightColour);
                if (background.includes("blob")) {
                    document.getElementById("gameplayScreen").style.backgroundImage = "url(" + background + ")";
                } else {
                    document.getElementById("gameplayScreen").style.backgroundColor = "#" + background;
                }

                document.querySelector("#gameplayScreen .backButton").classList.add("hidden");

                if (!this.app.getIsCompete()) {
                    this.preloadList.addHttpLoad("./img/assets/i_hint.png");
                    document.getElementById("hintButton").style.backgroundImage = "url(\"./img/assets/i_hint.png\")";
                    
                    // activates hint button
                    document.getElementById("hintButton").addEventListener("click", () => {
                        ChessEngine.showHint();
                    });
                    // shows hint button
                    document.getElementById("hintButton").style.display = "inline";
                    document.querySelector("#gameplayScreen .attemptsText").style.display = "none";
                }
            }
        });

        this.preloadList.addHttpLoad("./img/assets/win.png");
        document.querySelector("#gameplayScreen .solvedImg").src = "./img/assets/win.png";
    }

    show() {
        super.show();
    }

    hide() {
        if (isCreatorMode()) {
            // Set attempts to shared variable in App
            this.app.setAttempts(ChessEngine.getAttempts());
        }

        super.hide();
    }
}
