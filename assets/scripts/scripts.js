let pacMan;
let pacManDirection = "left";

function createPacMan() {

    pacMan = document.createElement("img");
    pacMan.src = "assets/images/pacMan1.png";
    pacMan.id = "pacMan";
    document.body.appendChild(pacMan);

}

createPacMan();

let pacManPosition = {

    "x": pacMan.getBoundingClientRect().x,
    "y": pacMan.getBoundingClientRect().y

};

function movePacMan(event) {

    switch (event.key) {

        case "ArrowLeft":

            pacMan.style.transform = "rotate(0deg)";
            pacManDirection = "left";

            pacManPosition.x -= 10;
            pacMan.style.left = pacManPosition.x + "px";

            break;

        case "ArrowRight":

            pacMan.style.transform = "rotate(180deg)";
            pacManDirection = "right";

            pacManPosition.x += 10;
            pacMan.style.left = pacManPosition.x + "px";
            break;

        case "ArrowUp":

            pacMan.style.transform = "rotate(90deg)";
            pacManDirection = "up";

            pacManPosition.y -= 10;
            pacMan.style.top = pacManPosition.y + "px";
            break;

        case "ArrowDown":

            pacMan.style.transform = "rotate(-90deg)";
            pacManDirection = "down";

            pacManPosition.y += 10;
            pacMan.style.top = pacManPosition.y + "px";
            break;

    }

}

window.addEventListener("keydown", movePacMan);