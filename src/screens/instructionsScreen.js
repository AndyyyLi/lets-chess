/* eslint-disable no-undef */
import "./styles/instructionsScreen.scss";
import ScreenBase from "./screenBase";

import { LAYOUTS, SOUNDS, ASSETS } from "../const";
import { isAudienceMode, changeBoardColours, getPuzzleDifficulty, getPuzzleObjective, getPuzzleTitle, renderLeaderboard } from "../util";
import { ChessEngine } from "../chessEngine";

import LayoutManagerInstance from "../layoutManager";
import SoundManagerInstance from "../soundManager";
import { PreloadList } from "../libs/Preloader";

export default class InstructionsScreen extends ScreenBase {
    constructor(app) {
        super("Instructions", document.querySelector("#instructionsScreen"), LAYOUTS.EMPTY_LAYOUT, app);

        document.querySelector("#instructionsScreen .play").addEventListener("click", () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
            this.app.showGameplay();
        });

        this.showingLeaderboard = false;

        document.querySelector("#instructionsScreen .leaderboardButton").addEventListener("click", () => {
            if (this.showingLeaderboard) {
                // shows puzzle
                document.querySelector("#instructionsScreen .leaderboard").classList.add("hidden");
                document.querySelector("#instructionsScreen .instructionsInfo").style.display = "grid";
                document.querySelector("#instructionsScreen .leaderboardButton").innerText = "See Leaderboard";
            } else {
                // shows leaderboard
                document.querySelector("#instructionsScreen .leaderboard").classList.remove("hidden");
                document.querySelector("#instructionsScreen .instructionsInfo").style.display = "none";
                document.querySelector("#instructionsScreen .leaderboardButton").innerText = "See Puzzle";
            }

            this.showingLeaderboard = !this.showingLeaderboard;
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
            const avatarPreloadList = new PreloadList();

            if (isAudienceMode()) {
                const assetManager = o3h.Instance.getAssetManager();

                const replayData = assetManager.getInputAsset(ASSETS.REPLAY_DATA);
                const replayPlayer = await replayData.createReplayPlayer();

                const replayProperties = await replayPlayer.getProperties();
                const creatorPuzzle = replayProperties.puzzle;
                const colour = replayProperties.colour;
                const background = replayProperties.background;


                if (replayProperties.isCompete) {
                    const attempts = replayProperties.attempts;

                    this.app.setAttempts(attempts);

                    if (attempts) {
                        if (attempts == 1) {
                            document.getElementById("creatorAttempts").innerText = attempts + " attempt!";
                        } else {
                            document.getElementById("creatorAttempts").innerText = attempts + " attempts.";
                        }
                    }

                    const userDataService = o3h.Instance.getUserDataService();
                    const leaderboard = await userDataService.getLeaderboard();
                    const entries = leaderboard.Entries;

                    entries.sort(function (a, b) {
                        return b.Rank - a.Rank;
                    });

                    renderLeaderboard(entries, avatarPreloadList, "instructionsScreen");
                }

                this.app.setChosenPuzzle(creatorPuzzle);
                this.app.setColour(colour);
                this.app.setBackground(background);

                let darkColour = "#" + colour.substring(0, 6);
                let lightColour = "#" + colour.substring(6, 12);

                // setup info puzzle display
                document.querySelector("#instructionsScreen .details .puzzleTitleDetails").innerText = getPuzzleTitle(creatorPuzzle);
                document.querySelector("#instructionsScreen .details .puzzleDifficulty").innerText = getPuzzleDifficulty(creatorPuzzle.Rating);
                document.querySelector("#instructionsScreen .details .puzzleUserColour").innerText = (creatorPuzzle.FEN.split(" ")[1] == "b") ? "White" : "Black";
                document.querySelector("#instructionsScreen .details .puzzleMoves").innerText = creatorPuzzle.Moves.split(" ").length / 2;
                document.querySelector("#instructionsScreen .details .puzzleObjective").innerText = getPuzzleObjective(creatorPuzzle.Themes);

                document.getElementById("puzzleInstructions").style.width = (screen.width / 2 - 20) + "px";

                let config = {
                    showNotation: false,
                    position: creatorPuzzle.FEN
                };
                ChessEngine.buildPuzzle("puzzleInstructions", config, false);
                changeBoardColours("#puzzleInstructions .white-1e1d7", lightColour, darkColour);
                changeBoardColours("#puzzleInstructions .black-3c85d", darkColour, lightColour);

                // setup gameplay puzzle
                ChessEngine.initPuzzle("myBoard", creatorPuzzle);
                changeBoardColours("#myBoard .white-1e1d7", lightColour, darkColour);
                changeBoardColours("#myBoard .black-3c85d", darkColour, lightColour);
                if (background.includes("blob")) {
                    document.getElementById("gameplayScreen").style.backgroundImage = "url(" + background + ")";
                } else {
                    document.getElementById("gameplayScreen").style.backgroundColor = "#" + background;
                }

                // adds hint button in choose mode
                if (!replayProperties.isCompete) {
                    this.preloadList.addHttpLoad("./img/assets/i_hint.png");

                    // activates hint button
                    document.getElementById("hintButton").addEventListener("click", () => {
                        ChessEngine.showHint();
                    });
                    // shows hint button
                    document.getElementById("hintButton").style.display = "inline";
                    document.querySelector("#gameplayScreen .attemptsText").style.display = "none";
                }
            }

            await avatarPreloadList.loadAll();
        });

        this.preloadList.addHttpLoad("./img/assets/background_2.png");
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
