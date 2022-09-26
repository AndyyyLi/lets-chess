import "./styles/recordingScreen.scss";
import ScreenBase from "./screenBase";

import { LAYOUTS } from "../const";

import LayoutManagerInstance from "../layoutManager";
import RecordingManagerInstance from "../recordingManager";

export default class RecordingScreen extends ScreenBase {
    constructor(app) {
        super(null, document.querySelector("#recordingScreen"), LAYOUTS.RECORDING_CAMERA, app);

        document.querySelector("#recordingScreen .backButton").addEventListener("click", () => {
            this.app.showExperience();
        });

        this.preloadList.addLoad(() => LayoutManagerInstance.createRecordingCameraLayout());
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
