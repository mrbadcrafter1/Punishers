/* weather.js — погода и время суток */
(function () {
  "use strict";

  var TIMES = ["день", "вечер", "ночь", "утро"];
  var WEATHERS = [
    { id: "ясно",   weight: 50, rad: 0, cold: 0, desc: "небо серое, но сухое." },
    { id: "ветер",  weight: 25, rad: 0, cold: 1, desc: "ветер несёт пыль. глаза слезятся." },
    { id: "дождь",  weight: 15, rad: 1, cold: 2, desc: "дождь стучит по жести. холодно." },
    { id: "туман",  weight: 8,  rad: 2, cold: 1, desc: "радиоактивный туман. счётчик трещит." },
    { id: "буря",   weight: 2,  rad: 3, cold: 3, desc: "буря. ничего не видно дальше вытянутой руки." }
  ];

  var Weather = {
    tickCount: 0,
    timeTickInterval: 8,   // смена времени каждые 8 тиков
    weatherTickInterval: 5, // смена погоды каждые 5 тиков

    init: function () {
      this.cacheDom();
    },

    cacheDom: function () {
      this.timeEl = document.getElementById("weather-time");
      this.stateEl = document.getElementById("weather-state");
      this.infoEl = document.getElementById("weather-info");
    },

    // вызывается из room.js на каждом тике
    onTick: function () {
      var d = GameState.data;
      this.tickCount++;

      // смена времени суток
      if (this.tickCount % this.timeTickInterval === 0) {
        d.timeOfDay = (d.timeOfDay + 1) % 4;
        GameState.save();
      }

      // смена погоды
      if (this.tickCount % this.weatherTickInterval === 0) {
        d.weather = this.pickWeather();
        GameState.save();
      }

      // влияние погоды на героя (раз в тик)
      var w = this.getWeather(d.weather);
      if (w) {
        if (w.rad) GameState.changeStat("rad", w.rad * 0.3);
        if (w.cold) GameState.changeStat("cold", w.cold * 0.3);
      }

      this.render();
    },

    pickWeather: function () {
      var total = 0;
      WEATHERS.forEach(function (w) { total += w.weight; });
      var roll = Math.random() * total;
      var acc = 0;
      for (var i = 0; i < WEATHERS.length; i++) {
        acc += WEATHERS[i].weight;
        if (roll <= acc) return WEATHERS[i].id;
      }
      return "ясно";
    },

    getWeather: function (id) {
      for (var i = 0; i < WEATHERS.length; i++) {
        if (WEATHERS[i].id === id) return WEATHERS[i];
      }
      return WEATHERS[0];
    },

    isNight: function () {
      var t = GameState.data.timeOfDay;
      return t === 2; // ночь
    },

    render: function () {
      var d = GameState.data;
      if (this.timeEl) this.timeEl.textContent = TIMES[d.timeOfDay] || "день";
      if (this.stateEl) this.stateEl.textContent = d.weather || "ясно";

      var w = this.getWeather(d.weather);
      if (this.infoEl && w) {
        this.infoEl.title = w.desc;
      }
    }
  };

  window.Weather = Weather;
})();