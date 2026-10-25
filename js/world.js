/* world.js — финал игры */
(function () {
  "use strict";

  var World = {
    init: function () {
      // Инициализация не требуется, просто заглушка
    },

    showEnding: function () {
      var endingScreen = document.getElementById("ending");
      if (!endingScreen) {
        console.error("Экран #ending не найден в HTML!");
        return;
      }

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
          GameState.data.endingSeen = true;
          GameState.data.endingChoice = "stay";
          GameState.save();
          if (text) text.innerHTML = "ты закрываешь глаза.<br><br>свет. тепло. и голоса.<br><br><b>конец.</b>";
          actions.innerHTML = "";
        });

        var btnLeave = document.createElement("button");
        btnLeave.className = "btn btn--nav";
        btnLeave.innerHTML = "[2] уйти";
        btnLeave.addEventListener("click", function () {
          GameState.data.endingSeen = true;
          GameState.data.endingChoice = "leave";
          GameState.save();
          if (text) text.innerHTML = "ты разворачиваешься и уходишь.<br><br>зона остаётся зоной.<br><br><b>конец.</b>";
          actions.innerHTML = "";
        });

        actions.appendChild(btnStay);
        actions.appendChild(btnLeave);
      }
    }
  };

  window.World = World;
})();