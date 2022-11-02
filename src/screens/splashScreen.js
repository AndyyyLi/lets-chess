import "./styles/splashScreen.scss";
import ScreenBase from "./screenBase";

import { LAYOUTS, SOUNDS, ASSETS } from "../const";
import { isCreatorMode, isAudienceMode } from "../util";

import LayoutManagerInstance from "../layoutManager";
import PersistentDataManagerInstance from "../persistentDataManager";
import SoundManagerInstance from "../soundManager";

export default class SplashScreen extends ScreenBase {
    constructor(app) {
        super("SplashScreen", document.querySelector("#splashScreen"), LAYOUTS.EMPTY_LAYOUT, app);

        document.querySelector("#splashScreen .continueButton").addEventListener("click", () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);

            // Checks the play mode
            // const playMode = isCreatorMode() ? "creator" : "audience";

            if (isCreatorMode()) {
                this.app.showMenu();
            } else {
                if (this.app.getIsCompete()) {
                    document.querySelector("#instructionsScreen .compete").classList.remove("hidden");
                    document.querySelector("#instructionsScreen .instructionsOptions").classList.remove("hidden");
                } else {
                    document.querySelector("#instructionsScreen .choose").classList.remove("hidden");
                }

                this.app.showInstructions();
            }

            // If the player has already seen the tutorial for this play mode...
            // if (PersistentDataManagerInstance.getSettingsDataProperty(`${playMode}_tutorial`)) {
            //     // ... skip to showing the experience screen
            //     this.app.showGameplay();
            // } else {
            //     // Otherwise, show the tutorial screen
            //     this.app.showMenu();
            // }
        });


        /**
         * *** PRE-LOADING ASSETS IN YOUR MODULE ***
         * 
         * - Preload images using PreloadList.addHttpLoad(). This will save the image in the local cache so it
         *   will show immediately when the screen is visible.
         * 
         * - Preload sounds by passing the sound loading promise from SoundManager.loadSound() to PreloadList.addLoad().
         *   This will resolve when the sound has been loaded by the Oooh platform.
         * 
         * - Preload fonts by adding preload <link> tags in the <head> of your index.html, so there will never be a flash
         *   of unstyled text. Check it out!
         * 
         * - Preload creating layouts in your module by passing the layout promise from LayoutManager to PreloadList.addLoad().
         * 
         * - You can preload any other asynchronous tasks in your module by passing an asynchronous function to PreloadList.addLoad().
         */


        // This is an example of pre-loading an image.  You should pre-load any images or other web assets you are going
        // to use on a given screen so they can be shown immediately when the screen is visible.
        this.preloadList.addHttpLoad("./img/assets/i_back.png");
        document.querySelectorAll(".backButton").forEach(btn => {
            btn.style.backgroundImage = "url(\"./img/assets/i_back.png\")";
        });

        
        this.preloadList.addHttpLoad("./img/assets/background_2.png");
        if (isCreatorMode()) {
            document.getElementById("menuScreen").style.backgroundImage = "url(\"./img/assets/background_2.png\")";
        } else {
            document.getElementById("instructionsScreen").style.backgroundImage = "url(\"./img/assets/background_2.png\")";
        }

        this.preloadList.addHttpLoad("./img/assets/splashcrop.png");
        document.getElementById("splashScreen").style.backgroundImage = "url(\"./img/assets/splashcrop.png\")";

        this.preloadList.addHttpLoad("./img/assets/title.png");
        document.querySelectorAll(".title").forEach(title => {
            title.src = "./img/assets/title.png";
        });

        // Do THIS to load sounds in Oooh! This will load a button sound using the Howler library with the HTML5 audio polyfill
        this.preloadList.addLoad(() => SoundManagerInstance.loadSound(SOUNDS.SFX_BUTTON_TAP));

        // Fonts pre-loading in index.html

        // This is an example of pre-loading an Oooh API call. You should pre-load any calls that can take a few seconds to
        // complete, such as creating layouts and loading creator assets.
        this.preloadList.addLoad(() => LayoutManagerInstance.createEmptyLayout());

        this.preloadList.addLoad(async () => {
            if (isAudienceMode()) {
                const assetManager = o3h.Instance.getAssetManager();

                const replayData = assetManager.getInputAsset(ASSETS.REPLAY_DATA);
                const replayPlayer = await replayData.createReplayPlayer();

                const replayProperties = await replayPlayer.getProperties();
                const isCompete = replayProperties.isCompete;

                this.app.setIsCompete(isCompete);
            }
        });

        // this.preloadList.addLoad(async () => {
        //     // Checks the play mode
        //     const playMode = isCreatorMode() ? "creator" : "audience";

        //     // If the player has already seen the tutorial for this play mode...
        //     if (PersistentDataManagerInstance.getSettingsDataProperty(`${playMode}_tutorial`)) {
        //         // ... show the tutorial button on the splash screen
        //         document.querySelector("#splashScreen #tutorialButton").classList.remove("hidden");
        //     }
        // });
    }

    show() {
        super.show();

        this.app.systemSettingsService.showSystemSettings();
    }
}
