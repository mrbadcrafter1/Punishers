/* craft.js — верстак, создание предметов с затратами времени */
(function () {
  "use strict";

  var RECIPES = [
    {
      id: "workbench",
      name: "верстак",
      desc: "рабочее место для создания предметов",
      cost: { wood: 5, hide: 2 },
      time: 5,
      reusable: false, // Строится один раз
      onFinish: function () {
        UI.notify("верстак построен.");
      }
    },
    {
      id: "detector",
      name: "детектор артефактов",
      desc: "позволяет глушить аномалии",
      cost: { wood: 10, hide: 5, chips: 3, parts: 2 },
      time: 10,
      req: "workbench",
      reusable: false, // Создается один раз
      onFinish: function () {
        UI.notify("детектор собран. теперь аномалии можно глушить.");
      }
    },
    {
      id: "medkit",
      name: "аптечка",
      desc: "восстанавливает 50 HP",
      cost: { wood: 3, hide: 2, chips: 1 },
      time: 3,
      req: "workbench",
      reusable: true, // Можно крафтить сколько угодно
      onFinish: function () {
        GameState.heal(50);
        UI.notify("аптечка собрана и использована. (+50 HP)");
      }
    },
    {
      id: "shelter",
      name: "укрепление",
      desc: "привлекает выживших (NPC)",
      cost: { wood: 20, hide: 10, parts: 1 },
      time: 15,
      req: "workbench",
      reusable: true, // Можно строить много раз
      onFinish: function () {
        GameState.addSurvivor();
        UI.notify("блокпост укреплен. выжившие будут приходить.");
      }
    }
  ];

  var Craft = {
    animFrameId: null,

    init: function () {
      this.cacheDom();
      this.bindEvents();
      this.startAnimLoop();
    },

    cacheDom: function () {
      this.listEl = document.getElementById("craft-list");
      this.btnBack = document.getElementById("btn-back-room-craft");
      
      this.inv = {
        wood: document.getElementById("craft-wood"),
        hide: document.getElementById("craft-hide"),
        chips: document.getElementById("craft-chips"),
        parts: document.getElementById("craft-parts"),
        artifacts: document.getElementById("craft-artifacts")
      };
    },

    bindEvents: function () {
      var self = this;
      if (this.btnBack) {
        this.btnBack.addEventListener("click", function () {
          UI.showScreen("room");
          Room.render();
        });
      }
    },

    startAnimLoop: function () {
      var self = this;
      function loop() {
        self.updateProgressVisuals();
        self.animFrameId = requestAnimationFrame(loop);
      }
      this.animFrameId = requestAnimationFrame(loop);
    },

    updateProgressVisuals: function () {
      var items = document.querySelectorAll(".craft-item--crafting");
      items.forEach(function(item) {
        var id = item.getAttribute("data-id");
        var recipe = RECIPES.find(function(r) { return r.id === id; });
        if (!recipe) return;

        var left = GameState.getCraftingLeft(id);
        var fill = item.querySelector(".craft-item__progress-fill");
        
        if (left > 0) {
          var percent = 100 - (left / recipe.time) * 100;
          if (percent < 0) percent = 0;
          if (percent > 100) percent = 100;
          if (fill) fill.style.width = percent + "%";
        } else {
          // Крафт завершен
          GameState.finishCrafting(id);
          recipe.onFinish();
          GameState.save();
          Craft.render();
          Room.render();
        }
      });
    },

    render: function () {
      var d = GameState.data;
      if (!this.listEl) return;

      this.listEl.innerHTML = "";

      if (this.inv.wood) this.inv.wood.textContent = d.wood;
      if (this.inv.hide) this.inv.hide.textContent = d.hide;
      if (this.inv.chips) this.inv.chips.textContent = d.chips;
      if (this.inv.parts) this.inv.parts.textContent = d.parts;
      if (this.inv.artifacts) this.inv.artifacts.textContent = d.artifacts;

      RECIPES.forEach(function (recipe) {
        var isCrafted = GameState.hasCrafted(recipe.id);
        var isCrafting = GameState.getCraftingLeft(recipe.id) > 0;
        
        // Если предмет НЕ многоразовый и уже скрафчен, показываем "готово"
        var isFinishedForever = (!recipe.reusable && isCrafted);
        
        var item = document.createElement("div");
        item.className = "craft-item" + 
          (isFinishedForever ? " craft-item--done" : "") + 
          (isCrafting ? " craft-item--crafting" : "");
        item.setAttribute("data-id", recipe.id);

        var info = document.createElement("div");
        info.className = "craft-item__info";

        var name = document.createElement("div");
        name.className = "craft-item__name";
        name.textContent = recipe.name + (recipe.req && !GameState.hasCrafted(recipe.req) ? " (требуется верстак)" : "");

        var cost = document.createElement("div");
        cost.className = "craft-item__cost";
        var costText = [];
        if (recipe.cost.wood) costText.push("дерево: " + recipe.cost.wood);
        if (recipe.cost.hide) costText.push("шкуры: " + recipe.cost.hide);
        if (recipe.cost.chips) costText.push("микросхемы: " + recipe.cost.chips);
        if (recipe.cost.parts) costText.push("детали: " + recipe.cost.parts);
        cost.textContent = costText.join(" · ");

        var progBar = document.createElement("div");
        progBar.className = "craft-item__progress";
        var progFill = document.createElement("div");
        progFill.className = "craft-item__progress-fill";
        progBar.appendChild(progFill);

        info.appendChild(name);
        info.appendChild(cost);
        info.appendChild(progBar);

        var btn = document.createElement("button");
        btn.className = "craft-item__btn";

        if (isFinishedForever) {
          btn.textContent = "готово";
          btn.disabled = true;
        } else if (isCrafting) {
          btn.textContent = "в процессе...";
          btn.disabled = true;
        } else {
          btn.textContent = "создать";
          
          var canAfford = true;
          if (recipe.cost.wood && d.wood < recipe.cost.wood) canAfford = false;
          if (recipe.cost.hide && d.hide < recipe.cost.hide) canAfford = false;
          if (recipe.cost.chips && d.chips < recipe.cost.chips) canAfford = false;
          if (recipe.cost.parts && d.parts < recipe.cost.parts) canAfford = false;
          
          var hasReq = !recipe.req || GameState.hasCrafted(recipe.req);

          if (!canAfford || !hasReq) btn.disabled = true;

          btn.addEventListener("click", function () {
            if (recipe.cost.wood) GameState.spendWood(recipe.cost.wood);
            if (recipe.cost.hide) GameState.spendHide(recipe.cost.hide);
            if (recipe.cost.chips) GameState.spendChip(recipe.cost.chips);
            if (recipe.cost.parts) GameState.spendPart(recipe.cost.parts);
            
            GameState.startCrafting(recipe.id, recipe.time);
            GameState.save();
            Craft.render();
            Room.render();
          });
        }

        item.appendChild(info);
        item.appendChild(btn);
        this.listEl.appendChild(item);
      }, this);
    }
  };

  window.Craft = Craft;
})();