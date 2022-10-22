import "./styles/selectionScreen.scss";
import ScreenBase from "./screenBase";

import { LAYOUTS, SOUNDS } from "../const";
import { sortPuzzles, setupPuzzleDetails, displayPuzzles, isCreatorMode, getPuzzleTitle, changeBoardColours } from "../util";

import LayoutManagerInstance from "../layoutManager";
import SoundManagerInstance from "../soundManager";
// import PersistentDataManagerInstance from "../persistentDataManager";

export default class SelectionScreen extends ScreenBase {
    constructor(app) {
        super("Selection", document.querySelector("#selectionScreen"), LAYOUTS.EMPTY_LAYOUT, app);

        this.puzzles;
        this.currentSort;
        this.listDisplayIdx = 0;
        this.scroll = document.getElementById("puzzleList").scrollTop;
        this.scrollToLoad = screen.width / 2;
        this.galleryOpen = false;

        this.preloadList.addLoad(() => LayoutManagerInstance.createEmptyLayout());

        // imports the puzzles.json file then displays them without sorting
        this.preloadList.addLoad(async () => {
            if (isCreatorMode()) {
                // only needs one "." for SDK, needs two for local webpack
                const response = await fetch('../puzzles/puzzles.json');
                this.puzzles = await response.json();

                this.currentSort = "none";

                this.listDisplayIdx = displayPuzzles(this.puzzles, this.listDisplayIdx);
            }
        });

        document.getElementById("puzzleList").addEventListener("scroll", () => {
            var newScroll = document.getElementById("puzzleList").scrollTop;
            // check downward scroll
            if (newScroll > this.scroll) {
                // check scroll past scrollToLoad and that there are still puzzles to display
                if (newScroll > this.scrollToLoad && this.listDisplayIdx < this.puzzles.length) {
                    this.listDisplayIdx = displayPuzzles(this.puzzles, this.listDisplayIdx);
                    this.scrollToLoad += screen.width * 2;
                }
            }

            this.scroll = newScroll;
        });

        document.querySelector("#selectionScreen .backButton").addEventListener("click", () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
            this.app.showMenu();
        });

        document.querySelector("#sortButton").addEventListener('click', () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
            document.querySelector("#selectionScreen .backdrop").style.transform = "scale(1)";
        });

        document.querySelector(".sortOptions .moves").addEventListener('click', () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
            sortPuzzles(this.puzzles, "moves", this.currentSort);
            this.listDisplayIdx = displayPuzzles(this.puzzles, 0);
            this.scrollToLoad = screen.width / 2;
            this.currentSort = "moves";
            document.querySelector("#selectionScreen .backdrop").style.transform = "scale(0)";
        });

        document.querySelector(".sortOptions .difficulty").addEventListener('click', () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
            sortPuzzles(this.puzzles, "difficulty", this.currentSort);
            this.listDisplayIdx = displayPuzzles(this.puzzles, 0);
            this.scrollToLoad = screen.width / 2;
            this.currentSort = "difficulty";
            document.querySelector("#selectionScreen .backdrop").style.transform = "scale(0)";
        });

        document.querySelector(".sortOptions .gameState").addEventListener('click', () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
            sortPuzzles(this.puzzles, "gameState", this.currentSort);
            this.listDisplayIdx = displayPuzzles(this.puzzles, 0);
            this.scrollToLoad = screen.width / 2;
            this.currentSort = "gameState";
            document.querySelector("#selectionScreen .backdrop").style.transform = "scale(0)";
        });

        document.querySelector(".sortOptions .opening").addEventListener('click', () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
            sortPuzzles(this.puzzles, "opening", this.currentSort);
            this.listDisplayIdx = displayPuzzles(this.puzzles, 0);
            this.scrollToLoad = screen.width / 2;
            this.currentSort = "opening";
            document.querySelector("#selectionScreen .backdrop").style.transform = "scale(0)";
        });

        document.querySelector(".sortOptions .close").addEventListener('click', () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
            document.querySelector("#selectionScreen .sorting").style.transform = "scale(0)";
        });

        document.querySelector("#randomPuzzleButton").addEventListener('click', () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);

            if (this.puzzles) {
                let randomIdx = Math.floor(Math.random() * this.puzzles.length);
                let puzzle = this.puzzles[randomIdx];

                this.app.setChosenPuzzle(puzzle);

                document.querySelector("#customizeScreen .puzzleTitle").innerHTML = getPuzzleTitle(puzzle);
                setupPuzzleDetails(puzzle, "#customizeScreen", "puzzleDetails");

                this.app.showDetails();
            }
        });

        document.querySelector("#selectionScreen .chooseButton").addEventListener('click', () => {
            let puzzle = this.app.getChosenPuzzle();

            document.querySelector("#customizeScreen .puzzleTitle").innerHTML = getPuzzleTitle(puzzle);
            setupPuzzleDetails(puzzle, "#customizeScreen", "puzzleDetails");

            // set board colour options
            document.querySelectorAll("#customizeScreen .boardColours .colour").forEach(colour => {
                let darkColour = "#" + colour.id.substring(0,6);
                let lightColour = "#" + colour.id.substring(6,12);

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
                // prevents weird doubleclicking bug
                if (this.galleryOpen) return;

                this.galleryOpen = true;

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

                this.galleryOpen = false;
            });

            document.querySelector("#selectionScreen .showInfo").style.transform = "scale(0)";

            this.app.showDetails();
        });

        document.querySelector(".detailsWindow .close").addEventListener('click', () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
            document.querySelector("#selectionScreen .showInfo").style.transform = "scale(0)";
        });
    }

}
