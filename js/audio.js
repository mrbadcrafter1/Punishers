/* audio.js — звуки через Web Audio API (без внешних файлов) */
(function () {
  "use strict";

  var AudioEngine = {
    ctx: null,
    enabled: true,

    init: function () {
      // Инициализация по первому клику (требование браузеров)
      document.body.addEventListener("click", function () {
        if (!AudioEngine.ctx) {
          try {
            AudioEngine.ctx = new (window.AudioContext || window.webkitAudioContext)();
          } catch (e) {
            console.warn("Web Audio API не поддерживается");
          }
        }
      }, { once: true });
    },

    playTone: function (freq, type, duration, vol) {
      if (!this.ctx || !this.enabled) return;
      
      var osc = this.ctx.createOscillator();
      var gain = this.ctx.createGain();
      
      osc.type = type || "sine";
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(vol || 0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    },

    // Короткий звук клика/шага
    click: function () {
      this.playTone(600, "square", 0.05, 0.05);
    },

    // Звук урона
    damage: function () {
      this.playTone(100, "sawtooth", 0.3, 0.1);
    },

    // Звук победы/находки
    loot: function () {
      this.playTone(800, "sine", 0.1, 0.1);
      setTimeout(function () {
        AudioEngine.playTone(1200, "sine", 0.15, 0.1);
      }, 100);
    }
  };

  window.AudioEngine = AudioEngine;
})();