import "./styles/recordingScreen.scss";
import ScreenBase from "./screenBase";

import { LAYOUTS } from "../const";

import LayoutManagerInstance from "../layoutManager";
import RecordingManagerInstance from "../recordingManager";
import { isAudienceMode } from "../util";

export default class RecordingScreen extends ScreenBase {
    constructor(app) {
        super(null, document.querySelector("#recordingScreen"), LAYOUTS.RECORDING_CAMERA, app);
        
        document.getElementById("recordingScreen").style.marginTop = screen.height / 3;

        this.preloadList.addLoad(async () => await LayoutManagerInstance.createContentCameraLayout());

        if (isAudienceMode()) {
            this.preloadList.addHttpLoad("./img/assets/i_larrow.png");
            this.preloadList.addHttpLoad("./img/assets/i_rarrow.png");
            document.querySelector("#recordingScreen .prevMove").src = "./img/assets/i_larrow.png";
            document.querySelector("#recordingScreen .nextMove").src = "./img/assets/i_rarrow.png";
        }
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
