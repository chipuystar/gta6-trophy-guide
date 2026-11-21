/* Leonida Trophy Atlas — boot, checklist rendering, search, filters,
   spoiler mode, progress bar and detail panel. Classic scripts only,
   so the app also runs straight from a file URL. */
"use strict";

var AtlasApp = (function () {
  var trophies = [];
  var state = TrophyStore.loadProgress();
  var currentFilter = "all";
  var searchQuery = "";
  var selectedId = 1;
  var currentView = "checklist";

  var GRADE_LABELS = {
    platinum: "Platinum",
    gold: "Gold",
    silver: "Silver",
    bronze: "Bronze"
  };

  function $(id) { return document.getElementById(id); }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function isEarned(trophy) { return !!state.earned[trophy.id]; }

  function isSpoilerHidden(trophy) {
    return state.spoiler && trophy.kind === "story" && !isEarned(trophy);
  }

  function matchesFilter(trophy) {
    if (currentFilter === "all") return true;
    if (currentFilter === "missable") return trophy.missable;
    return trophy.kind === currentFilter;
  }

  function matchesSearch(trophy) {
    if (!searchQuery) return true;
    var q = searchQuery.toLowerCase();
    return trophy.name.toLowerCase().indexOf(q) !== -1 ||
      trophy.description.toLowerCase().indexOf(q) !== -1;
  }

  function visibleTrophies() {
    return trophies.filter(function (t) { return matchesFilter(t) && matchesSearch(t); });
  }

  function countFor(filter) {
    if (filter === "all") return trophies.length;
    if (filter === "missable") return trophies.filter(function (t) { return t.missable; }).length;
    return trophies.filter(function (t) { return t.kind === filter; }).length;
  }

  function renderProgress() {
    var earned = trophies.filter(isEarned).length;
    $("earnedCount").textContent = String(earned);
    var pct = trophies.length ? Math.round((earned / trophies.length) * 100) : 0;
    $("progressFill").style.width = pct + "%";
    var parts = ["platinum", "gold", "silver", "bronze"].map(function (grade) {
      var total = trophies.filter(function (t) { return t.grade === grade; }).length;
      var got = trophies.filter(function (t) { return t.grade === grade && isEarned(t); }).length;
      return "<b>" + GRADE_LABELS[grade] + " " + got + "/" + total + "</b>";
    });
    $("gradeCounts").innerHTML = parts.join(" &nbsp;&middot;&nbsp; ") +
      " &nbsp;&middot;&nbsp; <b>" + pct + "% complete</b>";
  }

  function renderFilterCounts() {
    document.querySelectorAll("[data-count-for]").forEach(function (el) {
      el.textContent = "(" + countFor(el.getAttribute("data-count-for")) + ")";
    });
  }

  function trophyRowHtml(trophy) {
    var hidden = isSpoilerHidden(trophy);
    var name = hidden ? "Story trophy — hidden until earned" : trophy.name;
    var desc = hidden ? "Turn spoiler mode off, or earn this trophy, to reveal it." : trophy.description;
    var classes = ["trophy-row"];
    if (isEarned(trophy)) classes.push("earned");
    if (trophy.id === selectedId) classes.push("selected");
    if (hidden) classes.push("spoiler-hidden");
    var meta = "<span class=\"pill pill-" + trophy.grade + "\">" + GRADE_LABELS[trophy.grade] + "</span>" +
      "<span class=\"pill\">" + escapeHtml(trophy.kind) + "</span>";
    if (trophy.missable) meta += "<span class=\"pill pill-missable\">Missable</span>";
    if (trophy.hidden) meta += "<span class=\"pill pill-hidden\">Hidden on PSN</span>";
    var countLine = trophy.count
      ? "<span class=\"trophy-count\">Target: " + trophy.count.toLocaleString("en-US") + " " + escapeHtml(trophy.countLabel || "") + "</span>"
      : "";
    return "<div class=\"" + classes.join(" ") + "\" data-trophy-id=\"" + trophy.id + "\" role=\"button\" tabindex=\"0\">" +
      "<input type=\"checkbox\" class=\"trophy-check\" aria-label=\"Mark earned\" " + (isEarned(trophy) ? "checked" : "") + ">" +
      "<div class=\"trophy-body\">" +
      "<div class=\"trophy-name\">" + escapeHtml(name) + "</div>" +
      "<p class=\"trophy-desc\">" + escapeHtml(desc) + "</p>" +
      "<div class=\"trophy-meta\">" + meta + "</div>" +
      (countLine ? "<div class=\"trophy-meta\">" + countLine + "</div>" : "") +
      "</div></div>";
  }

  function renderList() {
    var list = visibleTrophies();
    var listEl = $("trophyList");
    var emptyEl = $("emptyState");
    if (list.length === 0) {
      listEl.innerHTML = "";
      emptyEl.hidden = false;
      if (currentFilter === "online") {
        emptyEl.innerHTML = "<h3>NO ONLINE TROPHIES</h3><p>The official 55-trophy list holds no online trophy — the whole road to platinum is playable offline.</p>";
      } else {
        emptyEl.innerHTML = "<h3>NOTHING HERE</h3><p>No trophies match this filter and search. Try another filter or clear the search box.</p>";
      }
      return;
    }
    emptyEl.hidden = true;
    listEl.innerHTML = list.map(trophyRowHtml).join("");
    listEl.querySelectorAll(".trophy-row").forEach(function (row) {
      var id = Number(row.getAttribute("data-trophy-id"));
      row.addEventListener("click", function () { selectTrophy(id); });
      row.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectTrophy(id); }
      });
      var check = row.querySelector(".trophy-check");
      check.addEventListener("click", function (event) {
        event.stopPropagation();
        toggleEarned(id, check.checked);
      });
    });
  }

  function renderDetail() {
    var panel = $("detailPanel");
    var trophy = null;
    trophies.forEach(function (t) { if (t.id === selectedId) trophy = t; });
    if (!trophy) {
      panel.innerHTML = "<p class=\"detail-empty\">Select a trophy to read its guide, sources and roadmap stage.</p>";
      return;
    }
    if (isSpoilerHidden(trophy)) {
      panel.innerHTML =
        "<p class=\"detail-grade\">" + GRADE_LABELS[trophy.grade] + " &middot; STORY</p>" +
        "<h3 class=\"detail-name\">Story trophy — hidden until earned</h3>" +
        "<p class=\"detail-desc\">Spoiler mode is on. Earn this trophy, or switch spoiler mode off, to reveal its name, description and guide.</p>";
      return;
    }
    var stage = roadmapStageFor(trophy);
    var guideText = escapeHtml(trophy.guide);
    var sourceAt = guideText.lastIndexOf("Sources:");
    var body = sourceAt === -1 ? guideText : guideText.slice(0, sourceAt);
    var sourceLine = sourceAt === -1 ? "" : guideText.slice(sourceAt);
    var meta = "<span class=\"pill pill-" + trophy.grade + "\">" + GRADE_LABELS[trophy.grade] + "</span>" +
      "<span class=\"pill\">" + escapeHtml(trophy.kind) + "</span>";
    if (trophy.missable) meta += "<span class=\"pill pill-missable\">Missable — tied to a chapter, mission, choice or one-time event</span>";
    if (trophy.hidden) meta += "<span class=\"pill pill-hidden\">Hidden on PSN until earned</span>";
    var countLine = trophy.count
      ? "<p class=\"detail-desc\"><b>Target:</b> " + trophy.count.toLocaleString("en-US") + " " + escapeHtml(trophy.countLabel || "") + "</p>"
      : "";
    panel.innerHTML =
      "<p class=\"detail-grade\">" + GRADE_LABELS[trophy.grade] + " &middot; " + escapeHtml(trophy.kind).toUpperCase() + "</p>" +
      "<h3 class=\"detail-name\">" + escapeHtml(trophy.name) + "</h3>" +
      "<p class=\"detail-desc\">" + escapeHtml(trophy.description) + "</p>" +
      "<div class=\"detail-meta\">" + meta + "</div>" +
      countLine +
      "<h4 class=\"detail-guide-heading\">Guide</h4>" +
      "<p class=\"detail-guide\">" + body +
      (sourceLine ? "<span class=\"source-line\">" + sourceLine + "</span>" : "") + "</p>" +
      (stage
        ? "<p class=\"detail-stage\"><b>Roadmap — Stage " + stage.stage + ": " + escapeHtml(stage.title) + ".</b> " + escapeHtml(stage.note) + "</p>"
        : "");
  }

  function renderRoadmapView() {
    renderRoadmap($("roadmapStages"), trophies, state.earned, function (id) {
      selectTrophy(id);
      switchView("checklist");
    });
  }

  function renderAll() {
    renderProgress();
    renderFilterCounts();
    renderList();
    renderDetail();
    if (currentView === "roadmap") renderRoadmapView();
  }

  function selectTrophy(id) {
    selectedId = id;
    renderList();
    renderDetail();
  }

  function toggleEarned(id, earned) {
    if (earned) state.earned[id] = true;
    else delete state.earned[id];
    TrophyStore.saveProgress(state);
    renderAll();
  }

  function switchView(view) {
    currentView = view;
    $("tabChecklist").classList.toggle("active", view === "checklist");
    $("tabRoadmap").classList.toggle("active", view === "roadmap");
    $("checklistView").hidden = view !== "checklist";
    $("roadmapView").hidden = view !== "roadmap";
    if (view === "roadmap") renderRoadmapView();
    else renderList();
  }

  function setFilter(filter) {
    currentFilter = filter;
    document.querySelectorAll("#filterChips .chip").forEach(function (chip) {
      chip.classList.toggle("active", chip.getAttribute("data-filter") === filter);
    });
    renderList();
  }

  function bindControls() {
    $("searchBox").addEventListener("input", function (event) {
      searchQuery = event.target.value.trim();
      renderList();
    });
    document.querySelectorAll("#filterChips .chip").forEach(function (chip) {
      chip.addEventListener("click", function () { setFilter(chip.getAttribute("data-filter")); });
    });
    $("spoilerToggle").checked = state.spoiler;
    $("spoilerToggle").addEventListener("change", function (event) {
      state.spoiler = event.target.checked;
      TrophyStore.saveProgress(state);
      renderList();
      renderDetail();
    });
    $("tabChecklist").addEventListener("click", function () { switchView("checklist"); });
    $("tabRoadmap").addEventListener("click", function () { switchView("roadmap"); });
    $("exportBtn").addEventListener("click", function () { TrophyStore.exportProgress(state); });
    $("importBtn").addEventListener("click", function () { $("importFile").click(); });
    $("importFile").addEventListener("change", function (event) {
      var file = event.target.files && event.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var imported = TrophyStore.parseImportFile(String(reader.result));
          if (!imported) throw new Error("bad file");
          state = imported;
          TrophyStore.saveProgress(state);
          $("spoilerToggle").checked = state.spoiler;
          renderAll();
        } catch (err) {
          window.alert("That file is not a Leonida Trophy Atlas progress export.");
        }
        event.target.value = "";
      };
      reader.readAsText(file);
    });
  }

  function boot() {
    bindControls();
    fetch("data/trophies.json")
      .then(function (response) { return response.json(); })
      .then(function (data) {
        trophies = data.trophies || data;
        renderAll();
      })
      .catch(function () {
        $("trophyList").innerHTML = "<p class=\"detail-empty\">Could not load the trophy data. Open this app from its own folder so it can read data/trophies.json.</p>";
      });
  }

  return { boot: boot };
})();

document.addEventListener("DOMContentLoaded", AtlasApp.boot);
