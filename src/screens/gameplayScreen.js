import "./styles/gameplayScreen.scss";
import ScreenBase from "./screenBase";
import { ChessEngine } from "../chessEngine";

import { LAYOUTS, SOUNDS } from "../const";
import { isCreatorMode, isAudienceMode, setupPuzzleDetails, changeBoardColours, renderLeaderboard } from "../util";

import LayoutManagerInstance from "../layoutManager";
import SoundManagerInstance from "../soundManager";
import { PreloadList } from "../libs/Preloader";

export default class GameplayScreen extends ScreenBase {
    constructor(app) {
        super("Gameplay", document.querySelector("#gameplayScreen"), LAYOUTS.EMPTY_LAYOUT, app);

        this.preloadList.addHttpLoad("./img/assets/i_back.png");

        this.preloadList.addHttpLoad("./img/assets/title_compete.png");

        document.querySelector("#gameplayScreen .notifDiv .next").addEventListener("click", () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);

            // sets up recordingScreen puzzle
            let puzzle = this.app.getChosenPuzzle();
            setupPuzzleDetails(puzzle, "#recordingScreen", "puzzleRecord");

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
            let darkColour = "#" + colour.substring(0, 6);
            let lightColour = "#" + colour.substring(6, 12);

            changeBoardColours("#puzzleRecord .white-1e1d7", lightColour, darkColour);
            changeBoardColours("#puzzleRecord .black-3c85d", darkColour, lightColour);
            if (background.includes("blob")) {
                document.getElementById("recordingScreen").style.backgroundImage = "url(" + background + ")";
            } else {
                document.getElementById("recordingScreen").style.backgroundColor = "#" + background;
            }

            if (this.app.getIsCompete()) {
                const attempts = ChessEngine.getAttempts();
                let msg = attempts == 1 ? "Flawless solve!" : "Solved in " + attempts + " attempts!";

                document.querySelector("#recordingScreen .attemptCount").innerText = msg;
                document.querySelector("#recordingScreen .attempts").classList.remove("hidden");

                if (isCreatorMode()) {
                    document.querySelector("#recordingScreen .recordingImg").src = "./img/assets/title_compete.png";
                    document.querySelector("#recordingScreen .recordingImg").classList.remove("hidden");

                    this.app.showRecording();
                } else {
                    // show leaderboard if audience
                    document.querySelector("#gameplayScreen .update").style.transform = "scale(1)";
                    document.querySelector("#gameplayScreen .postGameLeaderboard").classList.add("fallDown");
                }
            } else {
                // else go to recording
                this.app.showRecording();
            }
        });

        document.querySelector("#gameplayScreen .postGameLeaderboard .next").addEventListener("click", () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
            document.querySelector("#gameplayScreen .postGameLeaderboard").classList.remove("fallDown");
            this.app.showRecording();
        });

        document.querySelector("#undoButton").addEventListener('click', () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
            ChessEngine.undoMove();
        });

        document.querySelector("#gameplayScreen .backButton").addEventListener("click", () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);

            if (isCreatorMode()) {
                document.querySelector("#gameplayScreen .leave").style.transform = "scale(1)";
                document.querySelector("#gameplayScreen .leaveConfirmation").classList.add("fallDown");
            } else {
                this.app.showInstructions();
            }
        });

        document.querySelector("#gameplayScreen .leaveOptions .confirm").addEventListener("click", () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);

            // resets gameplay notifs and buttons
            document.getElementById("notif").innerText = "Your turn!";
            document.getElementById("giveUpButton").style.transform = "scale(0)";
            document.getElementById("undoButton").style.transform = "scale(0)";

            document.querySelector("#gameplayScreen .leave").style.transform = "scale(0)";
            document.querySelector("#gameplayScreen .leaveConfirmation").classList.remove("fallDown");
            
            this.app.showCustomization();
        });

        document.querySelector("#gameplayScreen .leaveOptions .cancel").addEventListener("click", () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);

            document.querySelector("#gameplayScreen .leave").style.transform = "scale(0)";
            document.querySelector("#gameplayScreen .leaveConfirmation").classList.remove("fallDown");
        });

        if (isAudienceMode()) {
            this.preloadList.addHttpLoad("./img/assets/whiteking.png");
            document.querySelector("#gameplayScreen .giveUpImg").src = "./img/assets/whiteking.png";

            document.querySelector("#giveUpButton").addEventListener('click', () => {
                SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);

                document.querySelector("#gameplayScreen .giveUp").style.transform = "scale(1)";
                document.querySelector("#gameplayScreen .giveUpConfirmation").classList.add("fallDown");

            });

            document.querySelector("#gameplayScreen .giveUpOptions .cancel").addEventListener('click', () => {
                SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);

                document.querySelector("#gameplayScreen .giveUp").style.transform = "scale(0)";
                document.querySelector("#gameplayScreen .giveUpConfirmation").classList.remove("fallDown");
            });

            document.querySelector("#gameplayScreen .giveUpOptions .confirm").addEventListener('click', () => {
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
                let darkColour = "#" + colour.substring(0, 6);
                let lightColour = "#" + colour.substring(6, 12);
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
        }


        this.preloadList.addLoad(() => LayoutManagerInstance.createEmptyLayout());

        this.preloadList.addHttpLoad("./img/assets/win.png");
        document.querySelector("#gameplayScreen .solvedImg").src = "./img/assets/win.png";
    }

    async updateLeaderboard(attempts) {
        const avatarPreloadList = new PreloadList();

        // eslint-disable-next-line no-undef
        const userDataService = o3h.Instance.getUserDataService();
        const leaderboard = await userDataService.addToLeaderboard({ score: attempts });
        const entries = leaderboard.Entries;

        entries.sort(function (a, b) {
            return b.Rank - a.Rank;
        });

        const thisUser = await userDataService.getActiveUserInformation();

        renderLeaderboard(entries, avatarPreloadList, "gameplayScreen", thisUser.Name);

        avatarPreloadList.loadAll();
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
