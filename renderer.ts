import { GameEngine } from './engine.js';
import { BuildingType, PlayerId } from './types.js';

export class GameRenderer {
    private ctx: CanvasRenderingContext2D;
    private colors: Record<string, string> = {
        '1': '#3b82f6',     // Синий (Игрок)
        '2': '#ef4444',     // Красный (Враг)
        'neutral': '#9ca3af' // Серый
    };

    constructor(canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext('2d')!;
    }

    render(engine: GameEngine, selectedId: string | null, mousePos: { x: number, y: number } | null) {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // Рисуем линию перетаскивания
        if (selectedId && mousePos) {
            const from = engine.buildings.find(b => b.id === selectedId);
            if (from) {
                this.ctx.beginPath();
                this.ctx.moveTo(from.pos.x, from.pos.y);
                this.ctx.lineTo(mousePos.x, mousePos.y);
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                this.ctx.setLineDash([5, 5]);
                this.ctx.stroke();
                this.ctx.setLineDash([]);
            }
        }

        // Рисуем здания
        engine.buildings.forEach(b => {
            // Отрисовка радиуса для башен
            if (b.type === BuildingType.Tower && b.owner !== 'neutral' && b.attackRadius) {
                this.ctx.beginPath();
                this.ctx.arc(b.pos.x, b.pos.y, b.attackRadius, 0, Math.PI * 2);
                this.ctx.strokeStyle = 'rgba(239, 68, 68, 0.15)'; // Полупрозрачный красный
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
            }

            this.ctx.beginPath();
            this.ctx.arc(b.pos.x, b.pos.y, b.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = this.colors[b.owner.toString()] || this.colors.neutral;
            this.ctx.fill();
            
            if (b.id === selectedId) {
                this.ctx.lineWidth = 3;
                this.ctx.strokeStyle = 'yellow';
                this.ctx.stroke();
            }

            // Текст: количество юнитов
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(Math.floor(b.units).toString(), b.pos.x, b.pos.y + 5);
            
            // Тип здания (иконка/буква)
            this.ctx.font = '10px Arial';
            this.ctx.fillText(b.type.toUpperCase(), b.pos.x, b.pos.y - b.radius - 5);
        });

        // Рисуем рои юнитов
        engine.swarms.forEach(s => {
            const x = s.startPos.x + (s.targetPos.x - s.startPos.x) * s.progress;
            const y = s.startPos.y + (s.targetPos.y - s.startPos.y) * s.progress;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 4, 0, Math.PI * 2);
            this.ctx.fillStyle = this.colors[s.owner.toString()] || 'white';
            this.ctx.fill();
        });
    }
}