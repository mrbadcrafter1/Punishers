/* path.js — 2D-вылазки, бой и аномалии */
(function () {
  "use strict";

  var LOCATIONS = [
    { name: "кордон", desc: "ржавая дорога. следы гусениц. тишина." },
    { name: "свалка", desc: "горы металлолома. здесь что-то есть." },
    { name: "тёмная долина", desc: "тут всегда сумрак. и всегда кто-то смотрит." },
    { name: "бар", desc: "ты слышишь музыку. или это ветер воет в проводах." },
    { name: "припять", desc: "город-призрак. колесо обозрения. и центр." }
  ];

  var Path = {
    mapSize: 9, // Увеличили карту
    grid: [],
    isCombat: false,
    dodgeActive: null,

    init: function () {
      this.cacheDom();
      this.bindEvents();
    },

    cacheDom: function () {
      this.locEl = document.getElementById("path-location");
      this.descEl = document.getElementById("path-description");
      this.gridEl = document.getElementById("path-grid");
      this.btnBack = document.getElementById("btn-back-room-path");
      this.hpEl = document.getElementById("path-hp");
      
      // Бой
      this.combatModal = document.getElementById("combat-modal");
      this.pHpFill = document.getElementById("combat-player-hp");
      this.pHpText = document.getElementById("combat-player-hp-text");
      this.eHpFill = document.getElementById("combat-enemy-hp");
      this.eHpText = document.getElementById("combat-enemy-hp-text");
      this.dmgTaken = document.getElementById("dmg-taken");
      this.dmgDealt = document.getElementById("dmg-dealt");
      
      // Аномалия
      this.modalEl = document.getElementById("anomaly-modal");
      this.canvasEl = document.getElementById("anomaly-canvas");
    },

    bindEvents: function () {
      var self = this;
      if (this.btnBack) this.btnBack.addEventListener("click", function () {
        self.isCombat = false;
        if (self.combatModal) self.combatModal.style.display = "none";
        self.grid = [];
        UI.showScreen("room");
        Room.render();
      });

      var btnAtk = document.getElementById("btn-attack");
      var btnHl = document.getElementById("btn-heal");
      if (btnAtk) btnAtk.addEventListener("click", this.attack.bind(this));
      if (btnHl) btnHl.addEventListener("click", this.heal.bind(this));

      // Клавиатура
      window.addEventListener("keydown", function (e) {
        var pathScreen = document.getElementById("path");
        if (!pathScreen || !pathScreen.classList.contains("screen--active")) return;
        
        var key = e.key.toLowerCase();
        var isMove = ["w", "a", "s", "d", "ц", "ф", "ы", "в", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key);
        
        // Аномалия
        if (self.modalEl && self.modalEl.style.display === "flex") {
           if (isMove || key === " ") {
             e.preventDefault();
             if (self.dodgeActive) self.dodgeActive();
           }
           return;
        }

        // Если в бою — блокируем движение
        if (self.isCombat) return;
        
        if (key === "w" || key === "arrowup" || key === "ц") { e.preventDefault(); self.movePlayer(0, -1); }
        if (key === "s" || key === "arrowdown" || key === "ы") { e.preventDefault(); self.movePlayer(0, 1); }
        if (key === "a" || key === "arrowleft" || key === "ф") { e.preventDefault(); self.movePlayer(-1, 0); }
        if (key === "d" || key === "arrowright" || key === "в") { e.preventDefault(); self.movePlayer(1, 0); }
      });
    },

    render: function () {
      var d = GameState.data;
      if (!this.gridEl) return;

      if (this.grid.length === 0) {
        this.generateMap();
      }

      var loc = LOCATIONS[d.pathLocation] || LOCATIONS[0];
      if (this.locEl) this.locEl.textContent = loc.name;
      if (this.descEl) this.descEl.textContent = loc.desc;
      if (this.hpEl) this.hpEl.textContent = Math.round(d.hp);

      this.drawGrid();
    },

    generateMap: function () {
      this.grid = [];
      for (var y = 0; y < this.mapSize; y++) {
        var row = [];
        for (var x = 0; x < this.mapSize; x++) {
          var r = Math.random();
          var type = "empty";
          
          if (r < 0.12) type = "enemy";
          else if (r < 0.20) type = "anomaly";
          else if (r < 0.28) type = "loot";
          else if (r < 0.45) type = "wall";
          
          row.push({ type: type, explored: false });
        }
        this.grid.push(row);
      }
      
      var cx = Math.floor(this.mapSize / 2);
      var cy = Math.floor(this.mapSize / 2);
      GameState.data.gridX = cx;
      GameState.data.gridY = cy;
      
      // Очищаем стартовую зону
      for(var i = -1; i <= 1; i++) {
        for(var j = -1; j <= 1; j++) {
           if(this.grid[cy+j] && this.grid[cy+j][cx+i]) this.grid[cy+j][cx+i].type = "empty";
        }
      }
      
      this.grid[0][0].type = "exit"; // Выход в углу
      this.updateFog();
    },

    updateFog: function () {
      var px = GameState.data.gridX;
      var py = GameState.data.gridY;
      for (var y = 0; y < this.mapSize; y++) {
        for (var x = 0; x < this.mapSize; x++) {
          if (Math.abs(px - x) + Math.abs(py - y) <= 2) { // Радиус обзора 2
            this.grid[y][x].explored = true;
          }
        }
      }
    },

    drawGrid: function () {
      if (!this.gridEl) return;
      this.gridEl.innerHTML = "";
      this.gridEl.style.gridTemplateColumns = "repeat(" + this.mapSize + ", 1fr)";
      
      var px = GameState.data.gridX;
      var py = GameState.data.gridY;

      for (var y = 0; y < this.mapSize; y++) {
        for (var x = 0; x < this.mapSize; x++) {
          var cell = this.grid[y][x];
          var div = document.createElement("div");
          div.className = "grid-cell";

          if (x === px && y === py) {
            div.classList.add("grid-cell--player");
            div.textContent = "@";
          } else if (!cell.explored) {
            div.classList.add("grid-cell--fog");
          } else {
            if (cell.type === "enemy") { div.classList.add("grid-cell--enemy"); div.textContent = "E"; }
            else if (cell.type === "anomaly") { div.classList.add("grid-cell--anomaly"); div.textContent = "A"; }
            else if (cell.type === "loot") { div.classList.add("grid-cell--loot"); div.textContent = "S"; }
            else if (cell.type === "exit") { div.classList.add("grid-cell--exit"); div.textContent = "X"; }
            else if (cell.type === "wall") { div.classList.add("grid-cell--wall"); div.textContent = "#"; }
            else { div.textContent = "."; }
          }
          this.gridEl.appendChild(div);
        }
      }
    },

    movePlayer: function (dx, dy) {
      var px = GameState.data.gridX + dx;
      var py = GameState.data.gridY + dy;

      if (px < 0 || px >= this.mapSize || py < 0 || py >= this.mapSize) return;
      
      var cell = this.grid[py][px];
      if (cell.type === "wall") {
         UI.notify("бетонная стена. не пройти.", "warning");
         return; 
      }

      GameState.data.gridX = px;
      GameState.data.gridY = py;
      this.updateFog();
      
      if (cell.type === "enemy") {
        this.startCombat();
      } else if (cell.type === "anomaly") {
        this.startAnomaly();
      } else if (cell.type === "loot") {
        UI.notify("ты находишь тайник! (+3 хвороста, +1 еда)");
        GameState.addWood(3); GameState.addFood(1);
        cell.type = "empty";
        GameState.save();
      } else if (cell.type === "exit") {
        UI.notify("ты нашел выход. возвращаемся на базу.");
        this.isCombat = false;
        GameState.data.pathLocation = GameState.data.worldLocation;
        GameState.data.pathProgress = 3;
        GameState.save();
        this.grid = [];
        UI.showScreen("room");
        Room.render();
        return;
      }
      
      this.drawGrid();
    },

    // --- БОЙ ---
    startCombat: function () {
      this.isCombat = true;
      GameState.data.enemyHp = 30 + (GameState.data.worldLocation * 10);
      GameState.data.enemyMaxHp = GameState.data.enemyHp;
      
      // Принудительно открываем окно
      if (this.combatModal) {
        this.combatModal.style.display = "flex";
      }
      
      UI.notify("стычка! враг атакует.", "warning");
      if (window.AudioEngine) AudioEngine.damage();
      this.updateCombatUI();
    },

    updateCombatUI: function () {
      var d = GameState.data;
      if (!this.pHpFill) return;
      
      this.pHpFill.style.width = Math.max(0, (d.hp / d.maxHp) * 100) + "%";
      this.pHpText.textContent = Math.max(0, Math.round(d.hp)) + " / " + d.maxHp;
      
      this.eHpFill.style.width = Math.max(0, (d.enemyHp / d.enemyMaxHp) * 100) + "%";
      this.eHpText.textContent = Math.max(0, Math.round(d.enemyHp)) + " / " + d.enemyMaxHp;
    },

    showDmg: function (el, amount, isHeal) {
      if (!el) return;
      el.textContent = (isHeal ? "+" : "-") + amount;
      el.className = "combat-dmg " + (isHeal ? "text-ok" : "text-danger") + " animate";
      void el.offsetWidth; // Перезапуск анимации
    },

    attack: function () {
      if (!this.isCombat) return;
      if (window.AudioEngine) AudioEngine.click();
      
      var d = GameState.data;
      var dmg = 10 + Math.floor(Math.random() * 10);
      d.enemyHp -= dmg;
      this.showDmg(this.dmgDealt, dmg, false);
      this.updateCombatUI();
      
      if (d.enemyHp <= 0) {
        UI.notify("враг повержен. (+2 шкуры)");
        GameState.addHide(2);
        this.endCombat();
        return;
      }
      
      // Ответка врага
      var self = this;
      setTimeout(function() {
        var enemyDmg = 5 + Math.floor(Math.random() * 10);
        GameState.damage(enemyDmg);
        self.showDmg(self.dmgTaken, enemyDmg, false);
        self.updateCombatUI();
        if (window.AudioEngine) AudioEngine.damage();
        
        if (d.hp <= 0) return self.gameOver();
      }, 400);
    },

    heal: function () {
      if (!this.isCombat) return;
      if (window.AudioEngine) AudioEngine.click();
      
      var d = GameState.data;
      if (d.food > 0) {
        GameState.spendFood(1);
        GameState.heal(20);
        this.showDmg(this.dmgTaken, 20, true);
        UI.notify("ты съедаешь паек. (+20 HP)");
      } else {
        UI.notify("нет еды!", "warning");
      }
      this.updateCombatUI();
      
      // Ответка врага
      var self = this;
      setTimeout(function() {
        var enemyDmg = 5 + Math.floor(Math.random() * 5);
        GameState.damage(enemyDmg);
        self.showDmg(self.dmgTaken, enemyDmg, false);
        self.updateCombatUI();
        UI.notify("враг бьет: " + enemyDmg + " урона.", "warning");
        
        if (d.hp <= 0) return self.gameOver();
      }, 400);
    },

    endCombat: function () {
      this.isCombat = false;
      if (this.combatModal) this.combatModal.style.display = "none";
      this.grid[GameState.data.gridY][GameState.data.gridX].type = "empty";
      GameState.save();
      this.drawGrid();
    },

    gameOver: function () {
      this.isCombat = false;
      if (this.combatModal) this.combatModal.style.display = "none";
      GameState.data.dead = true;
      GameState.save();
      UI.showGameOver("зона не прощает ошибок.<br>ты остался здесь навсегда.");
    },

    // --- АНОМАЛИЯ ---
    startAnomaly: function () {
      var self = this;
      if (!this.modalEl) return;
      this.modalEl.style.display = "flex";
      
      var ctx = this.canvasEl.getContext("2d");
      var cw = this.canvasEl.width;
      var ch = this.canvasEl.height;
      var cx = cw / 2;
      var cy = ch / 2;
      var radius = 60;
      
      var currentDeg = 0;
      var targetDeg = Math.random() * 360;
      var margin = 25;
      var speed = 180;
      var isDone = false;

      function draw() {
        if (isDone) return;
        ctx.clearRect(0, 0, cw, ch);
        
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 6;
        ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.stroke();

        ctx.strokeStyle = "#c47a3a";
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, (targetDeg - margin) * Math.PI / 180, (targetDeg + margin) * Math.PI / 180);
        ctx.stroke();

        var curRad = currentDeg * Math.PI / 180;
        var px = cx + Math.cos(curRad) * radius;
        var py = cy + Math.sin(curRad) * radius;
        ctx.fillStyle = "#e89a4a";
        ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill();

        currentDeg = (currentDeg + speed * (1 / 60)) % 360;
      }

      var animId = requestAnimationFrame(function loop() {
        draw();
        if (!isDone) animId = requestAnimationFrame(loop);
      });

      this.dodgeActive = function() {
        if (isDone) return;
        isDone = true;
        cancelAnimationFrame(animId);
        
        var diff = Math.abs(currentDeg - targetDeg);
        if (diff > 180) diff = 360 - diff;
        
        if (diff <= margin) {
          UI.notify("аномалия заглушена. (+1 артефакт)");
          GameState.changeStat("rad", 10);
          self.grid[GameState.data.gridY][GameState.data.gridX].type = "empty";
          if (window.AudioEngine) AudioEngine.loot();
        } else {
          UI.notify("не успел! аномалия бьет током.", "warning");
          GameState.damage(15);
          GameState.changeStat("rad", 25);
          if (window.AudioEngine) AudioEngine.damage();
        }
        
        self.modalEl.style.display = "none";
        self.dodgeActive = null;
        if (GameState.data.hp <= 0) return self.gameOver();
        self.drawGrid();
        self.render();
      };

      document.getElementById("btn-dodge").onclick = this.dodgeActive;
    }
  };

  window.Path = Path;
})();