import "./styles/selectionScreen.scss";
import ScreenBase from "./screenBase";
import { ChessEngine } from "../chessEngine";

import { LAYOUTS, SOUNDS } from "../const";
import { isCreatorMode } from "../util";

import LayoutManagerInstance from "../layoutManager";
import PersistentDataManagerInstance from "../persistentDataManager";
import SoundManagerInstance from "../soundManager";

export default class SelectionScreen extends ScreenBase {
    constructor(app) {
        super("Selection", document.querySelector("#selectionScreen"), LAYOUTS.EMPTY_LAYOUT, app);

        document.querySelector("#selectionScreen button").addEventListener("click", () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);

            this.app.showGameplay();
        });

        this.puzzles;

        this.preloadList.addLoad(() => LayoutManagerInstance.createEmptyLayout());

        this.preloadList.addLoad(async () => {
            const response = await fetch('../puzzles/puzzles.json');
            this.puzzles = await response.json();

            this.puzzles.forEach(puzzle => {
                var board = document.createElement("div");
                board.id = puzzle.PuzzleId;
                board.className = "puzzle";
                // when clicked, takes user to confirm screen
                // board.onclick = function() {
                //     confirmBoard(puzzle);
                // };

                document.getElementById("puzzleList").appendChild(board);

                ChessEngine.buildPuzzle(board.id, puzzle.FEN);
            });
        });

        document.querySelector("#sortButton").addEventListener('click', () => {
            
        });

        document.querySelector("#randomPuzzleButton").addEventListener('click', () => {
            if (this.puzzles) {
                let randomIdx = Math.floor(Math.random() * this.puzzles.length);
                // confirmBoard(puzzles[randomIdx]);
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
        const playMode = isCreatorMode() ? "creator" : "audience";
        PersistentDataManagerInstance.setSettingsDataProperty(`${playMode}_tutorial`, true);
    }
}
