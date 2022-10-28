import "./styles/instructionsScreen.scss";
import ScreenBase from "./screenBase";

import { LAYOUTS, SOUNDS, ASSETS } from "../const";
import { isAudienceMode, changeBoardColours, getPuzzleDifficulty, getPuzzleObjective, getPuzzleTitle } from "../util";
import { ChessEngine } from "../chessEngine";

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

        // if (isAudienceMode()) {
        //     if (!this.app.getIsCompete()) {
        //         this.preloadList.addHttpLoad("./img/assets/trophy.png");
        //         document.querySelector("#instructionsScreen .trophy").src = "./img/assets/trophy.png";
        //     } else {
        //         // !!! show leaderboard
        //     }
            
        // }

        this.preloadList.addLoad(async () => {
            if (isAudienceMode()) {
                const assetManager = o3h.Instance.getAssetManager();

                const replayData = assetManager.getInputAsset(ASSETS.REPLAY_DATA);
                const replayPlayer = await replayData.createReplayPlayer();

                const replayProperties = await replayPlayer.getProperties();
                const attempts = replayProperties.attempts;

                this.app.setAttempts(attempts);

                if (attempts) {
                    if (attempts == 1) {
                        document.getElementById("creatorAttempts").innerHTML = attempts + " attempt!";
                    } else {
                        document.getElementById("creatorAttempts").innerHTML = attempts + " attempts.";
                    }
                }
            }
        });

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

                let darkColour = "#" + colour.substring(0,6);
                let lightColour = "#" + colour.substring(6,12);

                if (!this.app.getIsCompete()) {
                    // set info
                    document.querySelector("#instructionsScreen .details .puzzleTitleDetails").innerHTML = getPuzzleTitle(creatorPuzzle);
                    document.querySelector("#instructionsScreen .details .puzzleDifficulty").innerHTML = getPuzzleDifficulty(creatorPuzzle.Rating);
                    document.querySelector("#instructionsScreen .details .puzzleUserColour").innerHTML = (creatorPuzzle.FEN.split(" ")[1] == "b") ? "White" : "Black";
                    document.querySelector("#instructionsScreen .details .puzzleMoves").innerHTML = creatorPuzzle.Moves.split(" ").length / 2;
                    document.querySelector("#instructionsScreen .details .puzzleObjective").innerHTML = getPuzzleObjective(creatorPuzzle.Themes);
    
                    document.getElementById("puzzleInstructions").style.width = (screen.width / 2 - 20) + "px";
    
                    let config = {
                        showNotation: false,
                        position: creatorPuzzle.FEN
                    };
                    ChessEngine.buildPuzzle("puzzleInstructions", config, false);
                    changeBoardColours("#puzzleInstructions .white-1e1d7", lightColour, darkColour);
                    changeBoardColours("#puzzleInstructions .black-3c85d", darkColour, lightColour);
                }

                ChessEngine.initPuzzle("myBoard", creatorPuzzle);
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
