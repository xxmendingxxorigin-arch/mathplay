/**
 * ============================================================================
 * MATHPLAY - JAVASCRIPT CONTROLLER
 * Interactive educational platform for the Four Color Theorem & Game Math
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initHistoryCollapsibles();
    initFourColorModule();
    initTheoryTabs();
    initNimGameModule();
    initGameTheoryModule();
    initMontyHallModule();
    initBridgesModule();
    initQuizModule();
});

/* ============================================================================
   1. THEME TOGGLE & COLLAPSIBLES
   ============================================================================ */
function initThemeToggle() {
    const btnTheme = document.getElementById('theme-toggle');
    if (!btnTheme) return;

    btnTheme.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        btnTheme.innerHTML = newTheme === 'light' 
            ? '<i class="fa-solid fa-sun"></i>' 
            : '<i class="fa-solid fa-moon"></i>';
    });
}

function initHistoryCollapsibles() {
    const collapseBtns = document.querySelectorAll('.history-header-btn');
    collapseBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.history-card-collapsible');
            if (card) {
                card.classList.toggle('open');
            }
        });
    });
}

/* ============================================================================
   2. FOUR COLOR THEOREM SANDBOX & SOLVER
   ============================================================================ */
function initFourColorModule() {
    const mapSelect = document.getElementById('map-select');
    const mapStage = document.getElementById('map-stage');
    const colorButtons = document.querySelectorAll('.palette-buttons .color-btn');
    const btnAutoSolve = document.getElementById('btn-auto-solve');
    const btnResetMap = document.getElementById('btn-reset-map');

    const statColored = document.getElementById('stat-colored');
    const statColorsUsed = document.getElementById('stat-colors-used');
    const statConflicts = document.getElementById('stat-conflicts');
    const conflictWrapper = document.getElementById('stat-conflict-wrapper');
    const successBanner = document.getElementById('map-success-banner');

    let activeColor = 'color-1'; // color-1, color-2, color-3, color-4, or 'clear'
    let currentMapData = null;
    let regionColors = {}; // { regionId: 'color-1' | null }

    // Maps definitions
    const MAP_PRESETS = {
        'south-america': {
            type: 'polygons',
            viewBox: '40 15 470 595',
            regions: [
                { id: 'col', name: 'Colombia', points: '120,65 135,45 155,35 170,30 185,48 180,75 195,95 220,120 212,150 200,185 175,175 145,160 130,140 115,115 110,95' },
                { id: 'ven', name: 'Venezuela', points: '185,48 210,52 220,35 255,45 305,55 320,68 310,95 300,115 270,125 245,130 220,120 195,95 180,75' },
                { id: 'guy', name: 'Guyanas', points: '320,68 365,75 400,95 385,125 345,120 300,115 310,95' },
                { id: 'ecu', name: 'Ecuador', points: '115,115 95,135 85,160 75,175 100,170 120,170 145,160 130,140' },
                { id: 'per', name: 'Perú', points: '75,175 65,195 85,230 115,270 135,310 160,340 175,335 185,310 200,285 225,270 210,240 190,215 200,185 175,175 145,160 120,170 100,170' },
                { id: 'bra', name: 'Brasil', points: '400,95 420,120 440,150 465,175 495,215 480,265 460,310 440,345 410,380 385,420 375,450 370,465 360,450 340,445 320,460 325,430 310,415 315,390 300,365 280,360 295,330 280,285 250,265 225,270 210,240 190,215 200,185 212,150 220,120 245,130 270,125 300,115 345,120 385,125' },
                { id: 'bol', name: 'Bolivia', points: '175,335 185,310 200,285 225,270 250,265 280,285 295,330 280,360 265,375 245,385 220,380 195,375 185,355' },
                { id: 'par', name: 'Paraguay', points: '245,385 265,375 280,360 300,365 315,390 310,415 290,430 265,420' },
                { id: 'chi', name: 'Chile', points: '160,340 165,380 160,430 160,480 150,530 155,570 180,595 185,550 175,500 185,440 195,375 185,355 175,335' },
                { id: 'arg', name: 'Argentina', points: '195,375 220,380 245,385 265,420 290,430 310,415 325,430 320,460 310,470 315,485 285,485 245,500 220,560 195,585 180,595 185,550 175,500 185,440' },
                { id: 'uru', name: 'Uruguay', points: '320,460 340,445 360,450 370,465 360,485 335,495 315,485 310,470' }
            ],
            adjacencies: {
                'col': ['ven', 'ecu', 'per', 'bra'],
                'ven': ['col', 'guy', 'bra'],
                'guy': ['ven', 'bra'],
                'ecu': ['col', 'per'],
                'per': ['col', 'ecu', 'bra', 'bol', 'chi'],
                'bra': ['col', 'ven', 'guy', 'per', 'bol', 'par', 'arg', 'uru'],
                'bol': ['per', 'bra', 'par', 'arg', 'chi'],
                'par': ['bol', 'bra', 'arg'],
                'chi': ['per', 'bol', 'arg'],
                'arg': ['chi', 'bol', 'par', 'bra', 'uru'],
                'uru': ['bra', 'arg']
            }
        },

        'western-europe': {
            type: 'polygons',
            viewBox: '30 30 460 435',
            regions: [
                { id: 'por', name: 'Portugal', points: '70,255 90,290 85,345 75,365 45,360 40,310 50,275' },
                { id: 'esp', name: 'España', points: '70,240 110,240 180,245 195,260 210,280 205,295 180,335 145,365 95,375 75,365 85,345 90,290 70,255' },
                { id: 'fra', name: 'Francia', points: '240,100 255,125 270,145 280,170 275,205 260,225 250,250 250,280 230,290 210,280 195,260 180,245 170,210 155,175 120,160 145,140 170,125 210,115' },
                { id: 'uk', name: 'Reino Unido (Isla)', points: '160,40 185,45 180,75 195,95 210,110 200,130 165,140 125,150 140,120 135,95 150,75 145,55' },
                { id: 'bel', name: 'Bélgica', points: '240,100 250,90 270,95 285,110 270,145 255,125' },
                { id: 'ned', name: 'Países Bajos', points: '250,90 265,65 285,55 310,50 305,80 285,110 270,95' },
                { id: 'ger', name: 'Alemania', points: '310,50 330,40 365,45 375,55 370,105 365,155 340,175 310,195 295,200 275,205 280,170 270,145 285,110 305,80' },
                { id: 'sui', name: 'Suiza', points: '275,205 295,200 310,195 315,220 310,235 290,240 270,235 260,225' },
                { id: 'ita', name: 'Italia', points: '260,225 270,235 290,240 310,235 335,230 360,235 340,260 330,300 355,345 380,385 395,415 365,410 355,435 335,450 325,410 305,360 280,320 260,295 250,280 250,250' },
                { id: 'aut', name: 'Austria', points: '310,195 340,175 365,155 390,160 415,185 395,225 360,235 335,230 310,235 315,220' },
                { id: 'pol', name: 'Polonia', points: '375,55 420,50 465,60 475,110 465,160 435,185 415,185 390,160 365,155 370,105' }
            ],
            adjacencies: {
                'por': ['esp'],
                'esp': ['por', 'fra'],
                'fra': ['esp', 'bel', 'ger', 'sui', 'ita'],
                'uk': [],
                'bel': ['fra', 'ned', 'ger'],
                'ned': ['bel', 'ger'],
                'ger': ['bel', 'ned', 'fra', 'sui', 'aut', 'pol'],
                'sui': ['fra', 'ger', 'ita', 'aut'],
                'ita': ['fra', 'sui', 'aut'],
                'aut': ['ger', 'sui', 'ita', 'pol'],
                'pol': ['ger', 'aut']
            }
        },

        'north-central-america': {
            type: 'polygons',
            viewBox: '40 20 480 485',
            regions: [
                { id: 'can', name: 'Canadá', points: '55,35 180,25 240,45 290,65 340,40 440,55 420,95 410,105 365,125 330,140 290,135 260,115 160,115 60,115 45,75' },
                { id: 'usa', name: 'Estados Unidos', points: '60,115 160,115 260,115 290,135 330,140 365,125 410,105 440,135 430,165 420,205 395,250 410,290 400,335 375,280 340,275 300,280 270,305 235,280 195,245 160,235 95,235 70,205 50,165' },
                { id: 'mex', name: 'México', points: '95,235 160,235 195,245 235,280 270,305 280,340 305,355 330,330 355,320 375,330 365,360 345,365 310,365 290,385 250,375 225,365 190,345 155,315 130,270 120,245 105,280 90,325 75,270' },
                { id: 'gua', name: 'Guatemala', points: '250,375 290,385 310,365 345,365 345,390 350,395 330,410 290,400' },
                { id: 'belz', name: 'Belice', points: '365,360 345,365 345,390 360,375' },
                { id: 'hon', name: 'Honduras', points: '350,395 380,395 405,405 365,420 335,420 330,410' },
                { id: 'slv', name: 'El Salvador', points: '290,400 330,410 335,420 310,415' },
                { id: 'nic', name: 'Nicaragua', points: '335,420 365,420 405,405 400,440 395,455 365,450 345,445' },
                { id: 'cri', name: 'Costa Rica', points: '345,445 365,450 395,455 415,465 405,480 390,485 370,475 350,465' },
                { id: 'pan', name: 'Panamá', points: '390,485 405,480 415,465 445,465 480,470 505,485 475,490 445,485 415,490' }
            ],
            adjacencies: {
                'can': ['usa'],
                'usa': ['can', 'mex'],
                'mex': ['usa', 'gua', 'belz'],
                'gua': ['mex', 'belz', 'hon', 'slv'],
                'belz': ['mex', 'gua'],
                'hon': ['gua', 'slv', 'nic'],
                'slv': ['gua', 'hon'],
                'nic': ['hon', 'cri'],
                'cri': ['nic', 'pan'],
                'pan': ['cri']
            }
        },

        'honeycomb-hive': {
            type: 'polygons',
            viewBox: '0 0 520 380',
            regions: [
                // Fila 1 (3 hexágonos)
                { id: 'h1', name: 'Celda Alpha', points: '160,82 200,59 240,82 240,128 200,151 160,128' },
                { id: 'h2', name: 'Celda Beta', points: '240,82 280,59 320,82 320,128 280,151 240,128' },
                { id: 'h3', name: 'Celda Gamma', points: '320,82 360,59 400,82 400,128 360,151 320,128' },
                // Fila 2 (4 hexágonos intercalados con contacto perfecto)
                { id: 'h4', name: 'Celda Delta', points: '120,151 160,128 200,151 200,197 160,220 120,197' },
                { id: 'h5', name: 'Celda Épsilon (Centro)', points: '200,151 240,128 280,151 280,197 240,220 200,197' },
                { id: 'h6', name: 'Celda Zeta (Centro)', points: '280,151 320,128 360,151 360,197 320,220 280,197' },
                { id: 'h7', name: 'Celda Eta', points: '360,151 400,128 440,151 440,197 400,220 360,197' },
                // Fila 3 (3 hexágonos)
                { id: 'h8', name: 'Celda Theta', points: '160,220 200,197 240,220 240,266 200,289 160,266' },
                { id: 'h9', name: 'Celda Iota', points: '240,220 280,197 320,220 320,266 280,289 240,266' },
                { id: 'h10', name: 'Celda Kappa', points: '320,220 360,197 400,220 400,266 360,289 320,266' }
            ],
            adjacencies: {
                'h1': ['h2', 'h4', 'h5'],
                'h2': ['h1', 'h3', 'h5', 'h6'],
                'h3': ['h2', 'h6', 'h7'],
                'h4': ['h1', 'h5', 'h8'],
                'h5': ['h1', 'h2', 'h4', 'h6', 'h8', 'h9'],
                'h6': ['h2', 'h3', 'h5', 'h7', 'h9', 'h10'],
                'h7': ['h3', 'h6', 'h10'],
                'h8': ['h4', 'h5', 'h9'],
                'h9': ['h5', 'h6', 'h8', 'h10'],
                'h10': ['h6', 'h7', 'h9']
            }
        },

        'concentric-rings': {
            type: 'polygons',
            viewBox: '0 0 500 400',
            regions: [
                // Core
                { id: 'c0', name: 'Núcleo Central', points: '220,180 280,180 295,200 280,220 220,220 205,200' },
                // Mid Ring (4 quadrants)
                { id: 'm1', name: 'Anillo Medio Norte', points: '200,100 300,100 280,180 220,180' },
                { id: 'm2', name: 'Anillo Medio Este', points: '300,100 370,170 370,230 295,200 280,180' },
                { id: 'm3', name: 'Anillo Medio Sur', points: '280,220 295,200 370,230 300,300 200,300 220,220' },
                { id: 'm4', name: 'Anillo Medio Oeste', points: '200,100 220,180 205,200 220,220 200,300 130,230 130,170' },
                // Outer Ring (4 sections)
                { id: 'o1', name: 'Corona Norte', points: '140,40 360,40 300,100 200,100' },
                { id: 'o2', name: 'Corona Este', points: '360,40 450,150 450,250 370,230 370,170 300,100' },
                { id: 'o3', name: 'Corona Sur', points: '370,230 450,250 360,360 140,360 200,300 300,300' },
                { id: 'o4', name: 'Corona Oeste', points: '140,40 200,100 130,170 130,230 200,300 140,360 50,250 50,150' }
            ],
            adjacencies: {
                'c0': ['m1', 'm2', 'm3', 'm4'],
                'm1': ['c0', 'm2', 'm4', 'o1'],
                'm2': ['c0', 'm1', 'm3', 'o2'],
                'm3': ['c0', 'm2', 'm4', 'o3'],
                'm4': ['c0', 'm1', 'm3', 'o4'],
                'o1': ['m1', 'o2', 'o4'],
                'o2': ['m2', 'o1', 'o3'],
                'o3': ['m3', 'o2', 'o4'],
                'o4': ['m4', 'o1', 'o3']
            }
        },

        'birkhoff-diamond': {
            type: 'polygons',
            viewBox: '0 0 500 400',
            regions: [
                { id: 'r1', name: 'Norte', points: '250,30 380,120 250,150 120,120' },
                { id: 'r2', name: 'Oeste Exterior', points: '120,120 250,150 170,250 50,200' },
                { id: 'r3', name: 'Este Exterior', points: '380,120 450,200 330,250 250,150' },
                { id: 'r4', name: 'Centro', points: '250,150 330,250 250,270 170,250' },
                { id: 'r5', name: 'Sur Oeste', points: '170,250 250,270 250,370 110,320' },
                { id: 'r6', name: 'Sur Este', points: '330,250 390,320 250,370 250,270' }
            ],
            adjacencies: {
                // En el teorema de los 4 colores, tocar en un solo vértice (punto) NO es adyacencia
                'r1': ['r2', 'r3'],
                'r2': ['r1', 'r4', 'r5'],
                'r3': ['r1', 'r4', 'r6'],
                'r4': ['r2', 'r3', 'r5', 'r6'],
                'r5': ['r2', 'r4', 'r6'],
                'r6': ['r3', 'r4', 'r5']
            }
        },

        'voronoi-complex': {
            type: 'polygons',
            viewBox: '0 0 500 400',
            regions: [
                { id: 'z1', name: 'Archipiélago Alpha', points: '40,40 180,30 200,120 70,150' },
                { id: 'z2', name: 'Región Beta', points: '180,30 340,40 310,140 200,120' },
                { id: 'z3', name: 'Costa Gamma', points: '340,40 460,50 450,170 310,140' },
                { id: 'z4', name: 'Valle Central Delta', points: '200,120 310,140 330,240 180,230 140,180' },
                { id: 'z5', name: 'Tierras Épsilon', points: '70,150 140,180 180,230 120,330 40,260' },
                { id: 'z6', name: 'Cuenca Zeta', points: '310,140 450,170 430,300 330,240' },
                { id: 'z7', name: 'Meseta Eta', points: '180,230 330,240 360,350 220,360' },
                { id: 'z8', name: 'Península Theta', points: '120,330 220,360 360,350 320,380 140,380' }
            ],
            adjacencies: {
                'z1': ['z2', 'z4', 'z5'],
                'z2': ['z1', 'z3', 'z4'],
                'z3': ['z2', 'z4', 'z6'],
                'z4': ['z1', 'z2', 'z3', 'z5', 'z6', 'z7'],
                'z5': ['z1', 'z4', 'z7', 'z8'],
                'z6': ['z3', 'z4', 'z7'],
                'z7': ['z4', 'z5', 'z6', 'z8'],
                'z8': ['z5', 'z7']
            }
        }
    };

    // Procedural organic planar map generator (Voronoi + Lloyd relaxation + Exact Geometric Adjacency)
    function generateRandomPlanarMap() {
        const width = 500;
        const height = 400;
        const pad = 25;
        const numRegions = 8 + Math.floor(Math.random() * 6); // 8 a 13 regiones aleatorias

        const REGION_NAMES = [
            'Reino de Avalon', 'Costa Esmeralda', 'Valle Dorado', 'Tierras del Norte',
            'Bahía Carmesí', 'Meseta Zafiro', 'Bosque de Jade', 'Península Coral',
            'Cumbres de Ágata', 'Oasis del Sol', 'Frontera Austral', 'Archipiélago de Niebla',
            'Isla del Dragón', 'Tierras Altas', 'Delta Argenta', 'Paso del Viento'
        ];
        const shuffledNames = [...REGION_NAMES].sort(() => Math.random() - 0.5);

        // Generate initial random seeds
        let sites = [];
        for (let i = 0; i < numRegions; i++) {
            sites.push({
                x: pad + 15 + Math.random() * (width - 2 * pad - 30),
                y: pad + 15 + Math.random() * (height - 2 * pad - 30)
            });
        }

        // Bounding box for map
        const box = [
            { x: pad, y: pad },
            { x: width - pad, y: pad },
            { x: width - pad, y: height - pad },
            { x: pad, y: height - pad }
        ];

        // Polygon bisector clipper (Sutherland-Hodgman)
        function clipPolygonByBisector(poly, s1, s2) {
            const mx = (s1.x + s2.x) / 2;
            const my = (s1.y + s2.y) / 2;
            const nx = s1.x - s2.x;
            const ny = s1.y - s2.y;

            function isInside(p) {
                return (p.x - mx) * nx + (p.y - my) * ny >= 0;
            }

            function lineInter(pA, pB) {
                const vA = (pA.x - mx) * nx + (pA.y - my) * ny;
                const vB = (pB.x - mx) * nx + (pB.y - my) * ny;
                const t = Math.abs(vA - vB) < 1e-6 ? 0.5 : vA / (vA - vB);
                return {
                    x: Math.round(pA.x + t * (pB.x - pA.x)),
                    y: Math.round(pA.y + t * (pB.y - pA.y))
                };
            }

            const res = [];
            for (let i = 0; i < poly.length; i++) {
                const curr = poly[i];
                const next = poly[(i + 1) % poly.length];
                const inCurr = isInside(curr);
                const inNext = isInside(next);

                if (inCurr) res.push(curr);
                if (inCurr !== inNext) {
                    res.push(lineInter(curr, next));
                }
            }
            return res;
        }

        // 1 pass of Lloyd relaxation to create well-proportioned organic shapes
        const relaxedSites = [];
        for (let i = 0; i < sites.length; i++) {
            let cell = [...box];
            for (let j = 0; j < sites.length; j++) {
                if (i !== j) cell = clipPolygonByBisector(cell, sites[i], sites[j]);
            }
            if (cell.length >= 3) {
                let cx = 0, cy = 0;
                cell.forEach(p => { cx += p.x; cy += p.y; });
                relaxedSites.push({ x: cx / cell.length, y: cy / cell.length });
            } else {
                relaxedSites.push(sites[i]);
            }
        }
        sites = relaxedSites;

        // Final Voronoi cells
        const regions = [];
        for (let i = 0; i < sites.length; i++) {
            let cell = [...box];
            for (let j = 0; j < sites.length; j++) {
                if (i !== j) cell = clipPolygonByBisector(cell, sites[i], sites[j]);
            }
            if (cell.length >= 3) {
                const id = `reg_${i + 1}`;
                regions.push({
                    id: id,
                    name: shuffledNames[i] || `Provincia ${i + 1}`,
                    points: cell.map(p => `${p.x},${p.y}`).join(' ')
                });
            }
        }

        // Exact geometric adjacency calculation
        function distToSegment(p, a, b) {
            const l2 = (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
            if (l2 === 0) return Math.hypot(p.x - a.x, p.y - a.y);
            let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
            t = Math.max(0, Math.min(1, t));
            return Math.hypot(p.x - (a.x + t * (b.x - a.x)), p.y - (a.y + t * (b.y - a.y)));
        }

        function edgesOverlap(a1, a2, b1, b2) {
            const tol = 6;
            const minLen = 8;
            let close = 0;
            if (distToSegment(b1, a1, a2) < tol) close++;
            if (distToSegment(b2, a1, a2) < tol) close++;
            if (distToSegment(a1, b1, b2) < tol) close++;
            if (distToSegment(a2, b1, b2) < tol) close++;

            if (close >= 2) {
                const lenA = Math.hypot(a2.x - a1.x, a2.y - a1.y);
                if (lenA < minLen) return false;
                const dx = (a2.x - a1.x) / lenA;
                const dy = (a2.y - a1.y) / lenA;
                const t_b1 = (b1.x - a1.x) * dx + (b1.y - a1.y) * dy;
                const t_b2 = (b2.x - a1.x) * dx + (b2.y - a1.y) * dy;
                const overlapStart = Math.max(0, Math.min(t_b1, t_b2));
                const overlapEnd = Math.min(lenA, Math.max(t_b1, t_b2));
                return (overlapEnd - overlapStart >= minLen);
            }
            return false;
        }

        const polyEdges = {};
        regions.forEach(r => {
            const pts = r.points.trim().split(/\s+/).map(p => {
                const [x, y] = p.split(',').map(Number);
                return { x, y };
            });
            const edges = [];
            for (let i = 0; i < pts.length; i++) {
                edges.push([pts[i], pts[(i + 1) % pts.length]]);
            }
            polyEdges[r.id] = edges;
        });

        const adjacencies = {};
        regions.forEach(r => adjacencies[r.id] = []);

        for (let i = 0; i < regions.length; i++) {
            for (let j = i + 1; j < regions.length; j++) {
                const idA = regions[i].id;
                const idB = regions[j].id;
                let sharesEdge = false;
                for (const eA of polyEdges[idA]) {
                    for (const eB of polyEdges[idB]) {
                        if (edgesOverlap(eA[0], eA[1], eB[0], eB[1])) {
                            sharesEdge = true;
                            break;
                        }
                    }
                    if (sharesEdge) break;
                }
                if (sharesEdge) {
                    adjacencies[idA].push(idB);
                    adjacencies[idB].push(idA);
                }
            }
        }

        return {
            type: 'polygons',
            viewBox: '0 0 500 400',
            regions: regions,
            adjacencies: computeGeometricAdjacencies(regions)
        };
    }

    // Shared geometric adjacency calculator (with collinearity verification to prevent corner false conflicts)
    function computeGeometricAdjacencies(regions) {
        function distToSegment(p, a, b) {
            const l2 = (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
            if (l2 === 0) return Math.hypot(p.x - a.x, p.y - a.y);
            let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
            t = Math.max(0, Math.min(1, t));
            return Math.hypot(p.x - (a.x + t * (b.x - a.x)), p.y - (a.y + t * (b.y - a.y)));
        }

        function edgesOverlap(a1, a2, b1, b2) {
            const tol = 3.5;
            const minLen = 4.0;
            const lenA = Math.hypot(a2.x - a1.x, a2.y - a1.y);
            const lenB = Math.hypot(b2.x - b1.x, b2.y - b1.y);
            if (lenA < minLen || lenB < minLen) return false;

            // Ensure edges are parallel/collinear
            const dot = Math.abs(((b2.x - b1.x) * (a2.x - a1.x) + (b2.y - b1.y) * (a2.y - a1.y)) / (lenA * lenB));
            if (dot < 0.90) return false;

            if (distToSegment(b1, a1, a2) > tol && distToSegment(b2, a1, a2) > tol) return false;

            const dx = (a2.x - a1.x) / lenA;
            const dy = (a2.y - a1.y) / lenA;
            const t_b1 = (b1.x - a1.x) * dx + (b1.y - a1.y) * dy;
            const t_b2 = (b2.x - a1.x) * dx + (b2.y - a1.y) * dy;
            const start = Math.max(0, Math.min(t_b1, t_b2));
            const end = Math.min(lenA, Math.max(t_b1, t_b2));
            return (end - start >= minLen);
        }

        const polyEdges = {};
        regions.forEach(r => {
            const pts = r.points.trim().split(/\s+/).map(p => {
                const [x, y] = p.split(',').map(Number);
                return { x, y };
            });
            const edges = [];
            for (let i = 0; i < pts.length; i++) {
                edges.push([pts[i], pts[(i + 1) % pts.length]]);
            }
            polyEdges[r.id] = edges;
        });

        const adjacencies = {};
        regions.forEach(r => adjacencies[r.id] = []);

        for (let i = 0; i < regions.length; i++) {
            for (let j = i + 1; j < regions.length; j++) {
                const idA = regions[i].id;
                const idB = regions[j].id;
                let sharesEdge = false;
                for (const eA of polyEdges[idA]) {
                    for (const eB of polyEdges[idB]) {
                        if (edgesOverlap(eA[0], eA[1], eB[0], eB[1])) {
                            sharesEdge = true;
                            break;
                        }
                    }
                    if (sharesEdge) break;
                }
                if (sharesEdge) {
                    adjacencies[idA].push(idB);
                    adjacencies[idB].push(idA);
                }
            }
        }
        return adjacencies;
    }

    // Generator for McGregor 110-Region Map (Martin Gardner, Scientific American 1975)
    let cachedMcGregorMap = null;
    function getOrGenerateMcGregorMap() {
        if (cachedMcGregorMap) return cachedMcGregorMap;
        const regions = [];
        const cx = 250, cy = 290;

        // Central rectangle
        regions.push({
            id: 'mcg_0',
            name: 'Región Central (Núcleo)',
            points: '220,240 280,240 280,340 220,340'
        });

        const numTiers = 9;
        const dx = 18;
        const dy = 21;

        for (let t = 1; t <= numTiers; t++) {
            const inY = 240 - (t - 1) * dy;
            const outY = 240 - t * dy;
            const inLeft = 220 - (t - 1) * dx;
            const outLeft = 220 - t * dx;
            const inRight = 280 + (t - 1) * dx;
            const outRight = 280 + t * dx;

            const numBricks = t * 2;
            const span = outRight - outLeft;
            const brickW = span / numBricks;

            // Top tier bricks
            for (let b = 0; b < numBricks; b++) {
                const bx1 = Math.round(outLeft + b * brickW);
                const bx2 = Math.round(outLeft + (b + 1) * brickW);
                let pts = [];

                if (b === 0) {
                    pts = [
                        `${outLeft},${cy}`,
                        `${outLeft},${outY}`,
                        `${bx2},${outY}`,
                        `${bx2},${inY}`,
                        `${inLeft},${inY}`,
                        `${inLeft},${cy}`
                    ];
                } else if (b === numBricks - 1) {
                    pts = [
                        `${inRight},${cy}`,
                        `${inRight},${inY}`,
                        `${bx1},${inY}`,
                        `${bx1},${outY}`,
                        `${outRight},${outY}`,
                        `${outRight},${cy}`
                    ];
                } else {
                    pts = [
                        `${bx1},${outY}`,
                        `${bx2},${outY}`,
                        `${bx2},${inY}`,
                        `${bx1},${inY}`
                    ];
                }
                regions.push({
                    id: `mcg_top_${t}_${b}`,
                    name: `Nivel Superior ${t} - Bloque ${b + 1}`,
                    points: pts.join(' ')
                });
            }

            // Symmetric bottom tier bricks
            const bInY = 340 + (t - 1) * dy;
            const bOutY = 340 + t * dy;

            for (let b = 0; b < numBricks; b++) {
                const bx1 = Math.round(outLeft + b * brickW);
                const bx2 = Math.round(outLeft + (b + 1) * brickW);
                let pts = [];

                if (b === 0) {
                    pts = [
                        `${outLeft},${cy}`,
                        `${inLeft},${cy}`,
                        `${inLeft},${bInY}`,
                        `${bx2},${bInY}`,
                        `${bx2},${bOutY}`,
                        `${outLeft},${bOutY}`
                    ];
                } else if (b === numBricks - 1) {
                    pts = [
                        `${inRight},${cy}`,
                        `${outRight},${cy}`,
                        `${outRight},${bOutY}`,
                        `${bx1},${bOutY}`,
                        `${bx1},${bInY}`,
                        `${inRight},${bInY}`
                    ];
                } else {
                    pts = [
                        `${bx1},${bInY}`,
                        `${bx2},${bInY}`,
                        `${bx2},${bOutY}`,
                        `${bx1},${bOutY}`
                    ];
                }
                regions.push({
                    id: `mcg_bot_${t}_${b}`,
                    name: `Nivel Inferior ${t} - Bloque ${b + 1}`,
                    points: pts.join(' ')
                });
            }
        }

        // Outermost wrapping corridors
        const topOuterY = 240 - numTiers * dy;
        const botOuterY = 340 + numTiers * dy;
        const leftOuterX = 220 - numTiers * dx;
        const rightOuterX = 280 + numTiers * dx;

        regions.push({
            id: 'mcg_outer_1',
            name: 'Canal Perimetral Norte-Este',
            points: `20,20 480,20 480,560 455,560 455,${topOuterY - 15} ${rightOuterX},${topOuterY - 15} ${rightOuterX},${topOuterY} ${leftOuterX},${topOuterY} 20,${topOuterY}`
        });

        regions.push({
            id: 'mcg_outer_2',
            name: 'Canal Perimetral Sur-Oeste',
            points: `20,${topOuterY} 20,560 455,560 455,${botOuterY} ${rightOuterX},${botOuterY} ${leftOuterX},${botOuterY} ${leftOuterX},${cy} 20,${cy}`
        });

        cachedMcGregorMap = {
            type: 'polygons',
            viewBox: '10 10 480 560',
            regions: regions,
            adjacencies: computeGeometricAdjacencies(regions)
        };
        return cachedMcGregorMap;
    }

    // Generator for Gardner Orthogonal Maze Map (29-Region Rectilinear Grid Puzzle)
    let cachedGardnerMap = null;
    function getOrGenerateGardnerOrthogonalMap() {
        if (cachedGardnerMap) return cachedGardnerMap;
        const regions = [
            // Fila 1 (Superior)
            { id: 'go_1', name: 'Sector A1 (Esquina NO)', points: '20,20 120,20 120,60 20,60' },
            { id: 'go_2', name: 'Sector A2 (Ranura Superior)', points: '120,20 145,20 145,60 120,60' },
            { id: 'go_3', name: 'Sector A3 (Norte Centro-Oeste)', points: '145,20 240,20 240,80 200,80 200,60 145,60' },
            { id: 'go_4', name: 'Sector A4 (Norte Centro)', points: '240,20 300,20 300,100 240,100' },
            { id: 'go_5', name: 'Sector A5 (Norte Centro-Este)', points: '300,20 400,20 400,80 350,80 350,100 300,100' },
            { id: 'go_6', name: 'Sector A6 (Esquina NE)', points: '400,20 480,20 480,140 430,140 430,80 400,80' },

            // Fila 2
            { id: 'go_7', name: 'Sector B1 (Oeste Superior)', points: '20,60 120,60 120,130 20,130' },
            { id: 'go_8', name: 'Sector B2 (Trominó Superior)', points: '120,60 200,60 200,130 160,130 160,95 120,95' },
            { id: 'go_9', name: 'Sector B3 (Cuadrado Central)', points: '160,95 200,95 200,130 160,130' },
            { id: 'go_10', name: 'Sector B4 (Columna Norte)', points: '200,80 240,80 240,190 200,190' },
            { id: 'go_11', name: 'Sector B5 (Caja Alta)', points: '300,60 350,60 350,110 300,110' },
            { id: 'go_12', name: 'Sector B6 (Hueco Este)', points: '430,80 480,80 480,165 430,165' },

            // Fila 3
            { id: 'go_13', name: 'Sector C1 (Borde Oeste)', points: '20,130 75,130 75,200 20,200' },
            { id: 'go_14', name: 'Sector C2 (Bloque Escalonado)', points: '75,130 160,130 160,250 80,250 80,200 75,200' },
            { id: 'go_15', name: 'Sector C3 (Corredor Escalonado)', points: '240,100 300,100 300,190 260,190 260,150 240,150' },
            { id: 'go_16', name: 'Sector C4 (Serpiente Este)', points: '350,80 400,80 400,180 350,180 350,130 300,130 300,100 350,100' },
            { id: 'go_17', name: 'Sector C5 (Franja Este)', points: '430,165 480,165 480,260 430,260' },

            // Fila 4 (Centro)
            { id: 'go_18', name: 'Sector D1 (Oeste Medio)', points: '20,200 80,200 80,310 20,310' },
            { id: 'go_19', name: 'Sector D2 (Codo Centro)', points: '160,130 200,130 200,290 120,290 120,250 160,250' },
            { id: 'go_20', name: 'Sector D3 (Bloque Medio)', points: '240,150 260,150 260,190 300,190 300,260 240,260' },
            { id: 'go_21', name: 'Sector D4 (Codo Gigante)', points: '300,190 430,190 430,260 380,260 380,225 300,225' },

            // Fila 5 (Inferior)
            { id: 'go_22', name: 'Sector E1 (Pilar SO)', points: '20,310 80,310 80,450 20,450' },
            { id: 'go_23', name: 'Sector E2 (Arco Sur)', points: '80,290 160,290 160,450 115,450 115,370 80,370' },
            { id: 'go_24', name: 'Sector E3 (Columna Sur)', points: '115,370 160,370 160,480 80,480 80,450 115,450' },
            { id: 'go_25', name: 'Sector E4 (T Sur)', points: '160,290 240,290 240,370 200,370 200,480 160,480' },
            { id: 'go_26', name: 'Sector E5 (Centro Sur)', points: '240,260 300,260 300,370 240,370' },
            { id: 'go_27', name: 'Sector E6 (Caja Sur)', points: '300,260 380,260 380,370 300,370' },
            { id: 'go_28', name: 'Sector E7 (Puente SE)', points: '240,370 300,370 300,420 430,420 430,480 240,480 240,420' },
            { id: 'go_29', name: 'Sector E8 (Esquina SE)', points: '380,260 480,260 480,480 430,480 430,370 380,370' }
        ];

        cachedGardnerMap = {
            type: 'polygons',
            viewBox: '10 10 480 480',
            regions: regions,
            adjacencies: computeGeometricAdjacencies(regions)
        };
        return cachedGardnerMap;
    }

    // Color palette selection handler
    colorButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            colorButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeColor = btn.getAttribute('data-color');
        });
    });

    const btnNewRandom = document.getElementById('btn-new-random');
    if (btnNewRandom) {
        btnNewRandom.addEventListener('click', () => {
            renderMap('random-map');
        });
    }

    // Render map function
    function renderMap(mapKey) {
        if (mapKey === 'random-map') {
            currentMapData = generateRandomPlanarMap();
            if (btnNewRandom) btnNewRandom.classList.remove('hidden');
        } else if (mapKey === 'mcgregor-110') {
            currentMapData = getOrGenerateMcGregorMap();
            if (btnNewRandom) btnNewRandom.classList.add('hidden');
        } else if (mapKey === 'gardner-orthogonal') {
            currentMapData = getOrGenerateGardnerOrthogonalMap();
            if (btnNewRandom) btnNewRandom.classList.add('hidden');
        } else {
            currentMapData = MAP_PRESETS[mapKey];
            if (btnNewRandom) btnNewRandom.classList.add('hidden');
        }

        regionColors = {};
        successBanner.classList.add('hidden');

        if (currentMapData.type === 'polygons') {
            let svgHtml = `<svg viewBox="${currentMapData.viewBox}" class="map-svg">`;
            currentMapData.regions.forEach(region => {
                svgHtml += `
                    <polygon id="region-${region.id}" 
                             data-id="${region.id}" 
                             points="${region.points}" 
                             class="map-region">
                        <title>${region.name || region.id}</title>
                    </polygon>
                `;
            });
            svgHtml += `</svg>`;
            mapStage.innerHTML = svgHtml;

            // Attach click listeners to polygons
            document.querySelectorAll('.map-region').forEach(el => {
                el.addEventListener('click', () => {
                    const id = el.getAttribute('data-id');
                    applyColorToRegion(id);
                });
            });
        } else if (currentMapData.type === 'graph') {
            let svgHtml = `<svg viewBox="${currentMapData.viewBox}" class="map-svg">`;
            
            // Edges
            currentMapData.edges.forEach(edge => {
                const n1 = currentMapData.nodes.find(n => n.id === edge[0]);
                const n2 = currentMapData.nodes.find(n => n.id === edge[1]);
                svgHtml += `
                    <line id="edge-${edge[0]}-${edge[1]}" 
                          x1="${n1.x}" y1="${n1.y}" 
                          x2="${n2.x}" y2="${n2.y}" 
                          class="graph-edge" />
                `;
            });

            // Nodes
            currentMapData.nodes.forEach(node => {
                svgHtml += `
                    <g class="node-group" data-id="${node.id}">
                        <circle id="region-${node.id}" 
                                data-id="${node.id}" 
                                cx="${node.x}" cy="${node.y}" r="22" 
                                class="graph-node" />
                        <text x="${node.x}" y="${node.y}" class="node-label">${node.label}</text>
                    </g>
                `;
            });

            svgHtml += `</svg>`;
            mapStage.innerHTML = svgHtml;

            // Attach listeners to graph nodes
            document.querySelectorAll('.node-group').forEach(el => {
                el.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = el.getAttribute('data-id');
                    if (id) applyColorToRegion(id);
                });
            });
        }

        updateStatusAndConflicts();
    }

    function applyColorToRegion(regionId) {
        if (activeColor === 'clear') {
            delete regionColors[regionId];
        } else {
            regionColors[regionId] = activeColor;
        }

        const el = document.getElementById(`region-${regionId}`);
        if (el) {
            // Remove color classes
            el.classList.remove('colored-1', 'colored-2', 'colored-3', 'colored-4');
            if (activeColor !== 'clear') {
                const colorIndex = activeColor.replace('color-', '');
                el.classList.add(`colored-${colorIndex}`);
            }
        }

        updateStatusAndConflicts();
    }

    function updateStatusAndConflicts() {
        const allIds = currentMapData.type === 'polygons' 
            ? currentMapData.regions.map(r => r.id) 
            : currentMapData.nodes.map(n => n.id);

        const totalRegions = allIds.length;
        const coloredCount = Object.keys(regionColors).length;
        
        // Count distinct colors used
        const distinctColors = new Set(Object.values(regionColors));
        
        // Conflict checking
        let conflictCount = 0;
        const conflictingRegions = new Set();

        // Clear all previous conflict styles
        document.querySelectorAll('.map-region, .graph-node').forEach(el => el.classList.remove('has-conflict'));
        document.querySelectorAll('.graph-edge').forEach(el => el.classList.remove('edge-conflict'));

        for (const [nodeId, neighbors] of Object.entries(currentMapData.adjacencies)) {
            const colorA = regionColors[nodeId];
            if (!colorA) continue;

            neighbors.forEach(neighborId => {
                const colorB = regionColors[neighborId];
                if (colorB && colorA === colorB && nodeId < neighborId) {
                    conflictCount++;
                    conflictingRegions.add(nodeId);
                    conflictingRegions.add(neighborId);

                    // If graph, highlight edge
                    const edgeEl1 = document.getElementById(`edge-${nodeId}-${neighborId}`);
                    const edgeEl2 = document.getElementById(`edge-${neighborId}-${nodeId}`);
                    if (edgeEl1) edgeEl1.classList.add('edge-conflict');
                    if (edgeEl2) edgeEl2.classList.add('edge-conflict');
                }
            });
        }

        // Apply conflict CSS to nodes/regions
        conflictingRegions.forEach(id => {
            const el = document.getElementById(`region-${id}`);
            if (el) el.classList.add('has-conflict');
        });

        // Update DOM stats
        statColored.textContent = `${coloredCount} / ${totalRegions}`;
        statColorsUsed.textContent = `${distinctColors.size} / 4`;
        statConflicts.textContent = conflictCount;

        if (conflictCount > 0) {
            conflictWrapper.classList.add('alert-conflict');
        } else {
            conflictWrapper.classList.remove('alert-conflict');
        }

        // Victory Condition: All colored, no conflicts, and strictly all 4 colors used!
        if (coloredCount === totalRegions && conflictCount === 0) {
            if (distinctColors.size === 4) {
                successBanner.className = 'success-banner';
                successBanner.innerHTML = `
                    <i class="fa-solid fa-trophy"></i>
                    <div>
                        <strong>¡Desafío Cumplido!</strong>
                        <p>Has coloreado todo el mapa sin conflictos usando exactamente los 4 colores requeridos.</p>
                    </div>
                `;
                successBanner.classList.remove('hidden');
            } else {
                successBanner.className = 'success-banner banner-warning';
                successBanner.innerHTML = `
                    <i class="fa-solid fa-palette"></i>
                    <div>
                        <strong>¡Sin conflictos, pero faltan colores!</strong>
                        <p>Has usado solo ${distinctColors.size} de los 4 colores. Para completar el reto debes usar los 4 colores en el mapa.</p>
                    </div>
                `;
                successBanner.classList.remove('hidden');
            }
        } else {
            successBanner.classList.add('hidden');
        }
    }

    // Auto-solver using greedy / backtracking Welsh-Powell graph coloring
    function solveMapAutomatically() {
        const allIds = currentMapData.type === 'polygons' 
            ? currentMapData.regions.map(r => r.id) 
            : currentMapData.nodes.map(n => n.id);

        // Sort nodes by degree (number of neighbors) descending
        const sortedNodes = [...allIds].sort((a, b) => {
            return currentMapData.adjacencies[b].length - currentMapData.adjacencies[a].length;
        });

        const availableColors = ['color-1', 'color-2', 'color-3', 'color-4'];
        const solution = {};

        function backtrack(index) {
            if (index === sortedNodes.length) return true;
            const nodeId = sortedNodes[index];
            const neighborColors = new Set(
                (currentMapData.adjacencies[nodeId] || [])
                    .map(neighbor => solution[neighbor])
                    .filter(Boolean)
            );
            for (const col of availableColors) {
                if (!neighborColors.has(col)) {
                    solution[nodeId] = col;
                    if (backtrack(index + 1)) return true;
                    delete solution[nodeId];
                }
            }
            return false;
        }

        if (!backtrack(0)) {
            for (const nodeId of sortedNodes) {
                const neighborColors = new Set(
                    (currentMapData.adjacencies[nodeId] || [])
                        .map(neighbor => solution[neighbor])
                        .filter(Boolean)
                );
                solution[nodeId] = availableColors.find(c => !neighborColors.has(c)) || 'color-1';
            }
        }

        // Ensure all 4 colors are used if possible
        const usedColors = new Set(Object.values(solution));
        for (const col of availableColors) {
            if (!usedColors.has(col)) {
                for (const nodeId of sortedNodes) {
                    const neighbors = currentMapData.adjacencies[nodeId] || [];
                    const neighborColors = new Set(neighbors.map(n => solution[n]));
                    if (!neighborColors.has(col)) {
                        solution[nodeId] = col;
                        usedColors.add(col);
                        break;
                    }
                }
            }
        }

        // Animate assigning the solution
        let delay = 0;
        sortedNodes.forEach((nodeId) => {
            setTimeout(() => {
                activeColor = solution[nodeId];
                applyColorToRegion(nodeId);
            }, delay);
            delay += 120;
        });
    }

    // Event Listeners
    mapSelect.addEventListener('change', (e) => {
        renderMap(e.target.value);
    });

    btnResetMap.addEventListener('click', () => {
        renderMap(mapSelect.value);
    });

    btnAutoSolve.addEventListener('click', () => {
        solveMapAutomatically();
    });

    // Initialize first map
    renderMap('south-america');
}

/* ============================================================================
   3. THEORY TABS CONTROLLER
   ============================================================================ */
function initTheoryTabs() {
    const tabBtns = document.querySelectorAll('.tab-headers .tab-btn');
    const tabPanes = document.querySelectorAll('.tab-contents .tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const activePane = document.getElementById(target);
            if (activePane) activePane.classList.add('active');
        });
    });
}

/* ============================================================================
   4. NIM GAME WITH LIVE BINARY XOR ANALYZER
   ============================================================================ */
function initNimGameModule() {
    const heapsContainer = document.getElementById('nim-heaps-container');
    const binaryTable = document.getElementById('nim-binary-table');
    const btnEndTurn = document.getElementById('btn-nim-end-turn');
    const btnReset = document.getElementById('btn-nim-reset');
    const turnBadge = document.getElementById('nim-turn-badge');
    const msgBox = document.getElementById('nim-message');
    const showMathToggle = document.getElementById('nim-show-math');

    // Default Nim configuration: 3 rows with 3, 5, 7 tokens
    let heaps = [3, 5, 7];
    let selectedRow = null;
    let selectedCount = 0;
    let isPlayerTurn = true;
    let gameOver = false;

    function renderGame() {
        heapsContainer.innerHTML = '';
        heaps.forEach((count, rowIndex) => {
            const rowEl = document.createElement('div');
            rowEl.className = `nim-row ${selectedRow === rowIndex ? 'active-row' : ''}`;
            rowEl.innerHTML = `
                <span class="nim-row-label">Fila ${rowIndex + 1} (${count})</span>
                <div class="nim-tokens" id="tokens-row-${rowIndex}"></div>
            `;

            const tokensWrap = rowEl.querySelector('.nim-tokens');
            for (let i = 0; i < count; i++) {
                const token = document.createElement('button');
                token.className = 'nim-token';
                token.innerHTML = '<i class="fa-solid fa-gem"></i>';
                
                // Highlight tokens marked for removal
                if (selectedRow === rowIndex && i >= count - selectedCount) {
                    token.classList.add('selected-to-remove');
                }

                token.addEventListener('click', () => {
                    if (!isPlayerTurn || gameOver) return;
                    handleTokenClick(rowIndex, i, count);
                });

                tokensWrap.appendChild(token);
            }

            heapsContainer.appendChild(rowEl);
        });

        updateBinaryTable();
        updateControls();
    }

    function handleTokenClick(rowIndex, tokenIndex, totalInRow) {
        const countToTake = totalInRow - tokenIndex;
        if (selectedRow === rowIndex && selectedCount === countToTake) {
            // Toggling off / deselect
            selectedRow = null;
            selectedCount = 0;
        } else {
            selectedRow = rowIndex;
            selectedCount = countToTake;
        }
        renderGame();
    }

    function updateControls() {
        btnEndTurn.disabled = !isPlayerTurn || selectedRow === null || selectedCount === 0 || gameOver;
    }

    function calculateXORSum() {
        return heaps.reduce((acc, val) => acc ^ val, 0);
    }

    function updateBinaryTable() {
        if (!binaryTable) return;
        
        if (!showMathToggle.checked) {
            binaryTable.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">Análisis binario oculto. Activa la casilla para visualizarlo.</p>`;
            return;
        }

        const xorSum = calculateXORSum();
        const maxHeap = Math.max(...heaps, 1);
        const bitLength = Math.max(3, maxHeap.toString(2).length);

        let html = '';
        heaps.forEach((count, i) => {
            const binStr = count.toString(2).padStart(bitLength, '0');
            html += `
                <div class="binary-row">
                    <span>Fila ${i + 1} (${count}):</span>
                    <span>${binStr.split('').join(' ')}</span>
                </div>
            `;
        });

        const xorBinStr = xorSum.toString(2).padStart(bitLength, '0');
        html += `
            <div class="binary-row xor-sum-row ${xorSum === 0 ? '' : 'xor-nonzero'}">
                <span>Suma-Nim (⊕):</span>
                <span class="xor-val">${xorBinStr.split('').join(' ')} (Decimal: ${xorSum})</span>
            </div>
        `;

        binaryTable.innerHTML = html;
    }

    function checkGameOver() {
        const remaining = heaps.reduce((a, b) => a + b, 0);
        if (remaining === 0) {
            gameOver = true;
            if (isPlayerTurn) {
                // If it became player turn with 0 items, the AI took the last item!
                turnBadge.innerHTML = '<i class="fa-solid fa-robot"></i> ¡La IA Matemática Gana!';
                turnBadge.className = 'ai-status-badge ai-thinking';
                msgBox.innerHTML = `<strong>¡La IA ha ganado!</strong> La teoría de juegos demostró que la suma-nim te dejó sin opciones.`;
            } else {
                turnBadge.innerHTML = '<i class="fa-solid fa-trophy"></i> ¡Ganaste!';
                turnBadge.className = 'ai-status-badge';
                msgBox.innerHTML = `<strong>¡Increíble Victoria!</strong> Lograste dominar la estrategia binaria.`;
            }
            btnEndTurn.disabled = true;
            return true;
        }
        return false;
    }

    function playerExecuteMove() {
        if (selectedRow === null || selectedCount === 0) return;

        heaps[selectedRow] -= selectedCount;
        selectedRow = null;
        selectedCount = 0;
        isPlayerTurn = false;

        renderGame();

        if (checkGameOver()) return;

        // AI Turn
        turnBadge.innerHTML = '<i class="fa-solid fa-brain"></i> IA Calculando XOR...';
        turnBadge.className = 'ai-status-badge ai-thinking';
        msgBox.textContent = 'La IA está calculando la suma Nim para encontrar el movimiento ganador...';

        setTimeout(aiExecuteMove, 900);
    }

    function aiExecuteMove() {
        if (gameOver) return;

        const xorSum = calculateXORSum();
        let targetHeap = -1;
        let removeCount = 0;

        if (xorSum !== 0) {
            // Winning position for AI: find a heap where heap XOR sum < heap
            for (let i = 0; i < heaps.length; i++) {
                const targetVal = heaps[i] ^ xorSum;
                if (targetVal < heaps[i]) {
                    targetHeap = i;
                    removeCount = heaps[i] - targetVal;
                    break;
                }
            }
        }

        // If in losing position (xorSum == 0), take 1 from largest heap
        if (targetHeap === -1 || removeCount <= 0) {
            const maxIdx = heaps.reduce((maxI, el, i, arr) => el > arr[maxI] ? i : maxI, 0);
            targetHeap = maxIdx;
            removeCount = 1;
        }

        heaps[targetHeap] -= removeCount;

        isPlayerTurn = true;
        turnBadge.innerHTML = '<i class="fa-solid fa-user"></i> Tu Turno';
        turnBadge.className = 'ai-status-badge';
        msgBox.innerHTML = `La IA retiró <strong>${removeCount}</strong> ficha(s) de la <strong>Fila ${targetHeap + 1}</strong>.`;

        renderGame();
        checkGameOver();
    }

    btnEndTurn.addEventListener('click', playerExecuteMove);

    btnReset.addEventListener('click', () => {
        heaps = [3, 5, 7];
        selectedRow = null;
        selectedCount = 0;
        isPlayerTurn = true;
        gameOver = false;
        turnBadge.innerHTML = '<i class="fa-solid fa-user"></i> Tu Turno';
        turnBadge.className = 'ai-status-badge';
        msgBox.textContent = 'Nueva partida iniciada. Haz clic en las fichas que deseas retirar.';
        renderGame();
    });

    showMathToggle.addEventListener('change', updateBinaryTable);

    renderGame();
}

/* ============================================================================
   5. GAME THEORY & PRISONER'S DILEMMA SIMULATOR
   ============================================================================ */
function initGameTheoryModule() {
    const botASelect = document.getElementById('bot-a-select');
    const botBSelect = document.getElementById('bot-b-select');
    const btnRunSim = document.getElementById('btn-run-sim');
    const scoreAEl = document.getElementById('score-a');
    const scoreBEl = document.getElementById('score-b');
    const historyLog = document.getElementById('rounds-history-log');

    // Payoff rules (Points awarded: Defect against Cooperate = +5 / 0, Both Cooperate = +3 / +3, Both Defect = +1 / +1)
    function getPayoff(moveA, moveB) {
        if (moveA === 'C' && moveB === 'C') return [3, 3];
        if (moveA === 'C' && moveB === 'D') return [0, 5];
        if (moveA === 'D' && moveB === 'C') return [5, 0];
        if (moveA === 'D' && moveB === 'D') return [1, 1];
        return [0, 0];
    }

    function getMove(strategy, round, myHistory, oppHistory) {
        switch (strategy) {
            case 'always-cooperate':
                return 'C';
            case 'always-defect':
                return 'D';
            case 'random':
                return Math.random() < 0.5 ? 'C' : 'D';
            case 'tit-for-tat':
                if (round === 0) return 'C';
                return oppHistory[round - 1]; // Copy opponent's last move
            case 'grudger':
                if (oppHistory.includes('D')) return 'D';
                return 'C';
            default:
                return 'C';
        }
    }

    function runTournament() {
        const stratA = botASelect.value;
        const stratB = botBSelect.value;
        const totalRounds = 20;

        let totalA = 0;
        let totalB = 0;
        const historyA = [];
        const historyB = [];
        let logHtml = '';

        for (let r = 0; r < totalRounds; r++) {
            const moveA = getMove(stratA, r, historyA, historyB);
            const moveB = getMove(stratB, r, historyB, historyA);

            historyA.push(moveA);
            historyB.push(moveB);

            const [pA, pB] = getPayoff(moveA, moveB);
            totalA += pA;
            totalB += pB;

            const textA = moveA === 'C' ? '<span style="color:#34d399">Coopera</span>' : '<span style="color:#f87171">Traiciona</span>';
            const textB = moveB === 'C' ? '<span style="color:#34d399">Coopera</span>' : '<span style="color:#f87171">Traiciona</span>';

            logHtml += `
                <div class="round-entry">
                    <span>Ronda ${r + 1}:</span>
                    <span>A (${textA}) vs B (${textB})</span>
                    <span>+${pA} / +${pB} pts</span>
                </div>
            `;
        }

        scoreAEl.textContent = `${totalA} pts`;
        scoreBEl.textContent = `${totalB} pts`;
        historyLog.innerHTML = logHtml;
    }

    if (btnRunSim) {
        btnRunSim.addEventListener('click', runTournament);
    }
}

/* ============================================================================
   6. MONTY HALL PARADOX INTERACTIVE & LARGE-SCALE SIMULATOR
   ============================================================================ */
function initMontyHallModule() {
    const doorCards = document.querySelectorAll('.door-card');
    const instructionText = document.getElementById('monty-instruction-text');
    const btnStay = document.getElementById('btn-monty-stay');
    const btnSwitch = document.getElementById('btn-monty-switch');
    const btnReset = document.getElementById('btn-monty-reset');

    // Fast simulation elements
    const btnSim100 = document.getElementById('btn-sim-100');
    const btnSim1000 = document.getElementById('btn-sim-1000');
    const btnResetStats = document.getElementById('btn-reset-stats');
    const labelSwitchRate = document.getElementById('label-switch-rate');
    const labelStayRate = document.getElementById('label-stay-rate');
    const barSwitch = document.getElementById('bar-switch');
    const barStay = document.getElementById('bar-stay');

    let prizeDoor = 0; // 0, 1, or 2
    let playerChoice = null;
    let revealedGoatDoor = null;
    let gameState = 'CHOOSE_FIRST'; // 'CHOOSE_FIRST', 'DECIDE_SWITCH', 'REVEALED'

    // Stats
    let simStats = {
        switchWins: 0,
        switchTotal: 0,
        stayWins: 0,
        stayTotal: 0
    };

    function startNewGame() {
        prizeDoor = Math.floor(Math.random() * 3);
        playerChoice = null;
        revealedGoatDoor = null;
        gameState = 'CHOOSE_FIRST';

        instructionText.innerHTML = `Paso 1: ¡Elige una de las 3 puertas! Detrás de una hay un <strong>Automóvil Deportivo</strong> y detrás de dos hay <strong>Cabras</strong>.`;

        btnStay.classList.add('hidden');
        btnSwitch.classList.add('hidden');

        doorCards.forEach((card, index) => {
            card.classList.remove('opened', 'selected');
            const tag = document.getElementById(`door-tag-${index}`);
            if (tag) tag.textContent = '';

            const contentEl = document.getElementById(`door-content-${index}`);
            if (index === prizeDoor) {
                contentEl.innerHTML = '<i class="fa-solid fa-car"></i>';
            } else {
                contentEl.innerHTML = '<i class="fa-solid fa-cow"></i>';
            }
        });
    }

    function handleDoorClick(doorIndex) {
        if (gameState === 'DECIDE_SWITCH') {
            if (doorIndex === revealedGoatDoor) {
                return; // Host door is already open
            }
            if (doorIndex === playerChoice) {
                finishGame(false); // Stay
            } else {
                finishGame(true); // Switch
            }
            return;
        }

        if (gameState !== 'CHOOSE_FIRST') return;

        playerChoice = doorIndex;
        gameState = 'DECIDE_SWITCH';

        doorCards[playerChoice].classList.add('selected');
        document.getElementById(`door-tag-${playerChoice}`).textContent = 'Tu Elección';

        // Host opens a goat door that is neither player's choice nor the car
        const availableGoatDoors = [0, 1, 2].filter(d => d !== playerChoice && d !== prizeDoor);
        revealedGoatDoor = availableGoatDoors[Math.floor(Math.random() * availableGoatDoors.length)];

        // Open host door
        doorCards[revealedGoatDoor].classList.add('opened');
        document.getElementById(`door-tag-${revealedGoatDoor}`).textContent = 'Cabra (Monty)';

        // Identify other unopened door
        const otherDoor = [0, 1, 2].find(d => d !== playerChoice && d !== revealedGoatDoor);

        instructionText.innerHTML = `Monty Hall ha abierto la <strong>Puerta ${revealedGoatDoor + 1}</strong> y revela una cabra. Puedes <strong>hacer clic en la puerta que desees</strong> o usar los botones: ¿quedarte con la <strong>Puerta ${playerChoice + 1}</strong> o cambiar a la <strong>Puerta ${otherDoor + 1}</strong>?`;

        btnStay.classList.remove('hidden');
        btnSwitch.classList.remove('hidden');
    }

    function finishGame(didSwitch) {
        if (gameState !== 'DECIDE_SWITCH') return;

        const otherDoor = [0, 1, 2].find(d => d !== playerChoice && d !== revealedGoatDoor);
        const finalDoor = didSwitch ? otherDoor : playerChoice;

        gameState = 'REVEALED';

        // Reveal all doors
        doorCards.forEach(card => card.classList.add('opened'));

        const won = (finalDoor === prizeDoor);

        if (didSwitch) {
            simStats.switchTotal++;
            if (won) simStats.switchWins++;
        } else {
            simStats.stayTotal++;
            if (won) simStats.stayWins++;
        }

        updateStatsUI();

        if (won) {
            instructionText.innerHTML = `🎉 <strong>¡GANASTE EL AUTOMÓVIL!</strong> (${didSwitch ? 'Cambiaste' : 'Te mantuviste'} y acertaste).`;
        } else {
            instructionText.innerHTML = `🐐 <strong>Te tocó una cabra.</strong> El auto estaba en la Puerta ${prizeDoor + 1}.`;
        }

        btnStay.classList.add('hidden');
        btnSwitch.classList.add('hidden');

        unlockMontyMystery();
    }

    const montyLocked = document.getElementById('monty-mystery-locked');
    const montyUnlocked = document.getElementById('monty-mystery-unlocked');

    function unlockMontyMystery() {
        if (montyLocked && montyUnlocked) {
            montyLocked.style.display = 'none';
            montyUnlocked.style.display = 'block';
        }
    }

    function runBatchSimulation(count) {
        unlockMontyMystery();
        for (let i = 0; i < count; i++) {
            const car = Math.floor(Math.random() * 3);
            const pick = Math.floor(Math.random() * 3);
            
            // Host opens goat door
            const goats = [0, 1, 2].filter(d => d !== pick && d !== car);
            const hostOpen = goats[Math.floor(Math.random() * goats.length)];
            const switchPick = [0, 1, 2].find(d => d !== pick && d !== hostOpen);

            // Strategy 1: Switch
            simStats.switchTotal++;
            if (switchPick === car) simStats.switchWins++;

            // Strategy 2: Stay
            simStats.stayTotal++;
            if (pick === car) simStats.stayWins++;
        }
        updateStatsUI();
    }

    function updateStatsUI() {
        const switchPct = simStats.switchTotal > 0 
            ? ((simStats.switchWins / simStats.switchTotal) * 100).toFixed(1) 
            : 0;
        const stayPct = simStats.stayTotal > 0 
            ? ((simStats.stayWins / simStats.stayTotal) * 100).toFixed(1) 
            : 0;

        labelSwitchRate.textContent = `${switchPct}% (${simStats.switchWins} / ${simStats.switchTotal})`;
        labelStayRate.textContent = `${stayPct}% (${simStats.stayWins} / ${simStats.stayTotal})`;

        barSwitch.style.width = `${switchPct}%`;
        barStay.style.width = `${stayPct}%`;
    }

    // Door listeners
    doorCards.forEach((card, i) => {
        card.addEventListener('click', () => handleDoorClick(i));
    });

    btnStay.addEventListener('click', () => finishGame(false));
    btnSwitch.addEventListener('click', () => finishGame(true));
    btnReset.addEventListener('click', startNewGame);

    // Fast sim listeners
    btnSim100.addEventListener('click', () => runBatchSimulation(100));
    btnSim1000.addEventListener('click', () => runBatchSimulation(1000));
    btnResetStats.addEventListener('click', () => {
        simStats = { switchWins: 0, switchTotal: 0, stayWins: 0, stayTotal: 0 };
        updateStatsUI();
        if (montyLocked && montyUnlocked) {
            montyLocked.style.display = 'flex';
            montyUnlocked.style.display = 'none';
        }
    });

    startNewGame();
}

/* ============================================================================
   7. KÖNIGSBERG 7 BRIDGES MODULE (STEP-BY-STEP SOLVER)
   ============================================================================ */
function initBridgesModule() {
    const stage = document.getElementById('bridges-stage');
    const feedback = document.getElementById('bridges-feedback');
    const statCrossed = document.getElementById('stat-bridges-crossed');
    const statIsland = document.getElementById('stat-current-island');
    const stepIndicator = document.getElementById('bridge-step-indicator');
    const modeSelect = document.getElementById('bridge-map-mode');
    const btnAutoPlay = document.getElementById('btn-bridges-autoplay');
    const btnStep = document.getElementById('btn-bridges-step');
    const btnReset = document.getElementById('btn-bridges-reset');

    if (!stage) return;

    // Bridges Definitions
    const BASE_BRIDGES = [
        { id: 'b1', n1: 'A', n2: 'B', name: 'Puente 1 (Norte ↔ Isla)', path: 'M 190,70 Q 210,130 230,170', lx: 205, ly: 120 },
        { id: 'b2', n1: 'A', n2: 'B', name: 'Puente 2 (Norte ↔ Isla)', path: 'M 220,70 Q 250,130 270,170', lx: 255, ly: 120 },
        { id: 'b3', n1: 'A', n2: 'D', name: 'Puente 3 (Norte ↔ Este)', path: 'M 300,70 Q 370,80 400,160', lx: 360, ly: 110 },
        { id: 'b4', n1: 'B', n2: 'C', name: 'Puente 4 (Isla ↔ Sur)', path: 'M 230,230 Q 210,270 190,310', lx: 205, ly: 270 },
        { id: 'b5', n1: 'B', n2: 'C', name: 'Puente 5 (Isla ↔ Sur)', path: 'M 270,230 Q 250,270 220,310', lx: 255, ly: 270 },
        { id: 'b6', n1: 'B', n2: 'D', name: 'Puente 6 (Isla ↔ Este)', path: 'M 310,200 Q 360,200 400,200', lx: 360, ly: 190 },
        { id: 'b7', n1: 'C', n2: 'D', name: 'Puente 7 (Sur ↔ Este)', path: 'M 300,310 Q 370,300 400,240', lx: 360, ly: 280 }
    ];

    const EXTRA_EULER_BRIDGE = {
        id: 'b8', n1: 'A', n2: 'C', name: 'Puente 8 Extra (Norte ↔ Sur)', path: 'M 110,95 L 110,285', lx: 85, ly: 190
    };

    // Predefined step-by-step educational sequences
    const SEQUENCES = {
        'original-7': {
            start: 'A',
            steps: [
                { bridgeId: 'b1', to: 'B', desc: 'Paso 1: Salimos de la Ribera Norte (A) y cruzamos el Puente 1 hacia la Isla (B).' },
                { bridgeId: 'b4', to: 'C', desc: 'Paso 2: Desde la Isla (B), cruzamos el Puente 4 hacia la Ribera Sur (C).' },
                { bridgeId: 'b7', to: 'D', desc: 'Paso 3: Desde el Sur (C), cruzamos el Puente 7 hacia la Ribera Este (D).' },
                { bridgeId: 'b3', to: 'A', desc: 'Paso 4: Desde el Este (D), cruzamos el Puente 3 regresando al Norte (A).' },
                { bridgeId: 'b2', to: 'B', desc: 'Paso 5: Del Norte (A), cruzamos el segundo puente (Puente 2) a la Isla (B).' },
                { bridgeId: 'b5', to: 'C', desc: 'Paso 6: De la Isla (B), cruzamos el Puente 5 hacia la Ribera Sur (C).' }
            ],
            stuckMsg: `🚨 <strong>¡Paso 6: Atrapados! (Falta 1 puente)</strong><br>
Hemos cruzado 6 puentes y no queda ningún camino libre para salir de la Ribera Sur (C). El único puente que falta (Puente 6, marcado en rojo) quedó inalcanzable. ¡Euler demostró que en este mapa es <strong>físicamente imposible</strong> cruzar los 7 puentes sin repetir!<br>
<button id="btn-try-euler8-inline" class="btn btn-sm btn-accent" style="margin-top: 10px; cursor: pointer; box-shadow: 0 0 14px rgba(236,72,153,0.5);"><i class="fa-solid fa-wand-magic-sparkles"></i> 🌉 ¡Ver Solución Completa con 8 Puentes!</button>`
        },
        'euler-8': {
            start: 'B',
            steps: [
                { bridgeId: 'b1', to: 'A', desc: 'Paso 1: Salimos de la Isla (B) y cruzamos el Puente 1 hacia el Norte (A).' },
                { bridgeId: 'b8', to: 'C', desc: 'Paso 2: ¡Cruzamos el 8º Puente Extra de Euler directamente del Norte (A) al Sur (C)!' },
                { bridgeId: 'b4', to: 'B', desc: 'Paso 3: Del Sur (C) cruzamos el Puente 4 hacia la Isla (B).' },
                { bridgeId: 'b2', to: 'A', desc: 'Paso 4: De la Isla (B) cruzamos el Puente 2 hacia el Norte (A).' },
                { bridgeId: 'b3', to: 'D', desc: 'Paso 5: Del Norte (A) cruzamos el Puente 3 hacia el Este (D).' },
                { bridgeId: 'b7', to: 'C', desc: 'Paso 6: Del Este (D) cruzamos el Puente 7 hacia el Sur (C).' },
                { bridgeId: 'b5', to: 'B', desc: 'Paso 7: Del Sur (C) cruzamos el Puente 5 hacia la Isla (B).' },
                { bridgeId: 'b6', to: 'D', desc: 'Paso 8: ¡De la Isla (B) cruzamos el Puente 6 al Este (D) y completamos todos los puentes!' }
            ],
            victoryMsg: '🎉 <strong>¡Misión Cumplida!</strong> Hemos recorrido los 8 puentes completos sin repetir ninguno. Al añadir el 8º puente, los grados de las islas se volvieron pares y logramos el Camino Euleriano perfecto.'
        }
    };

    let currentMode = 'original-7';
    let currentLocation = null;
    let crossedBridges = new Map(); // bridgeId -> stepNumber (1, 2, 3...)
    let currentStepIndex = 0;
    let autoPlayInterval = null;

    function getActiveBridges() {
        return currentMode === 'euler-8' 
            ? [...BASE_BRIDGES, EXTRA_EULER_BRIDGE] 
            : BASE_BRIDGES;
    }

    function renderBridges() {
        const bridgesList = getActiveBridges();
        const totalBridges = bridgesList.length;

        let svg = `
            <svg viewBox="0 0 500 360" class="bridge-svg">
                <!-- River Pregolia -->
                <path d="M 50,150 L 150,150 L 150,120 L 360,120 L 480,80 L 480,280 L 360,240 L 150,240 L 150,210 L 50,210 Z" class="river-path" />
                
                <!-- Landmasses -->
                <!-- Island B (Center) -->
                <ellipse cx="260" cy="200" rx="60" ry="32" class="landmass ${currentLocation === 'B' ? 'current-pos' : ''}" data-land="B" />
                <text x="260" y="205" class="node-label">Isla B</text>

                <!-- North Landmass A -->
                <path d="M 80,40 L 420,40 L 400,95 L 80,95 Z" class="landmass ${currentLocation === 'A' ? 'current-pos' : ''}" data-land="A" />
                <text x="250" y="65" class="node-label">Ribera Norte (A)</text>

                <!-- South Landmass C -->
                <path d="M 80,285 L 400,285 L 420,340 L 80,340 Z" class="landmass ${currentLocation === 'C' ? 'current-pos' : ''}" data-land="C" />
                <text x="250" y="315" class="node-label">Ribera Sur (C)</text>

                <!-- East Landmass D -->
                <path d="M 380,140 Q 480,180 480,240 L 410,260 Z" class="landmass ${currentLocation === 'D' ? 'current-pos' : ''}" data-land="D" />
                <text x="440" y="205" class="node-label">Este (D)</text>

                <!-- Bridges Paths -->
        `;

        const isStuckAtSix = (currentMode === 'original-7' && crossedBridges.size === 6);

        bridgesList.forEach(bridge => {
            const stepNum = crossedBridges.get(bridge.id);
            const isCrossed = stepNum !== undefined;
            const isUnreachable = isStuckAtSix && !isCrossed;

            svg += `
                <g class="bridge-group" data-id="${bridge.id}">
                    <path id="bridge-${bridge.id}" 
                          d="${bridge.path}" 
                          class="bridge-path ${isCrossed ? 'crossed' : ''} ${isUnreachable ? 'unreachable' : ''}" 
                          data-id="${bridge.id}" 
                          title="${bridge.name} ${isUnreachable ? '(¡Imposible de alcanzar sin repetir!)' : ''}" />
                    ${isCrossed ? `
                        <circle cx="${bridge.lx}" cy="${bridge.ly}" r="11" fill="#10b981" stroke="#ffffff" stroke-width="2" />
                        <text x="${bridge.lx}" y="${bridge.ly}" class="bridge-step-label">${stepNum}</text>
                    ` : (isUnreachable ? `
                        <circle cx="${bridge.lx}" cy="${bridge.ly}" r="13" fill="#ef4444" stroke="#ffffff" stroke-width="2" />
                        <text x="${bridge.lx}" y="${bridge.ly}" class="bridge-step-label" style="font-size: 10px;">❌ Falta</text>
                    ` : '')}
                </g>
            `;
        });

        svg += `</svg>`;
        stage.innerHTML = svg;

        // Attach click listeners for manual play
        document.querySelectorAll('.landmass').forEach(el => {
            el.addEventListener('click', () => {
                stopAutoPlay();
                const land = el.getAttribute('data-land');
                if (currentLocation === null) {
                    currentLocation = land;
                    feedback.textContent = `Punto de partida fijado en: ${land}. Ahora haz clic en un puente conectado para cruzarlo.`;
                    renderBridges();
                }
            });
        });

        document.querySelectorAll('.bridge-group').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                stopAutoPlay();
                const bId = el.getAttribute('data-id');
                if (bId) crossBridgeManual(bId);
            });
        });

        statCrossed.textContent = `${crossedBridges.size} / ${totalBridges}`;
        statIsland.textContent = `Posición: ${currentLocation ? 'Tierra ' + currentLocation : 'Ninguna'}`;
        stepIndicator.textContent = `Paso ${currentStepIndex} de ${SEQUENCES[currentMode].steps.length}`;
    }

    function crossBridgeManual(bridgeId) {
        const bridgesList = getActiveBridges();
        const totalBridges = bridgesList.length;

        if (crossedBridges.has(bridgeId)) {
            feedback.textContent = '¡Este puente ya fue cruzado! Las reglas prohíben cruzar dos veces el mismo puente.';
            return;
        }

        const bridge = bridgesList.find(b => b.id === bridgeId);
        if (!bridge) return;

        if (currentLocation === null) {
            // Auto start at n1 of the chosen bridge
            currentLocation = bridge.n1;
        }

        if (bridge.n1 !== currentLocation && bridge.n2 !== currentLocation) {
            feedback.textContent = `No puedes cruzar este puente porque no estás conectado a él. (Estás en la tierra ${currentLocation}).`;
            return;
        }

        // Cross bridge
        currentStepIndex++;
        crossedBridges.set(bridgeId, currentStepIndex);
        currentLocation = (bridge.n1 === currentLocation) ? bridge.n2 : bridge.n1;

        if (crossedBridges.size === totalBridges) {
            feedback.innerHTML = '🎉 <strong>¡Increíble!</strong> Has logrado recorrer todos los puentes sin repetir ninguno.';
            unlockBridgesMystery();
        } else {
            // Check if stuck
            const availableBridges = bridgesList.filter(b => 
                !crossedBridges.has(b.id) && (b.n1 === currentLocation || b.n2 === currentLocation)
            );

            if (availableBridges.length === 0) {
                feedback.innerHTML = `⚠️ <strong>¡Te has quedado atrapado en la tierra ${currentLocation}!</strong> No quedan puentes libres sin repetir. ¡Euler demostró que con 7 puentes es matemáticamente imposible!<br>
                <button id="btn-try-euler8-inline" class="btn btn-sm btn-accent" style="margin-top: 10px; cursor: pointer; box-shadow: 0 0 14px rgba(236,72,153,0.5);"><i class="fa-solid fa-wand-magic-sparkles"></i> 🌉 ¡Ver Solución con 8 Puentes!</button>`;
                
                const btnInline = document.getElementById('btn-try-euler8-inline');
                if (btnInline) {
                    btnInline.addEventListener('click', () => {
                        modeSelect.value = 'euler-8';
                        currentMode = 'euler-8';
                        resetBridges();
                        setTimeout(() => toggleAutoPlay(), 300);
                    });
                }
                unlockBridgesMystery();
            } else {
                feedback.textContent = `Has cruzado hacia la tierra ${currentLocation}. Te quedan ${totalBridges - crossedBridges.size} puentes.`;
            }
        }

        renderBridges();
    }

    const bridgesLocked = document.getElementById('bridges-mystery-locked');
    const bridgesUnlocked = document.getElementById('bridges-mystery-unlocked');
    const degA = document.getElementById('deg-val-A');
    const degB = document.getElementById('deg-val-B');
    const degC = document.getElementById('deg-val-C');
    const degD = document.getElementById('deg-val-D');
    const ruleTitle = document.getElementById('bridges-rule-title');
    const ruleDesc = document.getElementById('bridges-rule-desc');

    function unlockBridgesMystery() {
        if (bridgesLocked && bridgesUnlocked) {
            bridgesLocked.style.display = 'none';
            bridgesUnlocked.style.display = 'block';

            if (currentMode === 'euler-8') {
                if (degA) degA.innerHTML = '<span class="even-good">4 Puentes (Par ✅)</span>';
                if (degB) degB.innerHTML = '<span class="even-good">6 Puentes (Par ✅)</span>';
                if (degC) degC.innerHTML = '<span class="even-good">4 Puentes (Par ✅)</span>';
                if (degD) degD.innerHTML = '<span class="even-good">4 Puentes (Par ✅)</span>';
                if (ruleTitle) ruleTitle.textContent = '🌟 ¡La Solución Mágica del 8º Puente!';
                if (ruleDesc) ruleDesc.innerHTML = 'Al añadir el 8º puente entre el Norte y el Sur, todas las islas pasaron a tener un número <strong>PAR de puentes (4 y 6)</strong>. Ahora siempre puedes entrar y salir sin quedarte atrapado, ¡logrando el recorrido perfecto!';
            } else {
                if (degA) degA.innerHTML = '3 Puentes (Impar ❌)';
                if (degB) degB.innerHTML = '5 Puentes (Impar ❌)';
                if (degC) degC.innerHTML = '3 Puentes (Impar ❌)';
                if (degD) degD.innerHTML = '3 Puentes (Impar ❌)';
                if (ruleTitle) ruleTitle.textContent = '🚪 La Regla de las Puertas Gemelas:';
                if (ruleDesc) ruleDesc.innerHTML = 'Para entrar y salir de una isla necesitas puentes que vayan en <strong>parejas (números pares: 2, 4, 6...)</strong>. Como todas las islas de Königsberg tienen un número impar (3 y 5), ¡siempre te quedas atrapado!';
            }
        }
    }

    function advanceAutoStep() {
        const seq = SEQUENCES[currentMode];
        const bridgesList = getActiveBridges();

        if (currentStepIndex === 0) {
            currentLocation = seq.start;
        }

        if (currentStepIndex < seq.steps.length) {
            const stepData = seq.steps[currentStepIndex];
            currentStepIndex++;
            crossedBridges.set(stepData.bridgeId, currentStepIndex);
            currentLocation = stepData.to;

            feedback.innerHTML = `<i class="fa-solid fa-person-walking"></i> ${stepData.desc}`;
            renderBridges();

            // Highlight newly crossed bridge
            const newlyCrossed = document.getElementById(`bridge-${stepData.bridgeId}`);
            if (newlyCrossed) {
                newlyCrossed.classList.add('traversing');
                setTimeout(() => newlyCrossed.classList.remove('traversing'), 700);
            }

            // Check if final step
            if (currentStepIndex === seq.steps.length) {
                unlockBridgesMystery();
                if (currentMode === 'original-7') {
                    setTimeout(() => {
                        feedback.innerHTML = seq.stuckMsg;
                        const btnInline = document.getElementById('btn-try-euler8-inline');
                        if (btnInline) {
                            btnInline.addEventListener('click', () => {
                                modeSelect.value = 'euler-8';
                                currentMode = 'euler-8';
                                resetBridges();
                                setTimeout(() => toggleAutoPlay(), 300);
                            });
                        }
                        stopAutoPlay();
                    }, 800);
                } else {
                    setTimeout(() => {
                        feedback.innerHTML = seq.victoryMsg;
                        stopAutoPlay();
                    }, 800);
                }
            }
            return true;
        } else {
            stopAutoPlay();
            return false;
        }
    }

    function toggleAutoPlay() {
        if (autoPlayInterval) {
            stopAutoPlay();
        } else {
            btnAutoPlay.innerHTML = '<i class="fa-solid fa-pause"></i> Pausar';
            btnAutoPlay.classList.replace('btn-accent', 'btn-secondary');
            
            // If already finished, reset first
            if (currentStepIndex >= SEQUENCES[currentMode].steps.length) {
                resetBridges();
            }

            advanceAutoStep();
            autoPlayInterval = setInterval(() => {
                const hasNext = advanceAutoStep();
                if (!hasNext) stopAutoPlay();
            }, 1400);
        }
    }

    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
            btnAutoPlay.innerHTML = '<i class="fa-solid fa-play"></i> Auto-Paso a Paso';
            btnAutoPlay.classList.replace('btn-secondary', 'btn-accent');
        }
    }

    function resetBridges() {
        stopAutoPlay();
        currentLocation = null;
        crossedBridges.clear();
        currentStepIndex = 0;
        feedback.textContent = 'Haz clic en "Auto-Paso a Paso" o en "Siguiente" para ver cómo se resuelven los puentes paso por paso.';
        if (bridgesLocked && bridgesUnlocked) {
            bridgesLocked.style.display = 'flex';
            bridgesUnlocked.style.display = 'none';
        }
        renderBridges();
    }

    // Event listeners
    modeSelect.addEventListener('change', (e) => {
        currentMode = e.target.value;
        resetBridges();
    });

    btnStep.addEventListener('click', () => {
        stopAutoPlay();
        advanceAutoStep();
    });

    btnAutoPlay.addEventListener('click', toggleAutoPlay);
    btnReset.addEventListener('click', resetBridges);

    renderBridges();
}

/* ============================================================================
   8. INTERACTIVE MATH QUIZ
   ============================================================================ */
function initQuizModule() {
    const quizContainer = document.getElementById('quiz-container');
    const btnPrev = document.getElementById('btn-quiz-prev');
    const btnNext = document.getElementById('btn-quiz-next');
    const progressText = document.getElementById('quiz-progress-text');
    const progressFill = document.getElementById('quiz-progress-fill');
    const resultsBox = document.getElementById('quiz-results');
    const scoreTitle = document.getElementById('quiz-score-title');
    const scoreDesc = document.getElementById('quiz-score-desc');
    const btnRestart = document.getElementById('btn-restart-quiz');

    const QUESTIONS = [
        {
            title: "¿Cuántos colores como máximo necesitas para pintar CUALQUIER mapa sin que dos países vecinos tengan el mismo color?",
            options: [
                "3 colores",
                "4 colores",
                "7 colores",
                "10 colores"
            ],
            correct: 1,
            explanation: "¡El Teorema de los Cuatro Colores demuestra que 4 colores son suficientes para cualquier mapa plano del mundo!"
        },
        {
            title: "¿Por qué fue tan famoso el Teorema de los 4 Colores en 1976?",
            options: [
                "Porque los griegos antiguos ya lo habían inventado en piedra.",
                "Porque fue el primer gran teorema demostrado con la ayuda de una supercomputadora.",
                "Porque solo funcionaba en mapas de la Luna.",
                "Porque se usaron lápices mágicos de colores."
            ],
            correct: 1,
            explanation: "Fue la primera vez en la historia que los matemáticos usaron una supercomputadora para revisar miles de mapas posibles."
        },
        {
            title: "En el Juego del Nim de las fichas, ¿cuál es el secreto para ganar?",
            options: [
                "Tirar un dado con mucha suerte.",
                "Hacer trampa cuando el rival no mira.",
                "Equilibrar las filas en 'parejas mágicas' (Suma-Nim en cero).",
                "Tomar siempre todas las fichas en el primer turno."
            ],
            correct: 2,
            explanation: "Al dejar las filas equilibradas (suma binaria en cero), tu oponente queda acorralado y tú siempre te quedarás con la última gema."
        },
        {
            title: "En el Dilema del Prisionero, ¿qué nos enseña la matemática sobre la vida real?",
            options: [
                "Que ser egoísta y hacer trampa siempre es la mejor idea.",
                "Que la confianza, la amistad y el trabajo en equipo dan mejores resultados para todos.",
                "Que nunca debemos jugar con amigos.",
                "Que los robots siempre se enojan."
            ],
            correct: 1,
            explanation: "El dilema demuestra que cuando las personas cooperan y se ayudan mutuamente, a todos les va mucho mejor."
        },
        {
            title: "En el concurso de Monty Hall con 3 puertas, ¿por qué siempre conviene CAMBIAR de puerta?",
            options: [
                "Porque da igual, siempre es 50/50.",
                "Porque al cambiarte aprovechas que el presentador ya quitó una cabra y ganas 2 de cada 3 veces (66%).",
                "Porque las cabras comen coches.",
                "Porque la primera puerta siempre tiene mala suerte."
            ],
            correct: 1,
            explanation: "Al inicio casi seguro elegiste una cabra (2 de cada 3 veces). Cuando el presentador te quita la otra cabra, ¡al cambiarte te llevas el coche directo!"
        },
        {
            title: "🏛️ En el misterio de Los 7 Puentes de Königsberg, ¿por qué Leonhard Euler demostró que era IMPOSIBLE cruzarlos todos pasando una sola vez?",
            options: [
                "Porque el río estaba demasiado congelado.",
                "Porque todas las islas tenían un número IMPAR de puentes (3 y 5) y te quedas atrapado sin salida.",
                "Porque los puentes estaban rotos y cerrados.",
                "Porque faltaba comprar un mapa en la tienda del pueblo."
            ],
            correct: 1,
            explanation: "¡Para entrar y salir de una isla necesitas puentes en parejas (números pares: 2, 4, 6...)! Como todas las islas de Königsberg tenían 3 o 5 puentes (impares), ¡era matemáticamente imposible no quedar atrapado!"
        },
        {
            title: "🌉 ¿Qué gran rama de la matemática moderna inventó Euler gracias a este acertijo?",
            options: [
                "La Teoría de Grafos y Redes (la base del GPS de Google Maps e Internet).",
                "La creación de los barcos de vapor.",
                "El invento de las calculadoras a pilas.",
                "Las reglas oficiales del fútbol."
            ],
            correct: 0,
            explanation: "¡Euler inventó la Teoría de Grafos al representar las orillas como puntos y los puentes como líneas! Gracias a esto hoy funcionan las rutas de Google Maps y las redes sociales."
        }
    ];

    let currentIndex = 0;
    const userAnswers = new Array(QUESTIONS.length).fill(null);

    function renderQuestion() {
        const q = QUESTIONS[currentIndex];
        progressText.textContent = `Pregunta ${currentIndex + 1} de ${QUESTIONS.length}`;
        progressFill.style.width = `${((currentIndex + 1) / QUESTIONS.length) * 100}%`;

        btnPrev.disabled = (currentIndex === 0);
        btnNext.innerHTML = (currentIndex === QUESTIONS.length - 1) 
            ? 'Finalizar Quiz <i class="fa-solid fa-flag-checkered"></i>' 
            : 'Siguiente <i class="fa-solid fa-arrow-right"></i>';

        const letters = ['A', 'B', 'C', 'D'];
        let optionsHtml = '';

        q.options.forEach((opt, idx) => {
            let stateClass = '';
            if (userAnswers[currentIndex] !== null) {
                if (idx === q.correct) stateClass = 'correct';
                else if (userAnswers[currentIndex] === idx) stateClass = 'wrong';
            }

            optionsHtml += `
                <button class="quiz-opt-btn ${stateClass}" data-index="${idx}">
                    <span class="opt-letter">${letters[idx]}</span>
                    <span>${opt}</span>
                </button>
            `;
        });

        let explanationHtml = '';
        if (userAnswers[currentIndex] !== null) {
            explanationHtml = `
                <div class="quiz-explanation">
                    <strong>Explicación:</strong> ${q.explanation}
                </div>
            `;
        }

        quizContainer.innerHTML = `
            <div class="quiz-question-box">
                <h3 class="quiz-q-title">${currentIndex + 1}. ${q.title}</h3>
                <div class="quiz-options">
                    ${optionsHtml}
                </div>
                ${explanationHtml}
            </div>
        `;

        // Attach option click listeners
        document.querySelectorAll('.quiz-opt-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (userAnswers[currentIndex] !== null) return; // already answered
                const selected = parseInt(btn.getAttribute('data-index'));
                userAnswers[currentIndex] = selected;
                renderQuestion();
            });
        });
    }

    function showResults() {
        quizContainer.parentElement.querySelector('.quiz-footer').classList.add('hidden');
        quizContainer.classList.add('hidden');
        resultsBox.classList.remove('hidden');

        const score = userAnswers.reduce((acc, ans, idx) => {
            return acc + (ans === QUESTIONS[idx].correct ? 1 : 0);
        }, 0);

        if (score === QUESTIONS.length) {
            scoreTitle.textContent = '¡Puntaje Perfecto! 🏆';
            scoreDesc.textContent = `Has acertado las ${score} de ${QUESTIONS.length} preguntas. ¡Eres un maestro de los grafos, la teoría de juegos y las matemáticas!`;
        } else if (score >= Math.ceil(QUESTIONS.length * 0.6)) {
            scoreTitle.textContent = '¡Muy buen trabajo! 🌟';
            scoreDesc.textContent = `Has acertado ${score} de ${QUESTIONS.length} preguntas. Comprendes muy bien los conceptos clave.`;
        } else {
            scoreTitle.textContent = '¡Sigue aprendiendo! 💡';
            scoreDesc.textContent = `Has acertado ${score} de ${QUESTIONS.length} preguntas. Puedes repasar los módulos interactivos y volver a intentarlo.`;
        }
    }

    btnPrev.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            renderQuestion();
        }
    });

    btnNext.addEventListener('click', () => {
        if (currentIndex < QUESTIONS.length - 1) {
            currentIndex++;
            renderQuestion();
        } else {
            showResults();
        }
    });

    btnRestart.addEventListener('click', () => {
        userAnswers.fill(null);
        currentIndex = 0;
        quizContainer.parentElement.querySelector('.quiz-footer').classList.remove('hidden');
        quizContainer.classList.remove('hidden');
        resultsBox.classList.add('hidden');
        renderQuestion();
    });

    renderQuestion();
}
