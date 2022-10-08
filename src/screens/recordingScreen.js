import "./styles/recordingScreen.scss";
import ScreenBase from "./screenBase";

import { LAYOUTS } from "../const";

import LayoutManagerInstance from "../layoutManager";
import RecordingManagerInstance from "../recordingManager";

export default class RecordingScreen extends ScreenBase {
    constructor(app) {
        super(null, document.querySelector("#recordingScreen"), LAYOUTS.RECORDING_CAMERA, app);

        if (!this.app.getIsCompete()) {
            document.querySelector("#recordingScreen .backButton").addEventListener("click", () => {
                this.app.showDetails();
            });
        }
        
        document.getElementById("recordingScreen").style.marginTop = (screen.height / 3) + "px";

        this.preloadList.addLoad(async () => await LayoutManagerInstance.createContentCameraLayout());
    }

    show() {
        super.show();
        RecordingManagerInstance.showNativeRecordButton();
    }

    hide() {
        RecordingManagerInstance.hideNativeRecordButton();
        super.hide();
    }
}
