/* path.js — вылазка с корректным спавном, сохранением карт и финалом */
(function () {
  "use strict";

  var LOCATIONS = [
    { name: "кордон", enemyHp: 20, enemyDmg: 5, mapSize: 25 },
    { name: "свалка", enemyHp: 30, enemyDmg: 8, mapSize: 30 },
    { name: "тёмная долина", enemyHp: 45, enemyDmg: 12, mapSize: 35 },
    { name: "бар", enemyHp: 60, enemyDmg: 15, mapSize: 40 },
    { name: "припять", enemyHp: 80, enemyDmg: 20, mapSize: 45 }
  ];

  var VIEW_SIZE = 9;

  var Path = {
    mapGrid: [],
    explored: {},
    isCombat: false,
    dodgeActive: null,
    combatCooldown: false,
    
    prevX: 0,
    prevY: 0,
    isTransitioning: false,

    init: function () {
      this.cacheDom();
      this.bindEvents();
    },

    cacheDom: function () {
      this.locEl = document.getElementById("path-location");
      this.gridEl = document.getElementById("path-grid");
      this.btnUseArtifact = document.getElementById("btn-use-artifact");
      this.overlay = document.getElementById("transition-overlay");
      
      this.hpEl = document.getElementById("path-hp");
      this.foodEl = document.getElementById("path-food");
      this.fatigueEl = document.getElementById("path-fatigue");
      this.artifactsEl = document.getElementById("path-artifacts");
      
      this.combatModal = document.getElementById("combat-modal");
      this.pHpFill = document.getElementById("combat-player-hp");
      this.pHpText = document.getElementById("combat-player-hp-text");
      this.eHpFill = document.getElementById("combat-enemy-hp");
      this.eHpText = document.getElementById("combat-enemy-hp-text");
      this.dmgTaken = document.getElementById("dmg-taken");
      this.dmgDealt = document.getElementById("dmg-dealt");
      
      this.btnAttack = document.getElementById("btn-attack");
      this.btnHeal = document.getElementById("btn-heal");
      
      this.modalEl = document.getElementById("anomaly-modal");
      this.canvasEl = document.getElementById("anomaly-canvas");
    },

    bindEvents: function () {
      var self = this;

      if (this.btnUseArtifact) {
        this.btnUseArtifact.addEventListener("click", function() {
          self.useArtifact();
        });
      }

      if (this.btnAttack) this.btnAttack.addEventListener("click", this.attack.bind(this));
      if (this.btnHeal) this.btnHeal.addEventListener("click", this.heal.bind(this));

      window.addEventListener("keydown", function (e) {
        var pathScreen = document.getElementById("path");
        if (!pathScreen || !pathScreen.classList.contains("screen--active")) return;
        if (self.isTransitioning) return;
        
        var key = e.key.toLowerCase();
        var isMove = ["w", "a", "s", "d", "ц", "ф", "ы", "в", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key);
        
        if (self.modalEl && self.modalEl.style.display === "flex") {
           if (isMove || key === " ") {
             e.preventDefault();
             if (self.dodgeActive) self.dodgeActive();
           }
           return;
        }

        if (self.isCombat) return;
        
        if (key === "w" || key === "arrowup" || key === "ц") { e.preventDefault(); self.movePlayer(0, -1); }
        if (key === "s" || key === "arrowdown" || key === "ы") { e.preventDefault(); self.movePlayer(0, 1); }
        if (key === "a" || key === "arrowleft" || key === "ф") { e.preventDefault(); self.movePlayer(-1, 0); }
        if (key === "d" || key === "arrowright" || key === "в") { e.preventDefault(); self.movePlayer(1, 0); }
      });
    },

    exitPath: function () {
      this.isCombat = false;
      if (this.combatModal) this.combatModal.style.display = "none";
      GameState.saveCurrentMap();
      GameState.save();
      UI.showScreen("room");
      Room.render();
    },

    useArtifact: function () {
      var d = GameState.data;
      if (d.artifacts <= 0) {
        UI.notify("нет артефактов.", "warning");
        return;
      }
      d.artifacts--;
      GameState.changeStat("fatigue", -50);
      GameState.heal(20);
      UI.notify("ты используешь артефакт. выносливость и раны восстановлены.");
      if (window.AudioEngine) AudioEngine.loot();
      GameState.save();
      this.render();
    },

    generateMap: function (isFirstTime) {
      var d = GameState.data;
      var loc = LOCATIONS[d.worldLocation] || LOCATIONS[0];
      var size = loc.mapSize;
      var isFinalLoc = (d.worldLocation === LOCATIONS.length - 1);
      
      this.mapGrid = [];
      this.explored = {};
      
      for (var y = 0; y < size; y++) {
        var row = [];
        for (var x = 0; x < size; x++) {
          var r = Math.random();
          var type = "empty";
          
          if (r < 0.15) type = "enemy";
          else if (r < 0.25) type = "anomaly"; 
          else if (r < 0.29) type = "loot";
          
          if (x === 0 || y === 0 || x === size - 1 || y === size - 1) type = "wall";
          
          row.push({ type: type });
        }
        this.mapGrid.push(row);
      }

      if (!isFinalLoc && d.worldLocation < LOCATIONS.length - 1) {
        this.spawnEdgeTile("open_location", size);
      }
      if (d.worldLocation > 0) {
        this.spawnEdgeTile("back_location", size);
      }

      var rx = 2 + Math.floor(Math.random() * (size - 4));
      var ry = 2 + Math.floor(Math.random() * (size - 4));
      this.mapGrid[ry][rx].type = "exit";

      if (isFinalLoc) {
        this.spawnEdgeTile("center", size);
      }

      var spawnX, spawnY;
      
      if (isFirstTime) {
        spawnX = Math.floor(size / 2);
        spawnY = Math.floor(size / 2);
        this.mapGrid[spawnY][spawnX].type = "exit";
      } else {
        var foundB = false;
        for (var y = 0; y < size; y++) {
          for (var x = 0; x < size; x++) {
            if (this.mapGrid[y][x].type === "back_location") {
              spawnX = x;
              spawnY = y;
              foundB = true;
              break;
            }
          }
          if (foundB) break;
        }
        if (!foundB) {
          spawnX = Math.floor(size / 2);
          spawnY = Math.floor(size / 2);
        }
      }

      d.playerX = spawnX;
      d.playerY = spawnY;
      this.prevX = spawnX;
      this.prevY = spawnY;
      
      for(var i = -1; i <= 1; i++) {
        for(var j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue;
          if(this.mapGrid[spawnY+j] && this.mapGrid[spawnY+j][spawnX+i]) {
            var t = this.mapGrid[spawnY+j][spawnX+i].type;
            if (t !== "exit" && t !== "back_location" && t !== "open_location" && t !== "center") {
              this.mapGrid[spawnY+j][spawnX+i].type = "empty";
            }
          }
        }
      }
      
      d.currentMapGrid = this.mapGrid;
      d.currentExplored = this.explored;
      this.updateFog();
      GameState.saveCurrentMap();
      GameState.save();
    },

    spawnEdgeTile: function (type, size) {
      var placed = false;
      var attempts = 0;
      
      while (!placed && attempts < 100) {
        attempts++;
        var side = Math.floor(Math.random() * 4);
        var x, y;
        
        if (side === 0) { x = 1 + Math.floor(Math.random() * (size - 2)); y = 0; }
        else if (side === 1) { x = size - 1; y = 1 + Math.floor(Math.random() * (size - 2)); }
        else if (side === 2) { x = 1 + Math.floor(Math.random() * (size - 2)); y = size - 1; }
        else { x = 0; y = 1 + Math.floor(Math.random() * (size - 2)); }
        
        var isOccupied = false;
        if (this.mapGrid[y][x].type === "open_location" || this.mapGrid[y][x].type === "back_location" || this.mapGrid[y][x].type === "exit" || this.mapGrid[y][x].type === "center") {
          isOccupied = true;
        }
        
        if (!isOccupied) {
          this.mapGrid[y][x].type = type;
          placed = true;
        }
      }
    },

    updateFog: function () {
      var d = GameState.data;
      var px = d.playerX;
      var py = d.playerY;
      for (var y = -1; y <= 1; y++) {
        for (var x = -1; x <= 1; x++) {
          this.explored[(px + x) + "," + (py + y)] = true;
        }
      }
      d.currentExplored = this.explored;
    },

    loadOrGenerate: function () {
      var d = GameState.data;
      if (GameState.loadMap(d.worldLocation)) {
        this.mapGrid = d.currentMapGrid;
        this.explored = d.currentExplored;
      } else {
        var isFirst = (d.worldLocation === 0);
        this.generateMap(isFirst);
      }
    },

    render: function () {
      var d = GameState.data;
      if (!this.gridEl) return;

      if (this.mapGrid.length === 0) {
        this.loadOrGenerate();
      }

      var loc = LOCATIONS[d.worldLocation] || LOCATIONS[0];
      if (this.locEl) this.locEl.textContent = loc.name;
      
      if (this.hpEl) this.hpEl.textContent = Math.round(d.hp);
      if (this.foodEl) this.foodEl.textContent = d.food;
      if (this.fatigueEl) this.fatigueEl.textContent = Math.round(d.fatigue) + "%";
      if (this.artifactsEl) this.artifactsEl.textContent = d.artifacts || 0;

      this.drawMap();
    },

    drawMap: function () {
      if (!this.gridEl) return;
      this.gridEl.innerHTML = "";
      
      var cellSize = Math.min(window.innerWidth / 12, window.innerHeight / 14);
      if (cellSize > 45) cellSize = 45; 
      if (cellSize < 25) cellSize = 25;

      this.gridEl.style.gridTemplateColumns = "repeat(" + VIEW_SIZE + ", " + cellSize + "px)";
      this.gridEl.style.gridTemplateRows = "repeat(" + VIEW_SIZE + ", " + cellSize + "px)";
      this.gridEl.style.fontSize = (cellSize * 0.6) + "px";

      var px = GameState.data.playerX;
      var py = GameState.data.playerY;
      var offset = Math.floor(VIEW_SIZE / 2);

      for (var y = -offset; y <= offset; y++) {
        for (var x = -offset; x <= offset; x++) {
          var worldX = px + x;
          var worldY = py + y;
          
          var div = document.createElement("div");
          div.className = "grid-cell";

          if (worldY < 0 || worldY >= this.mapGrid.length || worldX < 0 || worldX >= this.mapGrid[0].length) {
            div.classList.add("grid-cell--fog");
            this.gridEl.appendChild(div);
            continue;
          }

          var isExplored = this.explored[worldX + "," + worldY];

          if (x === 0 && y === 0) {
            div.classList.add("grid-cell--player");
            div.textContent = "@";
          } else if (!isExplored) {
            div.classList.add("grid-cell--fog");
          } else {
            var cell = this.mapGrid[worldY][worldX];
            if (cell.type === "enemy") { div.classList.add("grid-cell--enemy"); div.textContent = "E"; }
            else if (cell.type === "anomaly") { div.classList.add("grid-cell--anomaly"); div.textContent = "A"; }
            else if (cell.type === "loot") { div.classList.add("grid-cell--loot"); div.textContent = "S"; }
            else if (cell.type === "exit") { div.classList.add("grid-cell--exit"); div.textContent = "X"; }
            else if (cell.type === "open_location") { div.classList.add("grid-cell--exit"); div.textContent = "L"; }
            else if (cell.type === "back_location") { div.classList.add("grid-cell--exit"); div.textContent = "B"; }
            else if (cell.type === "center") { div.classList.add("grid-cell--exit"); div.textContent = "C"; }
            else if (cell.type === "wall") { div.classList.add("grid-cell--wall"); div.textContent = "#"; }
            else { div.textContent = "."; }
          }
          
          this.gridEl.appendChild(div);
        }
      }
    },

    transitionTo: function (nextLoc, callback) {
      var self = this;
      this.isTransitioning = true;
      
      if (this.overlay) this.overlay.classList.add("transition-overlay--active");
      
      setTimeout(function () {
        GameState.data.worldLocation = nextLoc;
        self.mapGrid = [];
        self.explored = {};
        GameState.save();
        
        self.loadOrGenerate();
        self.render();
        
        if (self.overlay) self.overlay.classList.remove("transition-overlay--active");
        self.isTransitioning = false;
        
        if (typeof callback === "function") callback();
      }, 450);
    },

    movePlayer: function (dx, dy) {
      var d = GameState.data;
      
      if (d.fatigue >= 100) {
        UI.notify("ты слишком устал. нужно возвращаться.", "warning");
        return;
      }
      
      if (d.food <= 0) {
        GameState.damage(5);
        UI.notify("голод сводит живот. (-5 HP)", "warning");
        
        if (d.hp <= 0) {
          return this.gameOver("ты не выдержал голода и упал прямо на ржавой земле.");
        }
      } else {
        GameState.changeStat("fatigue", 0.5); 
        
        if (!d.stepCount) d.stepCount = 0;
        d.stepCount++;
        if (d.stepCount % 4 === 0) {
          GameState.spendFood(1);
        }
      }

      var nextX = d.playerX + dx;
      var nextY = d.playerY + dy;

      if (nextY < 0 || nextY >= this.mapGrid.length || nextX < 0 || nextX >= this.mapGrid[0].length) return;

      var nextCell = this.mapGrid[nextY][nextX];

      if (nextCell.type === "wall") {
         UI.notify("граница Зоны. дальше нельзя.", "warning");
         return; 
      }

      this.prevX = d.playerX;
      this.prevY = d.playerY;

      d.playerX = nextX;
      d.playerY = nextY;
      this.updateFog();
      
      if (nextCell.type === "enemy") {
        this.startCombat();
      } else if (nextCell.type === "anomaly") {
        this.startAnomaly(nextX, nextY);
      } else if (nextCell.type === "loot") {
        if (Math.random() < 0.5) {
          UI.notify("ты находишь детали! (+1 деталь)");
          GameState.addPart(1);
        } else {
          UI.notify("ты находишь тайник! (+3 хвороста, +1 еда)");
          GameState.addWood(3); GameState.addFood(1);
        }
        nextCell.type = "empty";
        GameState.save();
      } else if (nextCell.type === "exit") {
        UI.notify("эвакуация. ты возвращаешься на базу.");
        this.exitPath();
        return;
      } else if (nextCell.type === "open_location") {
        UI.notify("ты нашел переход. перед тобой новая локация.");
        GameState.saveCurrentMap();
        GameState.data.worldLocation++;
        delete GameState.data.mapData[GameState.data.worldLocation];
        
        this.transitionTo(GameState.data.worldLocation);
        return;
      } else if (nextCell.type === "back_location") {
        UI.notify("ты возвращаешься на предыдущую локацию.");
        GameState.saveCurrentMap();
        GameState.data.worldLocation--;
        
        this.transitionTo(GameState.data.worldLocation);
        return;
      } else if (nextCell.type === "center") {
        UI.notify("ты нашел Исполнитель Желаний...");
        GameState.saveCurrentMap();
        GameState.save();
        if (window.World) {
          World.showEnding();
        } else {
          console.error("World не загружен! Проверьте main.js");
        }
        return;
      }
      
      GameState.saveCurrentMap();
      this.render();
    },

    startCombat: function () {
      var d = GameState.data;
      var loc = LOCATIONS[d.worldLocation] || LOCATIONS[0];
      
      this.isCombat = true;
      this.combatCooldown = false;
      d.enemyHp = loc.enemyHp + Math.floor(Math.random() * 10);
      d.enemyMaxHp = d.enemyHp;
      d.enemyDmg = loc.enemyDmg;
      
      if (this.combatModal) this.combatModal.style.display = "flex";
      UI.notify("стычка! враг атакует.", "warning");
      if (window.AudioEngine) AudioEngine.damage();
      this.updateCombatUI();
      this.render();
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
      void el.offsetWidth;
    },

    attack: function () {
      if (!this.isCombat || this.combatCooldown) return;
      if (window.AudioEngine) AudioEngine.click();
      
      this.combatCooldown = true;
      if (this.btnAttack) this.btnAttack.disabled = true;
      if (this.btnHeal) this.btnHeal.disabled = true;
      
      var d = GameState.data;
      var dmg = 10 + Math.floor(Math.random() * 10);
      d.enemyHp -= dmg;
      this.showDmg(this.dmgDealt, dmg, false);
      this.updateCombatUI();
      this.render();
      
      if (d.enemyHp <= 0) {
        UI.notify("враг повержен. (+2 шкуры)");
        GameState.addHide(2);
        
        if (Math.random() < 0.3) {
          GameState.addChip(1);
          UI.notify("с врага выпала микросхема.");
        }
        
        this.endCombat();
        return;
      }
      
      var self = this;
      setTimeout(function() {
        var enemyDmg = d.enemyDmg + Math.floor(Math.random() * 5);
        GameState.damage(enemyDmg);
        self.showDmg(self.dmgTaken, enemyDmg, false);
        self.updateCombatUI();
        self.render();
        if (window.AudioEngine) AudioEngine.damage();
        
        self.combatCooldown = false;
        if (self.btnAttack) self.btnAttack.disabled = false;
        if (self.btnHeal) self.btnHeal.disabled = false;
        
        if (d.hp <= 0) return self.gameOver();
      }, 600);
    },

    heal: function () {
      if (!this.isCombat || this.combatCooldown) return;
      if (window.AudioEngine) AudioEngine.click();
      
      this.combatCooldown = true;
      if (this.btnAttack) this.btnAttack.disabled = true;
      if (this.btnHeal) this.btnHeal.disabled = true;
      
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
      this.render();
      
      var self = this;
      setTimeout(function() {
        var enemyDmg = d.enemyDmg + Math.floor(Math.random() * 5);
        GameState.damage(enemyDmg);
        self.showDmg(self.dmgTaken, enemyDmg, false);
        self.updateCombatUI();
        self.render();
        
        self.combatCooldown = false;
        if (self.btnAttack) self.btnAttack.disabled = false;
        if (self.btnHeal) self.btnHeal.disabled = false;
        
        if (d.hp <= 0) return self.gameOver();
      }, 600);
    },

    endCombat: function () {
      this.isCombat = false;
      this.combatCooldown = false;
      if (this.btnAttack) this.btnAttack.disabled = false;
      if (this.btnHeal) this.btnHeal.disabled = false;
      if (this.combatModal) this.combatModal.style.display = "none";
      var px = GameState.data.playerX;
      var py = GameState.data.playerY;
      if (this.mapGrid[py] && this.mapGrid[py][px]) this.mapGrid[py][px].type = "empty";
      GameState.save();
      this.render();
    },

    gameOver: function (text) {
      this.isCombat = false;
      this.combatCooldown = false;
      if (this.combatModal) this.combatModal.style.display = "none";
      GameState.data.dead = true;
      GameState.save();
      UI.showGameOver(text || "зона не прощает ошибок.<br>ты остался здесь навсегда.");
    },

    startAnomaly: function (x, y) {
      var self = this;
      if (!this.modalEl) return;
      
      var hasDetector = GameState.data.hasDetector;

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
          if (hasDetector) {
            UI.notify("вы успешно заглушили аномалию. (+1 артефакт)");
            GameState.addArtifact(1);
            self.mapGrid[y][x].type = "empty";
            if (window.AudioEngine) AudioEngine.loot();
          } else {
            UI.notify("вы уклонились от аномалии.");
            if (window.AudioEngine) AudioEngine.click();
          }
        } else {
          UI.notify("не успел! аномалия отбрасывает тебя назад.", "warning");
          GameState.damage(15);
          GameState.changeStat("rad", 20);
          
          GameState.data.playerX = self.prevX;
          GameState.data.playerY = self.prevY;
          
          if (window.AudioEngine) AudioEngine.damage();
        }
        
        self.modalEl.style.display = "none";
        self.dodgeActive = null;
        if (GameState.data.hp <= 0) return self.gameOver();
        this.render();
      }.bind(this);
    }
  };

  window.Path = Path;
})();