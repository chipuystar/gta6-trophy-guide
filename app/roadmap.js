/* Leonida Trophy Atlas — roadmap to the platinum.
   Six stages in play order, built from the official descriptions:
   which story chapters and missions, which collectibles and counts. */
"use strict";

var RoadmapStages = [
  {
    stage: 1,
    title: "Story — first playthrough",
    note: "Play the main missions in chapter order, from Gone Fishing through Chapters 1–4 to the final mission. Story trophies unlock as you go; the pink flags mark the chapter and mission moments to watch."
  },
  {
    stage: 2,
    title: "Strangers & side strands",
    note: "Between story beats, meet Leonida's strangers and finish their strands — Andy, Kenton, Billy, Randy and Tyrone each have a final mission, and 8 stranger strands in all. Hunt the unique animal for Bret here too."
  },
  {
    stage: 3,
    title: "Collectibles cleanup",
    note: "Sweep the state for everything countable: 18 meditation spots, 3 card sets, 100 WAiNK locations, 100 vehicles, 52 areas of Leonida, 8 garage properties and 10 Scooter Bros registrations."
  },
  {
    stage: 4,
    title: "Activities & grind",
    note: "The long middle: 250 stunts, 42 gold Shooting Range challenges, 14 drone race wins, 20 race wins, 50 challenges, 5 bank vaults, 9 gang operations — plus the money goals, $250,000 laundered and $100,000 spent."
  },
  {
    stage: 5,
    title: "Feats & one-offs",
    note: "Single-moment feats: partner escapes and robberies, the unscheduled VCIA departure, the showroom smash, bowling, the cocktail on Ocean Beach, and the strange and choice-driven moments."
  },
  {
    stage: 6,
    title: "Platinum",
    note: "Finish 100% completion for A Long Road, and Vice Got a Price! — the platinum — is yours."
  }
];

function roadmapStageFor(trophy) {
  var found = null;
  RoadmapStages.forEach(function (entry) {
    if (entry.stage === trophy.stage) found = entry;
  });
  return found;
}

function renderRoadmap(container, trophies, earnedIds, onSelectTrophy) {
  container.innerHTML = "";
  RoadmapStages.forEach(function (entry) {
    var stageTrophies = trophies.filter(function (t) { return t.stage === entry.stage; });
    if (stageTrophies.length === 0) return;

    var section = document.createElement("section");
    section.className = "roadmap-stage";

    var head = document.createElement("div");
    head.className = "roadmap-stage-head";
    var num = document.createElement("span");
    num.className = "roadmap-stage-num";
    num.textContent = "STAGE " + entry.stage;
    var title = document.createElement("span");
    title.className = "roadmap-stage-title";
    title.textContent = entry.title;
    head.appendChild(num);
    head.appendChild(title);
    section.appendChild(head);

    var note = document.createElement("p");
    note.className = "roadmap-stage-note";
    note.textContent = entry.note + "  (" + stageTrophies.length + " trophies)";
    section.appendChild(note);

    var chips = document.createElement("div");
    chips.className = "roadmap-trophies";
    stageTrophies.forEach(function (trophy) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "roadmap-chip";
      chip.textContent = trophy.name;
      if (trophy.missable) {
        var flag = document.createElement("span");
        flag.className = "mini-flag";
        flag.textContent = "  MISSABLE";
        chip.appendChild(flag);
      }
      if (earnedIds[trophy.id]) chip.classList.add("earned");
      chip.addEventListener("click", function () { onSelectTrophy(trophy.id); });
      chips.appendChild(chip);
    });
    section.appendChild(chips);
    container.appendChild(section);
  });
}
