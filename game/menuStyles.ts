export const MENU_BUTTON_HEIGHT = 64;

export const menuButtonStyles = {
    primary: {
        base: 'good', designHeight: MENU_BUTTON_HEIGHT, font: 'bold 26px sans',
        fill: '#f1c07d', fillTo: '#de9b53', textColor: '#352219', textColorTo: '#352219',
        border: 2, borderColor: '#f9d394', radius: 6, corner: 'cut',
        depth: 5, depthColor: '#9d6335', textShadowX: 0, textShadowY: 0,
        hover: { fill: '#ffe0a2', fillTo: '#efb879' },
    },
    secondary: {
        base: 'flat', designHeight: MENU_BUTTON_HEIGHT, font: 'bold 26px sans',
        fill: '#324840', fillTo: '#253932', textColor: '#f8ecd0', textColorTo: '#f8ecd0',
        border: 2, borderColor: '#738774', radius: 6, corner: 'cut',
        depth: 5, depthColor: '#131f1b', textShadowX: 0, textShadowY: 0,
        hover: { fill: '#496153', fillTo: '#354e42' },
    },
} as const;
