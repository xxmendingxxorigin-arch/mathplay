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
            viewBox: '0 0 500 560',
            regions: [
                { id: 'col', name: 'Colombia', points: '140,50 200,60 210,120 160,150 110,100' },
                { id: 'ven', name: 'Venezuela', points: '200,60 300,50 310,110 240,120 210,120' },
                { id: 'guy', name: 'Guyanas', points: '300,50 380,60 370,110 310,110' },
                { id: 'ecu', name: 'Ecuador', points: '110,100 160,150 120,180 80,140' },
                { id: 'per', name: 'Perú', points: '120,180 160,150 210,180 220,280 160,300 130,220' },
                { id: 'bra', name: 'Brasil', points: '210,120 240,120 310,110 370,110 440,170 450,270 380,340 300,320 260,250 220,280 210,180' },
                { id: 'bol', name: 'Bolivia', points: '220,280 260,250 300,320 280,370 200,360 200,320' },
                { id: 'par', name: 'Paraguay', points: '280,370 340,360 330,420 270,420 280,370' },
                { id: 'chi', name: 'Chile', points: '160,300 200,320 200,480 170,540 150,480' },
                { id: 'arg', name: 'Argentina', points: '200,360 280,370 270,420 310,460 260,540 200,480' },
                { id: 'uru', name: 'Uruguay', points: '330,420 380,410 370,460 310,460' }
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
                'uru': ['arg', 'bra']
            }
        },

        'western-europe': {
            type: 'polygons',
            viewBox: '0 0 520 440',
            regions: [
                { id: 'por', name: 'Portugal', points: '40,270 80,260 80,340 40,350' },
                { id: 'esp', name: 'España', points: '80,260 180,250 180,350 80,340' },
                { id: 'fra', name: 'Francia', points: '180,250 190,150 270,140 280,220 250,260 180,250' },
                { id: 'uk', name: 'Reino Unido', points: '140,70 220,60 200,130 130,120' },
                { id: 'bel', name: 'Bélgica', points: '250,140 280,130 280,170 250,170' },
                { id: 'ned', name: 'Países Bajos', points: '270,90 310,80 310,130 270,130' },
                { id: 'ger', name: 'Alemania', points: '280,130 370,110 380,210 300,220 280,170' },
                { id: 'sui', name: 'Suiza', points: '250,220 300,220 300,260 250,260' },
                { id: 'ita', name: 'Italia', points: '250,260 300,260 360,350 330,370 270,300' },
                { id: 'aut', name: 'Austria', points: '300,220 380,210 390,260 300,260' },
                { id: 'pol', name: 'Polonia', points: '370,110 460,100 470,210 380,210' }
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
            viewBox: '0 0 520 460',
            regions: [
                { id: 'can', name: 'Canadá', points: '60,30 460,30 440,100 80,100' },
                { id: 'usa', name: 'Estados Unidos', points: '80,100 440,100 410,190 150,190' },
                { id: 'mex', name: 'México', points: '150,190 410,190 320,280 220,280' },
                { id: 'gua', name: 'Guatemala', points: '220,280 270,280 260,320 210,320' },
                { id: 'belz', name: 'Belice', points: '270,280 300,270 300,300 270,300' },
                { id: 'hon', name: 'Honduras', points: '260,300 330,300 320,340 260,330' },
                { id: 'slv', name: 'El Salvador', points: '210,320 260,320 260,340 210,340' },
                { id: 'nic', name: 'Nicaragua', points: '260,330 340,330 330,380 270,370' },
                { id: 'cri', name: 'Costa Rica', points: '270,370 330,380 350,410 290,410' },
                { id: 'pan', name: 'Panamá', points: '290,410 350,410 430,420 410,445 310,445' }
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
            viewBox: '0 0 500 400',
            regions: [
                // Row 1 (3 hexagons)
                { id: 'h1', name: 'Celda Alpha', points: '140,60 180,35 220,60 220,110 180,135 140,110' },
                { id: 'h2', name: 'Celda Beta', points: '230,60 270,35 310,60 310,110 270,135 230,110' },
                { id: 'h3', name: 'Celda Gamma', points: '320,60 360,35 400,60 400,110 360,135 320,110' },
                // Row 2 (4 hexagons - staggered)
                { id: 'h4', name: 'Celda Delta', points: '95,145 135,120 175,145 175,195 135,220 95,195' },
                { id: 'h5', name: 'Celda Épsilon (Centro)', points: '185,145 225,120 265,145 265,195 225,220 185,195' },
                { id: 'h6', name: 'Celda Zeta (Centro)', points: '275,145 315,120 355,145 355,195 315,220 275,195' },
                { id: 'h7', name: 'Celda Eta', points: '365,145 405,120 445,145 445,195 405,220 365,195' },
                // Row 3 (3 hexagons)
                { id: 'h8', name: 'Celda Theta', points: '140,230 180,205 220,230 220,280 180,305 140,280' },
                { id: 'h9', name: 'Celda Iota', points: '230,230 270,205 310,230 310,280 270,305 230,280' },
                { id: 'h10', name: 'Celda Kappa', points: '320,230 360,205 400,230 400,280 360,305 320,280' }
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

        'wheel-graph': {
            type: 'graph',
            viewBox: '0 0 500 400',
            nodes: [
                { id: 'w_center', label: 'HUB', x: 250, y: 200 },
                { id: 'w1', label: '1', x: 250, y: 70 },
                { id: 'w2', label: '2', x: 380, y: 135 },
                { id: 'w3', label: '3', x: 340, y: 310 },
                { id: 'w4', label: '4', x: 160, y: 310 },
                { id: 'w5', label: '5', x: 120, y: 135 }
            ],
            edges: [
                // Wheel Spokes (Center to perimeter)
                ['w_center', 'w1'], ['w_center', 'w2'], ['w_center', 'w3'], ['w_center', 'w4'], ['w_center', 'w5'],
                // Odd Cycle Rim (5 vertices) -> Strictly requires 4 colors!
                ['w1', 'w2'], ['w2', 'w3'], ['w3', 'w4'], ['w4', 'w5'], ['w5', 'w1']
            ],
            adjacencies: {
                'w_center': ['w1', 'w2', 'w3', 'w4', 'w5'],
                'w1': ['w_center', 'w2', 'w5'],
                'w2': ['w_center', 'w1', 'w3'],
                'w3': ['w_center', 'w2', 'w4'],
                'w4': ['w_center', 'w3', 'w5'],
                'w5': ['w_center', 'w4', 'w1']
            }
        },

        'birkhoff-diamond': {
            type: 'polygons',
            viewBox: '0 0 500 400',
            regions: [
                { id: 'r1', name: 'Norte', points: '250,30 380,120 250,150 120,120' },
                { id: 'r2', name: 'Oeste Exterior', points: '120,120 250,150 170,250 50,200' },
                { id: 'r3', name: 'Este Exterior', points: '380,120 450,200 330,250 250,150' },
                { id: 'r4', name: 'Centro 1', points: '250,150 330,250 250,270 170,250' },
                { id: 'r5', name: 'Sur Oeste', points: '170,250 250,270 250,370 110,320' },
                { id: 'r6', name: 'Sur Este', points: '330,250 390,320 250,370 250,270' }
            ],
            adjacencies: {
                'r1': ['r2', 'r3', 'r4'],
                'r2': ['r1', 'r4', 'r5'],
                'r3': ['r1', 'r4', 'r6'],
                'r4': ['r1', 'r2', 'r3', 'r5', 'r6'],
                'r5': ['r2', 'r4', 'r6'],
                'r6': ['r3', 'r4', 'r5']
            }
        },

        'planar-graph': {
            type: 'graph',
            viewBox: '0 0 500 400',
            nodes: [
                { id: 'n1', label: 'A', x: 250, y: 60 },
                { id: 'n2', label: 'B', x: 100, y: 180 },
                { id: 'n3', label: 'C', x: 400, y: 180 },
                { id: 'n4', label: 'D', x: 180, y: 320 },
                { id: 'n5', label: 'E', x: 320, y: 320 },
                { id: 'n6', label: 'F', x: 250, y: 200 }
            ],
            edges: [
                ['n1', 'n2'], ['n1', 'n3'], ['n1', 'n6'],
                ['n2', 'n4'], ['n2', 'n6'],
                ['n3', 'n5'], ['n3', 'n6'],
                ['n4', 'n5'], ['n4', 'n6'],
                ['n5', 'n6']
            ],
            adjacencies: {
                'n1': ['n2', 'n3', 'n6'],
                'n2': ['n1', 'n4', 'n6'],
                'n3': ['n1', 'n5', 'n6'],
                'n4': ['n2', 'n5', 'n6'],
                'n5': ['n3', 'n4', 'n6'],
                'n6': ['n1', 'n2', 'n3', 'n4', 'n5']
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

    // Procedural random planar map generator (3x3 jittered mesh)
    function generateRandomPlanarMap() {
        const rows = 3;
        const cols = 3;
        const width = 480;
        const height = 360;
        const marginX = 20;
        const marginY = 20;

        // Generate grid vertices with random jitter
        const vertices = [];
        for (let r = 0; r <= rows; r++) {
            vertices[r] = [];
            for (let c = 0; c <= cols; c++) {
                const baseX = marginX + (c * (width - 2 * marginX)) / cols;
                const baseY = marginY + (r * (height - 2 * marginY)) / rows;
                
                // Add jitter to internal vertices
                const jitterX = (c > 0 && c < cols) ? (Math.random() - 0.5) * 45 : 0;
                const jitterY = (r > 0 && r < rows) ? (Math.random() - 0.5) * 45 : 0;

                vertices[r][c] = {
                    x: Math.round(baseX + jitterX),
                    y: Math.round(baseY + jitterY)
                };
            }
        }

        const regions = [];
        const adjacencies = {};
        const greek = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Épsilon', 'Zeta', 'Eta', 'Theta', 'Iota'];

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const id = `rand_${r}_${c}`;
                const name = `Región ${greek[r * cols + c] || id}`;
                const p1 = vertices[r][c];
                const p2 = vertices[r][c + 1];
                const p3 = vertices[r + 1][c + 1];
                const p4 = vertices[r + 1][c];

                regions.push({
                    id: id,
                    name: name,
                    points: `${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y}`
                });

                adjacencies[id] = [];
                // 4-connected neighbors
                if (r > 0) adjacencies[id].push(`rand_${r - 1}_${c}`);
                if (r < rows - 1) adjacencies[id].push(`rand_${r + 1}_${c}`);
                if (c > 0) adjacencies[id].push(`rand_${r}_${c - 1}`);
                if (c < cols - 1) adjacencies[id].push(`rand_${r}_${c + 1}`);
            }
        }

        return {
            type: 'polygons',
            viewBox: '0 0 500 400',
            regions: regions,
            adjacencies: adjacencies
        };
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

        // Victory Condition: All colored, no conflicts, max 4 colors!
        if (coloredCount === totalRegions && conflictCount === 0 && distinctColors.size <= 4) {
            successBanner.classList.remove('hidden');
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

        for (const nodeId of sortedNodes) {
            const neighborColors = new Set(
                (currentMapData.adjacencies[nodeId] || [])
                    .map(neighbor => solution[neighbor])
                    .filter(Boolean)
            );

            // Find first color not used by any colored neighbor
            const chosen = availableColors.find(c => !neighborColors.has(c));
            if (chosen) {
                solution[nodeId] = chosen;
            } else {
                solution[nodeId] = 'color-1'; // fallback
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
