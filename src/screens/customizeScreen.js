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
        this.app.setBackground(document.querySelector("#customizeScreen .bgDefault").id);

        this.onBoard = true;

        // set board colour options
        document.querySelectorAll("#customizeScreen .boardColours .colour").forEach(colour => {
            let darkColour = "#" + colour.id.substring(0, 6);
            let lightColour = "#" + colour.id.substring(6, 12);

            colour.addEventListener("click", () => {
                let thisColour = this.app.getColour();

                if (colour.id == thisColour) return;

                // highlight selected colour
                document.getElementById(thisColour).classList.remove("chosen");
                colour.classList.add("chosen");
                this.app.setColour(colour.id);

                changeBoardColours("#puzzleDetails .white-1e1d7", lightColour, darkColour);
                changeBoardColours("#puzzleDetails .black-3c85d", darkColour, lightColour);
            });
        });

        // set background colour options
        document.querySelectorAll("#customizeScreen .bgColours .colour").forEach(bgColour => {

            bgColour.addEventListener("click", () => {
                let thisBackground = this.app.getBackground();

                if (bgColour.id == thisBackground) return;

                // remove background image if present
                if (thisBackground.includes("blob")) {
                    document.getElementById("customizeScreen").style.backgroundImage = "none";
                } else {
                    // chosen class only applies to colour backgrounds
                    document.getElementById(thisBackground).classList.remove("chosen");
                }

                // highlight selected colour
                bgColour.classList.add("chosen");
                this.app.setBackground(bgColour.id);
                document.getElementById("customizeScreen").style.backgroundColor = "#" + bgColour.id;
            });
        });

        // allows users to pick their own background photo
        document.querySelector("#customizeScreen .bgPhoto").addEventListener("click", async () => {
            await this.app.assetManager.getImageFromGallery().then(img => {
                return img.getImageUrl();
            }).then(async imgUrl => {
                let currBackground = this.app.getBackground();

                // chosen class only applies to colour backgrounds 
                if (!currBackground.includes("blob")) document.getElementById(currBackground).classList.remove("chosen");

                this.app.setBackground(imgUrl);
                document.getElementById("customizeScreen").style.backgroundImage = "url(" + imgUrl + ")";
            }).catch(err => {
                // no photo chosen
            });
        });

        document.querySelector("#customizeScreen .board").addEventListener("click", () => {
            if (this.onBoard) return;

            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);

            document.querySelector("#customizeScreen .bgColours").classList.add("hidden");
            document.querySelector("#customizeScreen .background").classList.remove("selected");
            document.querySelector("#customizeScreen .boardColours").classList.remove("hidden");
            document.querySelector("#customizeScreen .board").classList.add("selected");
            document.querySelector("#customizeScreen .customText").innerHTML = "Select board colour";

            this.onBoard = true;
        });

        document.querySelector("#customizeScreen .background").addEventListener("click", () => {
            if (!this.onBoard) return;

            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);

            document.querySelector("#customizeScreen .boardColours").classList.add("hidden");
            document.querySelector("#customizeScreen .board").classList.remove("selected");
            document.querySelector("#customizeScreen .bgColours").classList.remove("hidden");
            document.querySelector("#customizeScreen .background").classList.add("selected");
            document.querySelector("#customizeScreen .customText").innerHTML = "Select background";

            this.onBoard = false;
        });

        document.querySelector("#customizeScreen .finishCustomization").addEventListener("click", () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);

            let darkColour = "#" + this.app.getColour().substring(0, 6);
            let lightColour = "#" + this.app.getColour().substring(6, 12);
            let background = this.app.getBackground();

            if (this.app.getIsCompete()) {
                ChessEngine.initPuzzle("myBoard", this.app.getChosenPuzzle());

                changeBoardColours("#myBoard .white-1e1d7", lightColour, darkColour);
                changeBoardColours("#myBoard .black-3c85d", darkColour, lightColour);
                if (background.includes("blob")) {
                    document.getElementById("gameplayScreen").style.backgroundImage = "url(" + background + ")";
                } else {
                    document.getElementById("gameplayScreen").style.backgroundColor = "#" + background;
                }

                // if creator picks choose flow then changes to compete, the recording back button needs to be re-hidden
                document.querySelector("#recordingScreen .backbutton").classList.add("hidden");

                this.app.showGameplay();
            } else {
                let puzzle = this.app.getChosenPuzzle();
                ChessEngine.buildPuzzle("puzzleRecord", puzzle.FEN, true);

                setupPuzzleDetails(puzzle, "#recordingScreen", "puzzleRecord");
                changeBoardColours("#puzzleRecord .white-1e1d7", lightColour, darkColour);
                changeBoardColours("#puzzleRecord .black-3c85d", darkColour, lightColour);
                if (background.includes("blob")) {
                    document.getElementById("recordingScreen").style.backgroundImage = "url(" + background + ")";
                } else {
                    document.getElementById("recordingScreen").style.backgroundColor = "#" + background;
                }

                // creators can only go back if they are not competing
                document.querySelector("#recordingScreen .backbutton").classList.remove("hidden");

                this.app.showRecording();
            }
        });

        document.querySelector("#recordingScreen .backButton").addEventListener("click", () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
            this.app.showCustomization();
        });

        document.querySelector("#customizeScreen .backButton").addEventListener("click", () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);

            let thisColour = this.app.getColour();
            let thisBackground = this.app.getBackground();

            // reset highlighted to default colour
            document.getElementById(thisColour).classList.remove("chosen")
            document.getElementById("b58863f0d9b5").classList.add("chosen");
            this.app.setColour("b58863f0d9b5");

            // reset highlighted to default bg colour
            if (thisBackground.includes("blob")) {
                document.getElementById("customizeScreen").style.backgroundImage = "none";
            } else {
                document.getElementById(thisBackground).classList.remove("chosen");
            }

            document.getElementById("bebebe").classList.add("chosen");
            document.getElementById("customizeScreen").style.backgroundColor = "#bebebe";
            this.app.setBackground("bebebe");

            // reset selected customization target
            if (!this.onBoard) {
                document.querySelector("#customizeScreen .bgColours").classList.add("hidden");
                document.querySelector("#customizeScreen .background").classList.remove("selected");
                document.querySelector("#customizeScreen .boardColours").classList.remove("hidden");
                document.querySelector("#customizeScreen .board").classList.add("selected");

                this.onBoard = true;
            }

            this.app.showSelection();
        });

        this.preloadList.addLoad(() => LayoutManagerInstance.createEmptyLayout());

        this.preloadList.addHttpLoad("./img/assets/i_camera.png");
        document.getElementById("photo").src = "./img/assets/i_camera.png";
    }
}
