import "./styles/customizeScreen.scss";
import ScreenBase from "./screenBase";

import { LAYOUTS, SOUNDS } from "../const";
import { setupPuzzleDetails, changeBoardColours } from "../util";
import { ChessEngine } from "../chessEngine";

import LayoutManagerInstance from "../layoutManager";
import SoundManagerInstance from "../soundManager";

export default class CustomizeScreen extends ScreenBase {
    constructor(app) {
        super("Details", document.querySelector("#customizeScreen"), LAYOUTS.EMPTY_LAYOUT, app);

        // default colours of board
        this.app.setColour(document.querySelector("#customizeScreen .default").id);
        this.app.setBgColour(document.querySelector("#customizeScreen .bgDefault").id);

        this.onBoard = true;

        document.querySelector("#customizeScreen .board").addEventListener("click", () => {
            if (this.onBoard) return;

            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);

            document.querySelector("#customizeScreen .bgColours").classList.add("hidden");
            document.querySelector("#customizeScreen .background").style.opacity = "0.5";
            document.querySelector("#customizeScreen .boardColours").classList.remove("hidden");
            document.querySelector("#customizeScreen .board").style.opacity = "1";

            this.onBoard = true;
        });

        document.querySelector("#customizeScreen .background").addEventListener("click", () => {
            if (!this.onBoard) return;

            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);

            document.querySelector("#customizeScreen .boardColours").classList.add("hidden");
            document.querySelector("#customizeScreen .board").style.opacity = "0.5";
            document.querySelector("#customizeScreen .bgColours").classList.remove("hidden");
            document.querySelector("#customizeScreen .background").style.opacity = "1";

            this.onBoard = false;
        });

        document.querySelector("#customizeScreen .finishCustomization").addEventListener("click", () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);

            let darkColour = "#" + this.app.getColour().substring(0,6);
            let lightColour = "#" + this.app.getColour().substring(6,12);

            if (this.app.getIsCompete()) {
                ChessEngine.initPuzzle("myBoard", this.app.getChosenPuzzle());

                changeBoardColours("#myBoard .white-1e1d7", lightColour, darkColour);
                changeBoardColours("#myBoard .black-3c85d", darkColour, lightColour);
                document.getElementById("gameplayScreen").style.backgroundColor = "#" + this.app.getBgColour();

                this.app.showGameplay();
            } else {
                let puzzle = this.app.getChosenPuzzle();
                ChessEngine.buildPuzzle("puzzleRecord", puzzle.FEN, true);

                setupPuzzleDetails(puzzle, "#recordingScreen", "puzzleRecord");
                changeBoardColours("#puzzleRecord .white-1e1d7", lightColour, darkColour);
                changeBoardColours("#puzzleRecord .black-3c85d", darkColour, lightColour);
                document.getElementById("recordingScreen").style.backgroundColor = "#" + this.app.getBgColour();

                // creators can only go back if they are not competing
                document.querySelector("#recordingScreen .backbutton").classList.remove("hidden");
                document.querySelector("#recordingScreen .backButton").addEventListener("click", () => {
                    SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
                    this.app.showDetails();
                });

                this.app.showRecording();
            }
        });

        document.querySelector("#customizeScreen .backButton").addEventListener("click", () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);

            let thisColour = this.app.getColour();
            let thisBgColour = this.app.getBgColour();

            // reset highlighted to default colour
            document.getElementById(thisColour).style.border = "none";
            document.getElementById("b58863f0d9b5").style.border = "solid 3px white";
            this.app.setColour("b58863f0d9b5");

            // reset highlighted to default bg colour
            document.getElementById(thisBgColour).style.border = "none";
            document.getElementById("customizeScreen").style.backgroundColor = "#bebebe";
            document.getElementById("bebebe").style.border = "solid 3px white";
            this.app.setBgColour("bebebe");

            // reset selected customization target
            if (!this.onBoard) {
                document.querySelector("#customizeScreen .bgColours").classList.add("hidden");
                document.querySelector("#customizeScreen .background").style.opacity = "0.5";
                document.querySelector("#customizeScreen .boardColours").classList.remove("hidden");
                document.querySelector("#customizeScreen .board").style.opacity = "1";

                this.onBoard = true;
            }

            this.app.showSelection();
        })

        this.preloadList.addLoad(() => LayoutManagerInstance.createEmptyLayout());
    }
}
