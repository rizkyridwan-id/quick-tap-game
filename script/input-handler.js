canvas.addEventListener("mousedown", ({x, y}) => {
    mouse.x = x
    mouse.y = y
})

canvas.addEventListener("mouseup", ({x, y}) => {
    mouse.x = null
    mouse.y = null
})