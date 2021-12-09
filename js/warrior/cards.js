var warriorCards = {
    strike: generateCard(
        "strike",
        1,
        "js/warrior/cardsSkins/strike.png",
        "Costs 1 energy\nDeal 5 damage",
        function() {
            enemiesHandler.attackEnemy(1, 5)
        }
    ),
    defend: generateCard(
        "defend",
        1,
        "js/warrior/cardsSkins/defend.png",
        "Costs 1 energy\nGain 5 block",
        function() {
            game.player.block += 5
        }
    ),
    dualwield: generateCard(
        "dualwield",
        1,
        "js/warrior/cardsSkins/dualwield.png",
        "Costs 1 energy\nDeal 3 damage\nGain 3 block",
        function() {
            enemiesHandler.attackEnemy(1, 3)
            game.player.block += 3
        }
    ),
    timetravel: generateCard(
        "timetravel",
        3,
        "js/warrior/cardsSkins/timetravel.png",
        "Consts 3 energy\nDecrease difficulty by 1\n(can't be lower than 0)",
        function() {
            game.difficulty = Math.max(0, game.difficulty - 1)
        }
    )
}