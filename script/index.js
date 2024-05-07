const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

/**
 * CANVAS SETUP
 */
canvas.width = window.innerWidth
canvas.height = window.innerHeight

/**
 * GLOBAL VARS
 */
const color = {
    "GOLD": "#DEB841",
    "GREEN": "#44CF6C",
    "BLUE": "#3F84E5",
    "DANGER": "#B20D30",
    "GHOST": "rgba(251, 251, 255, 0.7)"
}
let circleList = []
let playerScore = 0
let mouse = {
    x: null,
    y: null
}

/**
 * USER DEFINED FUNCTIONS
 */
class Circle {
    constructor() {
        this.x = Math.random() * (canvas.width - 200) + 100
        this.y = Math.random() * (canvas.height - 200) + 100
        this.size = Math.random() * 50 + 15
        this.color = this._generateColor()
        this.score = this._calculateScore()
        this.isClicked = false

        this._regenerateRandPosition()
    }

    _generateColor() {
        const dangerCount = circleList.filter(it => it.color === color.DANGER).length

        if(dangerCount >= 2) {
            if(this.size <= 22) {
                return color.GOLD
            } else if (this.size <= 35) {
                return color.BLUE
            } else {
                const lastColor = [color.GREEN, color.GHOST]
                return lastColor[Math.round(Math.random())]
            } 
        }
        
        return color.DANGER
    }

    _calculateScore() {
        switch(this.color) {
            case color.DANGER: 
                return -50
            case color.GOLD: 
                return 100
            case color.GREEN:
                return 20
            case color.BLUE:
                return 30
            case color.GHOST:
                return -5
        }
    }

    _isCollideOrIn(cX, cY, cR) {
        const distX = cX - this.x
        const distY = cY - this.y
        const distance = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2))

        if(distance <= cR + this.size) {
           return true
        }
    }

    _regenerateRandPosition() {
        let isCollide;
        for(let i =0 ;i< circleList.length; i++) {
            const {x, y, size} = circleList[i]
            isCollide = this._isCollideOrIn(x, y, size + 30)
            if(isCollide) {
                break;
            }
        }
        if(isCollide) {
            this.x = Math.random() * (canvas.width - 200) + 100
            this.y = Math.random() * (canvas.height - 200) + 100
            this._regenerateRandPosition()
        } 
    }

    _addResizeAnimation() {
        this.counter ||= 0
        if(this.counter % 60 === 0) {
            this.sizeModifier = 0.07
            this.counter = 0
        } else if (this.counter % 30 === 0) {
            this.sizeModifier = -0.07
        }
        this.size += this.sizeModifier
        this.counter++
    }

    update() {
        this._addResizeAnimation()
        if(this._isCollideOrIn(mouse.x, mouse.y, 1)) {
            this.isClicked = true
        }
    }

    draw() {
        ctx.beginPath()
        ctx.fillStyle=this.color
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.closePath()
    }
}

function handleCircles() {
    for(let i=0; i < circleList.length; i++) {
        circleList[i].update()
        circleList[i].draw()

        if(circleList[i].isClicked) {
            playerScore += circleList[i].score
            circleList.splice(i, 1)
            circleList.push(new Circle())
            i--
        }
    }
}

function handleScore() {
    ctx.fillStyle="white"
    ctx.font = "30px arial"
    ctx.fillText("Score: "+playerScore, canvas.width - 200, 50)
}

/**
 * INIT
 */
let maxCircles = 15
for(let i =0; i< maxCircles; i++) {
    circleList.push(new Circle())
}