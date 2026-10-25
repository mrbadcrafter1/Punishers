/* state.js — состояние игры и сохранение (с картами локаций) */
(function () {
  "use strict";

  var STORAGE_KEY = "dark_zone_save_v7";

  var defaultState = {
    introSeen: false,
    wood: 2, food: 0, hide: 0, ammo: 0, artifacts: 0,
    chips: 0, parts: 0,
    fire: 0, fireLevel: 0,
    hunger: 0, cold: 0, fatigue: 0, rad: 0, hp: 100, maxHp: 100,
    tickCount: 0, lastSaved: 0,
    crafted: {},
    crafting: {},
    hasDetector: false,
    survivors: 0,
    npcGatherTimer: 0,
    timeOfDay: 0, weather: "ясно", weatherTimer: 0,
    
    // Прогресс
    worldLocation: 0, // Текущая локация на глобальной карте
    pathProgress: 0,  // Сколько L найдено в текущей локации
    
    // === ДАННЫЕ КАРТ ДЛЯ КАЖДОЙ ЛОКАЦИИ ===
    // Хранит: { "0": { grid: [...], explored: {...}, px: 0, py: 0 }, ... }
    mapData: {}, 
    
    // Текущее состояние в вылазке
    currentMapGrid: [],
    currentExplored: {},
    playerX: 0, playerY: 0,
    
    enemyHp: 0, enemyMaxHp: 0, enemyType: "", enemyDmg: 0,
    endingSeen: false, endingChoice: null, dead: false,
    cooldowns: { gatherWood: 0, gatherFood: 0, hunt: 0 }
  };

  var GameState = {
    data: null,
    init: function () { this.data = this.load(); },

    load: function () {
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          var parsed = JSON.parse(raw);
          var merged = Object.assign({}, defaultState, parsed);
          merged.crafted = Object.assign({}, defaultState.crafted, parsed.crafted || {});
          merged.crafting = Object.assign({}, defaultState.crafting, parsed.crafting || {});
          merged.cooldowns = Object.assign({}, defaultState.cooldowns, parsed.cooldowns || {});
          merged.mapData = parsed.mapData || {};
          return merged;
        }
      } catch (e) {}
      return Object.assign({}, defaultState, { crafted: {}, mapData: {} });
    },

    save: function () {
      try {
        this.data.lastSaved = Date.now();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      } catch (e) {}
    },

    reset: function () { this.data = Object.assign({}, defaultState, { crafted: {}, mapData: {} }); this.save(); },

    // --- КУЛДАУНЫ ДЕЙСТВИЙ ---
    setCooldown: function (action, seconds) {
      if (this.data.cooldowns[action] !== undefined) {
        this.data.cooldowns[action] = Date.now() + (seconds * 1000);
      }
    },
    getCooldownLeft: function (action) {
      var endTime = this.data.cooldowns[action];
      if (endTime <= Date.now()) return 0;
      return (endTime - Date.now()) / 1000;
    },

    // --- КРАФТ ---
    startCrafting: function(id, seconds) { this.data.crafting[id] = Date.now() + (seconds * 1000); },
    getCraftingLeft: function(id) {
      if (!this.data.crafting[id]) return 0;
      var endTime = this.data.crafting[id];
      if (endTime <= Date.now()) return 0;
      return (endTime - Date.now()) / 1000;
    },
    finishCrafting: function(id) {
      delete this.data.crafting[id];
      this.data.crafted[id] = true;
      if (id === "detector") this.data.hasDetector = true;
    },
    hasCrafted: function (id) { return !!this.data.crafted[id]; },

    // --- РЕСУРСЫ ---
    addWood: function (n) { this.data.wood += n; },
    spendWood: function (n) { if (this.data.wood < n) return false; this.data.wood -= n; return true; },
    addFood: function (n) { this.data.food += n; },
    spendFood: function (n) { if (this.data.food < n) return false; this.data.food -= n; return true; },
    addHide: function (n) { this.data.hide += n; },
    spendHide: function (n) { if (this.data.hide < n) return false; this.data.hide -= n; return true; },
    addAmmo: function (n) { this.data.ammo += n; },
    addArtifact: function (n) { this.data.artifacts += n; },
    spendArtifact: function (n) { if (this.data.artifacts < n) return false; this.data.artifacts -= n; return true; },
    addChip: function (n) { this.data.chips += n; },
    spendChip: function (n) { if (this.data.chips < n) return false; this.data.chips -= n; return true; },
    addPart: function (n) { this.data.parts += n; },
    spendPart: function (n) { if (this.data.parts < n) return false; this.data.parts -= n; return true; },

    // --- NPC ---
    addSurvivor: function () { this.data.survivors += 1; },

    // --- ОГОНЬ ---
    addFire: function (n) { this.data.fire = Math.min(100, this.data.fire + n); this.updateFireLevel(); },
    reduceFire: function (n) { this.data.fire = Math.max(0, this.data.fire - n); this.updateFireLevel(); },
    updateFireLevel: function () {
      var f = this.data.fire;
      if (f <= 0) this.data.fireLevel = 0;
      else if (f < 25) this.data.fireLevel = 1;
      else if (f < 60) this.data.fireLevel = 2;
      else this.data.fireLevel = 3;
    },

    // --- ГЕРОЙ ---
    changeStat: function (name, delta) {
      if (typeof this.data[name] !== "number") return;
      this.data[name] = Math.max(0, Math.min(100, this.data[name] + delta));
    },
    damage: function (n) { this.data.hp = Math.max(0, this.data.hp - n); if (this.data.hp <= 0) this.data.dead = true; },
    heal: function (n) { this.data.hp = Math.min(this.data.maxHp, this.data.hp + n); },

    // --- КАРТЫ ЛОКАЦИЙ ---
    saveCurrentMap: function() {
      var loc = this.data.worldLocation;
      this.data.mapData[loc] = {
        grid: this.data.currentMapGrid,
        explored: this.data.currentExplored,
        px: this.data.playerX,
        py: this.data.playerY
      };
    },
    loadMap: function(loc) {
      if (this.data.mapData[loc]) {
        this.data.currentMapGrid = this.data.mapData[loc].grid;
        this.data.currentExplored = this.data.mapData[loc].explored;
        this.data.playerX = this.data.mapData[loc].px;
        this.data.playerY = this.data.mapData[loc].py;
        return true; // Карта загружена
      }
      return false; // Нужно генерировать новую
    },

    // --- СОХРАНЕНИЯ ---
    exportCode: function () { try { return btoa(encodeURIComponent(JSON.stringify(this.data))); } catch (e) { return ""; } },
    importCode: function (code) {
      try {
        var parsed = JSON.parse(decodeURIComponent(atob(code.trim())));
        var merged = Object.assign({}, defaultState, parsed);
        merged.crafted = Object.assign({}, defaultState.crafted, parsed.crafted || {});
        merged.crafting = Object.assign({}, defaultState.crafting, parsed.crafting || {});
        this.data = merged; this.save(); return true;
      } catch (e) { return false; }
    }
  };

  window.GameState = GameState;
})();