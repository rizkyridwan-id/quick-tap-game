function animate(){ 
    ctx.clearRect(0,0, canvas.clientWidth, canvas.height)
    handleCircles()
    handleScore()
    requestAnimationFrame(animate)
}

animate()