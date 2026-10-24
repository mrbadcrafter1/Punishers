/* world.js — глобальная карта Зоны и финал */
(function () {
  "use strict";

  var NODES = [
    { name: "кордон", desc: "отсюда всё началось." },
    { name: "свалка", desc: "металл, ржавчина, тайники." },
    { name: "тёмная долина", desc: "здесь опасно." },
    { name: "бар", desc: "место, где можно перевести дух." },
    { name: "припять", desc: "город мёртвых." },
    { name: "центр", desc: "исполнение желаний." }
  ];

  var World = {
    init: function () {
      this.cacheDom();
      this.bindEvents();
    },

    cacheDom: function () {
      this.mapEl = document.getElementById("world-map");
      this.descEl = document.getElementById("world-description");
      this.actionsEl = document.getElementById("world-actions");
      this.btnBack = document.getElementById("btn-back-room-world");
    },

    bindEvents: function () {
      var self = this;
      if (this.btnBack) this.btnBack.addEventListener("click", function () {
        UI.showScreen("room");
        Room.render();
      });
    },

    render: function () {
      var d = GameState.data;
      if (!this.mapEl) return;

      this.mapEl.innerHTML = "";
      
      NODES.forEach(function (node, i) {
        var el = document.createElement("div");
        el.className = "world-map__node";
        el.textContent = node.name;

        if (i === d.worldLocation) el.classList.add("world-map__node--current");
        else if (i < d.worldLocation) el.classList.add("world-map__node--done");

        this.mapEl.appendChild(el);
      }, this);

      var current = NODES[d.worldLocation] || NODES[0];
      if (this.descEl) this.descEl.textContent = current.desc;

      this.actionsEl.innerHTML = "";

      if (d.worldLocation >= NODES.length - 1) {
        // Дошли до центра
        this.createBtn("[1] войти в центр", "btn-world-center", function () {
          self.showEnding();
        });
      } else {
        // УСЛОВИЕ ДЛЯ ПЕРЕХОДА: игрок должен был сделать вылазку (pathProgress >= 3)
        if (d.pathProgress < 3) {
          var btnLocked = document.createElement("button");
          btnLocked.className = "btn btn--nav";
          btnLocked.disabled = true;
          btnLocked.innerHTML = "сначала исследуйте текущую локацию";
          this.actionsEl.appendChild(btnLocked);
        } else {
          this.createBtn("[1] идти к следующей точке", "btn-world-move", function () {
            if (d.fatigue > 80) {
              UI.notify("ты слишком устал для такого перехода.", "warning");
              return;
            }
            GameState.changeStat("fatigue", 40);
            GameState.changeStat("hunger", 20);
            d.worldLocation++;
            d.pathProgress = 0; // Сбрасываем прогресс для новой локации
            GameState.save();
            self.render();
            Room.render();
          });
        }
      }
    },

    createBtn: function (text, id, onclick) {
      var btn = document.createElement("button");
      btn.className = "btn";
      btn.id = id;
      btn.innerHTML = text;
      btn.addEventListener("click", onclick);
      this.actionsEl.appendChild(btn);
    },

    showEnding: function () {
      var d = GameState.data;
      UI.showScreen("ending");
      
      var title = document.getElementById("ending-subtitle");
      var text = document.getElementById("ending-text");
      var actions = document.getElementById("ending-actions");

      if (title) title.textContent = "исполнитель желаний";

      if (text) {
        text.innerHTML = `
          ты стоишь перед ним. он исполняет желания.<br><br>
          но ты помнишь Выброс. помнишь, как всё закончилось за одну минуту.<br><br>
          ты можешь пожелать вернуть всё. или пожелать, чтобы этого никогда не было.<br><br>
          а можешь просто уйти.
        `;
      }

      if (actions) {
        actions.innerHTML = "";
        
        var btnStay = document.createElement("button");
        btnStay.className = "btn";
        btnStay.innerHTML = "[1] вернуть мир";
        btnStay.addEventListener("click", function () {
          d.endingChoice = "stay";
          d.endingSeen = true;
          GameState.save();
          text.innerHTML = "ты закрываешь глаза.<br><br>свет. тепло. и голоса.<br><br><b>конец.</b>";
          actions.innerHTML = "";
        });

        var btnLeave = document.createElement("button");
        btnLeave.className = "btn btn--nav";
        btnLeave.innerHTML = "[2] уйти";
        btnLeave.addEventListener("click", function () {
          d.endingChoice = "leave";
          d.endingSeen = true;
          GameState.save();
          text.innerHTML = "ты разворачиваешься и уходишь.<br><br>зона остаётся зоной.<br><br><b>конец.</b>";
          actions.innerHTML = "";
        });

        actions.appendChild(btnStay);
        actions.appendChild(btnLeave);
      }
    }
  };

  window.World = World;
})();