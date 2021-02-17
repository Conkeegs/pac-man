let pacMan;
let key;

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

function movePacMan() {

    switch (key) {

        case "ArrowLeft":

            pacManPosition.x -= 1;
            pacMan.style.left = pacManPosition.x + "px";

            pacMan.style.transform = "rotate(0deg)";

            break;

        case "ArrowRight":

            pacManPosition.x += 1;
            pacMan.style.left = pacManPosition.x + "px";

            pacMan.style.transform = "rotate(180deg)";

            break;

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

    }

    setTimeout(movePacMan, 15);

}

movePacMan();

window.addEventListener("keydown", function(event) {

    if (event.key == "ArrowUp" || event.key == "ArrowDown" || event.key == "ArrowRight" || event.key == "ArrowLeft") {

        key = "";
        key = event.key;

    }

});