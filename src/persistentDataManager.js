import { PreloadList } from "./libs/Preloader";

class PersistentDataManager {
    constructor() {
        this.persistentDataService = null;
        
        this.settingsData = {};
        this.perOoohData = {};
    }

    async init() {
        this.persistentDataService = o3h.Instance.getUserPersistentDataService();
        
        const persistentDataLoader = new PreloadList();

        persistentDataLoader.addLoad(async () => {
            const settingsData = await this.persistentDataService.getSettingsDataAsync();
            if (settingsData != null) {
                this.settingsData = settingsData;
            }
        });

        persistentDataLoader.addLoad(async () => {
            const perOoohData = await this.persistentDataService.getPerOoohDataAsync();
            if (perOoohData != null) {
                this.perOoohData = perOoohData;
            }
        });
        
        // Load settings and per oooh data in parallel
        return persistentDataLoader.loadAll();
    }

    getSettingsData() {
        return this.settingsData;
    }
    getPerOoohData() {
        return this.perOoohData;
    }

    setSettingsData(value) {
        this.settingsData = value;
        this.persistentDataService.setSettingsDataAsync(this.settingsData);
    }
    setPerOoohData(value) {
        this.perOoohData = value;
        this.persistentDataService.setPerOoohDataAsync(this.perOoohData);
    }

    getSettingsDataProperty(key) {
        return this.settingsData[key];
    }
    getPerOoohDataProperty(key) {
        return this.perOoohData[key];
    }

    setSettingsDataProperty(key, value) {
        this.settingsData[key] = value;
        this.persistentDataService.setSettingsDataAsync(this.settingsData);
    }
    setPerOoohDataProperty(key, value) {
        this.perOoohData[key] = value;
        this.persistentDataService.setPerOoohDataAsync(this.perOoohData);
    }
}

const PersistentDataManagerInstance = new PersistentDataManager();
export default PersistentDataManagerInstance;
