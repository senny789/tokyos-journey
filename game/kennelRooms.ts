type Bank = readonly [left: number, right: number];
type Ledge = readonly [x: number, top: number, width: number];
type Room = {
    name: string;
    banks: readonly Bank[];
    ledges: readonly Ledge[];
    switchLedge: Ledge;
    longJumpLedge?: Ledge;
    orbLedge?: Ledge;
    gateX?: number;
    stone: readonly [rim: string, face: string, seam: string];
};

export const KENNEL_ROOM_WIDTH = 1664;
export const KENNEL_HEIGHT = 720;
export const KENNEL_FLOOR = 550;
export const KENNEL_ENTRY_X = 100;
export const KENNEL_ROOMS: readonly Room[] = [
    {
        name: 'Intake',
        banks: [[0, 500], [785, 1030], [1270, KENNEL_ROOM_WIDTH]],
        ledges: [[230, 441, 105], [640, 457, 82], [1150, 465, 80]],
        switchLedge: [405, 333, 103],
        gateX: 1515,
        stone: ['#b78862', '#503b3d', '#30252c'],
    },
    {
        name: 'Feed Loft',
        banks: [[0, 285], [512, 740], [1260, KENNEL_ROOM_WIDTH]],
        ledges: [[210, 442, 100], [385, 334, 80], [875, 466, 82], [1065, 390, 78]],
        switchLedge: [530, 224, 92],
        gateX: 1505,
        stone: ['#b29774', '#494038', '#2c2529'],
    },
    {
        name: 'Drain Room',
        banks: [[0, 206], [564, 650], [975, 1070], [1470, KENNEL_ROOM_WIDTH]],
        ledges: [[172, 456, 100], [331, 354, 78], [492, 251, 72]],
        longJumpLedge: [1172, 446, 68],
        orbLedge: [960, 229, 104],
        switchLedge: [652, 150, 84],
        stone: ['#9cb5a8', '#35474f', '#202c38'],
    },
];
