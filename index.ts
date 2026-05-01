import { GameEngine } from './engine.js';
import { GameRenderer } from './renderer.js';
import { BuildingType } from './types.js';

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const engine = new GameEngine();
const renderer = new GameRenderer(canvas);

let selectedId: string | null = null;
let mousePos = { x: 0, y: 0 };

engine.buildings.push(
    { id: 'p1', type: BuildingType.Village, pos: { x: 100, y: 300 }, owner: 1, units: 30, level: 1, radius: 30, maxUnits: 50, growthRate: 2, upgradeCost: (l) => l * 20 },
    { id: 'n1', type: BuildingType.Village, pos: { x: 400, y: 300 }, owner: 'neutral', units: 10, level: 1, radius: 25, maxUnits: 30, growthRate: 0, upgradeCost: (l) => 999 },
    { id: 'e1', type: BuildingType.Tower, pos: { x: 700, y: 300 }, owner: 2, units: 20, level: 1, radius: 25, maxUnits: 40, growthRate: 1, attackRadius: 100, attackDamage: 10, upgradeCost: (l) => l * 30 }
);

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const p = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const b = engine.getBuildingAt(p);
    if (b && b.owner === 1) selectedId = b.id;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mousePos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
});

canvas.addEventListener('mouseup', () => {
    if (selectedId) {
        const b = engine.getBuildingAt(mousePos);
        if (b && b.id !== selectedId) engine.sendUnits(selectedId, b.id, 0.5);
        selectedId = null;
    }
});

function tick() {
    engine.update(1/60);
    renderer.render(engine, selectedId, mousePos);
    requestAnimationFrame(tick);
}
tick();