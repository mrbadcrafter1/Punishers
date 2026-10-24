/* outside.js — сбор ресурсов, охота, состояние героя */
(function () {
  "use strict";

  var gatherWoodFlavor = [
    "хворост сухой. руки помнят, как это делается.",
    "под обломками — детский рюкзак. внутри только камень.",
    "ветер стих. стало слышно, как капает вода.",
    "где-то далеко — собачий лай. или тебе показалось.",
    "ты находишь обгоревшую фотографию. не смотришь на неё.",
    "на бетоне — следы. свежие. ты не один."
  ];
  var gatherFoodFlavor = [
    "грибы бледные. но съедобные. наверное.",
    "ты помнишь, какие можно есть. помнишь.",
    "запах сырости. и чего-то ещё. ты не оборачиваешься.",
    "ягоды. горькие. но это еда.",
    "на пне — гриб. большой. ты берёшь его осторожно."
  ];
  var huntFlavor = [
    "слепой пёс. он не видел тебя. ты успел первым.",
    "тушкан. маленький. но это мясо.",
    "ты слышишь рычание. но оно стихает. сегодня — повезло.",
    "следы. ты идёшь по ним. находишь тушу.",
    "выстрел. тишина. потом — ещё один. на всякий случай."
  ];
  var emptyFlavor = [
    "ничего. только пыль и ржавчина.",
    "пусто. ты возвращаешься с пустыми руками.",
    "ветер. и больше ничего.",
    "ты обшариваешь всё. ничего."
  ];

  var lastIndices = { wood: -1, food: -1, hunt: -1, empty: -1 };

  function pickFlavor(key, arr) {
    if (arr.length === 1) return 0;
    var idx;
    do { idx = Math.floor(Math.random() * arr.length); }
    while (idx === lastIndices[key]);
    lastIndices[key] = idx;
    return idx;
  }

  var Outside = {
    cost: {
      gatherWood: { fatigue: 5, hunger: 2, cold: 3 },
      gatherFood: { fatigue: 6, hunger: 2, cold: 3 },
      hunt:       { fatigue: 10, hunger: 3, cold: 5, rad: 1 }
    },

    init: function () {
      this.cacheDom();
      this.bindEvents();
    },

    cacheDom: function () {
      this.btnGatherWood = document.getElementById("btn-gather-wood");
      this.btnGatherFood = document.getElementById("btn-gather-food");
      this.btnHunt = document.getElementById("btn-hunt");
      this.btnBack = document.getElementById("btn-back-room");

      this.statWoodOut = document.getElementById("stat-wood-out");
      this.statFood = document.getElementById("stat-food");
      this.statHide = document.getElementById("stat-hide");
      this.description = document.getElementById("outside-description");

      this.bars = {
        hunger: document.getElementById("bar-hunger"),
        cold: document.getElementById("bar-cold"),
        fatigue: document.getElementById("bar-fatigue"),
        rad: document.getElementById("bar-rad")
      };
    },

    bindEvents: function () {
      var self = this;
      if (this.btnGatherWood) this.btnGatherWood.addEventListener("click", function () { self.gatherWood(); });
      if (this.btnGatherFood) this.btnGatherFood.addEventListener("click", function () { self.gatherFood(); });
      if (this.btnHunt) this.btnHunt.addEventListener("click", function () { self.hunt(); });
      if (this.btnBack) this.btnBack.addEventListener("click", function () {
        UI.showScreen("room");
        Room.render();
      });
    },

    canAct: function () {
      var d = GameState.data;
      if (d.fatigue >= 100) {
        UI.notify("ты слишком устал. нужно отдохнуть у костра.", "warning");
        return false;
      }
      if (d.hunger >= 100) {
        UI.notify("голод сводит руки. сначала нужно поесть.", "warning");
        return false;
      }
      return true;
    },

    applyCost: function (cost) {
      if (cost.fatigue) GameState.changeStat("fatigue", cost.fatigue);
      if (cost.hunger) GameState.changeStat("hunger", cost.hunger);
      if (cost.cold) GameState.changeStat("cold", cost.cold);
      if (cost.rad) GameState.changeStat("rad", cost.rad);
    },

    gatherWood: function () {
      if (!this.canAct()) return;
      this.applyCost(this.cost.gatherWood);
      
      if (window.AudioEngine) AudioEngine.click();

      if (Math.random() < 0.7) {
        var amount = 1 + Math.floor(Math.random() * 2);
        GameState.addWood(amount);
        var idx = pickFlavor("wood", gatherWoodFlavor);
        UI.notify(gatherWoodFlavor[idx] + " (+" + amount + " хвороста)");
      } else {
        var e = pickFlavor("empty", emptyFlavor);
        UI.notify(emptyFlavor[e]);
      }
      GameState.save();
      this.render();
      Room.render();
    },

    gatherFood: function () {
      if (!this.canAct()) return;
      this.applyCost(this.cost.gatherFood);
      
      if (window.AudioEngine) AudioEngine.click();

      if (Math.random() < 0.55) {
        var amount = 1 + Math.floor(Math.random() * 2);
        GameState.addFood(amount);
        var idx = pickFlavor("food", gatherFoodFlavor);
        UI.notify(gatherFoodFlavor[idx] + " (+" + amount + " еды)");
      } else {
        var e = pickFlavor("empty", emptyFlavor);
        UI.notify(emptyFlavor[e]);
      }
      GameState.save();
      this.render();
      Room.render();
    },

    hunt: function () {
      if (!this.canAct()) return;
      this.applyCost(this.cost.hunt);
      
      if (window.AudioEngine) AudioEngine.click();

      if (Math.random() < 0.6) {
        var food = 1 + Math.floor(Math.random() * 2);
        GameState.addFood(food);
        GameState.addHide(1);
        var idx = pickFlavor("hunt", huntFlavor);
        UI.notify(huntFlavor[idx] + " (+" + food + " еды, +1 шкура)");
        if (window.AudioEngine) AudioEngine.loot();
      } else {
        UI.notify("ты возвращаешься ни с чем. но живой.", "warning");
      }
      GameState.save();
      this.render();
      Room.render();
    },

    render: function () {
      var d = GameState.data;
      
      // Защита: если бары ещё не закешированы (вызвано до init), выходим
      if (!this.bars) return;

      if (this.statWoodOut) this.statWoodOut.textContent = d.wood;
      if (this.statFood) this.statFood.textContent = d.food;
      if (this.statHide) this.statHide.textContent = d.hide;

      this.updateBar("hunger", d.hunger);
      this.updateBar("cold", d.cold);
      this.updateBar("fatigue", d.fatigue);
      this.updateBar("rad", d.rad);

      if (this.description) {
        if (d.rad > 60) {
          this.description.innerHTML = "счётчик трещит. воздух горький.<br>нужно вернуться к костру.";
        } else if (d.cold > 70) {
          this.description.innerHTML = "пальцы не слушаются. ветер пронизывает насквозь.<br>огонь кажется далёким.";
        } else if (d.fatigue > 70) {
          this.description.innerHTML = "глаза слипаются. ты не помнишь, как сел.<br>пора отдохнуть.";
        } else {
          this.description.innerHTML = "серое небо. ржавая земля. ветер несёт пыль.";
        }
      }
    },

    updateBar: function (name, value) {
      if (!this.bars) return;
      var el = this.bars[name];
      if (!el) return;
      el.style.width = Math.round(value) + "%";
      el.classList.remove("hero-stat__fill--warn", "hero-stat__fill--danger");
      if (value >= 75) el.classList.add("hero-stat__fill--danger");
      else if (value >= 50) el.classList.add("hero-stat__fill--warn");
    }
  };

  window.Outside = Outside;
})();