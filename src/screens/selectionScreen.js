import "./styles/selectionScreen.scss";
import ScreenBase from "./screenBase";

import { LAYOUTS, SOUNDS } from "../const";
import { sortAndDisplayPuzzles, setupPuzzleDetails } from "../util";

import LayoutManagerInstance from "../layoutManager";
import PersistentDataManagerInstance from "../persistentDataManager";

export default class SelectionScreen extends ScreenBase {
    constructor(app) {
        super("Selection", document.querySelector("#selectionScreen"), LAYOUTS.EMPTY_LAYOUT, app);

        this.puzzles;
        this.currentSort;

        this.preloadList.addLoad(() => LayoutManagerInstance.createEmptyLayout());

        // fetch('../puzzles/puzzles.json')
        // .then(res => res.json())
        // .then(puzzles => {
        //     this.puzzles = puzzles;
        //     sortAndDisplayPuzzles(this.puzzles, "none", null);
        //     this.currentSort = "none";
        // });

        // imports the puzzles.json file then displays them without sorting
        this.preloadList.addLoad(async () => {
            const response = await fetch('../puzzles/puzzles.json');
            this.puzzles = await response.json();

            this.currentSort = "none";

            sortAndDisplayPuzzles(this.puzzles, this.currentSort, null);
        });

        document.querySelector("#sortButton").addEventListener('click', () => {
            document.querySelector(".sortOptions").classList.remove("hidden");
        });

        document.querySelector(".sortOptions .moves").addEventListener('click', () => {
            sortAndDisplayPuzzles(this.puzzles, "moves", this.currentSort);
            this.currentSort = "moves";
            document.querySelector(".sortOptions").classList.add("hidden");
        });

        document.querySelector(".sortOptions .difficulty").addEventListener('click', () => {
            sortAndDisplayPuzzles(this.puzzles, "difficulty", this.currentSort);
            this.currentSort = "difficulty";
            document.querySelector(".sortOptions").classList.add("hidden");
        });

        document.querySelector(".sortOptions .gameState").addEventListener('click', () => {
            sortAndDisplayPuzzles(this.puzzles, "gameState", this.currentSort);
            this.currentSort = "gameState";
            document.querySelector(".sortOptions").classList.add("hidden");
        });

        document.querySelector(".sortOptions .opening").addEventListener('click', () => {
            sortAndDisplayPuzzles(this.puzzles, "opening", this.currentSort);
            this.currentSort = "opening";
            document.querySelector(".sortOptions").classList.add("hidden");
        });

        document.querySelector(".sortOptions .close").addEventListener('click', () => {
            document.querySelector(".sortOptions").classList.add("hidden");
        });

        document.querySelector("#randomPuzzleButton").addEventListener('click', () => {
            if (this.puzzles) {
                let randomIdx = Math.floor(Math.random() * this.puzzles.length);
                let puzzle = this.puzzles[randomIdx];

                this.app.setChosenPuzzle(puzzle);

                setupPuzzleDetails(puzzle);
    
                this.app.showDetails();
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

        // Set that the tutorial has been seen for this play mode
        // const playMode = isCreatorMode() ? "creator" : "audience";
        // PersistentDataManagerInstance.setSettingsDataProperty(`${playMode}_tutorial`, true);
    }
}
