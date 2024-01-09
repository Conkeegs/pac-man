"use strict";

import DebugWindow from "../../debugwindow/DebugWindow.js";
import { GAMEOBJECTS } from "../../utils/Globals.js";
import { create } from "../../utils/Utils.js";

export class BoardObject {
	private element: HTMLElement;

	protected width: number | undefined;
	protected height: number | undefined;

	constructor(name: string) {
		if (!name) {
			DebugWindow.error("GameObject.js", "constructor", "GameObject must have a name.");
		} else if (GAMEOBJECTS.includes(name)) {
			DebugWindow.error("GameObject.js", "constructor", `A GameObject with the name '${name}' already exists.`);
		}

		GAMEOBJECTS.push(name);

		this.element = create({ name: "div", id: name, classes: ["game-object", "board-object"] });
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
