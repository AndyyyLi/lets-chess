import {
    getFullScreenLayout, LAYOUTS
} from "./const";

/**
 * Handles layout creation and display, and maintains references to the components in each layout.
 * Further reading: https://docs.oooh.io/docs/controlling-layout#layout
 */
class LayoutManager {
    /**
     * @constructor
     */
    constructor() {
        // A map of strings to the promise of the layout
        this.layoutsByName = new Map();
    }

    /**
     * Creates a layout and returns a promise that resolves to it.
     * API Reference: https://docs.oooh.io/docs/api-reference-layoutmanager#layoutmanagercreatelayout-method
     * 
     * @param {string} layoutName - The name of the layout
     * @param {module:o3h~ComponentConfig} layoutConfig - The layout config
     * @param {module:o3h.Component} layoutComponents - Component definitions to use in the layout
     * @param {module:o3h~Transition} existingComponents - Existing components to reuse
     * 
     * @returns {Promise.<module:o3h~Layout>}
     */
    createLayout(layoutName, layoutConfig, layoutComponents, existingComponents = {}) {
        if (this.layoutsByName.has(layoutName)) {
            return this.layoutsByName.get(layoutName);
        }

        const layoutPromise = o3h.Instance.getLayoutManager().createLayout(layoutConfig, layoutComponents, existingComponents);
        this.layoutsByName.set(layoutName, layoutPromise);

        return layoutPromise;
    }

    /**
     * Creates an empty layout with an empty main component.
     */
    async createEmptyLayout() {
        await this.createLayout(LAYOUTS.EMPTY_LAYOUT, "Full Screen", {});
    }

    async getLayout(layoutName) {
        const layout = await this.layoutsByName.get(layoutName);
        if (layout) {
            return layout;
        }
        return null;
    }

    /**
     * Shows a layout that has already been created and hides the current active layout.
     * 
     * @param {string} layoutName - The name of the pre-created layout
     */
    async showLayout(layoutName) {
        const layout = await this.layoutsByName.get(layoutName);
        if (layout) {
            await layout.show(true);
            return layout;
        }
        return null;
    }

    async hideLayout(layoutName) {
        const layout = await this.layoutsByName.get(layoutName);
        if (layout) {
            layout.hide(true);
            return layout;
        }
        return null;
    }

    async destroyLayout(layoutName) {
        const layout = await this.layoutsByName.get(layoutName);
        if (layout) {
            layout.destroy();
            this.layoutsByName.delete(layoutName);
        }
    }

    /** 
     * *** CREATE YOUR MODULE LAYOUTS ***
     * The following methods are examples for creating your own layouts using this LayoutManager. You can create your
     * own for your module.
     *  
     * - Add the layout name and a constant key to LAYOUTS in ./const.js
     * - Add a method to get the custom layout configuration in ./const.js
     * - Configure the video and camera components you'd like to create in your layout
     * - Call this.createLayout() with the layout name, the custom configuration and your component configs
     * 
     * - You can get components from the layout using Layout.getComponent()
     *      - ... and re-use them in new layouts by passing in a map of existingComponents to this.createLayout()
     */

    
    /**
     * Creates a layout with one fullscreen camera element.
     */
     async createRecordingCameraLayout() {
        const cameraConfig = new o3h.CameraComponentConfig();

        const layout = await this.createLayout(
            LAYOUTS.RECORDING_CAMERA,
            getFullScreenLayout(),
            { "main": cameraConfig }
        );
        
        return layout;
    }

    /**
     * Creates a layout with one fullscreen video element.
     */
    async createReviewVideoLayout() {
        const videoConfig = new o3h.VideoComponentConfig();

        const layout = await this.createLayout(
            LAYOUTS.REVIEW_VIDEO,
            getFullScreenLayout(),
            { "main": videoConfig }
        );

        return layout;
    }

}

const LayoutManagerInstance = new LayoutManager();
export default LayoutManagerInstance;
