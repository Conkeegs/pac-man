import PacMan from "../../../../../src/main/board/boardobject/children/character/PacMan.js";
import MovementDirection from "../../../../../src/main/board/boardobject/children/moveable/MovementDirection.js";
import Teleporter from "../../../../../src/main/board/boardobject/children/Teleporter.js";
import { TILESIZE } from "../../../../../src/main/utils/Globals.js";
import { px } from "../../../../../src/main/utils/Utils.js";
import Test from "../../../../base/Base.js";
import { tests } from "../../../../base/Decorators.js";

/**
 * Tests functionality of `Teleporter` instances.
 */
@tests(Teleporter)
export default class TeleporterTest extends Test {
	/**
	 * Test that teleporters can be created correctly.
	 */
	public createTeleporterTest(): void {
		const teleporterDirection: MovementDirection = MovementDirection.LEFT;
		const teleporter = new Teleporter("test-teleporter", teleporterDirection);

		this.assertStrictlyEqual(teleporterDirection, teleporter.getTeleportDirection());
		this.assertStrictlyEqual(px(TILESIZE), teleporter.getElement().css("width"));
		this.assertStrictlyEqual(px(TILESIZE), teleporter.getElement().css("height"));
	}

	/**
	 * Test that teleporters can return their resulting movement direction correctly.
	 */
	public getTeleportDirectionTest(): void {
		const teleporterDirection: MovementDirection = MovementDirection.UP;
		const teleporter = new Teleporter("test-teleporter", teleporterDirection);

		this.assertStrictlyEqual(teleporterDirection, teleporter.getTeleportDirection());
	}

	/**
	 * Test that teleporters can return their resulting movement direction correctly.
	 */
	public getLinkedTeleporterTest(): void {
		const teleporter1 = new Teleporter("test-teleporter-1", MovementDirection.RIGHT);
		const teleporter2 = new Teleporter("test-teleporter-2", MovementDirection.LEFT);

		teleporter1.link(teleporter2);

		this.assertStrictlyEqual(teleporter2, teleporter1.getLinkedTeleporter());
	}

	/**
	 * Test that teleporters link to each other correctly.
	 */
	public linkTest(): void {
		const teleporter1 = new Teleporter("test-teleporter-1", MovementDirection.RIGHT);
		const teleporter2 = new Teleporter("test-teleporter-2", MovementDirection.LEFT);

		teleporter1.link(teleporter2);
		teleporter2.link(teleporter1);

		this.assertStrictlyEqual(teleporter1, teleporter2.getLinkedTeleporter());
		this.assertStrictlyEqual(teleporter2, teleporter1.getLinkedTeleporter());
	}

	/**
	 * Test that teleporters teleport moveables properly when collided with.
	 */
	public async onCollisionTest(): Promise<void> {
		const teleporter1 = new Teleporter("test-teleporter-1", MovementDirection.RIGHT);
		const teleporter2 = new Teleporter("test-teleporter-2", MovementDirection.LEFT);

		teleporter1.link(teleporter2);
		teleporter2.link(teleporter1);

		const collidableMoveable = new PacMan();

		this.assertTrue(collidableMoveable.getShouldInterpolate());

		collidableMoveable.startMoving(MovementDirection.RIGHT);
		teleporter2.onCollision(collidableMoveable);

		const teleporter1Position = teleporter1.getPosition();
		let collidableMoveablePosition = collidableMoveable.getPosition();

		this.assertStrictlyEqual(teleporter1Position.x + teleporter1.getWidth(), collidableMoveablePosition.x);
		this.assertStrictlyEqual(teleporter1Position.y, collidableMoveablePosition.y);
		this.assertFalse(collidableMoveable.getShouldInterpolate());
		this.assertTrue(collidableMoveable["shouldRender"]);

		// reset this
		collidableMoveable["shouldRender"] = false;

		collidableMoveable.startMoving(MovementDirection.LEFT);
		teleporter1.onCollision(collidableMoveable);

		const teleporter2Position = teleporter2.getPosition();
		collidableMoveablePosition = collidableMoveable.getPosition();

		this.assertStrictlyEqual(teleporter2Position.x - collidableMoveable.getWidth(), collidableMoveablePosition.x);
		this.assertStrictlyEqual(teleporter2Position.y, collidableMoveablePosition.y);
		this.assertTrue(collidableMoveable["shouldRender"]);
	}
}
