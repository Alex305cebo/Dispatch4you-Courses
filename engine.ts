import { Building, Swarm, PlayerId, BuildingType, PlayerStats, Position } from './types.js';

export class GameEngine {
    buildings: Building[] = [];
    swarms: Swarm[] = [];
    playerStats: Record<string, PlayerStats> = {};
    
    private swarmSpeed = 0.5; // Скорость (путь за секунду)
    private aiTimer = 0;

    update(dt: number) {
        this.updateGlobalModifiers();
        this.updateAI(dt);

        // 1. Рост популяции
        this.buildings.forEach(b => {
            if (b.owner !== 'neutral' && b.units < b.maxUnits) {
                b.units += b.growthRate * b.level * dt;
                if (b.units > b.maxUnits) b.units = b.maxUnits;
            }
        });

        // 2. Логика башен
        for (const tower of this.buildings) {
            if (tower.type === BuildingType.Tower && tower.owner !== 'neutral' && tower.attackRadius) {
                for (const swarm of this.swarms) {
                    if (swarm.owner === tower.owner) continue;
                    
                    const currentPos = this.lerp(swarm.startPos, swarm.targetPos, swarm.progress);
                    const dist = this.getDistance(tower.pos, currentPos);
                    
                    if (dist <= tower.attackRadius) {
                        swarm.count -= (tower.attackDamage || 0) * dt;
                    }
                }
            });
        });

        // 3. Движение роев
        for (let i = this.swarms.length - 1; i >= 0; i--) {
            const swarm = this.swarms[i];
            swarm.progress += this.swarmSpeed * dt;

            if (swarm.count <= 0 || swarm.progress >= 1) {
                this.onSwarmArrival(swarm);
                this.swarms.splice(i, 1);
            }
        }
    }

    private updateGlobalModifiers() {
        const players = [...new Set(this.buildings.map(b => b.owner))].filter(o => o !== 'neutral');
        players.forEach(p => {
            const forges = this.buildings.filter(b => b.owner === p && b.type === BuildingType.Forge).length;
            this.playerStats[p.toString()] = {
                attackModifier: 1 + forges * 0.15,
                defenseModifier: 1 + forges * 0.15
            };
        });
    }

    private updateAI(dt: number) {
        this.aiTimer += dt;
        if (this.aiTimer < 3) return; // ИИ принимает решение раз в 3 секунды
        this.aiTimer = 0;

        const enemyBuildings = this.buildings.filter(b => b.owner === 2);
        const potentialTargets = this.buildings.filter(b => b.owner !== 2);

        enemyBuildings.forEach(eb => {
            // Если база заполнена более чем на 70%, атакуем случайную цель
            if (eb.units > eb.maxUnits * 0.7 && potentialTargets.length > 0) {
                const target = potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
                this.sendUnits(eb.id, target.id, 0.5);
            }
        });
    }

    sendUnits(fromId: string, toId: string, percentage: number = 0.5) {
        const from = this.buildings.find(b => b.id === fromId);
        const to = this.buildings.find(b => b.id === toId);
        if (!from || !to || from.units < 1) return;

        const countToSend = Math.floor(from.units * percentage);
        from.units -= countToSend;

        this.swarms.push({
            id: Math.random().toString(36).substr(2, 9),
            owner: from.owner,
            count: countToSend,
            startPos: { ...from.pos },
            targetPos: { ...to.pos },
            fromId,
            toId,
            progress: 0
        });
    }

    getBuildingAt(pos: Position): Building | undefined {
        return this.buildings.find(b => this.getDistance(b.pos, pos) <= b.radius);
    }

    private getDistance(p1: Position, p2: Position): number {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    }

    private lerp(p1: Position, p2: Position, t: number): Position {
        return {
            x: p1.x + (p2.x - p1.x) * t,
            y: p1.y + (p2.y - p1.y) * t
        };
    }

    private onSwarmArrival(swarm: Swarm) {
        if (swarm.count <= 0) return;
        const target = this.buildings.find(b => b.id === swarm.toId);
        if (!target) return;

        if (target.owner === swarm.owner) {
            target.units += swarm.count;
        } else {
            const attackerStats = this.playerStats[swarm.owner.toString()] || { attackModifier: 1, defenseModifier: 1 };
            const defenderStats = this.playerStats[target.owner.toString()] || { attackModifier: 1, defenseModifier: 1 };
            
            const damage = swarm.count * attackerStats.attackModifier;
            const defense = defenderStats.defenseModifier;

            const damageToUnits = damage / defense;
            target.units -= damageToUnits;
            
            if (target.units < 0) {
                target.owner = swarm.owner;
                target.units = Math.max(2, Math.abs(target.units) * 0.5); // После захвата остается часть выживших
                target.level = 1;
            }
        }
    }
}