'use strict';

// let pacMan;
// let keyPressed;
// let keys = [];
// let dots = [];

class Character {
    constructor(source, name) {
        let characterDiv = document.createElement('div');

        characterDiv.src = source;
        characterDiv.id = 'game-character-' + name;
        // place character on board at x and y

        this.source = source;
        this.name = name;
        this.characterDiv = characterDiv;
    }
}

/**
 * Creates a new Pac-Man <img> element and appends it to the document's body.
 */
// function createPacMan() {

//     pacMan = document.createElement("img");
//     pacMan.src = "assets/images/pacMan.png";
//     pacMan.id = "pacMan";
//     pacMan.style.left = "0";
//     pacMan.style.top = "0";
//     document.body.appendChild(pacMan);

// }

// createPacMan();

// let pacManPosition = {

//     "x": pacMan.getBoundingClientRect().x,
//     "y": pacMan.getBoundingClientRect().y

// };

// /**
//  * Calls itself continuously to test if Pac-Man is moving and moves him.
//  */
// function movePacMan() {

//     switch (keyPressed) {

//         case "ArrowUp":

//             pacManPosition.y -= 1;
//             pacMan.style.top = pacManPosition.y + "px";
//             pacMan.style.transform = "rotate(90deg)";

//             break;

//         case "ArrowDown":

//             pacManPosition.y += 1;
//             pacMan.style.top = pacManPosition.y + "px";
//             pacMan.style.transform = "rotate(-90deg)";

//             break;

//         case "ArrowRight":

//             pacManPosition.x += 1;
//             pacMan.style.left = pacManPosition.x + "px";
//             pacMan.style.transform = "rotate(180deg)";

//             break;

//         case "ArrowLeft":

//             pacManPosition.x -= 1;
//             pacMan.style.left = pacManPosition.x + "px";
//             pacMan.style.transform = "rotate(0deg)";

//             break;

//     }

// }

// let movePacManCheck = setInterval(movePacMan, 15);

// function createDots() {

//     let dot = document.createElement("img");
//     dot.src = "assets/images/dot.png";
//     dot.className = "dot";
//     dot.style.left = "50px";
//     dot.style.top = "0";
//     document.body.appendChild(dot);
//     dots.push(dot);

// }

// createDots();

// function eat() {

//     dots.forEach(function(dot) {

//         if (pacMan.style.left == dot.style.left && pacMan.style.top == dot.style.top) {

//             console.log("removed");
//             document.body.removeChild(dot);
//             clearInterval(eatCheck);

//         }

//     });

// }

// let eatCheck = setInterval(eat, 20);

// /**
//  * Adds an event listener that tests for keydown event and resets the keyPressed
//  * array, then gets the key pressed and sets its value in the array to be true.
//  */
// window.addEventListener("keydown", function(event) {

//     if (event.key == "ArrowUp" || event.key == "ArrowDown" || event.key == "ArrowRight" || event.key == "ArrowLeft") {

//         pacMan.src = "assets/images/pacman.gif";
//         keyPressed = "";
//         keyPressed = event.key;
//         keys[event.key] = true;

//     }

// });