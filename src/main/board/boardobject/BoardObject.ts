"use strict";

import DebugWindow from "../../debugwindow/DebugWindow.js";
import { BOARDOBJECTS } from "../../utils/Globals.js";
import { create } from "../../utils/Utils.js";

export type Position = {
	left: number;
	top: number;
};

export class BoardObject {
	private element: HTMLElement;

	protected name: string | undefined;
	protected width: number | undefined;
	protected height: number | undefined;
	protected position: Position | undefined;

	constructor(name: string) {
		if (!name) {
			DebugWindow.error("BoardObject.js", "constructor", "BoardObject must have a name.");
		} else if (BOARDOBJECTS.includes(name)) {
			DebugWindow.error("BoardObject.js", "constructor", `A BoardObject with the name '${name}' already exists.`);
		}

		this.name = name;

		BOARDOBJECTS.push(name);

		this.element = create({ name: "div", id: name, classes: ["game-object", "board-object"] });
	}

	public setPosition(position: Position): void {
		this.position = position;
	}

	public getElement(): HTMLElement {
		return this.element;
	}

	public getWidth(): number | undefined {
		return this.width;
	}

	public getHeight(): number | undefined {
		return this.height;
	}
}
