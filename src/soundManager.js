import { Howl } from "howler";
import { sleep } from "./util";

class SoundManager {
    constructor() {
        // A map of strings to the sound object
        this.soundsByPath = new Map();
    }

    loadSound(soundPath, o3hAudio = false, looping = false, pool = 5) {
        if (this.soundsByPath.has(soundPath)) {
            return this.soundsByPath.get(soundPath).loading();
        }

        if (!o3hAudio) {
            // Use Howler (HTML5 audio polyfill)
            const sound = new HowlerSound(soundPath, looping, pool);
            this.soundsByPath.set(soundPath, sound);
        } else {
            // Use o3h audio
            const sound = new O3hSound(soundPath, looping, o3h.Instance.getAudioManager());
            this.soundsByPath.set(soundPath, sound);
        }

        return this.soundsByPath.get(soundPath).loading();
    }

    async playSound(soundPath) {
        const sound = this.soundsByPath.get(soundPath);
        if (sound) {
            await sound.playSound();
        }
    }

    async stopSound(soundPath) {
        const sound = this.soundsByPath.get(soundPath);
        if (sound) {
            await sound.stopSound();
        }
    }

    unloadSound(soundPath) {
        const sound = this.soundsByPath.get(soundPath);
        if (sound) {
            // Stops and unloads the sound
            sound.unloadSound();
            this.soundsByPath.delete(soundPath);
        }
    }

    setVolume(soundPath, volume) {
        const sound = this.soundsByPath.get(soundPath);
        if (sound) {
            sound.setVolume(volume);
        }
    }

    setLooping(soundPath, looping) {
        const sound = this.soundsByPath.get(soundPath);
        if (sound) {
            sound.setLooping(looping);
        }
    }
}

class HowlerSound {
    constructor(soundPath, looping = false, pool = 5) {
        // Use Howler
        this.howl = new Howl({
            src: [soundPath],
            html5: true,
            loop: looping,
            pool: pool
        });
    }

    loading() {
        const howl = this.howl;
        return new Promise((resolve, reject) => {
            if (howl.state() == "loaded") {
                resolve();
            }

            howl.once("load", () => resolve());
            howl.once("loaderror", () => reject());
        });
    }

    async playSound() {
        this.howl.play();
        await sleep(this.howl.duration() * 1000);

        if (!this.howl.loop()) {
            await this.stopSound();
        }
    }

    async stopSound() {
        this.howl.stop();
    }

    unloadSound() {
        this.howl.unload();
        this.howl = null;
    }

    setVolume(volume) {
        this.howl.volume(volume);
    }

    setLooping(looping) {
        this.howl.loop(looping);
    }
}

class O3hSound {
    constructor(soundPath, looping = false, audioManager) {
        this.audioClipPromise = audioManager.load(soundPath);

        this.audioClipPromise.then((clip) => {
            clip.loop = looping;
            // Audio clip is set with audio clip
            this.audioClip = clip;
        });
    }

    loading() {
        return this.audioClipPromise;
    }

    async playSound() {
        this.audioClip.play();
        await sleep(this.audioClip.duration * 1000);

        if (!this.audioClip.loop) {
            await this.stopSound();
        }
    }

    async stopSound() {
        await this.audioClip.reset();
    }

    unloadSound() {
        this.audioClip.unload();

        this.audioClip = null;
        this.audioClipPromise = null;
    }

    setVolume(volume) {
        this.audioClip.volume = volume;
    }

    setLooping(looping) {
        this.audioClip.loop = looping;
    }
}

const SoundManagerInstance = new SoundManager();
export default SoundManagerInstance;
