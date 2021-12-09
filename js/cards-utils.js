var generateCard = function(name, energy, skin, text, evokeFunction) {
    return {
        isCard: true,
        dir: 0,
        name: name,
        time: 1e10,
        x: 500,
        y: 500,
        speed: 0,
        height: 300,
        width: 150,

        handID: -1,
        image: skin,
        textParticle: {
            isText: true,
            dir: 0,
            handID: -1,
            time: 1e10,
            image: "",
            text: text,
            xRel: 0,
            yRel: 150,
            speed: 0,
            height: 300,
            width: 150,
        },

        energy: energy,
        
        onClick() {
            if (game.player.energy >= energy && this.time >= 2)
            {
                game.player.energy -= energy
                this.time = .3
                this.textParticle.time = .3
                game.discardPile.push(game.hand.find(v => v.handID == this.handID))
                game.hand = game.hand.filter((v, i) => v.handID != this.handID)
                evokeFunction()
            }
        },

        update() {
            this.textParticle.x = this.x + this.textParticle.xRel
            this.textParticle.y = this.y + this.textParticle.yRel
        }
    }
}

var spawnCard = function(card) {
    makeParticles(card)
    makeParticles(card.textParticle)
    particles[particleID-1].textParticle = particles[particleID]
}