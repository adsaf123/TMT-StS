var warriorCards = {
    strike: generateCard(
        1,
        "js/warrior/cardsSkins/strike.png",
        "Deal 5 damage",
        function() {
            enemiesHandler.attackEnemy(1, 5)
        }
    ),
    defend: generateCard(
        1,
        "js/warrior/cardsSkins/defend.png",
        "Gain 5 block",
        function() {
            game.player.block += 5
        }
    )
}