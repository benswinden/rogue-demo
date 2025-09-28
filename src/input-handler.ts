import { Actor, Entity } from './entity';

export interface Action {
    perform: (entity: Entity) => void;
}

export abstract class ActionWithDirection implements Action {
    constructor(public dx: number, public dy: number) {}

    perform(_entity: Entity) {}
}

export class MovementAction extends ActionWithDirection {

    perform(entity: Entity) {

        const destX = entity.x + this.dx;
        const destY = entity.y + this.dy;

        if (!window.engine.gameMap.isInBounds(destX, destY)) return;
        if (!window.engine.gameMap.tiles[destY][destX].walkable) return;
        if (window.engine.gameMap.getBlockingEntityAtLocation(destX, destY)) return;
        entity.move(this.dx, this.dy);
    }
}

export class MeleeAction extends ActionWithDirection {

    perform(actor: Actor) {

        const destX = actor.x + this.dx;
        const destY = actor.y + this.dy;

        const target = window.engine.gameMap.getActorAtLocation(destX, destY);
        if (!target) return;

        const damage = actor.fighter.power - target.fighter.defense;
        const attackDescription = `${actor.name.toUpperCase()} attacks ${target.name}`;

        if (damage > 0) {
            console.log(`${attackDescription} for ${damage} hit points`);
            target.fighter.hp -= damage;
        } else {
            console.log(`${attackDescription} but does no damage`);
        }        
    }
}

export class BumpAction extends ActionWithDirection {

    perform(entity: Entity) {

        const destX = entity.x + this.dx;
        const destY = entity.y + this.dy;

        if (window.engine.gameMap.getActorAtLocation(destX, destY)) {
            return new MeleeAction(this.dx, this.dy).perform(entity as Actor);
        } else {
            return new MovementAction(this.dx, this.dy).perform(entity);
        }
    }
}

export class WaitAction implements Action {
    perform(_entity: Entity) {}
}

interface MovementMap {
    [key: string]: Action;
}

const MOVE_KEYS: MovementMap = {
    ArrowUp: new BumpAction(0,-1),
    ArrowDown: new BumpAction(0,1),
    ArrowLeft: new BumpAction(-1,0),
    ArrowRight: new BumpAction(1,0),
    // WASD
    w: new BumpAction(0,-1),
    s: new BumpAction(0,1),
    a: new BumpAction(-1,0),
    d: new BumpAction(1,0),
    q: new BumpAction(-1,-1),
    e: new BumpAction(1,-1),
    z: new BumpAction(-1,1),
    c: new BumpAction(1,1),
    x: new WaitAction(),
}

export function handleInput(event: KeyboardEvent): Action {
    return MOVE_KEYS[event.key];
}