let pacManBody = document.createElement("div");
pacManBody.textContent = " ";
pacManBody.id = "pacManBody";
document.body.appendChild(pacManBody);

let position = {

    "x": pacManBody.getBoundingClientRect().x,
    "y": pacManBody.getBoundingClientRect().y

};

function movePlayer(event) {

    switch (event.key) {

        case "ArrowLeft":

            position.x -= 10;
            pacManBody.style.left = position.x + "px";
            break;

        case "ArrowRight":

            position.x += 10;
            pacManBody.style.left = position.x + "px";
            break;

    }

}

window.addEventListener("keydown", movePlayer);