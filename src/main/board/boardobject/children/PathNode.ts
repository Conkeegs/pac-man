'use strict';

import { TILESIZE } from "../../../utils/Globals";
import { create, px } from "../../../utils/Utils";
import { BoardObject } from "../BoardObject";

export default class PathNode extends BoardObject {
    public override width = TILESIZE;
    public override height = TILESIZE;

    constructor(name: string, color = 'white') {
        super(name);

        const element: HTMLElement = this.getElement();

        element.css({
            width: px(this.width),
            height: px(this.height),
        } as CSSStyleDeclaration);

        element.appendChild(create('div', `${name}-node-element`, ['node']).css({
            width: px(TILESIZE * 0.5),
            height: px(TILESIZE * 0.5),
            backgroundColor: color
        } as CSSStyleDeclaration) as HTMLElement);
    }
}