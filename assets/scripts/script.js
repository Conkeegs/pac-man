let pacMan;
let keyPressed;
let keys = [];

/**
 * Creates a new Pac-Man <img> element and appends it to the document's body.
 */
function createPacMan() {

    pacMan = document.createElement("img");
    pacMan.src = "assets/images/pacMan.png";
    pacMan.id = "pacMan";
    pacMan.style.left = "0";
    pacMan.style.top = "0";
    document.body.appendChild(pacMan);

}

createPacMan();

let pacManPosition = {

    "x": pacMan.getBoundingClientRect().x,
    "y": pacMan.getBoundingClientRect().y

};

/**
 * Calls itself continuously to test if Pac-Man is moving and moves him.
 */
function movePacMan() {

    switch (keyPressed) {

        case "ArrowUp":

            pacManPosition.y -= 1;
            pacMan.style.top = pacManPosition.y + "px";
            pacMan.style.transform = "rotate(90deg)";

            break;

        case "ArrowDown":

            pacManPosition.y += 1;
            pacMan.style.top = pacManPosition.y + "px";
            pacMan.style.transform = "rotate(-90deg)";

            break;

        case "ArrowRight":

            pacManPosition.x += 1;
            pacMan.style.left = pacManPosition.x + "px";
            pacMan.style.transform = "rotate(180deg)";

            break;

        case "ArrowLeft":

            pacManPosition.x -= 1;
            pacMan.style.left = pacManPosition.x + "px";
            pacMan.style.transform = "rotate(0deg)";

            break;

    }

}

setInterval(movePacMan, 15);

/**
 * Adds an event listener that tests for keydown event and resets the keyPressed
 * array, then gets the key pressed and sets its value in the array to be true.
 */
window.addEventListener("keydown", function(event) {

    if (event.key == "ArrowUp" || event.key == "ArrowDown" || event.key == "ArrowRight" || event.key == "ArrowLeft") {

        pacMan.src = "assets/images/pacMan.gif";
        keyPressed = "";
        keyPressed = event.key;
        keys[event.key] = true;

    }

});