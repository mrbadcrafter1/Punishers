const _0x3e5b55 = _0xc146;
(function(_0x176d5c, _0x26d263) {
    const _0x143321 = _0xc146
      , _0x53fb53 = _0x176d5c();
    while (!![]) {
        try {
            const _0x192252 = -parseInt(_0x143321(0x14d)) / 0x1 * (parseInt(_0x143321(0x13d)) / 0x2) + parseInt(_0x143321(0x146)) / 0x3 + -parseInt(_0x143321(0x136)) / 0x4 + -parseInt(_0x143321(0x150)) / 0x5 * (-parseInt(_0x143321(0x160)) / 0x6) + parseInt(_0x143321(0x168)) / 0x7 + parseInt(_0x143321(0x120)) / 0x8 + -parseInt(_0x143321(0x14c)) / 0x9;
            if (_0x192252 === _0x26d263)
                break;
            else
                _0x53fb53['push'](_0x53fb53['shift']());
        } catch (_0x2f2f87) {
            _0x53fb53['push'](_0x53fb53['shift']());
        }
    }
}(_0x4f80, 0x79ddf));
const asciiText = String[_0x3e5b55(0x171)]`$$\   $$\ $$$$$$$$\      $$$$$$$\  
$$$\  $$ |\__$$  __|     $$  __$$\ 
$$$$\ $$ |   $$ |        $$ |  $$ |
$$ $$\$$ |   $$ |$$$$$$\ $$$$$$$  |
$$ \$$$$ |   $$ |\______|$$  __$$< 
$$ |\$$$ |   $$ |        $$ |  $$ |
$$ | \$$ |   $$ |        $$ |  $$ |
\__|  \__|   \__|        \__|  \__|`
  , ascii = document[_0x3e5b55(0x12c)](_0x3e5b55(0x152))
  , term = document[_0x3e5b55(0x12c)](_0x3e5b55(0x147))
  , copyright = document['getElementById'](_0x3e5b55(0x174))
  , overlay = document['getElementById'](_0x3e5b55(0x169))
  , ctx = overlay[_0x3e5b55(0x127)]('2d');
function resizeOverlay() {
    const _0x2e987a = _0x3e5b55;
    overlay[_0x2e987a(0x11f)] = overlay[_0x2e987a(0x17f)] * devicePixelRatio,
    overlay['height'] = overlay[_0x2e987a(0x137)] * devicePixelRatio,
    ctx[_0x2e987a(0x17b)](devicePixelRatio, 0x0, 0x0, devicePixelRatio, 0x0, 0x0);
}
window[_0x3e5b55(0x144)](_0x3e5b55(0x129), resizeOverlay),
resizeOverlay();
let t = 0x0;
function drawOverlay() {
    const _0x6414da = _0x3e5b55
      , _0xe820a8 = overlay[_0x6414da(0x17f)]
      , _0x2b347b = overlay['clientHeight'];
    ctx[_0x6414da(0x140)](0x0, 0x0, _0xe820a8, _0x2b347b);
    for (let _0x41260d = 0x0; _0x41260d < _0x2b347b; _0x41260d += 0x3) {
        const _0x596fb8 = Math[_0x6414da(0x13a)](_0x41260d / 0x28 + t / 0x3c) * 0x6;
        ctx[_0x6414da(0x17c)] = _0x41260d % 0x6 === 0x0 ? _0x6414da(0x158) : _0x6414da(0x165),
        ctx[_0x6414da(0x164)](_0x596fb8, _0x41260d, _0xe820a8, 0x2);
    }
    const _0x583090 = ctx[_0x6414da(0x135)](_0xe820a8 / 0x2, _0x2b347b / 0x2, 0x0, _0xe820a8 / 0x2, _0x2b347b / 0x2, Math[_0x6414da(0x138)](_0xe820a8, _0x2b347b));
    _0x583090[_0x6414da(0x16b)](0x0, _0x6414da(0x15f)),
    _0x583090[_0x6414da(0x16b)](0x1, _0x6414da(0x143)),
    ctx[_0x6414da(0x17c)] = _0x583090,
    ctx['fillRect'](0x0, 0x0, _0xe820a8, _0x2b347b),
    t++,
    requestAnimationFrame(drawOverlay);
}
drawOverlay();
const S = {
    'beep': new Audio('sounds/beep.mp3'),
    'crt': new Audio('sounds/crt_noise.mp3'),
    'hdd': new Audio(_0x3e5b55(0x185))
};
S[_0x3e5b55(0x178)][_0x3e5b55(0x159)] = !![],
S[_0x3e5b55(0x15c)]['loop'] = !![],
S['crt']['volume'] = 0.35,
S[_0x3e5b55(0x15c)][_0x3e5b55(0x126)] = 0.35;
const wait = _0x37e748 => new Promise(_0x3276ff => setTimeout(_0x3276ff, _0x37e748));
function addLine(_0x1ddf8f) {
    const _0x2c51dd = _0x3e5b55
      , _0x23e252 = document[_0x2c51dd(0x167)](_0x2c51dd(0x11c));
    return _0x23e252['textContent'] = _0x1ddf8f[_0x2c51dd(0x149)](),
    term['appendChild'](_0x23e252),
    term['scrollTop'] = term['scrollHeight'],
    _0x23e252;
}
function clearTerm() {
    const _0x2f3f21 = _0x3e5b55;
    term[_0x2f3f21(0x156)] = '';
}
async function start() {
    const _0x22204d = _0x3e5b55;
    clearTerm(),
    ascii[_0x22204d(0x12f)] = '',
    copyright[_0x22204d(0x12f)] = '',
    await wait(0x258);
    try {
        S['beep'][_0x22204d(0x182)] = 0x0,
        S[_0x22204d(0x184)][_0x22204d(0x173)]();
    } catch (_0x22ea03) {}
    await wait(0x320),
    ascii['textContent'] = asciiText,
    copyright[_0x22204d(0x12f)] = 'NT\x20SOFTWARE\x20©\x20NT\x20SOFTWARE\x20CORPORATION',
    setTimeout( () => {
        const _0x49bffd = _0x22204d;
        try {
            S['crt'][_0x49bffd(0x173)](),
            S['hdd'][_0x49bffd(0x173)]();
        } catch (_0x343319) {}
    }
    , 0x4b0),
    await wait(0x320),
    await addLine(_0x22204d(0x12a)),
    await wait(0x4b0),
    await addLine('КАЛИБРОВКА\x20АНТЕННОГО\x20КОНТУРА...'),
    await wait(0x578),
    await addLine(_0x22204d(0x179)),
    await wait(0x640),
    await addLine('СИНХРОНИЗАЦИЯ\x20РЕЗЕРВНЫХ\x20КАНАЛОВ...'),
    await wait(0x514),
    await addLine('ЗАГРУЗКА\x20МОДУЛЕЙ\x20УПРАВЛЕНИЯ\x20ВЕЩАНИЕМ...'),
    await wait(0x5dc),
    await addLine(_0x22204d(0x142)),
    await wait(0x384),
    await addLine('СИСТЕМА\x20ГОТОВА.'),
    await wait(0x3e8),
    await addLine(_0x22204d(0x17e)),
    showPrompt();
}
function showPrompt() {
    const _0x4df7dd = _0x3e5b55
      , _0x1497a9 = document[_0x4df7dd(0x167)](_0x4df7dd(0x11c))
      , _0x49a8b5 = document['createElement']('span');
    _0x49a8b5[_0x4df7dd(0x12d)] = _0x4df7dd(0x155),
    _0x49a8b5[_0x4df7dd(0x12f)] = '';
    const _0x95124d = document[_0x4df7dd(0x167)](_0x4df7dd(0x11e));
    _0x95124d[_0x4df7dd(0x12d)] = _0x4df7dd(0x122),
    _0x95124d['setAttribute'](_0x4df7dd(0x163), 'true'),
    _0x1497a9[_0x4df7dd(0x175)](_0x49a8b5),
    _0x1497a9[_0x4df7dd(0x175)](_0x95124d),
    term[_0x4df7dd(0x175)](_0x1497a9),
    term[_0x4df7dd(0x186)] = term[_0x4df7dd(0x177)];
    let _0x3eb1ca = '';
    function _0x5e28c7(_0x45350f) {
        const _0x1ab543 = _0x4df7dd;
        if (_0x45350f[_0x1ab543(0x11d)][_0x1ab543(0x125)] === 0x1 && !_0x45350f[_0x1ab543(0x133)] && !_0x45350f['metaKey'])
            _0x3eb1ca += _0x45350f['key'],
            _0x49a8b5['textContent'] = _0x3eb1ca[_0x1ab543(0x149)](),
            term[_0x1ab543(0x186)] = term[_0x1ab543(0x177)];
        else {
            if (_0x45350f['key'] === _0x1ab543(0x13b))
                _0x3eb1ca = _0x3eb1ca[_0x1ab543(0x141)](0x0, -0x1),
                _0x49a8b5[_0x1ab543(0x12f)] = _0x3eb1ca[_0x1ab543(0x149)]();
            else
                _0x45350f[_0x1ab543(0x11d)] === _0x1ab543(0x183) && (document[_0x1ab543(0x16c)](_0x1ab543(0x162), _0x5e28c7),
                _0x95124d['remove'](),
                processLogin(_0x3eb1ca[_0x1ab543(0x181)]()));
        }
        _0x45350f[_0x1ab543(0x14b)]();
    }
    document[_0x4df7dd(0x144)](_0x4df7dd(0x162), _0x5e28c7);
}
async function processLogin(_0xc38fcc) {
    const _0xf9f16c = _0x3e5b55;
    _0xc38fcc[_0xf9f16c(0x14f)]() !== _0xf9f16c(0x16e) ? (await addLine(_0xf9f16c(0x16a)),
    showPrompt()) : (await addLine(_0xf9f16c(0x145)),
    await wait(0x320),
    showMainMenu());
}
let menuItems = []
  , menuIndex = 0x0;
function _0xc146(_0x5558f4, _0xd8a591) {
    const _0x4f8094 = _0x4f80();
    return _0xc146 = function(_0xc14657, _0x1ef6ce) {
        _0xc14657 = _0xc14657 - 0x11c;
        let _0x5a5890 = _0x4f8094[_0xc14657];
        return _0x5a5890;
    }
    ,
    _0xc146(_0x5558f4, _0xd8a591);
}
function renderMenu(_0x45044f, _0x2eaa2f) {
    const _0x4a6ab1 = _0x3e5b55;
    clearTerm();
    if (_0x2eaa2f)
        addLine(_0x2eaa2f);
    const _0xdf6896 = document['createElement'](_0x4a6ab1(0x11c));
    _0xdf6896[_0x4a6ab1(0x12d)] = _0x4a6ab1(0x166),
    _0x45044f[_0x4a6ab1(0x16f)]( (_0x216672, _0x17f02c) => {
        const _0x49102c = _0x4a6ab1
          , _0x25fe70 = document[_0x49102c(0x167)](_0x49102c(0x11c))
          , _0x11e889 = _0x17f02c === menuIndex ? _0x49102c(0x17d) : '[\x20\x20\x20]';
        _0x25fe70[_0x49102c(0x12f)] = _0x11e889 + '\x20' + _0x216672,
        _0xdf6896[_0x49102c(0x175)](_0x25fe70);
    }
    ),
    term[_0x4a6ab1(0x175)](_0xdf6896),
    term['scrollTop'] = term['scrollHeight'];
}
function showMainMenu() {
    const _0x431aed = _0x3e5b55;
    menuItems = [_0x431aed(0x15b), _0x431aed(0x16d), _0x431aed(0x14e), _0x431aed(0x17a)],
    menuIndex = 0x0,
    renderMenu(menuItems, _0x431aed(0x12e));
    function _0x681e3e(_0x3b290a) {
        const _0x43c2e7 = _0x431aed;
        if (_0x3b290a[_0x43c2e7(0x11d)] === _0x43c2e7(0x15d))
            menuIndex = (menuIndex - 0x1 + menuItems[_0x43c2e7(0x125)]) % menuItems[_0x43c2e7(0x125)],
            renderMenu(menuItems, _0x43c2e7(0x12e)),
            _0x3b290a[_0x43c2e7(0x14b)]();
        else {
            if (_0x3b290a[_0x43c2e7(0x11d)] === 'ArrowDown')
                menuIndex = (menuIndex + 0x1) % menuItems['length'],
                renderMenu(menuItems, _0x43c2e7(0x12e)),
                _0x3b290a[_0x43c2e7(0x14b)]();
            else {
                if (_0x3b290a[_0x43c2e7(0x11d)] === _0x43c2e7(0x183)) {
                    document[_0x43c2e7(0x16c)]('keydown', _0x681e3e);
                    if (menuIndex === 0x0)
                        addLine('FORBIDDEN.'),
                        setTimeout(showMainMenu, 0x4b0);
                    else {
                        if (menuIndex === 0x1)
                            addLine(_0x43c2e7(0x124)),
                            setTimeout(showMainMenu, 0x4b0);
                        else {
                            if (menuIndex === 0x2)
                                showModulesMenu();
                            else
                                menuIndex === 0x3 && start();
                        }
                    }
                    _0x3b290a[_0x43c2e7(0x14b)]();
                }
            }
        }
    }
    document['addEventListener'](_0x431aed(0x162), _0x681e3e);
}
function _0x4f80() {
    const _0x3b4c0e = ['7300584ZqJwSf', 'PageDown', 'input-cursor', 'МОДУЛИ\x20СТАНЦИИ\x20(СТРОЙ.)', 'FORBIDDEN.', 'length', 'volume', 'getContext', '%\x200)', 'resize', 'ИНИЦИАЛИЗАЦИЯ\x20СИСТЕМ\x20РАДИОВЫШКИ...', 'classList', 'getElementById', 'className', 'ГЛАВНОЕ\x20МЕНЮ', 'textContent', 'degauss', 'img-wrap', 'ArrowDown', 'ctrlKey', 'start-screen', 'createRadialGradient', '3838684ARYuqT', 'clientHeight', 'max', 'ЭТА\x20ПАПКА\x20ПУСТА!', 'sin', 'Backspace', 'img', '456618MRgZAP', 'clipPath', 'assets/images/pd_med.png', 'clearRect', 'slice', 'ПРОВЕРКА\x20ЗАПАСНЫХ\x20БЛОКОВ:\x20OK', 'rgba(0,0,0,0.4)', 'addEventListener', 'ДОБРО\x20ПОЖАЛОВАТЬ.', '454641eWmmSp', 'terminal', 'progress-img', 'toUpperCase', 'Механизмы\x20улучшения\x20сигнала', 'preventDefault', '4980231XZTvbO', '4UTLpUu', 'Модули\x20станции\x20(строй.)', 'toLowerCase', '4723295dGaYjE', 'Механизмы\x20ручного\x20управления', 'ascii-logo', 'add', 'PD_MED', 'user-input', 'innerHTML', 'style', 'rgba(0,255,120,0.06)', 'loop', 'remove', 'Управление\x20аппаратурой', 'hdd', 'ArrowUp', 'inset(0\x200\x20', 'rgba(0,0,0,0)', '6ZyJpBt', 'PageUp', 'keydown', 'aria-hidden', 'fillRect', 'rgba(0,120,60,0.03)', 'menu-wrap', 'createElement', '6416578YOdUbx', 'overlay', 'НЕВЕРНЫЙ\x20ЛОГИН!\x20ПОПРОБУЙТЕ\x20ЕЩЕ\x20РАЗ.', 'addColorStop', 'removeEventListener', 'Управление\x20вещанием', 'admin_t_st', 'forEach', 'src', 'raw', 'click', 'play', 'copyright', 'appendChild', 'includes', 'scrollHeight', 'crt', 'ПРОВЕРКА\x20УРОВНЯ\x20ВЫХОДНОЙ\x20МОЩНОСТИ...', 'Назад', 'setTransform', 'fillStyle', '[\x20•\x20]', 'ВВЕДИТЕ\x20СВОЙ\x20ЛОГИН:', 'clientWidth', 'random', 'trim', 'currentTime', 'Enter', 'beep', 'sounds/hdd_loop.mp3', 'scrollTop', 'div', 'key', 'span', 'width'];
    _0x4f80 = function() {
        return _0x3b4c0e;
    }
    ;
    return _0x4f80();
}
function showModulesMenu() {
    const _0x435932 = _0x3e5b55;
    menuItems = [_0x435932(0x14a), _0x435932(0x151), 'Механизмы\x20электропроводки', 'Назад'],
    menuIndex = 0x0,
    renderMenu(menuItems, _0x435932(0x123));
    function _0x557a89(_0x93f912) {
        const _0x4240e4 = _0x435932;
        if (_0x93f912[_0x4240e4(0x11d)] === _0x4240e4(0x15d))
            menuIndex = (menuIndex - 0x1 + menuItems['length']) % menuItems[_0x4240e4(0x125)],
            renderMenu(menuItems, _0x4240e4(0x123)),
            _0x93f912[_0x4240e4(0x14b)]();
        else {
            if (_0x93f912[_0x4240e4(0x11d)] === _0x4240e4(0x132))
                menuIndex = (menuIndex + 0x1) % menuItems['length'],
                renderMenu(menuItems, _0x4240e4(0x123)),
                _0x93f912[_0x4240e4(0x14b)]();
            else {
                if (_0x93f912['key'] === 'Enter') {
                    document[_0x4240e4(0x16c)](_0x4240e4(0x162), _0x557a89);
                    if (menuItems[menuIndex] === _0x4240e4(0x14a))
                        showPDFolder();
                    else {
                        if (menuItems[menuIndex] === _0x4240e4(0x17a))
                            showMainMenu();
                        else
                            addLine(_0x4240e4(0x139)),
                            setTimeout(showModulesMenu, 0x4b0);
                    }
                    _0x93f912[_0x4240e4(0x14b)]();
                }
            }
        }
    }
    document[_0x435932(0x144)](_0x435932(0x162), _0x557a89);
}
function showPDFolder() {
    const _0x3109ce = _0x3e5b55;
    menuItems = [_0x3109ce(0x154), _0x3109ce(0x17a)],
    menuIndex = 0x0,
    renderMenu(menuItems, 'Механизмы\x20улучшения\x20сигнала');
    function _0x35c821(_0x1896e8) {
        const _0x2fd7a2 = _0x3109ce;
        if (_0x1896e8[_0x2fd7a2(0x11d)] === _0x2fd7a2(0x15d))
            menuIndex = (menuIndex - 0x1 + menuItems[_0x2fd7a2(0x125)]) % menuItems[_0x2fd7a2(0x125)],
            renderMenu(menuItems, _0x2fd7a2(0x14a)),
            _0x1896e8[_0x2fd7a2(0x14b)]();
        else {
            if (_0x1896e8[_0x2fd7a2(0x11d)] === _0x2fd7a2(0x132))
                menuIndex = (menuIndex + 0x1) % menuItems[_0x2fd7a2(0x125)],
                renderMenu(menuItems, _0x2fd7a2(0x14a)),
                _0x1896e8[_0x2fd7a2(0x14b)]();
            else {
                if (_0x1896e8[_0x2fd7a2(0x11d)] === _0x2fd7a2(0x183)) {
                    document['removeEventListener']('keydown', _0x35c821);
                    if (menuItems[menuIndex] === _0x2fd7a2(0x154))
                        openPDFile();
                    else {
                        if (menuItems[menuIndex] === _0x2fd7a2(0x17a))
                            showModulesMenu();
                    }
                    _0x1896e8[_0x2fd7a2(0x14b)]();
                }
            }
        }
    }
    document[_0x3109ce(0x144)](_0x3109ce(0x162), _0x35c821);
}
async function openPDFile() {
    const _0x231968 = _0x3e5b55;
    clearTerm(),
    addLine('ЗАГРУЗКА\x20PD_MED.NT\x20...');
    const _0xd59bb9 = document[_0x231968(0x167)](_0x231968(0x11c));
    _0xd59bb9[_0x231968(0x12d)] = _0x231968(0x131);
    const _0x2e0ec5 = document[_0x231968(0x167)](_0x231968(0x13c));
    _0x2e0ec5[_0x231968(0x12d)] = _0x231968(0x148),
    _0x2e0ec5[_0x231968(0x170)] = _0x231968(0x13f),
    _0xd59bb9[_0x231968(0x175)](_0x2e0ec5),
    term[_0x231968(0x175)](_0xd59bb9),
    term[_0x231968(0x186)] = term['scrollHeight'];
    let _0x4b5117 = 0x64;
    const _0x1e18dd = 0xc8
      , _0x2461d2 = setInterval( () => {
        const _0x2312d8 = _0x231968;
        _0x4b5117 -= 0x2;
        if (_0x4b5117 < 0x0)
            _0x4b5117 = 0x0;
        _0x2e0ec5[_0x2312d8(0x157)][_0x2312d8(0x13e)] = _0x2312d8(0x15e) + _0x4b5117 + _0x2312d8(0x128),
        _0x4b5117 === 0x0 && (clearInterval(_0x2461d2),
        afterImage());
    }
    , _0x1e18dd);
}
function afterImage() {
    const _0x9c36cb = _0x3e5b55;
    addLine('АППАРАТ\x20ОБРАЗЦА\x20PD-ROUND.\x20ИСПОЛЬЗУЕТСЯ\x20ДЛЯ\x20СВЯЗЫВАНИЯ\x20ГЛАВНОГО\x20ВЕЩАТЕЛЯ\x20С\x20ПОБОЧНЫМИ.');
    const _0x2274f4 = document[_0x9c36cb(0x167)](_0x9c36cb(0x11c));
    _0x2274f4[_0x9c36cb(0x156)] = '<b>УСТАНАВЛИВАТЬ\x20РЯДОМ\x20С\x20ПОБОЧНЫМ\x20ОБЪЕКТОМ!</b>',
    term['appendChild'](_0x2274f4);
    function _0xce329b(_0x332a94) {
        const _0x5ecd74 = _0x9c36cb;
        _0x332a94[_0x5ecd74(0x11d)] === _0x5ecd74(0x183) && (document[_0x5ecd74(0x16c)]('keydown', _0xce329b),
        showPDFolder(),
        _0x332a94[_0x5ecd74(0x14b)]());
    }
    document[_0x9c36cb(0x144)](_0x9c36cb(0x162), _0xce329b);
}
function maybeDegauss() {
    const _0x4c7001 = _0x3e5b55;
    Math[_0x4c7001(0x180)]() < 0.08 && (document[_0x4c7001(0x12c)](_0x4c7001(0x178))[_0x4c7001(0x12b)][_0x4c7001(0x153)]('degauss'),
    setTimeout( () => document[_0x4c7001(0x12c)](_0x4c7001(0x178))[_0x4c7001(0x12b)][_0x4c7001(0x15a)](_0x4c7001(0x130)), 0x384));
}
setInterval(maybeDegauss, 0x1b58),
window[_0x3e5b55(0x144)](_0x3e5b55(0x162), _0x4dc0c8 => {
    const _0x1175b1 = _0x3e5b55;
    [_0x1175b1(0x15d), _0x1175b1(0x132), _0x1175b1(0x161), _0x1175b1(0x121), '\x20'][_0x1175b1(0x176)](_0x4dc0c8[_0x1175b1(0x11d)]) && _0x4dc0c8[_0x1175b1(0x14b)]();
}
, {
    'passive': ![]
}),
window['addEventListener'](_0x3e5b55(0x172), () => {
    const _0x5efd4a = _0x3e5b55;
    document['getElementById'](_0x5efd4a(0x134))[_0x5efd4a(0x15a)](),
    start();
}
, {
    'once': !![]
});
