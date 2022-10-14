import "./styles/selectionScreen.scss";
import ScreenBase from "./screenBase";

import { LAYOUTS, SOUNDS } from "../const";
import { sortAndDisplayPuzzles, setupPuzzleDetails } from "../util";

import LayoutManagerInstance from "../layoutManager";
import SoundManagerInstance from "../soundManager";
// import PersistentDataManagerInstance from "../persistentDataManager";

export default class SelectionScreen extends ScreenBase {
    constructor(app) {
        super("Selection", document.querySelector("#selectionScreen"), LAYOUTS.EMPTY_LAYOUT, app);

        this.puzzles;
        this.currentSort;

        this.preloadList.addLoad(() => LayoutManagerInstance.createEmptyLayout());

        // imports the puzzles.json file then displays them without sorting
        this.preloadList.addLoad(async () => {
            const response = await fetch('./puzzles/puzzles.json');
            this.puzzles = await response.json();

            this.currentSort = "none";

            sortAndDisplayPuzzles(this.puzzles, this.currentSort, null);
        });

        document.querySelector("#selectionScreen .backButton").addEventListener("click", () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
            this.app.showMenu();
        })

        document.querySelector("#sortButton").addEventListener('click', () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
            document.querySelector(".sortOptions").classList.remove("hidden");
        });

        document.querySelector(".sortOptions .moves").addEventListener('click', () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
            sortAndDisplayPuzzles(this.puzzles, "moves", this.currentSort);
            this.currentSort = "moves";
            document.querySelector(".sortOptions").classList.add("hidden");
        });

        document.querySelector(".sortOptions .difficulty").addEventListener('click', () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
            sortAndDisplayPuzzles(this.puzzles, "difficulty", this.currentSort);
            this.currentSort = "difficulty";
            document.querySelector(".sortOptions").classList.add("hidden");
        });

        document.querySelector(".sortOptions .gameState").addEventListener('click', () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
            sortAndDisplayPuzzles(this.puzzles, "gameState", this.currentSort);
            this.currentSort = "gameState";
            document.querySelector(".sortOptions").classList.add("hidden");
        });

        document.querySelector(".sortOptions .opening").addEventListener('click', () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
            sortAndDisplayPuzzles(this.puzzles, "opening", this.currentSort);
            this.currentSort = "opening";
            document.querySelector(".sortOptions").classList.add("hidden");
        });

        document.querySelector(".sortOptions .close").addEventListener('click', () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
            document.querySelector(".sortOptions").classList.add("hidden");
        });

        document.querySelector("#randomPuzzleButton").addEventListener('click', () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);

            if (this.puzzles) {
                let randomIdx = Math.floor(Math.random() * this.puzzles.length);
                let puzzle = this.puzzles[randomIdx];

                this.app.setChosenPuzzle(puzzle);

                // show title
                if (puzzle.OpeningFamily) {
                    let name = puzzle.OpeningVariation.replaceAll('_', ' ');
                    document.querySelector("#detailsScreen .puzzleTitle").innerHTML = name;
                } else {
                    document.querySelector("#detailsScreen .puzzleTitle").innerHTML = "Puzzle " + puzzle.PuzzleId;
                }
                
                setupPuzzleDetails(puzzle, "#detailsScreen", "puzzleDetails");

                this.app.showDetails();
            }
        });
    }

}
