let pacMan;
let keyPressed;
let keys = [];

function createPacMan(src, positionX, positionY, transform) {

    pacMan = document.createElement("img");
    pacMan.src = src;
    pacMan.id = "pacMan";
    pacMan.style.transform = transform;
    pacMan.style.left = positionX + "px";
    pacMan.style.top = positionY + "px";
    document.body.appendChild(pacMan);

}

createPacMan("assets/images/pacMan1.png", 0, 0);

let pacManPosition = {

    "x": pacMan.getBoundingClientRect().x,
    "y": pacMan.getBoundingClientRect().y

};

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

    setTimeout(movePacMan, 15);

}

movePacMan();

function animatePacMan() {

    let counter = 0;

    if (keys["ArrowUp"] || keys["ArrowDown"] || keys["ArrowRight"] || keys["ArrowLeft"]) {

        setTimeout(function() {

            document.body.removeChild(pacMan);
            createPacMan("assets/images/pacMan2.png", pacManPosition.x, pacManPosition.y, pacMan.style.transform);

            setTimeout(function() {

                document.body.removeChild(pacMan);
                createPacMan("assets/images/pacMan3.png", pacManPosition.x, pacManPosition.y, pacMan.style.transform);

                setTimeout(function() {

                    document.body.removeChild(pacMan);
                    createPacMan("assets/images/pacMan1.png", pacManPosition.x, pacManPosition.y, pacMan.style.transform);
        
                }, 50);
    
            }, 50);

        }, 50);

    }

    setTimeout(animatePacMan, 150);

}

animatePacMan();

window.addEventListener("keydown", function(event) {

    if (event.key == "ArrowUp" || event.key == "ArrowDown" || event.key == "ArrowRight" || event.key == "ArrowLeft") {

        keyPressed = "";
        keyPressed = event.key;
        keys[event.key] = true;

    }

});

// window.addEventListener("keyup", function(event) {

//     if (event.key == "ArrowUp" || event.key == "ArrowDown" || event.key == "ArrowRight" || event.key == "ArrowLeft") {

//         key[event.key] = false;

//     }

// });