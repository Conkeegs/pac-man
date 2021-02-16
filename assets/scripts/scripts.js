let pacMan;

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

            pacManPosition.x -= 10;
            pacMan.style.left = pacManPosition.x + "px";
            break;

        case "ArrowRight":

            pacManPosition.x += 10;
            pacMan.style.left = pacManPosition.x + "px";
            break;

        case "ArrowUp":

            pacManPosition.y -= 10;
            pacMan.style.top = pacManPosition.y + "px";
            break;

        case "ArrowDown":

            pacManPosition.y += 10;
            pacMan.style.top = pacManPosition.y + "px";
            break;

    }

}

window.addEventListener("keydown", movePacMan);