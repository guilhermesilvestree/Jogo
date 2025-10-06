const rawLevelData = [
    {
        name: "O Despertar",
        playerStart: { x: 51, y: 650 },
        platforms: [
            { x: 0, y: 735, w: 1485, h: 80 },
            { x: 258, y: 629, w: 154, h: 24 },
            { x: 475, y: 557, w: 154, h: 24 },
            { x: 309, y: 461, w: 103, h: 24 },
            { x: 495, y: 363, w: 206, h: 24 },
            { x: 1350, y: 629, w: 150, h: 24 },
            { x: 1350, y: 545, w: 150, h: 24 },
            { x: 1350, y: 461, w: 150, h: 24 },
            { x: 1350, y: 377, w: 150, h: 24 },
            { x: 1350, y: 293, w: 150, h: 24 },
            { x: 1350, y: 209, w: 150, h: 24 },
        ],
        enemies: [
            { x: 412, y: 647 },
            { x: 825, y: 647 }
        ],
        water: [],
        acid: [],
        coins: [
            { x: 278, y: 593 },
            { x: 536, y: 520 },
            { x: 360, y: 423 },
            { x: 1400, y: 171 },
        ],
        exit: { x: 651, y: 291, width: 51, height: 72 }
    },
    {
        name: "Os Primeiros Ecos",
        playerStart: { x: 51, y: 580 },
        platforms: [
            { x: 0, y: 735, w: 1485, h: 60 },
            { x: 155, y: 640, w: 103, h: 24 },
            { x: 360, y: 567, w: 309, h: 24 },
            { x: 721, y: 436, w: 103, h: 24 },
            { x: 908, y: 350, w: 103, h: 24 },
            { x: 1113, y: 264, w: 103, h: 24 },
            { x: 567, y: 338, w: 103, h: 24 },
            { x: 206, y: 277, w: 258, h: 24 }
        ],
        enemies: [
            { x: 412, y: 454 },
            { x: 227, y: 223 },
            { x: 577, y: 283 },
            { x: 825, y: 622 }
        ],
        water: [],
        acid: [],
        coins: [
            { x: 175, y: 602 },
            { x: 381, y: 529 },
            { x: 762, y: 398 },
            { x: 1157, y: 226 }
        ],
        exit: { x: 227, y: 205, width: 51, height: 72 }
    },
    {
        name: "A Caverna Inundada",
        playerStart: { x: 51, y: 145 },
        platforms: [
            { x: 0, y: 760, w: 1485, h: 60 },
            { x: 0, y: 217, w: 206, h: 24 },
            { x: 258, y: 350, w: 103, h: 24 },
            { x: 412, y: 581, w: 10, h: 181 },
            { x: 772, y: 156, w: 10, h: 328 },
            { x: 668, y: 350, w: 103, h: 24 },
            { x: 567, y: 241, w: 103, h: 24 },
            { x: 855, y: 241, w: 103, h: 24 },
            { x: 1021, y: 338, w: 412, h: 24 },
            { x: 1134, y: 241, w: 103, h: 24 },
            { x: 515, y: 483, w: 472, h: 24 }
        ],
        enemies: [
            { x: 103, y: 504 },
            { x: 640, y: 405 },
            { x: 268, y: 283 },
            { x: 1238, y: 277 },
            { x: 825, y: 622 }
        ],
        water: [],
        acid: [
            { x: 0, y: 736, w: 412, h: 24 },
            { x: 422, y: 736, w: 1105, h: 24 }
        ],
        coins: [
            { x: 51, y: 205 },
            { x: 671, y: 433 },
            { x: 1383, y: 289 },
            { x: 309, y: 314 }
        ],
        exit: { x: 877, y: 398, width: 51, height: 72 }
    },
    /*    {
            name: "A Fenda dos Sussurros",
            playerStart: { x: 82, y: 145 },
            platforms: [
                { x: 0, y: 699, w: 1030, h: 24 },
                { x: 51, y: 218, w: 154, h: 24 },
                { x: 309, y: 302, w: 103, h: 24 },
                { x: 103, y: 423, w: 103, h: 24 },
                { x: 258, y: 544, w: 103, h: 24 },
                { x: 515, y: 605, w: 103, h: 24 },
                { x: 671, y: 508, w: 103, h: 24 },
                { x: 825, y: 412, w: 154, h: 24 },
                { x: 618, y: 314, w: 103, h: 24 },
                { x: 772, y: 218, w: 103, h: 24 },
                { x: 927, y: 145, w: 103, h: 24 }
            ],
            enemies: [
                { x: 155, y: 647 },
                { x: 835, y: 357 },
                { x: 628, y: 260 },
                { x: 268, y: 490 },
                { x: 825, y: 647 }
            ],
            water: [],
            acid: [
                { x: 464, y: 675, w: 412, h: 24 }
            ],
            coins: [
                { x: 62, y: 181 },
                { x: 927, y: 109 },
                { x: 721, y: 484 }
            ],
            exit: { x: 957, y: 73, width: 51, height: 72 }
        },
        {
            name: "O Coração da Escuridão",
            playerStart: { x: 51, y: 605 },
            platforms: [
                { x: 0, y: 699, w: 1030, h: 24 },
                { x: 876, y: 605, w: 154, h: 24 },
                { x: 0, y: 508, w: 772, h: 24 },
                { x: 206, y: 387, w: 154, h: 24 },
                { x: 464, y: 181, w: 20, h: 121 },
                { x: 567, y: 266, w: 206, h: 24 },
                { x: 206, y: 181, w: 206, h: 24 }
            ],
            enemies: [
                { x: 309, y: 454 },
                { x: 618, y: 212 },
                { x: 227, y: 127 },
                { x: 907, y: 550 },
                { x: 671, y: 454 },
                { x: 825, y: 647 }
            ],
            water: [],
            acid: [],
            coins: [
                { x: 927, y: 568 },
                { x: 258, y: 351 },
                { x: 618, y: 242 }
            ],
            exit: { x: 258, y: 109, width: 51, height: 72 }
        },
        {
            name: "teste",
            playerStart: { x: 202, y: 544 },
            platforms: [
                { x: 0, y: 699, w: 1030, h: 24 },
                { x: 177, y: 639, w: 265, h: 24 },
                { x: 377, y: 558, w: 224, h: 24 }
            ],
            enemies: [
                { x: 568, y: 452 },
                { x: 459, y: 463 },
                { x: 512, y: 478 }
            ],
            water: [],
            acid: [],
            coins: [],
            exit: { x: 966, y: 655, width: 51, height: 72 }
        } */
];
// lógica de proporção/responsividade do mapa em relação a tela

// fatores de escala em relação ao tamanho base
export function getLevelData() {
    const screenDecimalX = window.innerWidth / 1491;  // base largura
    const screenDecimalY = window.innerHeight / 832; // base altura

    // console.log(screenDecimalX, screenDecimalY);

    // função para escalar objetos
    const scaleObject = (obj, keys) => {
        const newObj = { ...obj };
        keys.forEach(key => {
            if (newObj[key] !== undefined) {
                if (["x", "w", "width"].includes(key)) {
                    newObj[key] = newObj[key] * screenDecimalX;
                } else if (["y", "h", "height"].includes(key)) {
                    newObj[key] = newObj[key] * screenDecimalY;
                }
            }
        });
        return newObj;
    };
    const generateLevelData = () => {
        return rawLevelData.map(level => ({
            ...level,
            playerStart: scaleObject(level.playerStart, ["x", "y"]),
            platforms: level.platforms.map(p =>
                scaleObject(p, ["x", "y", "w", "h"])
            ),
            enemies: level.enemies.map(e =>
                scaleObject(e, ["x", "y"])
            ),
            water: level.water.map(w =>
                scaleObject(w, ["x", "y", "w", "h"])
            ),
            acid: level.acid.map(a =>
                scaleObject(a, ["x", "y", "w", "h"])
            ),
            coins: level.coins.map(c =>
                scaleObject(c, ["x", "y"])
            ),
            exit: scaleObject(level.exit, ["x", "y", "width", "height"])
        }));
    };
    return generateLevelData()
}
function getLevels() {
    const level = levelData.map(data => ({ ...data, platforms: data.platforms.map(p => new Platform(p.x, p.y, p.w, p.h)), water: data.water.map(w => new Water(w.x, w.y, w.w, w.h)), acid: data.acid.map(a => new AcidWater(a.x, a.y, a.w, a.h)), coins: data.coins ? data.coins.map(c => new Coin(c.x, c.y)) : [] }));
    return level
}