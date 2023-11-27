let main = document.querySelector("main")
main.focus = true

const main_top = +(window.getComputedStyle(main).
    getPropertyValue('height').match(/\d+/))

const main_left = +(window.getComputedStyle(main).
    getPropertyValue('width').match(/\d+/))

let scoreboard = document.getElementById("score")

let collision = new CustomEvent("collision")
collision.element = undefined

let fruit = document.createElement("div")
fruit.id = "fruit"
main.appendChild(fruit)

let snake = []
let movement = undefined
let highscore = 0
let score = 0
let numPlayed = 0

createNewGame()

function moveSnake() {
    if (movement == "reset" || movement === undefined) return;

    let snake_head_top = +(snake[snake.length - 1].style.top.match(/\d+/))

    let snake_head_left = +(snake[snake.length - 1].style.left.match(/\d+/))

    switch (movement) {
        case "left":
            snake[0].style.left = (snake_head_left - 25) + "px"
            snake[0].style.top = snake_head_top + "px"
            break;
        case "right":
            snake[0].style.left = (snake_head_left + 25) + "px"
            snake[0].style.top = snake_head_top + "px"
            break;
        case "up":
            snake[0].style.top = (snake_head_top - 25) + "px"
            snake[0].style.left = snake_head_left + "px"
            break;
        case "down":
            snake[0].style.top = (snake_head_top + 25) + "px"
            snake[0].style.left = snake_head_left + "px"
            break;
    }

    if (+(snake[0].style.left.replace("px", "")) < 0 || +(snake[0].style.top.replace("px", "")) < 0) {
        collision.element = "border"
        document.dispatchEvent(collision)
    }

    if (+(snake[0].style.left.replace("px", "")) > main_left - 25
        || +(snake[0].style.top.replace("px", "")) > main_top - 25) {
        collision.element = "border"
        document.dispatchEvent(collision)
    }

    if (+(snake[0].style.left.replace("px", "")) == fruit.style.left.match(/\d+/)
        && +(snake[0].style.top.replace("px", "")) == fruit.style.top.match(/\d+/)) {
        collision.element = "fruit"
        document.dispatchEvent(collision)
    }

    if (score != 0) {
        let temp = snake[0]
        for (let i = 0; i < snake.length - 1; i++) {
            snake[i] = snake[i + 1]
        }
        snake[score] = temp

        for (let i = 0; i < snake.length - 2; i++) {
            if (snake[snake.length - 1].style.top == snake[i].style.top
                && snake[snake.length - 1].style.left == snake[i].style.left) {
                collision.element = "snake"
                document.dispatchEvent(collision)
            }
        }
    }
}

function moveRandomFruit() {
    let numCols = Math.floor(main_top / 25);
    let numRows = Math.floor(main_left / 25);

    let fruit_top = Math.floor(Math.random() * numCols) * 25
    let fruit_left = Math.floor(Math.random() * numRows) * 25

    fruit.style.top = fruit_top + "px"
    fruit.style.left = fruit_left + "px"
}

function collideWithElement(elm) {
    if (elm == "fruit") {
        moveRandomFruit()
        addSnake()
    }

    if (elm == "border" || elm == "snake") {
        console.log("Collided with " + elm)
        movement = "reset"
        let deathMessage = document.createElement("img")
        deathMessage.id = "death_message"
        deathMessage.src = "image/a10/snake_death.png"
        main.appendChild(deathMessage)
        deathMessage.addEventListener("click", resetGame)
    }
}

function addSnake() {
    scoreboard.innerHTML = "Score: " + ++score;
    let aSnake = document.createElement("div");
    aSnake.id = "snake"
    aSnake.className = "tail"
    aSnake.style.top = snake[snake.length - 1].style.top
    aSnake.style.left = snake[snake.length - 1].style.left
    snake.push(aSnake)
    main.appendChild(aSnake)
}

function resetGame() {
    if (document.querySelector("#death_message") != null) {
        main.removeChild(document.querySelector("#death_message"))
        highscore = highscore < score ? score : highscore;
        let highscore_box = document.getElementById("highscore")
        highscore_box.innerHTML = "Highscore: " + highscore

        for (let i = 0; i < snake.length; i++) {
            main.removeChild(snake[i])
        }
        score = 0
        scoreboard.innerHTML = "Score: 0"
        document.getElementById("attempts").innerHTML = "Atempts: " + ++numPlayed
        snake = []

        createNewGame()
    }
}

function createNewGame() {
    let newSnake = document.createElement("div")
    newSnake.id = "snake"

    let numCols = Math.floor(main_top / 25);
    let numRows = Math.floor(main_left / 25);

    let snake_top = Math.floor(Math.random() * numCols) * 25
    let snake_left = Math.floor(Math.random() * numRows) * 25

    newSnake.style.top = snake_top + "px"
    newSnake.style.left = snake_left + "px"

    snake.push(newSnake)
    main.appendChild(newSnake)
    moveRandomFruit()
    movement = undefined
}

document.body.addEventListener("keydown", (e) => {
    if (movement != "reset") {
        switch (e.key) {
            case "ArrowLeft":
            case "a":
                movement = "left"
                break;
            case "ArrowUp":
            case "w":
                movement = "up"
                break;
            case "ArrowRight":
            case "d":
                movement = "right"
                break;
            case "ArrowDown":
            case "s":
                movement = "down"
                break;
        }
    }
})

if (movement != "reset") {
    setInterval(moveSnake, 100)
}

document.getElementById("reset").addEventListener("click", resetGame)

document.addEventListener("collision", (e) => collideWithElement(e.element))