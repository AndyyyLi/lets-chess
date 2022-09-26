export const LAYOUTS = {
    EMPTY_LAYOUT: "emptyLayout",
    RECORDING_CAMERA: "recordingCamera",
    REVIEW_VIDEO: "reviewVideo"
};

// These assets must match the names configured in ./o3hmanifest.json
export const ASSETS = {
    FULL_SCREEN_RECORDING: "fullScreenRecording",
    REPLAY_DATA: "replay"
};

export const SOUNDS = {
    SFX_BUTTON_TAP: "./sounds/SFX_Button_Tap.mp3"
};

export const VIDEO_LENGTH = 30;

export const getCreatorCameraLayout = () => ({
    childrenFlexDirection: o3h.Layout.Direction.Vertical,
    children: [
        {
            id: "creator",
            flexRatio: 1
        },
        {
            id: "gameplay",
            flexRatio: 2
        }
    ]
});

export const getCreatorAudienceLayout = () => ({
    childrenFlexDirection: o3h.Layout.Direction.Vertical,
    children: [
        {
            flexRatio: 1,
            childrenFlexDirection: o3h.Layout.Direction.Horizontal,
            children: [
                {
                    id: "creator",
                    flexRatio: 1
                },
                {
                    id: "audience",
                    flexRatio: 1
                }
            ]
        },
        {
            id: "gameplay",
            flexRatio: 2
        }
    ]
});

export const getFullScreenLayout = () => ({
    childrenFlexDirection: o3h.Layout.Direction.Vertical,
    children: [
        {
            id: "main",
            flexRatio: 1
        }
    ]
});
