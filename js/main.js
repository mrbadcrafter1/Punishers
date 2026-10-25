/* main.js — инициализация, связывание модулей и чит-команда */
(function () {
  "use strict";

  function boot() {
    GameState.init();
    UI.init();

    if (GameState.data.dead) {
      UI.showGameOver();
      bindRestart();
      return;
    }

    Room.init();
    Outside.init();
    Weather.init();
    Path.init();
    Craft.init(); 
    if (typeof World !== "undefined") World.init();
    if (window.AudioEngine) AudioEngine.init();

    var startBtn = document.getElementById("intro-start");

    if (!GameState.data.introSeen) {
      UI.showScreen("intro");
      UI.playIntro();

      if (startBtn) {
        startBtn.addEventListener("click", function () {
          GameState.data.introSeen = true;
          GameState.save();
          UI.showScreen("room");
          Room.render();
          Outside.render();
          Weather.render();
        });
      }
    } else {
      UI.showScreen("room");
      Room.render();
      Outside.render();
      Weather.render();
    }

    bindSaves();
    bindRestart();
    bindPathNav();
    
    // Чит-команда
    window.cheat = function() {
      var d = GameState.data;
      d.wood = 999; d.food = 999; d.hide = 999;
      d.artifacts = 99; d.chips = 99; d.parts = 99;
      d.hp = 100; d.maxHp = 100; d.rad = 0; d.fatigue = 0;
      d.hasDetector = true; d.survivors = 5;
      d.worldLocation = 4; 
      delete d.mapData[4]; 
      
      if (Path) { Path.mapGrid = []; Path.explored = {}; }
      GameState.save();
      
      UI.notify("ЧИТ АКТИВИРОВАН: Припять, ресурсы, детектор.");
      Room.render(); Outside.render(); if (window.Craft) Craft.render();
      
      if (UI.currentScreen === "path") {
        Path.loadOrGenerate(); Path.render();
      }
    };
  }

  function bindPathNav() {
    var btnGoPath = document.getElementById("btn-go-path");
    if (btnGoPath) {
      btnGoPath.addEventListener("click", function () {
        Path.mapGrid = [];
        Path.explored = {};
        UI.showScreen("path");
        Path.render();
      });
    }
  }

  function bindRestart() {
    var restartBtn = document.getElementById("btn-restart");
    if (restartBtn) {
      restartBtn.addEventListener("click", function () {
        GameState.reset();
        location.reload();
      });
    }
  }

  function bindSaves() {
    var btnExport = document.getElementById("btn-export");
    var btnImport = document.getElementById("btn-import");
    var btnBack = document.getElementById("btn-back-room-saves");
    var textarea = document.getElementById("save-code");
    var btnHardReset = document.getElementById("btn-hard-reset"); // НОВАЯ КНОПКА

    if (btnBack) {
      btnBack.addEventListener("click", function () {
        UI.showScreen("room");
        Room.render();
      });
    }

    // ЛОГИКА ПОЛНОГО СБРОСА
    if (btnHardReset) {
      btnHardReset.addEventListener("click", function () {
        var confirmReset = confirm("Вы уверены? Весь прогресс будет удален безвозвратно!");
        if (confirmReset) {
          // Удаляем ключ сохранения из localStorage
          localStorage.removeItem("dark_zone_save_v7");
          // На всякий случай очищаем всё хранилище
          localStorage.clear();
          // Перезагружаем страницу, чтобы начать с чистого листа
          location.reload();
        }
      });
    }

    if (btnExport) {
      btnExport.addEventListener("click", function () {
        if (textarea) {
          textarea.value = GameState.exportCode();
          textarea.select();
          try { document.execCommand("copy"); UI.notify("код скопирован."); } catch (e) { UI.notify("выделите код вручную."); }
        }
      });
    }

    if (btnImport) {
      btnImport.addEventListener("click", function () {
        if (!textarea || !textarea.value) { UI.notify("вставьте код.", "warning"); return; }
        if (GameState.importCode(textarea.value)) {
          UI.notify("игра загружена.");
          setTimeout(function () { location.reload(); }, 1000);
        } else { UI.notify("неверный код.", "warning"); }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
