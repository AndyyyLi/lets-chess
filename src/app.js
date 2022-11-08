/* eslint-disable no-undef */
import "./style.scss";

import ScreenManagerInstance from "./screenManager";
import RecordingManagerInstance from "./recordingManager";
import PersistentDataManagerInstance from "./persistentDataManager";

import SplashScreen from "./screens/splashScreen";
import MenuScreen from "./screens/menuScreen";
import InstructionsScreen from "./screens/instructionsScreen";
import SelectionScreen from "./screens/selectionScreen";
import CustomizeScreen from "./screens/customizeScreen";
import GameplayScreen from "./screens/gameplayScreen";
import RecordingScreen from "./screens/recordingScreen";
import ReviewScreen from "./screens/reviewScreen";

import { PreloadList, PreloadListLoader } from "./libs/Preloader";
import { isCreatorMode } from "./util";
import { ASSETS } from "./const";

export default class App {
    constructor() {    
        this.runtime = o3h.Instance;
        this.runtime.adjustViewport("device-width", "device-height");

        this.assetManager = this.runtime.getAssetManager();
        this.inputManager = this.runtime.getInputManager();

        this.systemSettingsService = this.runtime.getSystemSettingsService();
        this.analyticService = this.runtime.getAnalyticService();

        this.splashScreen = new SplashScreen(this);
        
        if (isCreatorMode()) {
            this.menuScreen = new MenuScreen(this);
            this.selectionScreen = new SelectionScreen(this);
            this.customizeScreen = new CustomizeScreen(this);
            
            // holds PuzzleId's as keys and attempt counts for that respective puzzle as values
            this.attemptRecord;
        } else {
            this.instructionsScreen = new InstructionsScreen(this);
        }
        
        this.gameplayScreen = new GameplayScreen(this);
        this.recordingScreen = new RecordingScreen(this);
        this.reviewScreen = new ReviewScreen(this);

        this.chosenPuzzle;
        this.isCompete;
        this.attempts;
        this.colour;
        this.background;


        this.init();
    }

    setChosenPuzzle(puzzle) {
        this.chosenPuzzle = puzzle;
    }

    getChosenPuzzle() {
        return this.chosenPuzzle;
    }

    setIsCompete(isCompete) {
        this.isCompete = isCompete;
    }

    getIsCompete() {
        return this.isCompete;
    }

    setAttempts(num) {
        this.attempts = num;
    }

    getAttempts() {
        return this.attempts;
    }

    setColour(colour) {
        this.colour = colour;
    }

    getColour() {
        return this.colour;
    }

    setBackground(background) {
        this.background = background;
    }

    getBackground() {
        return this.background;
    }

    setAttemptRecord(id, attempts) {
        this.attemptRecord[id] = attempts;
    }

    getAttemptRecord(id) {
        return this.attemptRecord[id];
    }

    async init() {
        const managerPreloader = new PreloadList();

        managerPreloader.addLoad(() => RecordingManagerInstance.init(this.runtime.getNativeUIManager(), this.runtime.getControlManager(),
        () => {
            // Hide UI when recording starts
        },
        () => {
            // Show the review screen when recording stops
            this.showReview();
        }));
        managerPreloader.addLoad(() => PersistentDataManagerInstance.init());

        await managerPreloader.loadAll();

        const listPreloader = new PreloadListLoader();
        listPreloader.addPreloadList(this.splashScreen.getPreloadList());

        if (isCreatorMode()) {
            listPreloader.addPreloadList(this.menuScreen.getPreloadList());
            listPreloader.addPreloadList(this.selectionScreen.getPreloadList());
            listPreloader.addPreloadList(this.customizeScreen.getPreloadList());
        } else {
            listPreloader.addPreloadList(this.instructionsScreen.getPreloadList());
        }
        
        listPreloader.addPreloadList(this.gameplayScreen.getPreloadList());
        listPreloader.addPreloadList(this.recordingScreen.getPreloadList());
        listPreloader.addPreloadList(this.reviewScreen.getPreloadList());
    
        listPreloader.loadAll();

        await ScreenManagerInstance.showScreen(this.splashScreen);

        if (isCreatorMode()) {
            const service = await o3h.Instance.getUserPersistentDataService();
            let savedRecord = await service.getPerOoohDataAsync();
            let currDate = new Date();

            if (savedRecord) {
                let timeDiffHrs = (currDate.getTime() - savedRecord["time"]) / 3600000;
                console.log(timeDiffHrs);

                // reset attempts every 24 hours
                if (timeDiffHrs >= 24) {
                    this.attemptRecord = { "time": currDate.getTime() };
                } else {
                    this.attemptRecord = savedRecord;
                }
            } else {
                this.attemptRecord = { "time": currDate.getTime() };
            }
        }
    
        this.runtime.ready(() => {
            // Start splash screen animation, music, etc.

            // Show the title element to start its CSS animation
            document.querySelector("#splashScreen .title").classList.remove("hidden");
        });
    }

    async showMenu() {
        await ScreenManagerInstance.showScreen(this.menuScreen);
    }

    async showInstructions() {
        await ScreenManagerInstance.showScreen(this.instructionsScreen);
    }

    async showSelection() {
        await ScreenManagerInstance.showScreen(this.selectionScreen);
    }

    async showCustomization() {
        await ScreenManagerInstance.showScreen(this.customizeScreen);
    }

    async showGameplay() {
        await ScreenManagerInstance.showScreen(this.gameplayScreen);
    }

    async showRecording() {
        await ScreenManagerInstance.showScreen(this.recordingScreen);
    }

    async showReview() {
        ScreenManagerInstance.showLoadingCover();
        const fullScreenVideoAsset = RecordingManagerInstance.getFullScreenRecording();

        await this.reviewScreen.getPreloadList().loadAll();

        const videoPath = await fullScreenVideoAsset.getVideoPath();
        await this.reviewScreen.reviewVideoComponent.prepareVideo(videoPath);

        await ScreenManagerInstance.showScreen(this.reviewScreen);
        ScreenManagerInstance.hideLoadingCover();
    }

    async exit() {
        // Add the full-screen video recording as an output asset
        this.assetManager.addToOutput(ASSETS.FULL_SCREEN_RECORDING, RecordingManagerInstance.getFullScreenRecording());

        if (isCreatorMode()) {
            // Update persistent data for user's attempt record
            const service = await o3h.Instance.getUserPersistentDataService();
            await service.setPerOoohDataAsync(this.attemptRecord);

            // Add creator mode assets to output
            const replayRecorder = await this.runtime.createReplayRecorder();
            // Add the creator message as a replay data property
            // replayRecorder.addProperty("message", this.message);
            replayRecorder.addProperty("puzzle", this.chosenPuzzle);
            replayRecorder.addProperty("isCompete", this.isCompete);
            replayRecorder.addProperty("attempts", this.attempts);
            replayRecorder.addProperty("colour", this.colour);
            replayRecorder.addProperty("background", this.background);

            // Get the replay data from the replay recorder and add it as an output asset
            const replayData = await replayRecorder.getReplayData();
            this.assetManager.addToOutput(ASSETS.REPLAY_DATA, replayData);
        }

        // End the module with a score of 0 (non-game module)
        this.runtime.completeModule({ "score": this.attempts });
    }
}