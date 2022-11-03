import "./styles/selectionScreen.scss";
import ScreenBase from "./screenBase";

import { LAYOUTS, SOUNDS } from "../const";
import { sortPuzzles, setupPuzzleDetails, displayPuzzles, isCreatorMode, getPuzzleTitle } from "../util";

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

        this.preloadList.addLoad(() => LayoutManagerInstance.createEmptyLayout());

        // imports the puzzles.json file then displays them without sorting
        this.preloadList.addLoad(async () => {
            if (isCreatorMode()) {
                const response = await fetch('./puzzles/puzzles.json');
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

                document.querySelector("#customizeScreen .puzzleTitle").innerText = getPuzzleTitle(puzzle);
                setupPuzzleDetails(puzzle, "#customizeScreen", "puzzleDetails");

                this.app.showCustomization();
            }
        });

        document.querySelector("#selectionScreen .chooseButton").addEventListener('click', () => {
            let puzzle = this.app.getChosenPuzzle();
            
            document.querySelector("#customizeScreen .puzzleTitle").innerText = getPuzzleTitle(puzzle);
            setupPuzzleDetails(puzzle, "#customizeScreen", "puzzleDetails");

            document.querySelector("#selectionScreen .showInfo").style.transform = "scale(0)";

            this.app.showCustomization();
        });

        document.querySelector(".detailsWindow .close").addEventListener('click', () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
            document.querySelector("#selectionScreen .showInfo").style.transform = "scale(0)";
        });

        this.preloadList.addHttpLoad("./img/assets/i_sort.png");
        document.getElementById("sortButton").src = "./img/assets/i_sort.png";

        this.preloadList.addHttpLoad("./img/assets/i_exit.png");
        document.querySelectorAll("#selectionScreen .close").forEach(close => {
            close.src = "./img/assets/i_exit.png";
        });

        this.preloadList.addHttpLoad("./img/assets/whiteking.png");
        document.querySelectorAll("#selectionScreen .indicator").forEach(i => {
            i.src = "./img/assets/whiteking.png";
        });
        document.querySelector("#gameplayScreen .giveUpImg").src = "./img/assets/whiteking.png";
    }

}
