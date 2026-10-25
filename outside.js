/* outside.js — сбор ресурсов с ПЛАВНОЙ анимацией кулдауна */
(function () {
  "use strict";

  var gatherWoodFlavor = [
    "хворост сухой. руки помнят, как это делается.",
    "под обломками — детский рюкзак. внутри только камень.",
    "ветер стих. стало слышно, как капает вода."
  ];
  var gatherFoodFlavor = [
    "грибы бледные. но съедобные. наверное.",
    "ты помнишь, какие можно есть. помнишь.",
    "ягоды. горькие. но это еда."
  ];
  var huntFlavor = [
    "слепой пёс. он не видел тебя. ты успел первым.",
    "тушкан. маленький. но это мясо.",
    "следы. ты идёшь по ним. находишь тушу."
  ];
  var emptyFlavor = [
    "ничего. только пыль и ржавчина.",
    "пусто. ты возвращаешься с пустыми руками."
  ];

  var Outside = {
    animFrameId: null,
    maxCdWood: 5,   // Максимальное время отката в секундах (для расчета %)
    maxCdFood: 6,
    maxCdHunt: 10,

    cost: {
      gatherWood: { fatigue: 5, hunger: 2, cold: 3 },
      gatherFood: { fatigue: 6, hunger: 2, cold: 3 },
      hunt:       { fatigue: 10, hunger: 3, cold: 5, rad: 1 }
    },

    init: function () {
      this.cacheDom();
      this.bindEvents();
      this.startAnimLoop();
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

    // Запускаем цикл анимации при инициализации
    startAnimLoop: function () {
      var self = this;
      function loop() {
        self.updateCooldownVisuals();
        self.animFrameId = requestAnimationFrame(loop);
      }
      this.animFrameId = requestAnimationFrame(loop);
    },

    canAct: function (cooldownKey) {
      var d = GameState.data;
      if (GameState.getCooldownLeft(cooldownKey) > 0) {
        UI.notify("нужно подождать.", "warning");
        return false;
      }
      if (d.fatigue >= 100) {
        UI.notify("ты слишком устал.", "warning");
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
      if (!this.canAct("gatherWood")) return;
      this.applyCost(this.cost.gatherWood);
      
      GameState.setCooldown("gatherWood", this.maxCdWood); 
      
      if (window.AudioEngine) AudioEngine.click();

      if (Math.random() < 0.7) {
        var amount = 1 + Math.floor(Math.random() * 2);
        GameState.addWood(amount);
        UI.notify(gatherWoodFlavor[Math.floor(Math.random()*gatherWoodFlavor.length)] + " (+" + amount + " хвороста)");
      } else {
        UI.notify(emptyFlavor[Math.floor(Math.random()*emptyFlavor.length)]);
      }
      GameState.save();
      this.render();
      Room.render();
    },

    gatherFood: function () {
      if (!this.canAct("gatherFood")) return;
      this.applyCost(this.cost.gatherFood);
      
      GameState.setCooldown("gatherFood", this.maxCdFood);
      
      if (window.AudioEngine) AudioEngine.click();

      if (Math.random() < 0.55) {
        var amount = 1 + Math.floor(Math.random() * 2);
        GameState.addFood(amount);
        UI.notify(gatherFoodFlavor[Math.floor(Math.random()*gatherFoodFlavor.length)] + " (+" + amount + " еды)");
      } else {
        UI.notify(emptyFlavor[Math.floor(Math.random()*emptyFlavor.length)]);
      }
      GameState.save();
      this.render();
      Room.render();
    },

    hunt: function () {
      if (!this.canAct("hunt")) return;
      this.applyCost(this.cost.hunt);
      
      GameState.setCooldown("hunt", this.maxCdHunt);
      
      if (window.AudioEngine) AudioEngine.click();

      if (Math.random() < 0.6) {
        var food = 1 + Math.floor(Math.random() * 2);
        GameState.addFood(food);
        GameState.addHide(1);
        UI.notify(huntFlavor[Math.floor(Math.random()*huntFlavor.length)] + " (+" + food + " еды, +1 шкура)");
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
      if (!this.bars) return;

      if (this.statWoodOut) this.statWoodOut.textContent = d.wood;
      if (this.statFood) this.statFood.textContent = d.food;
      if (this.statHide) this.statHide.textContent = d.hide;

      this.updateBar("hunger", d.hunger);
      this.updateBar("cold", d.cold);
      this.updateBar("fatigue", d.fatigue);
      this.updateBar("rad", d.rad);
    },

    updateBar: function (name, value) {
      if (!this.bars) return;
      var el = this.bars[name];
      if (!el) return;
      el.style.width = Math.round(value) + "%";
      el.classList.remove("hero-stat__fill--warn", "hero-stat__fill--danger");
      if (value >= 75) el.classList.add("hero-stat__fill--danger");
      else if (value >= 50) el.classList.add("hero-stat__fill--warn");
    },

    // Эта функция вызывается 60 раз в секунду (requestAnimationFrame)
    updateCooldownVisuals: function () {
      var d = GameState.data;
      if (!this.btnGatherWood) return;

      // Сбор хвороста
      var leftWood = GameState.getCooldownLeft("gatherWood");
      if (leftWood > 0) {
        this.setButtonCooldown(this.btnGatherWood, leftWood, this.maxCdWood);
      } else {
        this.resetButton(this.btnGatherWood);
      }

      // Сбор еды
      var leftFood = GameState.getCooldownLeft("gatherFood");
      if (leftFood > 0) {
        this.setButtonCooldown(this.btnGatherFood, leftFood, this.maxCdFood);
      } else {
        this.resetButton(this.btnGatherFood);
      }

      // Охота
      var leftHunt = GameState.getCooldownLeft("hunt");
      if (leftHunt > 0) {
        this.setButtonCooldown(this.btnHunt, leftHunt, this.maxCdHunt);
      } else {
        this.resetButton(this.btnHunt);
      }
    },

    setButtonCooldown: function (btn, leftSec, maxSec) {
      btn.classList.add("btn--cooldown");
      btn.disabled = true;
      // Считаем процент оставшегося времени (от 100% до 0%)
      var percent = (leftSec / maxSec) * 100;
      if (percent < 0) percent = 0;
      if (percent > 100) percent = 100;
      
      // Устанавливаем CSS переменную для ширины заливки
      btn.style.setProperty("--cd-width", percent + "%");
    },

    resetButton: function (btn) {
      if (btn.classList.contains("btn--cooldown")) {
        btn.classList.remove("btn--cooldown");
        btn.disabled = false;
        btn.style.removeProperty("--cd-width");
      }
    }
  };

  window.Outside = Outside;
})();