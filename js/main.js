function init(){
	 game.renderer.renderSession.roundPixels = true;
}

function preload(){
	game.load.image('background', 'images/background.png');
	game.load.json('level:1', 'data/level01.json'); 
	game.load.image('ground', 'images/ground.png');
    game.load.image('grass:8x1', 'images/grass_8x1.png');
    game.load.image('grass:6x1', 'images/grass_6x1.png');
    game.load.image('grass:1x1', 'images/grass_1x1.png');
    game.load.image('grass:4x1', 'images/grass_4x1.png');
    game.load.image('grass:2x1', 'images/grass_2x1.png');
    game.load.image('hero', 'images/hero_stopped.png');
    game.load.audio('sfx:jump', 'audio/jump.wav');
    game.load.spritesheet('coin', 'images/coin_animated.png', 22, 22);
    game.load.audio('sfx:coin', 'audio/coin.wav');
    game.load.spritesheet('spider', 'images/spider.png', 42, 32);
    game.load.image('invisible-wall', 'images/invisible_wall.png');
    game.load.audio('sfx:stomp', 'audio/stomp.wav');
    game.load.image('icon:coin', 'images/coin_icon.png');
    game.load.image('font:numbers', 'images/numbers');
};

function create(){
	game.add.image(0, 0, 'background');
	loadLevel(game.cache.getJSON('level:1'));
	leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
	rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
    upKey.onDown.add(function(){
    jump();
    })
    sfxJump = game.add.audio('sfx:jump');
    sfxCoin = game.add.audio('sfx:coin');
    sfxStomp = game.add.audio('sfx:stomp');
    coinIcon = game.add.image(40, 0, 'icon:coin');
    hud = game.add.group();
    coinFont = game.add.retroFont('font:numbers', 20, 26, NUMBERS_STR, 6);
    hud.add(coinIcon);
    hud.position.set(10, 10);
    hud.add(coinScoreImg);
    coinScoreImg.anchor.set(1, 0.5);
    var NUMBERS_STR = "0123456789";
    console.log(NUMBERS_STR);
    var coinScoreImg = game.make.image(100 + coinIcon.width, coinIcon.height / 2, coinFont);
    console.log(coinScoreImg);

};

function update(){
	handleCollisions();
    handleInput();
    moveSpider();
};

function loadLevel(data){
	platforms = game.add.group();
    coins = game.add.group();
    spiders = game.add.group();
    enemyWalls = game.add.group();
    enemyWalls.visible = false;
	data.platforms.forEach(spawnPlatform, this);
	spawnCharacters({hero: data.hero, spiders: data.spiders});  
    data.coins.forEach(spawnCoin, this);
	game.physics.arcade.gravity.y = 1200;

	 
};

function spawnPlatform(platform) {
    game.add.sprite(platform.x, platform.y, platform.image);
    var sprite = platforms.create(platform.x, platform.y, platform.image);
    console.log(sprite);
    game.physics.enable(sprite);
    sprite.body.allowGravity = false;
    sprite.body.immovable = true;
     spawnEnemyWall(platform.x, platform.y, 'left');
    spawnEnemyWall(platform.x + sprite.width, platform.y, 'right');
};

function spawnCharacters(data){
	hero = game.add.sprite(data.hero.x, data.hero.y, 'hero');
	hero.anchor.set(0.5, 0.5);
	game.physics.enable(hero);
	hero.body.collideWorldBounds = true;
	game.physics.enable(hero);
      data.spiders.forEach(function (spider){
        var sprite = game.add.sprite(spider.x, spider.y, 'spider');
        spiders.add(sprite);
        sprite.anchor.set(0.5);
        // animation
        sprite.animations.add('crawl', [0, 1, 2], 8, true);
        sprite.animations.add('die', [0, 4, 0, 4, 0, 4, 3, 3, 3, 3, 3, 3], 12);
        sprite.animations.play('crawl');
        game.physics.enable(sprite);
        sprite.body.collideWorldBounds = true;
        sprite.body.velocity.x = 100;
})
};

function move(direction){
    hero.body.velocity.x = direction * 200;
 	if (hero.body.velocity.x < 0){
     hero.scale.x = -1;
    }
    else if (hero.body.velocity.x > 0) {
        hero.scale.x = 1;
    }
}

function handleInput(){
    if (leftKey.isDown) { 
        move(-1);
    }
    else if (rightKey.isDown) { 
    	move(1);
    }
     else {
        move(0);
	}
}

function handleCollisions(){
   game.physics.arcade.collide(hero, platforms);
   game.physics.arcade.overlap(hero, coins, onHeroVsCoin, null);
   game.physics.arcade.collide(spiders, platforms);
   game.physics.arcade.collide(spiders, enemyWalls);
   game.physics.arcade.overlap(hero, spiders, onHeroVsEnemy, null);
};

function jump(){
    var canJump = hero.body.touching.down;
    if (canJump) {
        hero.body.velocity.y = -600;
        sfxJump.play();
    }
    return canJump;
};

function spawnCoin(coin) {
    var sprite = coins.create(coin.x, coin.y, 'coin');
    sprite.anchor.set(0.5, 0.5);
    sprite.animations.add('rotate', [0, 1, 2, 1], 6, true); // 6fps, looped
    sprite.animations.play('rotate');
    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;
};

var coinPickupCount = 0;
console.log(coinPickupCount);

function onHeroVsCoin(hero, coin){
    coin.kill();
    sfxCoin.play();
    coinPickupCount++;
    coinFont.text = `x${this.coinPickupCount}`;
};

function spawnEnemyWall(x, y, side){
    var sprite = enemyWalls.create(x, y, 'invisible-wall');
    sprite.anchor.set(side === 'left' ? 1 : 0, 1);
    game.physics.enable(sprite);
    sprite.body.immovable = true;
    sprite.body.allowGravity = false;
}

function moveSpider(){
    spiders.forEach(function (spider){
        if (spider.body.touching.right || spider.body.blocked.right) {
            spider.body.velocity.x = -100; // turn left
        }
        else if (spider.body.touching.left || spider.body.blocked.left) {
            spider.body.velocity.x = 100;
        }
    })
}

function onHeroVsEnemy(hero, enemy){
    if (hero.body.velocity.y > 0) { // kill enemies when hero is falling
        hero.body.velocity.y = -200;
        die(enemy);
        sfxStomp.play(); 
    }
    else { // game over -> restart the game
        sfxStomp.play();
        game.state.restart();
    }
};

function die(spider) {
    spider.body.enable = false;
    spider.animations.play('die');
    spider.animations.play('die').onComplete.addOnce (function () {
        spider.kill();
    });
}

function spawnSpider(){
    spider = spiders.create(spider.x, spider.y, 'spider');
    spider.anchor.set(0.5);
    spider.animations.add('crawl', [0, 1, 2], 8, true);
    spider.animations.add('die', [0, 4, 0, 4, 0, 4, 3, 3, 3, 3, 3, 3], 1);
    spider.animations.play('crawl');

    // physic properties
    game.physics.enable(spider);
    spider.body.collideWorldBounds = true;
    spider.body.velocity.x = Spider.speed;
}

var game = new Phaser.Game(960, 600, Phaser.AUTO, 'game', {init: init, preload: preload, create: create, update: update});
