/**
 * Runs a series of PreloadLists sequentially.  This allows full system resources to be used on the highest-priority
 * assets (the ones that will be shown first)
 */
export class PreloadListLoader {
    constructor() {
        this.preloadLists = [];
    }

    /**
     * Adds a task to the list
     * @param {function} preloadList
     * @param {number} b
     * @returns {number}
     */
    addPreloadList(preloadList) {
        this.preloadLists.push(preloadList);
    }

    async loadAll() {
        for (let i = 0; i < this.preloadLists.length; i++) {
            await this.preloadLists[i].loadAll();
        }
    }
}

/**
 * Handles performing a series of async tasks in parallel, such as pre-caching an image or sound, creating a layout,
 */
export class PreloadList {
    constructor() {
        this.loadFuncs = [];
        this.allLoadsPromise = null;
    }

    /**
     * Adds a task to the preload list
     * @param {function} loadFunc - an async function to be performed when loadAll is called
     */
    addLoad(loadFunc) {
        this.loadFuncs.push(loadFunc);
    }

    /**
     * Helper function to pre-cache an asset, such as an image or sound
     * @param {string} path - the path where the resource is located
     */
    addHttpLoad(path) {
        this.addLoad(() => fetch(path));
    }

    /**
     * Kicks off all tasks that have been added with addLoad().  Can safely be called multiple times without restarting
     * the loads.
     * @returns {Promise} - a promise that resolves when all loads have been completed
     */
    loadAll() {
        if (!this.allLoadsPromise) {
            this.allLoadsPromise = Promise.all(
                // kick off each load function, and add them to an array
                this.loadFuncs.map(
                    (f) => new Promise((res, rej) => f().then(res, rej))
                )
            );
        }

        return this.allLoadsPromise;
    }
}
