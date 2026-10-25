/* ui.js — рендер, уведомления, печатная машинка, кулдауны */
(function () {
  "use strict";

  var UI = {
    notificationsEl: null,
    maxNotifications: 4,
    currentScreen: "intro",

    init: function () {
      this.notificationsEl = document.getElementById("notifications");
    },

    showScreen: function (id) {
      this.currentScreen = id;
      var screens = document.querySelectorAll(".screen");
      screens.forEach(function (s) {
        s.classList.remove("screen--active");
      });
      var target = document.getElementById(id);
      if (target) {
        target.classList.add("screen--active");
        if (target.scrollTop) target.scrollTop = 0;
      }
    },

    notify: function (text, type) {
      if (!this.notificationsEl) return;
      var el = document.createElement("div");
      el.className = "notification" + (type === "warning" ? " notification--warning" : "");
      el.textContent = text;
      this.notificationsEl.appendChild(el);

      while (this.notificationsEl.children.length > this.maxNotifications) {
        this.notificationsEl.removeChild(this.notificationsEl.firstChild);
      }

      requestAnimationFrame(function () {
        el.classList.add("notification--visible");
      });

      setTimeout(function () {
        el.classList.remove("notification--visible");
        setTimeout(function () {
          if (el.parentNode) el.parentNode.removeChild(el);
        }, 500);
      }, 4500);
    },

    setStatus: function (left, right) {
      var l = document.getElementById("status-left");
      var r = document.getElementById("status-right");
      if (l && left !== undefined) l.textContent = left;
      if (r && right !== undefined) r.textContent = right;
    },

    playIntro: function (onDone) {
      var lines = document.querySelectorAll(".intro__line");
      var startBtn = document.getElementById("intro-start");
      var totalDelay = 0;

      lines.forEach(function (line) {
        var delay = parseInt(line.getAttribute("data-delay"), 10) || 0;
        totalDelay = Math.max(totalDelay, delay);
        setTimeout(function () {
          line.classList.add("intro__line--visible");
        }, delay);
      });

      setTimeout(function () {
        if (startBtn) startBtn.hidden = false;
        if (typeof onDone === "function") onDone();
      }, totalDelay + 1200);
    },

    showGameOver: function (text) {
      var goText = document.getElementById("gameover-text");
      if (goText && text) goText.innerHTML = text;
      this.showScreen("gameover");
    },

    // Обновление кнопок с кулдаунами
    updateCooldownUI: function (btnId, textId, cdsLeft) {
      var btn = document.getElementById(btnId);
      var textEl = document.getElementById(textId);
      
      if (!btn) return;

      if (cdsLeft > 0) {
        btn.disabled = true;
        if (textEl) textEl.textContent = "(" + (cdsLeft * 5) + "с)";
      } else {
        btn.disabled = false;
        if (textEl) textEl.textContent = "";
      }
    }
  };

  window.UI = UI;
})();