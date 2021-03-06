import Paiton from "../js/sprites/paiton.js";
import Bowser from "../js/sprites/bowser.js";
export default class Bootloader extends Phaser.Scene {
  constructor() {
    super("Bootloader");
    this.paiton = null;
    this.bowser = null;
    this.ball = null;
    this.coin = null;
    this.gamePaused = false;

    this.intentos = localStorage.getItem("vidas");
    this.movil = false;
  }
  preload() {
    this.load.path = "../img/";
    this.load.tilemapTiledJSON("map", "pepito.json");
    this.load.image("tiles", "si-bicubic.png");
    this.load.image("coin", "lovelove.png");
    this.load.image("pause", "pause-tab.png");
    this.load.image("configure", "settings-tab.png");
    this.load.image("lose", "lose-tab.png");
    this.load.image("nolife", "nolife-tab.png");
    this.load.image("win", "win-tab.png");

    this.load.atlas("fire", "fire.png", "fire.json");
    this.load.atlas("ball", "ball.png", "ball.json");

    this.load.atlas("controls", "controls.png", "controls.json");
    this.load.atlas(
      "controls-design",
      "controls-design.png",
      "controls-design.json"
    );
    this.load.atlas("flares", "flares.png", "flares.json");

    this.paiton = new Paiton(this, 39, 400);
    this.paiton.preload();

    this.bowser = new Bowser(this, 5250, 100);
    this.bowser.preload();
  }

  create() {
    this.cameras.main.backgroundColor.setFromRGB(81, 209, 246);
    this.cameras.main.fadeIn(500, 0, 0, 0);
    this.mapa = this.make.tilemap({ key: "map" });
    this.cameras.main.setBounds(
      0,
      0,
      this.mapa.widthInPixels,
      this.mapa.heightInPixels
    );
    this.tilesets = this.mapa.addTilesetImage("si-bicubic", "tiles");
    this.foraje = this.mapa.createDynamicLayer(
      "complementario",
      this.tilesets,
      0,
      0
    );
    this.foraje.setCollisionByProperty({ final: true });
    this.solidos = this.mapa.createDynamicLayer("solidos", this.tilesets, 0, 0);
    this.solidos.setCollisionByProperty({ solido: true });

    this.coinLayer = this.mapa.getObjectLayer("CoinLayer").objects;

    this.coin = this.physics.add.staticGroup();

    this.coinLayer.forEach((object) => {
      let obj = this.coin.create(object.x, object.y, "coin");
      obj.setScale(object.width / 500, object.height / 500);
      obj.body.width = 25;
      obj.body.height = 30;
      obj.body.position = {
        x: obj.body.position.x + 230,
        y: obj.body.position.y + 190,
      };
    });

    this.paiton.create();
    this.mar = this.mapa.createDynamicLayer("mar", this.tilesets, 0, 0);
    this.mar.setCollisionByProperty({ mar: true });

    this.physics.add.collider(
      this.paiton.paiton,
      this.mar,
      this.deathPaiton,
      null,
      this
    );

    this.physics.add.collider(
      this.paiton.paiton,
      this.foraje,
      this.win,
      null,
      this
    );
    this.physics.add.collider(this.paiton.paiton, this.solidos);
    this.physics.add.collider(
      this.paiton.paiton,
      this.coin,
      this.paiton.collectCoin,
      null,
      this
    );
    this.cameras.main.startFollow(this.paiton.paiton, true, 50, 50, 50, 200);

    this.bowser.create();
    this.physics.add.collider(this.bowser.bowser, this.solidos);
    this.physics.add.collider(
      this.paiton.paiton,
      this.bowser.bowser,
      this.paiton.reaccionar
    );
    this.pause = this.add
      .image(600, 70, "controls-design", "64.png")
      .setInteractive()
      .setScale(0.5, 0.5)
      .on("pointerdown", () => this.pauseall())
      .on("pointerover", () => (this.pause.alpha = 0.8))
      .on("pointerout", () => (this.pause.alpha = 1))
      .setScrollFactor(0);

    this.configuring = false;

    this.menupause = new Phaser.GameObjects.Group();
    this.resume = this.add
      .image(600, 300, "pause")
      .setScale(0.6, 0.6)
      .setScrollFactor(0);
    this.exit = this.add
      .image(840, 140, "controls-design", "65.png")
      .setInteractive()
      .setScale(0.4, 0.4)
      .setDepth(40000)
      .on("pointerdown", () => this.resumeall(this.configuring ? 2 : 1))
      .on("pointerover", () => (this.exit.alpha = 0.8))
      .on("pointerout", () => (this.exit.alpha = 1))
      .setScrollFactor(0);
    this.play = this.add
      .image(466, 390, "controls-design", "60.png")
      .setInteractive()
      .setScale(0.6, 0.6)
      .on("pointerdown", () => this.resumeall(0))
      .on("pointerover", () => (this.play.alpha = 0.8))
      .on("pointerout", () => (this.play.alpha = 1))
      .setScrollFactor(0);
    this.replay = this.add
      .image(599, 390, "controls-design", "61.png")
      .setInteractive()
      .setScale(0.6, 0.6)
      .on("pointerdown", () => this.replayall())
      .on("pointerover", () => (this.replay.alpha = 0.8))
      .on("pointerout", () => (this.replay.alpha = 1))
      .setScrollFactor(0);
    this.menu = this.add
      .image(732, 390, "controls-design", "63.png")
      .setInteractive()
      .setScale(0.6, 0.6)
      .on("pointerdown", () => this.gomenu())
      .on("pointerover", () => (this.menu.alpha = 0.8))
      .on("pointerout", () => (this.menu.alpha = 1))
      .setScrollFactor(0);
    this.settings = this.add
      .image(360, 140, "controls-design", "56.png")
      .setInteractive()
      .setScale(0.6, 0.6)
      .on("pointerdown", () => this.opensettings())
      .on("pointerover", () => (this.settings.alpha = 0.8))
      .on("pointerout", () => (this.settings.alpha = 1))
      .setScrollFactor(0);
    this.menupause
      .add(this.resume)
      .add(this.play)
      .add(this.replay)
      .add(this.menu)
      .add(this.settings)
      .add(this.exit)
      .setVisible(false);
    this.menudeath = new Phaser.GameObjects.Group();
    this.lose = this.add
      .image(600, 300, "lose")
      .setScale(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(400);
    this.nolife = this.add
      .image(600, 300, "nolife")
      .setScale(0.5, 0.5)
      .setScrollFactor(0);
    this.menudeath
      .add(this.lose)
      .add(this.nolife)
      .add(this.replay)
      .add(this.menu)
      .setVisible(false);

    this.menuWin = new Phaser.GameObjects.Group();
    this.winer = this.add
      .image(600, 300, "win")
      .setScale(0.5, 0.5)
      .setScrollFactor(0);

    this.replayWin = this.add
      .image(600, 470, "controls-design", "61.png")
      .setInteractive()
      .setScale(0.4, 0.4)
      .on("pointerdown", () => this.replayall(true))
      .on("pointerover", () => (this.replayWin.alpha = 0.8))
      .on("pointerout", () => (this.replayWin.alpha = 1))
      .setScrollFactor(0);
    this.menuWin.add(this.winer).add(this.replayWin).setVisible(false);

    this.menusettings = new Phaser.GameObjects.Group();
    this.configure = this.add
      .image(600, 300, "configure")
      .setScale(0.6, 0.6)
      .setScrollFactor(0);
    this.passmovil = this.add
      .image(700, 280, "controls-design", this.movil ? "59.png" : "53.png")
      .setInteractive()
      .setScale(0.8, 0.8)
      .setScrollFactor(0)
      .on("pointerdown", () => this.switchmovil())
      .on("pointerover", () => (this.passmovil.alpha = 0.8))
      .on("pointerout", () => (this.passmovil.alpha = 1));

    this.initialkeys = localStorage.getItem("keys").split(",");
    this.initialkeys.forEach((v, i) => {
      this.initialkeys[i] = String.fromCharCode(v);
    });

    this.change = [];
    for (let i = 0; i < 5; i++) {
      this.change.push(
        this.add
          .image(750, 355 + i * 29.4, "controls", "button-horizontal-0.png")
          .setInteractive()
          .setScale(2.5, 0.8)
          .setScrollFactor(0)
          .on("pointerdown", () => this.changeKey(0 + i * 2))
          .on("pointerover", () => (this.change[0 + i * 2].alpha = 0.8))
          .on("pointerout", () => (this.change[0 + i * 2].alpha = 1))
      );
      this.change.push(
        this.add
          .text(700, 345 + i * 29.4, this.initialkeys[i], {
            fontFamily: "Comic Sans MS",
            fontSize: "15px",
            fill: "#fce7b2",
          })
          .setScrollFactor(0)
      );
    }
    this.change.forEach((e) => {
      this.menusettings.add(e);
    });
    this.menusettings
      .add(this.configure)
      .add(this.passmovil)
      .add(this.exit)
      .setVisible(false);

    this.anterior = -1;
    this.killed = false;
  }

  win = () => {
    this.gamePaused = true;
    this.pause.setVisible(false);
    this.input.stopPropagation();
    this.menuWin.setVisible(true);
    this.killed = true;
  };
  deathPaiton = (kind = true) => {
    if (!this.killed) {
      if (kind) {
        this.paiton.lifebar.visible = false;
        this.paiton.powerbar.visible = false;
        this.paiton.vida.visible = false;
        this.paiton.energia.visible = false;
        this.paiton.lifebol.visible = false;
        this.paiton.powerbol.visible = false;
      }
      this.intentos = localStorage.getItem("vidas");
      localStorage.setItem("vidas", this.intentos - 1);
      if (this.intentos - 1 == 0) {
        this.nolife.setDepth(400);
        this.lose.setDepth(0);
        this.menu.setPosition(600, 440).setDepth(500);
        this.replay.setDepth(0);
      } else {
        this.replay.setPosition(520, 440).setDepth(500);
        this.menu.setPosition(680, 440).setDepth(500);
      }
      this.gamePaused = true;
      this.pause.setVisible(false);
      this.input.stopPropagation();

      this.menudeath.setVisible(true);
      this.killed = true;
    }
  };
  pauseall() {
    this.pause.setScale(0.4, 0.4);
    setTimeout(() => {
      this.pause.setScale(0.5, 0.5);
    }, 100);
    this.gamePaused = true;
    this.input.stopPropagation();
    this.menupause.setVisible(true);
  }
  resumeall(button) {
    button == 0 ? this.play.setScale(0.5, 0.5) : this.exit.setScale(0.3, 0.3);
    setTimeout(() => {
      switch (button) {
        case 0:
          this.play.setScale(0.6, 0.6);
          this.gamePaused = false;
          this.menupause.setVisible(false);
          break;
        case 1:
          this.exit.setScale(0.4, 0.4);
          this.gamePaused = false;
          this.menupause.setVisible(false);
          break;
        case 2:
          this.configuring = false;
          this.exit.setScale(0.4, 0.4);
          this.gamePaused = false;
          this.menupause.setVisible(false);
          this.menusettings.setVisible(false);
      }
    }, 100);
  }
  replayall(tipe = false) {
    if (tipe) {
      this.replayWin.setScale(0.3, 0.3);
      setTimeout(() => {
        this.replayWin.setScale(0.4, 0.4);
      }, 100);
    }
    this.replay.setScale(0.5, 0.5);
    setTimeout(() => {
      this.replay.setScale(0.6, 0.6);
    }, 100);

    this.cameras.main.fade(500, 0, 0, 0);
    setTimeout(() => {
      this.scene.switch("Loading");
      this.scene.get("Loading").cameras.main.fadeIn(500, 0, 0, 0);
      this.scene.get("Loading").scene.scene.origin = 1;
      this.scene.get("Loading").scene.scene.decideswitch();
    }, 500);
  }
  gomenu() {
    this.menu.setScale(0.5, 0.5);
    setTimeout(() => {
      this.menu.setScale(0.6, 0.6);
      this.cameras.main.fade(500, 0, 0, 0);
      this.menupause.setVisible(false);
      this.scene.switch("Main");
      this.scene.get("Main").cameras.main.fadeIn(500, 0, 0, 0);

      if (this.intentos - 1 == 0) {
        this.scene.get("Main").scene.scene.origin = 0;
        this.scene.get("Main").scene.scene.word.setText("Iniciar Juego");
      } else {
        this.scene.get("Main").scene.scene.origin = 1;
        this.scene.get("Main").scene.scene.word.setText("Reanudar Juego");
      }
      this.scene.get("Main").scene.scene.getlife();
    }, 100);
  }
  opensettings() {
    this.configuring = true;
    this.settings.setScale(0.5, 0.5);
    setTimeout(() => {
      this.settings.setScale(0.6, 0.6);
      this.menusettings.setVisible(true);
    }, 100);
  }
  switchmovil = () => {
    this.passmovil.setScale(0.7, 0.7);
    setTimeout(() => {
      this.passmovil.setScale(0.8, 0.8);
    }, 30);
    if (!this.movil) {
      this.movil = true;
      this.passmovil.setFrame("59.png");
    } else {
      this.movil = false;
      this.passmovil.setFrame("53.png");
    }
    console.log(this.movil);
  };

  changeKey(index) {
    if (this.anterior != -1) this.change[this.anterior].setTintFill(0, 0, 0, 0);
    this.change[index].setTintFill(255, 255, 255, 255);
    this.anterior = index;

    const enter = new Promise((resolve, reject) => {
      this.input.keyboard.on("keydown", (e) => {
        if (this.anterior != index) reject();
        resolve([e.key.toUpperCase(), e.keyCode]);
      });
    });
    enter
      .then((result) => {
        let keys = localStorage.getItem("keys").split(",");
        keys[index / 2] = result[1].toString();
        localStorage.setItem("keys", keys);
        this.change[index + 1].setText(result[0]);
        this.change[index].setTintFill(0, 0, 0, 0);
      })
      .catch(console.log);
  }

  update() {
    if (!this.gamePaused) {
      this.paiton.update();
      this.bowser.update();

      if (this.ball != null) {
        this.ball.update();
      }
    }
  }
}