/* Leonida Trophy Atlas — progress store.
   Saves checklist progress in localStorage and handles export / import
   as a plain JSON file. No network, no cookies, no server. */
"use strict";

var TrophyStore = (function () {
  var STORAGE_KEY = "leonida-trophy-atlas-v1";
  var EXPORT_NAME = "leonida-trophy-atlas-progress.json";

  function blankState() {
    return { earned: {}, spoiler: false };
  }

  function cleanState(raw) {
    var state = blankState();
    if (!raw || typeof raw !== "object") return state;
    if (raw.earned && typeof raw.earned === "object") {
      Object.keys(raw.earned).forEach(function (id) {
        if (raw.earned[id]) state.earned[String(id)] = true;
      });
    }
    if (raw.spoiler === true) state.spoiler = true;
    return state;
  }

  function loadProgress() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return blankState();
      return cleanState(JSON.parse(raw));
    } catch (err) {
      return blankState();
    }
  }

  function saveProgress(state) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanState(state)));
    } catch (err) {
      /* Storage full or unavailable: progress still works in memory. */
    }
  }

  function exportProgress(state) {
    var payload = JSON.stringify(cleanState(state), null, 2);
    var blob = new Blob([payload], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = EXPORT_NAME;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function parseImportFile(text) {
    var parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || !parsed.earned) return null;
    return cleanState(parsed);
  }

  return {
    loadProgress: loadProgress,
    saveProgress: saveProgress,
    exportProgress: exportProgress,
    parseImportFile: parseImportFile
  };
})();
