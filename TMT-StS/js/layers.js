/////////////MAIN OBJECT/////////////////

var game = {
    playerTurn: true,
    difficulty: 0,

    enemies: {
        active: 1,
        1: {
            maxHP: 12,
            HP: 12,
        }
    },
    player: {
        character: "warrior",
        maxHP: 100,
        HP: 100,
        block: 0,
        energy: 3,
        maxEnergy: 3,
        drawPerTurn: 5,
    },

    drawPile: [
        ...Array.from({length: 4}, () => ({...warriorCards.strike})),
        ...Array.from({length: 4}, () => ({...warriorCards.defend}))
    ],
    discardPile: [],
    hand: []

}

/////////ENERGY///////////////////////////////

var energyParticle = {
    x: 100,
    y: 300,
    height: 50,
    width: 50,
    time: 1e10,
    speed: 0,
    image: "js/warrior/energy.png",
    text: "",
    update() {
        this.text = `<h1 style="color: #FF0000">${game.player.energy}/${game.player.maxEnergy}</h1>`
    }
}

makeParticles(energyParticle)

////////////GAME SCENE//////////////////////////////////

var getCharacterImage = function() {
    return "js/warrior/sprite.png"
}

var getEnemyImage = function() {
    return "js/enemies/bird.png"
}

addLayer("game-scene", {
    tabFormat: [
        ["row", [
            ["column", [
                ["display-image", getCharacterImage()],
                ["bar", "playerHP"]
            ]],
            ["blank", ["100px", "1px"]],
            ["column", [
                ["display-image", getEnemyImage()],
                ["bar", "enemyHP"]
            ]]
        ]],
        ["blank", "300px"]
    ],

    bars: {
        "playerHP": {
            direction: RIGHT,
            width: 500,
            height: 50,
            progress() {
                return game.player.HP / game.player.maxHP
            },
            fillStyle: {
                "background-color": "#FF0000"
            },
            display() {
                return `${game.player.HP}/${game.player.maxHP} HP, ${game.player.block} Block`
            }
        },

        "enemyHP": {
            direction: RIGHT,
            width: 500,
            height: 50,
            progress() {
                return game.enemies[1].HP / game.enemies[1].maxHP
            },
            fillStyle: {
                "background-color": "#FF0000"
            },
            display() {
                return `${game.enemies[1].HP}/${game.enemies[1].maxHP}`
            }
        }
    }
})

///////////ROUND HANDLER/////////////

var deckHandler = {
    shuffleDiscardPile() {
        game.drawPile = game.drawPile.concat(game.discardPile)
        game.drawPile = deckHandler.shuffleFunction(game.drawPile)

    },

    shuffleFunction(array) {
        let currentIndex = array.length,  randomIndex;
      
        while (currentIndex != 0) {
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;
      
          [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
      
        return array;
    }
}

var roundHandler = {
    beginRound() {
        game.playerTurn = true
        game.player.energy = game.player.maxEnergy
        
        for (var i = 0; i < game.player.drawPerTurn; i++) {
            if (!game.drawPile.length) {
                deckHandler.shuffleDiscardPile()
            }
            game.hand.push(game.drawPile[0])
            game.drawPile[0].x = 400 + i * 150
            spawnCard(game.drawPile[0])
            particles[particleID-1].handID = i;
            game.drawPile = game.drawPile.slice(1)
        }
    },

    endRound(withTurn) {
        game.playerTurn = false
        game.player.energy = 0
        game.hand.forEach((card) => {game.discardPile.push(card)})
        clearParticles((p) => p.handID != undefined)
        if (withTurn) {enemiesHandler.enemyTurn()}
        roundHandler.beginRound()

    }
}

var gameHandler = {
    increaseDifficulty(diff) {
        game.difficulty += diff
    }
}

var turnParticle = {
    x: 100,
    y: 200,
    height: 50,
    width: 200,
    time: 1e10,
    speed: 0,
    image: "js/warrior/turnButton.png",
    text: "End Turn",
    update() {
        this.text = game.playerTurn ? "End Turn" : "Enemy Turn"
    },
    onClick() {
        game.playerTurn ? roundHandler.endRound(true) : undefined;
    }
}

makeParticles(turnParticle)

var playerHandler = {
    dealDamage(dmg) {
        console.log("damaging for ", dmg)
        if (dmg >= game.player.block) {
            dmg -= game.player.block
            game.player.block = 0
            game.player.HP -= dmg
        } else {
            game.player.block -= dmg
        }
    }
}

var enemiesHandler = {
    attackEnemy(id, damage) {
        game.enemies[id].HP -= damage
        if (game.enemies[id].HP <= 0) {
            game.enemies.active -= 1
            if (game.enemies.active == 0) {
                gameHandler.increaseDifficulty(1)
                enemiesHandler.spawnEnemies(1)
                roundHandler.endRound(false)
            }
        }
    },
    
    spawnEnemies(num) {
        for (var i = 1; i <= num; i++) {
            game.enemies[i] = {
                maxHP: 12 * (1.2 ** game.difficulty),
                HP: 12 * (1.2 ** game.difficulty)
            }
        }
        game.enemies.active += num
    },

    enemyTurn() {
        for (const [key, value] of Object.entries(game.enemies)) {
            if (key != "active") {
                playerHandler.dealDamage(5 * (1.2 ** game.difficulty))
            }
        }
    }
}

deckHandler.shuffleDiscardPile()
roundHandler.beginRound()   