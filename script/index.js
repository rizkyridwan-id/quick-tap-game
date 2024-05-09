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
    "GHOST": "rgba(251, 251, 255, 0.2)"
}
let circleList = []
let particleList = []
let playerScore = 0
let mouse = {
    x: null,
    y: null
}

/**
 * USER DEFINED FUNCTIONS
 */
class Particle {
    constructor(x, y, color) {
        this.x =x
        this.y =y
        this.size = Math.random() * 6 + 4
        this.vX = Math.random() * 4-2
        this.vY = Math.random() * 4-2
        this.color = color
    }

    update() {
        this.x += this.vX
        this.y += this.vY
        if(this.size > 0.2) this.size -= 0.2
    }

    draw() {
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
    }
}

class Circle {
    constructor() {
        this.x = this._randomPoinInCanvas()
        this.y = this._randomPoinInCanvas(true)
        this.vX = Math.random() * 3 - 1.5
        this.vY = Math.random() * 3 - 1.5

        this.size = Math.random() * 50 + 15
        this.sizeModifier = 0

        this.color = this._generateColor()
        this.score = this._calculateScore()
        this.ttl = this._generateTTL()
        this.isClicked = false
    }

    _randomPoinInCanvas(isVertical = false) {
        const key = isVertical ? "height" : "width"
        return Math.random() * (canvas[key] - 200) + 100
    }

    _generateColor() {
        const dangerCount = circleList.filter(it => it.color === color.DANGER).length
        const dangerRandom = Math.floor(Math.random() * 2 + 1)
        if(dangerCount >= dangerRandom) {
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

    _generateTTL() {
        if(this.color === color.GHOST) {
            const randLifetime = Math.random() * 5000 + 5000
            return Date.now() + randLifetime
        }
    }

    _isCollideOrIn(cX, cY, cR) {
        const distance = this._dist(cX, cY)

        if(distance <= cR + this.size) {
           return true
        }
    }

    _dist(x, y) {
        return Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2))
    }

    _regenerateRandPosition() {
        let isCollide;
        for(let i =0 ;i< circleList.length; i++) {
            const {x, y, size} = circleList[i]
            isCollide = this._isCollideOrIn(x, y, size + 30)
            if(isCollide) {
                this.x = this._randomPoinInCanvas()
                this.y = this._randomPoinInCanvas(true)
                break;
            }
        }
        return isCollide && this._regenerateRandPosition() 
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

    _lineCircle(x1, y1, x2, y2) {
        const inside1 = this._pointCircle(x1, y1);
        const inside2 = this._pointCircle(x2, y2);
        if(inside1 || inside2) return true

        let distX = x1 - x2;
        let distY = y1 - y2;
        const lineLen = Math.sqrt( Math.pow(distX, 2) + Math.pow(distY, 2) );

        const dot= ( ((this.x - x1) * (x2 - x1)) + ((this.y - y1) * (y2 - y1)) ) / Math.pow(lineLen, 2)
        
        const closestX = x1 + (dot * (x2 - x1))
        const closestY = y1 + (dot * (y2 - y1))

        // const onSegment = this._linePoint(x1, y1, x2, y2, closestX, closestY)
        // if(!onSegment) return false

        distX = closestX - this.x
        distY = closestY - this.y
        const distance = Math.sqrt( Math.pow(distX, 2) + Math.pow(distY, 2) );

        if(distance <= this.size ) {
            return true
        }
    }

    _pointCircle(x, y) {
        const distance = this._dist(x, y);
        if(distance <= this.size) {
            return true
        }
    }

    _linePoint(x1, y1, x2, y2, px, py) {
        const d1 = this._dist(x1, y1)
        const d2 = this._dist(x2, y2)

        const lineLength =  Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
        const buffer = 0.1

        if (d1+d2 >= lineLength-buffer && d1+d2 <= lineLength+buffer) {
            return true;
        }
    }

    _handleWallCollision() {
        const upWallCollide = this._lineCircle(0, 0, canvas.width, 0)
        const bottomWallCollide = this._lineCircle(0, canvas.height, canvas.width, canvas.height)
        if(upWallCollide || bottomWallCollide) {
            this.vY *= -1
        }

        const rightWallCollide = this._lineCircle(canvas.width, 0, canvas.width, canvas.height)
        const leftWallCollide = this._lineCircle(0, 0, 0, canvas.height)
        if(rightWallCollide || leftWallCollide ) {
            this.vX *= -1
        }
    }

    _handleBallsCollision() {
        for(let i = 0; i < circleList.length;i++ ) {
            const {x, y, size, color: cColor} = circleList[i]

            if(this.color === color.GHOST) {
                break;
            }
            if(cColor === color.GHOST) {
                continue;
            }

            const isCollide = this._isCollideOrIn(x, y, size)
            if(isCollide && (this.x != x || this.y != y)) {
                
                if(this.x < x) {
                    this.vX = -this.vX
                }

                if(this.x > x) {
                    this.vX = Math.abs(this.vX)
                }

                if(this.y > y) {
                    this.vY = Math.abs(this.vY)
                }

                if(this.y < y) {
                    this.vY = -this.vY
                }

                // feature for ghost
                // if(this.y < y) {
                //     this.vY *= this.vY > 0 ? -1 : 1
                //     circleList[i].vY *= circleList[i].vY > 0 ? -1 : 1
                // }
                // if(this.y > y) {
                //     this.vY *= this.vY < 0 ? -1 : 1
                //     circleList[i].vY *= circleList[i].vY < 0 ? -1 : 1
                // }
            }
        }
    }

    _handleGhostDisappearance() {
        if(this.color === color.GHOST && this.ttl < Date.now() && this.sizeModifier === 0) {
            this.sizeModifier = -1
        }
    }

    update() {
        this.x += this.vX
        this.y += this.vY
        
        this._handleWallCollision()
        this._handleBallsCollision()
        this._handleGhostDisappearance()

        if(this._isCollideOrIn(mouse.x, mouse.y, 1)) {
            this.isClicked = true
        }

        const modifiedSize = this.size + this.sizeModifier
        this.size = modifiedSize >= 0.1 
            ? modifiedSize
            : 0.1
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
    const normalCircle = circleList.filter(it => it.color !== color.GHOST)
    const ghostCircle = circleList.filter(it => it.color === color.GHOST)
    circleList = [...normalCircle, ...ghostCircle]
    
    for(let i=0; i < circleList.length; i++) {
        circleList[i].update()
        circleList[i].draw()

        if(circleList[i].isClicked) {
            playerScore += circleList[i].score
            circleList[i].score = 0
            circleList[i].sizeModifier = -(circleList[i].size / 2)
         
            particleList.push(new Particle(circleList[i].x, circleList[i].y, circleList[i].color))
        }

        if(circleList[i].size === 0.1) {
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

function handleParticles() {
    for(i = 0; i < particleList.length; i++) {
        particleList[i].update()
        particleList[i].draw()
        if(particleList[i].size <= 0.2) {
            particleList.splice(i, 1)
            i--
        }
    }
}

/**
 * INIT
 */
let maxCircles = 10
for(let i =0; i< maxCircles; i++) {
    circleList.push(new Circle())
}