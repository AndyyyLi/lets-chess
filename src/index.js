import "./style.scss";
import App from "./app";

// This will load the o3h API from its remote location
// DO NOT include o3h.js in your compiled project

import(/* webpackIgnore: true */ "/api/o3h.js").then(async (o) => {
    window.o3h = o;
    window.app = new App();
});