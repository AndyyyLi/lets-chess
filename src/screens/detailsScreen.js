import "./styles/detailsScreen.scss";
import ScreenBase from "./screenBase";

import { LAYOUTS, SOUNDS } from "../const";
import { setupPuzzleDetails, changeBoardColours } from "../util";
import { ChessEngine } from "../chessEngine";

import LayoutManagerInstance from "../layoutManager";
import SoundManagerInstance from "../soundManager";

export default class DetailsScreen extends ScreenBase {
    constructor(app) {
        super("Details", document.querySelector("#detailsScreen"), LAYOUTS.EMPTY_LAYOUT, app);

        document.querySelector("#detailsScreen #skipCustomization").addEventListener("click", () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);

            if (this.app.getIsCompete()) {
                ChessEngine.initPuzzle("myBoard", this.app.getChosenPuzzle());

                this.app.showGameplay();
            } else {
                let puzzle = this.app.getChosenPuzzle();
                ChessEngine.buildPuzzle("puzzleRecord", puzzle.FEN, true);
                setupPuzzleDetails(puzzle, "#recordingScreen", "puzzleRecord");

                this.app.showRecording();
            }
            
        });

        // default colours of board
        this.colour = document.querySelector("#detailsScreen .default").id;
        this.bgColour = document.querySelector("#detailsScreen .bgDefault").id;

        this.onBoard = true;

        document.querySelector("#detailsScreen #customizeButton").addEventListener("click", () => {
            
            document.querySelectorAll("#detailsScreen .boardColours .colour").forEach(colour => {
                let darkColour = "#" + colour.id.substring(0,6);
                let lightColour = "#" + colour.id.substring(6,12);

                colour.addEventListener("click", () => {
                    if (colour.id == this.colour) return;

                    // highlight selected colour
                    document.getElementById(this.colour).style.border = "none";
                    colour.style.border = "solid 3px white";
                    this.colour = colour.id;

                    changeBoardColours("#puzzleDetails .white-1e1d7", lightColour, darkColour);
                    changeBoardColours("#puzzleDetails .black-3c85d", darkColour, lightColour);
                });
            });

            document.querySelectorAll("#detailsScreen .bgColours .colour").forEach(bgColour => {

                bgColour.addEventListener("click", () => {
                    if (bgColour.id == this.bgColour) return;

                    // highlight selected colour
                    document.getElementById(this.bgColour).style.border = "none";
                    bgColour.style.border = "solid 3px white";
                    this.bgColour = bgColour.id;

                    document.getElementById("detailsScreen").style.backgroundColor = "#" + this.bgColour;
                });
            });

            document.querySelector("#detailsScreen .customOptions").classList.remove("hidden");
            document.querySelector("#detailsScreen .detailsOptions").classList.add("hidden");
        });

        document.querySelector("#detailsScreen .board").addEventListener("click", () => {
            if (this.onBoard) return;

            document.querySelector("#detailsScreen .bgColours").classList.add("hidden");
            document.querySelector("#detailsScreen .background").style.opacity = "0.5";
            document.querySelector("#detailsScreen .boardColours").classList.remove("hidden");
            document.querySelector("#detailsScreen .board").style.opacity = "1";

            this.onBoard = true;
        });

        document.querySelector("#detailsScreen .background").addEventListener("click", () => {
            if (!this.onBoard) return;

            document.querySelector("#detailsScreen .boardColours").classList.add("hidden");
            document.querySelector("#detailsScreen .board").style.opacity = "0.5";
            document.querySelector("#detailsScreen .bgColours").classList.remove("hidden");
            document.querySelector("#detailsScreen .background").style.opacity = "1";

            this.onBoard = false;
        });

        document.querySelector("#detailsScreen .finishCustomization").addEventListener("click", () => {
            this.app.setColour(this.colour);
            this.app.setBgColour(this.bgColour);

            let darkColour = "#" + this.colour.substring(0,6);
            let lightColour = "#" + this.colour.substring(6,12);

            if (this.app.getIsCompete()) {
                ChessEngine.initPuzzle("myBoard", this.app.getChosenPuzzle());

                changeBoardColours("#myBoard .white-1e1d7", lightColour, darkColour);
                changeBoardColours("#myBoard .black-3c85d", darkColour, lightColour);
                document.getElementById("gameplayScreen").style.backgroundColor = "#" + this.bgColour;

                this.app.showGameplay();
            } else {
                let puzzle = this.app.getChosenPuzzle();
                ChessEngine.buildPuzzle("puzzleRecord", puzzle.FEN, true);

                setupPuzzleDetails(puzzle, "#recordingScreen", "puzzleRecord");
                changeBoardColours("#puzzleRecord .white-1e1d7", lightColour, darkColour);
                changeBoardColours("#puzzleRecord .black-3c85d", darkColour, lightColour);
                document.getElementById("recordingScreen").style.backgroundColor = "#" + this.bgColour;

                this.app.showRecording();
            }
        });

        document.querySelector("#detailsScreen .backButton").addEventListener("click", () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);

            // reset highlighted default colour
            document.getElementById(this.colour).style.border = "none";
            this.colour = "b58863f0d9b5";
            document.getElementById(this.colour).style.border = "solid 3px white";

            // reset highlighted default bg colour
            document.getElementById(this.bgColour).style.border = "none";
            this.bgColour = "bebebe";
            document.getElementById(this.bgColour).style.border = "solid 3px white";

            // reset selected customization target
            if (!this.onBoard) {
                document.querySelector("#detailsScreen .bgColours").classList.add("hidden");
                document.querySelector("#detailsScreen .background").style.opacity = "0.5";
                document.querySelector("#detailsScreen .boardColours").classList.remove("hidden");
                document.querySelector("#detailsScreen .board").style.opacity = "1";

                this.onBoard = true;
            }

            // close custom options
            document.querySelector("#detailsScreen .customOptions").classList.add("hidden");
            document.querySelector("#detailsScreen .detailsOptions").classList.remove("hidden");

            this.app.showSelection();
        })

        this.preloadList.addLoad(() => LayoutManagerInstance.createEmptyLayout());
    }

    show() {
        super.show();
    }

    hide() {        
        super.hide();
    }
}
