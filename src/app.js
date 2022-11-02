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
        this.menuScreen = new MenuScreen(this);
        this.instructionsScreen = new InstructionsScreen(this);
        this.selectionScreen = new SelectionScreen(this);
        this.customizeScreen = new CustomizeScreen(this);
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
        listPreloader.addPreloadList(this.menuScreen.getPreloadList());
        listPreloader.addPreloadList(this.instructionsScreen.getPreloadList());
        listPreloader.addPreloadList(this.selectionScreen.getPreloadList());
        listPreloader.addPreloadList(this.customizeScreen.getPreloadList());
        listPreloader.addPreloadList(this.gameplayScreen.getPreloadList());
        listPreloader.addPreloadList(this.recordingScreen.getPreloadList());
        listPreloader.addPreloadList(this.reviewScreen.getPreloadList());
    
        listPreloader.loadAll();

        await ScreenManagerInstance.showScreen(this.splashScreen);
    
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
        this.runtime.completeModule({ "attempts": this.attempts * -1 });
    }
}