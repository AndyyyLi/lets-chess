import "./styles/detailsScreen.scss";
import ScreenBase from "./screenBase";

import { LAYOUTS, SOUNDS } from "../const";
import { setupPuzzleDetails } from "../util";
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

        document.querySelector("#detailsScreen .backButton").addEventListener("click", () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);

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
