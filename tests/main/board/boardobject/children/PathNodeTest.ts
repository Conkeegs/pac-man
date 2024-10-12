import Board from "../../../../../src/main/board/Board.ts";
import PathNode from "../../../../../src/main/board/boardobject/children/PathNode.ts";
import { TILESIZE } from "../../../../../src/main/utils/Globals.ts";
import { px } from "../../../../../src/main/utils/Utils.ts";
import Assertion from "../../../../base/Assertion.ts";
import Test from "../../../../base/Base.ts";
import { tests } from "../../../../base/Decorators.ts";

/**
 * Tests the functionality of a `PathNode` instance.
 */
@tests(PathNode)
export default class PathNodeTest extends Test {
	/**
	 * Test that PathNode instances can be created correctly.
	 */
	public createPathNodeTest(): void {
		const pathNodeName = "testing-path-node";
		const pathNode = new PathNode(pathNodeName);
		const pathNodeElement = pathNode.getElement();

		Assertion.assertStrictlyEqual(px(TILESIZE), pathNodeElement.css("width"));
		Assertion.assertStrictlyEqual(px(TILESIZE), pathNodeElement.css("height"));
		Assertion.assertStrictlyEqual(1, pathNodeElement.childElementCount);

		const firstElementChild: HTMLDivElement = pathNodeElement.firstElementChild! as HTMLDivElement;

		Assertion.assertStrictlyEqual(HTMLDivElement.name, pathNodeElement.constructor.name);
		Assertion.assertStrictlyEqual(`${pathNodeName}-node-element`, firstElementChild.id);

		const childDimensionsPixels = px(Board.calcTileOffset(0.5));

		Assertion.assertStrictlyEqual(childDimensionsPixels, firstElementChild.css("width"));
		Assertion.assertStrictlyEqual(childDimensionsPixels, firstElementChild.css("height"));
		// should be white since it defaults to white
		Assertion.assertStrictlyEqual("white", firstElementChild.css("backgroundColor"));

		const backgroundColor = "red";
		const pathNode2 = new PathNode("testing-path-node-2", backgroundColor);

		Assertion.assertStrictlyEqual(
			backgroundColor,
			(pathNode2.getElement().firstElementChild as HTMLDivElement).css("backgroundColor")
		);
	}
}
