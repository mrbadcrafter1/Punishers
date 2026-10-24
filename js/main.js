/* main.js — инициализация и связывание модулей */
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

    // Инициализация модулей
    Room.init();
    Outside.init();
    Weather.init();
    Path.init();
    World.init();
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
    bindPathNav(); // Подключаем кнопку перехода в вылазку
  }

  // Принудительная генерация карты при клике на "вылазка"
  function bindPathNav() {
    var btnGoPath = document.getElementById("btn-go-path");
    if (btnGoPath) {
      btnGoPath.addEventListener("click", function () {
        Path.grid = []; // Очищаем старую карту
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

    if (btnBack) {
      btnBack.addEventListener("click", function () {
        UI.showScreen("room");
        Room.render();
      });
    }

    if (btnExport) {
      btnExport.addEventListener("click", function () {
        if (textarea) {
          textarea.value = GameState.exportCode();
          textarea.select();
          try {
            document.execCommand("copy");
            UI.notify("код скопирован в буфер обмена.");
          } catch (e) {
            UI.notify("выделите код и скопируйте вручную.");
          }
        }
      });
    }

    if (btnImport) {
      btnImport.addEventListener("click", function () {
        if (!textarea || !textarea.value) {
          UI.notify("вставьте код сохранения.", "warning");
          return;
        }
        if (GameState.importCode(textarea.value)) {
          UI.notify("игра загружена.");
          setTimeout(function () { location.reload(); }, 1000);
        } else {
          UI.notify("неверный код сохранения.", "warning");
        }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();