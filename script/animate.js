function animate(){ 
    ctx.clearRect(0,0, canvas.clientWidth, canvas.height)
    handleCircles()
    handleScore()
    handleParticles()
    requestAnimationFrame(animate)
}

animate()