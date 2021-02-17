let pacMan;
let key = [];

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

    if (key["ArrowUp"]) {

        pacManPosition.y -= 1;
        pacMan.style.top = pacManPosition.y + "px";
        pacMan.style.transform = "rotate(90deg)";

    }
    else if (key["ArrowDown"]) {

        pacManPosition.y += 1;
        pacMan.style.top = pacManPosition.y + "px";
        pacMan.style.transform = "rotate(-90deg)";

    }
    else if (key["ArrowRight"]) {

        pacManPosition.x += 1;
        pacMan.style.left = pacManPosition.x + "px";
        pacMan.style.transform = "rotate(180deg)";

    }
    else if (key["ArrowLeft"]) {

        pacManPosition.x -= 1;
        pacMan.style.left = pacManPosition.x + "px";
        pacMan.style.transform = "rotate(0deg)";

    }

    setTimeout(movePacMan, 15);

}

movePacMan();

function animatePacMan() {

    let counter = 0;

    if (key["ArrowUp"] || key["ArrowDown"] || key["ArrowRight"] || key["ArrowLeft"]) {

        setTimeout(function() {

            document.body.removeChild(pacMan);
            createPacMan("assets/images/pacMan2.png", pacManPosition.x, pacManPosition.y, pacMan.style.transform);
            counter++;
            console.log(counter);

            setTimeout(function() {

                document.body.removeChild(pacMan);
                createPacMan("assets/images/pacMan3.png", pacManPosition.x, pacManPosition.y, pacMan.style.transform);
                counter++;
                console.log(counter);

                setTimeout(function() {

                    document.body.removeChild(pacMan);
                    createPacMan("assets/images/pacMan1.png", pacManPosition.x, pacManPosition.y, pacMan.style.transform);
                    counter++;
                    console.log(counter);
        
                }, 50);
    
            }, 50);

        }, 50);

    }

    setTimeout(animatePacMan, 150);

}

animatePacMan();

window.addEventListener("keydown", function(event) {

    if (event.key == "ArrowUp" || event.key == "ArrowDown" || event.key == "ArrowRight" || event.key == "ArrowLeft") {

        key[event.key] = true;

    }

});

window.addEventListener("keyup", function(event) {

    if (event.key == "ArrowUp" || event.key == "ArrowDown" || event.key == "ArrowRight" || event.key == "ArrowLeft") {

        key[event.key] = false;

    }

});