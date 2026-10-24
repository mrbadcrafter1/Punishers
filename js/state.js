/* state.js — состояние игры и сохранение */
(function () {
  "use strict";

  var STORAGE_KEY = "dark_zone_save_v2";

  var defaultState = {
    introSeen: false,
    // ресурсы
    wood: 2,
    food: 0,
    hide: 0,
    ammo: 0,
    // огонь
    fire: 0,
    fireLevel: 0,
    // герой
    hunger: 0,
    cold: 0,
    fatigue: 0,
    rad: 0,
    hp: 100,
    maxHp: 100,
    // прогресс
    tickCount: 0,
    lastSaved: 0,
    // крафт
    crafted: {},
    // выжившие
    survivors: 0,
    // погода и время
    timeOfDay: 0,
    weather: "ясно",
    weatherTimer: 0,
    // вылазки
    pathLocation: 0,
    pathProgress: 0,
    pathVisits: 0,
    // карта
    worldLocation: 0,
    worldProgress: 0,
    // финал
    endingSeen: false,
    endingChoice: null,
    // gameover
    dead: false,
    
    // НОВЫЕ ПОЛЯ ДЛЯ 2D-ВЫЛАЗКИ
    gridX: 0,
    gridY: 0,
    enemyHp: 0
  };

  var GameState = {
    data: null,

    init: function () {
      this.data = this.load();
    },

    load: function () {
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          var parsed = JSON.parse(raw);
          var merged = Object.assign({}, defaultState, parsed);
          merged.crafted = Object.assign({}, defaultState.crafted, parsed.crafted || {});
          return merged;
        }
      } catch (e) {
        console.warn("Не удалось загрузить сохранение:", e);
      }
      return Object.assign({}, defaultState, { crafted: {} });
    },

    save: function () {
      try {
        this.data.lastSaved = Date.now();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      } catch (e) {
        console.warn("Не удалось сохранить:", e);
      }
    },

    reset: function () {
      this.data = Object.assign({}, defaultState, { crafted: {} });
      this.save();
    },

    // --- ресурсы ---
    addWood: function (n) { this.data.wood += n; },
    spendWood: function (n) {
      if (this.data.wood < n) return false;
      this.data.wood -= n; return true;
    },
    addFood: function (n) { this.data.food += n; },
    spendFood: function (n) {
      if (this.data.food < n) return false;
      this.data.food -= n; return true;
    },
    addHide: function (n) { this.data.hide += n; },
    addAmmo: function (n) { this.data.ammo += n; },
    spendAmmo: function (n) {
      if (this.data.ammo < n) return false;
      this.data.ammo -= n; return true;
    },

    // --- огонь ---
    addFire: function (n) {
      this.data.fire = Math.min(100, this.data.fire + n);
      this.updateFireLevel();
    },
    reduceFire: function (n) {
      this.data.fire = Math.max(0, this.data.fire - n);
      this.updateFireLevel();
    },
    updateFireLevel: function () {
      var f = this.data.fire;
      if (f <= 0) this.data.fireLevel = 0;
      else if (f < 25) this.data.fireLevel = 1;
      else if (f < 60) this.data.fireLevel = 2;
      else this.data.fireLevel = 3;
    },

    // --- герой ---
    changeStat: function (name, delta) {
      if (typeof this.data[name] !== "number") return;
      this.data[name] = Math.max(0, Math.min(100, this.data[name] + delta));
    },
    damage: function (n) {
      this.data.hp = Math.max(0, this.data.hp - n);
      if (this.data.hp <= 0) this.data.dead = true;
    },
    heal: function (n) {
      this.data.hp = Math.min(this.data.maxHp, this.data.hp + n);
    },

    // --- крафт ---
    hasCrafted: function (id) {
      return (this.data.crafted[id] || 0) > 0;
    },
    addCrafted: function (id) {
      this.data.crafted[id] = (this.data.crafted[id] || 0) + 1;
    },

    // --- экспорт / импорт ---
    exportCode: function () {
      try {
        var json = JSON.stringify(this.data);
        return btoa(encodeURIComponent(json));
      } catch (e) {
        return "";
      }
    },

    importCode: function (code) {
      try {
        var json = decodeURIComponent(atob(code.trim()));
        var parsed = JSON.parse(json);
        var merged = Object.assign({}, defaultState, parsed);
        merged.crafted = Object.assign({}, defaultState.crafted, parsed.crafted || {});
        this.data = merged;
        this.save();
        return true;
      } catch (e) {
        console.warn("Не удалось импортировать:", e);
        return false;
      }
    }
  };

  window.GameState = GameState;
})();