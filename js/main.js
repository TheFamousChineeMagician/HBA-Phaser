function init(){
	
}

function preload(){
	game.load.image('background', 'images/background.png');
	game.load.json('level:1', 'data/level01.json'); 
	game.load.image('ground', 'images/ground.png');
    game.load.image('grass:8x1', 'images/grass_8x1.png');
    game.load.image('grass:6x1', 'images/grass_6x1.png');
    game.load.image('grass:1x1', 'images/grass_1x1.png');

     game.load.image('hero', 'images/hero_stopped.png');
};

function create(){
	game.add.image(0, 0, 'background');
	loadLevel(this.game.cache.getJSON('level:1'));
}

function update(){

}

function loadLevel(data) {
	console.log(data);
	 data.platforms.forEach(spawnPlatform, this);
	 spawnCharacters({hero: data.hero});
};

function spawnPlatform(platform) {
    game.add.sprite(platform.x, platform.y, platform.image);
};

//Create a game state
var game = new Phaser.Game(960, 600, Phaser.AUTO, 'game', {init: init, preload: preload, create: create, update: update});
