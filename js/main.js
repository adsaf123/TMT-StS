/////////////MAIN OBJECT/////////////////

var game = {
    playerTurn: true,
    difficulty: 0,
    relics: [],

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
                return `${format(game.player.HP)}/${format(game.player.maxHP)} HP, ${format(game.player.block)} Block`
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
                return `${format(game.enemies[1].HP)}/${format(game.enemies[1].maxHP)}`
            }
        }
    }
})

///////////ROUND HANDLER/////////////

var deckHandler = {
    shuffleDiscardPile() {
        game.drawPile = game.drawPile.concat(game.discardPile)
        game.drawPile = deckHandler.shuffleFunction(game.drawPile)
        game.discardPile = []

    },

    shuffleHand() {
        game.drawPile = game.drawPile.concat(game.hand)
        game.drawPile = deckHandler.shuffleFunction(game.drawPile)
        clearParticles((p) => p.handID != undefined)
        game.hand = []
    },

    shuffleFunction(array) {
        let currentIndex = array.length,  randomIndex;
      
        while (currentIndex != 0) {
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;
      
          [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
      
        return array;
    },

    generateCardList() {
        var list = []
        for (const card of game.discardPile.concat(game.drawPile).concat(game.hand)) {
            list.push(["display-text", card.name])
        }
        return list.sort()
    },

    drawHand() {
        for (var i = 0; i < game.player.drawPerTurn; i++) {
            if (!game.drawPile.length) {
                deckHandler.shuffleDiscardPile()
            }
            game.hand.push(game.drawPile[0])
            game.drawPile[0].x = 400 + i * 150
            spawnCard(game.drawPile[0])
            game.hand[i].handID = i
            game.hand[i].textParticle.handID = i
            particles[particleID-1].handID = i
            particles[particleID].handID = i
            game.drawPile = game.drawPile.slice(1)
        }
    }
}

var roundHandler = {
    beginRound() {
        game.playerTurn = true
        game.player.energy = game.player.maxEnergy
        deckHandler.drawHand()
    },

    endRound(withTurn) {
        game.playerTurn = false
        game.player.energy = 0
        game.hand.forEach((card) => {game.discardPile.push(card)})
        game.hand = []
        clearParticles((p) => p.handID != undefined)
        if (withTurn) {enemiesHandler.enemyTurn()}
        roundHandler.beginRound()
    }
}

var particlesTmp = {}

var gameHandler = {
    increaseDifficulty(diff) {
        game.difficulty += diff
    },

    switchTabs() {
        if(player.navTab == "game-scene") {
            particlesTmp = {...particles}
            clearParticles()

            player.navTab = "deck-management"
        } else {
            for (const particle in particlesTmp) {
                if (particlesTmp[particle].isCard)
                    spawnCard({...particlesTmp[particle]})
                else if (!particlesTmp[particle].isText)
                    makeParticles(particlesTmp[particle])
            }
            particlesTmp = {}
            player.navTab = "game-scene"
        }
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
        if (dmg >= game.player.block) {
            dmg -= game.player.block
            game.player.block = 0
            game.player.HP -= dmg
        } else {
            game.player.block -= dmg
        }
        if (game.player.HP <= 0) {
            tmp.gameEnded = true
            clearParticles()
        }
    }
}

var enemiesHandler = {
    attackEnemy(id, damage) {
        game.enemies[id].HP -= damage
        if (game.enemies[id].HP <= 0) {
            game.enemies.active -= 1
            if (game.enemies.active == 0) {
                player.points = player.points.add(1)
                gameHandler.increaseDifficulty(1)
                enemiesHandler.spawnEnemies(1)
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

var randomProperty = function (obj) {
    var keys = Object.keys(obj);
    return obj[keys[ keys.length * Math.random() << 0]];
};

addLayer("deck-management", {
    startData() {
        return {
            unlocked: true
        }
    },

    row:"side",
    symbol: "D",

    tabFormat: [
        ["row", [
            ["clickable", "buyCard"],
            ["clickable", "deleteCard"],
            ["clickable", "buyRelic"],
        ]],
        "blank",
        ["display-text", "Your Deck:"],
        ["column", deckHandler.generateCardList]
    ],

    clickables: {
        "buyCard": {
            display() {
                return "Add new random card to your deck for 3 scraps"
            },

            canClick() {
                return player.points.gte(3)
            },

            onClick() {
                player.points = player.points.sub(3)
                game.discardPile.push({...randomProperty(warriorCards)})
            }
        },

        "deleteCard": {
            display() {
                return "Delete card from your deck for 5 scraps, reshuffles deck"
            },

            canClick() {
                return player.points.gte(5)
            },

            onClick() {
                var cardName = prompt("Write name of card to delete, wrong name will do nothing.")
                var card = game.drawPile.concat(game.discardPile).concat(game.hand).findIndex(element => element.name == cardName)
                if (card == -1)
                    return
                player.points = player.points.sub(5)
                deckHandler.shuffleDiscardPile()
                deckHandler.shuffleHand()
                var index = game.drawPile.findIndex(element => element.name == cardName)
                game.drawPile = game.drawPile.filter((v, i) => i != index)
                deckHandler.drawHand()
            }
        },
        
        "buyRelic": {
            display() {
                return "Gain new relic for 10 scraps"
            },

            canClick() {
                return false
                return player.points.gte(10)
            },

            onClick() {
                player.points = player.points.sub(10)
                //TODO
            }

        }
    }
})

deckHandler.shuffleDiscardPile()
roundHandler.beginRound()   