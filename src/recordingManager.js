import { VIDEO_LENGTH } from "./const";
import ScreenManagerInstance from "./screenManager";

/**
 * Handles showing and hiding the native record button, and handling full screen recordings
 */
class RecordingManager {
    constructor() {
        this.nativeRecordButton = null;
        this.fullScreenRecorder = null;
        this.onRecordingComplete = null;
        this.recording = false;
        this.fullScreenRecording = null;
    }

    async init(nativeUIManager, controlManager, onRecordingStarted, onRecordingComplete) {
        this.nativeRecordButton = await nativeUIManager.createNativeRecordButton(0.5, 0.81, 0.085);
        this.fullScreenRecorder = await controlManager.getFullScreenRecorder();

        this.onRecordingStarted = onRecordingStarted;
        this.onRecordingComplete = onRecordingComplete;

        this.recording = false;
        this.fullScreenRecording = null;

        this.nativeRecordButton.clickedEvent.add(() => { this.recordingButtonClicked() } );
        this.nativeRecordButton.countdownEndedEvent.add(() => { this.recordingCountdownEnded() });
    }

    async recordingButtonClicked() {
        if (this.recording) {
            this.nativeRecordButton.resetCountdown(0);
            this.recordingCountdownEnded();
        } else {
            this.recording = true;            

            if (this.fullScreenRecording != null) {
                this.deleteFullScreenRecording();
            }
            
            this.onRecordingStarted();
            ScreenManagerInstance.activeScreen.startRecording();

            this.nativeRecordButton.startCountdown();
            this.fullScreenRecorder.startRecording();
        }
    }

    async recordingCountdownEnded() {
        this.recording = false;
        this.hideNativeRecordButton();
        this.nativeRecordButton.resetCountdown(VIDEO_LENGTH);
        
        this.fullScreenRecording = await this.fullScreenRecorder.stopRecording();

        ScreenManagerInstance.activeScreen.stopRecording();
        this.onRecordingComplete();
    }

    showNativeRecordButton() {
        this.nativeRecordButton.show();
        this.nativeRecordButton.resetCountdown(VIDEO_LENGTH);
    }
    hideNativeRecordButton() {
        this.nativeRecordButton.hide();
    }

    isRecording() {
        return this.recording;
    }

    getFullScreenRecording() {
        return this.fullScreenRecording;
    }
    deleteFullScreenRecording() {
        this.fullScreenRecording.delete();
        this.fullScreenRecording = null;
    }
}

const RecordingManagerInstance = new RecordingManager();
export default RecordingManagerInstance;
