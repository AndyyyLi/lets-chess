import "./styles/reviewScreen.scss";
import ScreenBase from "./screenBase";

import { LAYOUTS, SOUNDS } from "../const";

import LayoutManagerInstance from "../layoutManager";
import SoundManagerInstance from "../soundManager";

export default class ReviewScreen extends ScreenBase {
    constructor(app) {
        super("EndScreen", document.querySelector("#reviewScreen"), LAYOUTS.REVIEW_VIDEO, app);

        document.querySelector("#review_retry").addEventListener("click", () => {
            this.app.showRecording();
        });

        document.querySelector("#review_done").addEventListener("click", () => {
            this.app.exit();
        });

        document.querySelectorAll("#reviewScreen button").forEach(button => {
            button.addEventListener("click", () => {
                SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
            });
        })

        this.preloadList.addLoad(async () => {
            const layout = await LayoutManagerInstance.createReviewVideoLayout();
            this.reviewVideoComponent = layout.getComponent("main");
        });
    }

    show() {
        super.show();
        // Play the recorded video, loaded in App.showReview()
        this.reviewVideoComponent.playVideo();
    }

    hide() {
        // Stop playing the video when this screen is hidden
        this.reviewVideoComponent.stop();

        super.hide();
    }
}
