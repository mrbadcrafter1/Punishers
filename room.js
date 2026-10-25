/* room.js — костёр, отдых, крафт, переходы, NPC */
(function () {
  "use strict";

  var woodFlavor = [
    "ты находишь обгоревшую фотографию. не смотришь на неё.",
    "ветер приносит запах гари. или это тебе кажется.",
    "где-то далеко — вой. или скрип металла.",
    "на стене — надпись мелом: «не открывай». ты не открываешь.",
    "хворост сухой. руки помнят, как это делается.",
    "слышно, как капает вода. кап. кап. кап.",
    "ты не помнишь, когда последний раз видел человека.",
    "тени пляшут на бетоне. ты стараешься не смотреть в них."
  ];

  var restFlavor = [
    "ты закрываешь глаза. на минуту. или на час.",
    "тепло. впервые за долгое время — тепло.",
    "ты слышишь, как трещит огонь. этого достаточно.",
    "где-то в глубине Зоны что-то шевелится. но не сейчас.",
    "ты не один. огонь — тоже компания."
  ];

  var lastWoodIndex = -1;
  var lastRestIndex = -1;

  function pickFlavor(arr, lastIndex) {
    if (arr.length === 1) return 0;
    var idx;
    do { idx = Math.floor(Math.random() * arr.length); }
    while (idx === lastIndex);
    return idx;
  }

  var Room = {
    firePerWood: 20,
    fireDecayPerTick: 1,
    tickInterval: 5000,
    tickTimer: null,

    init: function () {
      this.cacheDom();
      this.bindEvents();
      this.startTick();
      this.render();
    },

    cacheDom: function () {
      this.btnAddWood = document.getElementById("btn-add-wood");
      this.btnRest = document.getElementById("btn-rest");
      this.btnGoPath = document.getElementById("btn-go-path");
      this.fireVisual = document.getElementById("fire-visual");
      this.fireStatus = document.getElementById("fire-status");
      this.roomDescription = document.getElementById("room-description");
      
      this.inv = {
        wood: document.getElementById("stat-wood"),
        food: document.getElementById("stat-food"),
        hide: document.getElementById("stat-hide"),
        chips: document.getElementById("stat-chips"),
        parts: document.getElementById("stat-parts"),
        artifacts: document.getElementById("stat-artifacts"),
        detector: document.getElementById("stat-detector"),
        survivors: document.getElementById("stat-survivors")
      };
      
      this.barsRoom = {
        hunger: document.getElementById("bar-hunger-room"),
        cold: document.getElementById("bar-cold-room"),
        fatigue: document.getElementById("bar-fatigue-room"),
        rad: document.getElementById("bar-rad-room")
      };
    },

    bindEvents: function () {
      var self = this;
      if (this.btnAddWood) this.btnAddWood.addEventListener("click", function () { self.addWood(); });
      if (this.btnRest) this.btnRest.addEventListener("click", function () { self.rest(); });
      
      this.bindNav("btn-go-outside", "outside", function () { Outside.render(); });
      this.bindNav("btn-go-craft", "craft", function () { Craft.render(); });
      this.bindNav("btn-go-world", "world", function () { if (window.World) World.render(); });
      this.bindNav("btn-go-saves", "saves", function () { if (window.SaveUI) SaveUI.render(); });
    },

    bindNav: function (id, screen, after) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("click", function () {
        UI.showScreen(screen);
        if (typeof after === "function") after();
      });
    },

    addWood: function () {
      if (GameState.data.wood <= 0) {
        UI.notify("нечего бросать в огонь. сначала нужно собрать хворост.", "warning");
        return;
      }
      GameState.spendWood(1);
      GameState.addFire(this.firePerWood);
      GameState.save();
      
      if (window.AudioEngine) AudioEngine.click();

      var idx = pickFlavor(woodFlavor, lastWoodIndex);
      lastWoodIndex = idx;
      UI.notify(woodFlavor[idx]);

      this.render();
    },

    rest: function () {
      if (GameState.data.fireLevel < 2) {
        UI.notify("слишком холодно. огонь должен быть сильнее.", "warning");
        return;
      }
      var d = GameState.data;
      if (d.food > 0) {
        GameState.spendFood(1);
        GameState.changeStat("hunger", -20);
      } else {
        UI.notify("нечего есть. отдых будет тяжёлым.", "warning");
      }
      GameState.changeStat("fatigue", -40);
      GameState.changeStat("cold", -25);
      GameState.changeStat("rad", -5);
      GameState.heal(5);

      var idx = pickFlavor(restFlavor, lastRestIndex);
      lastRestIndex = idx;
      UI.notify(restFlavor[idx]);

      GameState.save();
      this.render();
    },

    startTick: function () {
      var self = this;
      this.tickTimer = setInterval(function () {
        var d = GameState.data;
        if (d.dead) return;

        if (d.fire > 0) {
          GameState.reduceFire(self.fireDecayPerTick);
          d.tickCount++;
          if (d.tickCount % 6 === 0) GameState.save();
        }

        if (d.fireLevel < 2) GameState.changeStat("cold", 1);
        if (d.fatigue < 100) GameState.changeStat("fatigue", 0.5);
        GameState.changeStat("hunger", 0.3);

        if (d.hunger >= 100 || d.cold >= 100 || d.rad >= 100) {
          GameState.damage(3);
        }

        if (d.hp <= 0) {
          d.dead = true;
          GameState.save();
          UI.showGameOver("голод. холод. радиация.<br>что-то из этого оказалось сильнее.<br>зона не прощает.");
          return;
        }

        if (d.survivors > 0) {
          d.npcGatherTimer++;
          if (d.npcGatherTimer >= 6) {
            d.npcGatherTimer = 0;
            var amount = d.survivors;
            GameState.addWood(amount);
            GameState.addFood(amount);
            UI.notify("выжившие принесли ресурсы: +" + amount + " дерева, +" + amount + " еды.");
            GameState.save();
          }
        }

        self.render();
        if (window.Outside) Outside.render();
        if (window.Weather) Weather.onTick();
      }, this.tickInterval);
    },

    render: function () {
      var d = GameState.data;

      // Обновляем инвентарь
      if (this.inv.wood) this.inv.wood.textContent = d.wood;
      if (this.inv.food) this.inv.food.textContent = d.food;
      if (this.inv.hide) this.inv.hide.textContent = d.hide;
      if (this.inv.chips) this.inv.chips.textContent = d.chips || 0;
      if (this.inv.parts) this.inv.parts.textContent = d.parts || 0;
      if (this.inv.artifacts) this.inv.artifacts.textContent = d.artifacts || 0;
      if (this.inv.detector) this.inv.detector.textContent = d.hasDetector ? "есть" : "нет";
      if (this.inv.survivors) this.inv.survivors.textContent = d.survivors || 0;

      this.updateBarRoom("hunger", d.hunger);
      this.updateBarRoom("cold", d.cold);
      this.updateBarRoom("fatigue", d.fatigue);
      this.updateBarRoom("rad", d.rad);

      if (this.fireVisual) {
        this.fireVisual.className = "fire fire--" +
          (d.fireLevel === 0 ? "off" :
           d.fireLevel === 1 ? "low" :
           d.fireLevel === 2 ? "mid" : "high");
      }

      if (this.fireStatus) {
        this.fireStatus.textContent =
          d.fireLevel === 0 ? "огня нет" :
          d.fireLevel === 1 ? "тлеет" :
          d.fireLevel === 2 ? "горит" : "пылает";
      }

      if (this.roomDescription) {
        if (d.fireLevel === 0) {
          this.roomDescription.innerHTML = "темно. холодно. где-то капает вода.<br>костёр почти погас.";
        } else if (d.fireLevel === 1) {
          this.roomDescription.innerHTML = "огонь слабый. тени дрожат.<br>нужно больше хвороста.";
        } else if (d.fireLevel === 2) {
          this.roomDescription.innerHTML = "огонь горит ровно. тепло.<br>снаружи — тишина. слишком тихая.";
        } else {
          this.roomDescription.innerHTML = "костёр пылает. стены блокпоста освещены.<br>ты чувствуешь себя почти живым.";
        }
      }

      if (this.btnRest) {
        this.btnRest.disabled = d.fireLevel < 2;
      }

      if (this.btnGoPath) {
        var canGoPath = (d.wood >= 5 && d.food >= 2);
        this.btnGoPath.disabled = !canGoPath;
        this.btnGoPath.title = canGoPath ? "" : "нужно запастись (5 хвороста, 2 еды)";
      }

      UI.setStatus(
        "хворост: " + d.wood + " · еда: " + d.food + " · hp: " + Math.round(d.hp),
        d.fireLevel === 0 ? "зона молчит" : "огонь горит"
      );
    },

    updateBarRoom: function (name, value) {
      if (!this.barsRoom) return;
      var el = this.barsRoom[name];
      if (!el) return;
      el.style.width = Math.round(value) + "%";
      el.classList.remove("hero-stat__fill--warn", "hero-stat__fill--danger");
      if (value >= 75) el.classList.add("hero-stat__fill--danger");
      else if (value >= 50) el.classList.add("hero-stat__fill--warn");
    }
  };

  window.Room = Room;
})();