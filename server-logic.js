var infoPack = { player: [], bullet: [], target: [], monster: [], meteo: [], hP: [], fire: [], coin: [] };
var removePack = { player: [], bullet: [], target: [], monster: [], meteo: [], hP: [], fire: [], coin: [] };
var shooter = require('./shooter');

Shared = function () {
  var me = {
    id: '',
    x: 250, // X of the character 
    y: 250, // Y of the character 
    speedX: 0, //speed X defult to 0
    speedY: 0, //speed Y defult to 0
    space: 'blackGal',
  };

  me.update = function () {
    me.updatePos(); //update char or bullet position
  };

  me.updatePos = function () {
    me.x += me.speedX;
    me.y += me.speedY;
  };

  me.getDist = function (pt) {
    return Math.sqrt(Math.pow(me.x - pt.x, 2) + Math.pow(me.y - pt.y, 2)); //calculates distance
  };
  return me;
};

Shared.makeModular = function () { //this is what makes my project modular
  var pack = {
    infoPack: {
      player: infoPack.player, //pack with info for player
      bullet: infoPack.bullet, //pack with info for bullet
      target: infoPack.target, //pack with info for target
      monster: infoPack.monster, //pack with info for special target
      meteo: infoPack.meteo, //pack with meteorite
      hP: infoPack.hP,
      fire: infoPack.fire,
      coin: infoPack.coin
    },
    removePack: {
      player: removePack.player, //this is the pack that removes the players info
      bullet: removePack.bullet, //this is the pack that removes the bullet info
      target: removePack.target, //this is the pack that removes the target info
      monster: removePack.monster, // monster
      meteo: removePack.meteo,
      hP: removePack.hP,
      fire: removePack.fire,
      coin: removePack.coin
    },
    updatePack: {
      player: Player.update(),  //this sends only the basic info (hence update pack)
      bullet: Bullet.update(),  //same for these
      target: Target.update(), //same for this one too
      monster: Monster.update(),
      meteo: Meteo.update(),
      hP: HP.update(),
      fire: Fire.update(),
      coin: Coin.update()
    }
  };

  // infoPack.player, infoPack.bullet, infoPack.target, infoPack.monster, infoPack.meteo, infoPack.hP, infoPack.fire, infoPack.coin = []; //sets to empty so it does not repeat/duplicate
  // removePack.player, removePack.bullet, removePack.target, removePack.monster, removePack.meteo, removePack.hP, removePack.fire, removePack.coin = [];  //sets to empty so it does not repeat/duplicate
  infoPack.player = [];
  infoPack.bullet = []; //sets to empty so it does not repeat/duplicate
  infoPack.target = []; //sets to empty so it does not repeat/duplicate
  infoPack.monster = [];
  infoPack.meteo = [];
  infoPack.hP = [];
  infoPack.fire = [];
  removePack.player = [];
  removePack.bullet = [];  //sets to empty so it does not repeat/duplicate
  removePack.target = [];  //sets to empty so it does not repeat/duplicate
  removePack.monster = [];
  removePack.meteo = [];
  removePack.hP = [];
  removePack.fire = [];
  return pack;
};

Player = function (id) {
  var me = Shared(); //shared properties between bullet and player
  me.id = id;
  me.number = '' + Math.floor(10 * Math.random());
  me.pRight = false; //moving right auto false
  me.pLeft = false; //moving left auto false
  me.pUp = false; //moving up auto false
  me.pDown = false; //moving down auto false
  me.pAttack = false; //attacking set to fasle which is shooting!
  me.mouseAngle = 0; //mouse or touchpad angle
  me.maxSpeed = 6; //moving speed 10 (need to modify this)***
  me.healthPoints = 5; // player hp
  me.maxHealthPoints = 5; // the max hp a player starts with
  me.score = 0; //score starts at 0, + dependant on the kill.
  me.counter = 0; //killing counter
  me.speedCounter = 0;  //speed counter
  me.sCounter = 0; //special monster
  me.sSpeedCounter = 0; //speed for special monster
  me.specialCounter = 0;
  me.dead = false;
  me.spaceReset = false;
  me.shootingSpeed = 0;
  me.healthAppear = false;
  me.playSound = false;
  me.rapidShooting = false; //rapid shooting true randomly
  me.eatHealth = false; //ate health
  me.healthInv = false; //invinsable
  var chance = Math.random();
  var chanceRand = Math.random() * 500;

  var second_update = me.update;
  me.update = function () { //this function calls a secondary update
    me.resetEverything(); //reset game
    me.updateSpeed();
    second_update();

    if (me.healthAppear == true) {
      me.addHP();
      me.healthAppear = false;
    }

    if (me.sCounter == 6) { //special monster
      me.addMonster(); //call addMonster function
      me.addCoin();
      me.sCounter = 0; //reset counter back to 0
    }

    if (me.counter == 5) { //if counter is 5 then
      me.specialCounter++;
      if (me.specialCounter <= 2) {
        me.addEnemy(); //add enemy
        me.counter = 0; //set counter back to 0
      }
    }

    if (me.speedCounter == 3) { //if counter is 3 then
      me.addMeteo();
      me.speedCounter = 0; //set counter back to 0
    }

    if (me.pAttack) {
      if (me.rapidShooting == true) {
        for (var i = -3; i < 3; i++)
          me.fireBullet(i * 10 + me.mouseAngle);
      } else {
        me.fireBullet(me.mouseAngle); //mouse angle attack
      }
    }

    if (me.x <= 10) {
      me.pLeft = false;
      me.x += 3;
    }
    if (me.x >= 496) {
      me.pRight = false;
      me.x -= 3;
    }
    if (me.y <= 4) {
      me.pUp = false;
      me.y += 4;
    }
    if (me.y >= 496) {
      me.pDown = false;
      me.y -= 4;
    }

  };
  me.resetEverything = function () {
    if (me.healthPoints <= 0) {
      me.dead = true;
      me.pAttack = false;
      me.counter = 0; //killing counter
      me.speedCounter = 0;  //speed counter
      me.sCounter = 0; //special monster
      me.specialCounter = 0; //stops creating too many targets
      me.x = 250;
      me.y = 250;
      me.remove();
      shooter.checkInfo(me);

      if (me.spaceReset == true) { //if i press spacebar when I die this will reset it
        me.healthPoints = 5; // player hp
        me.maxHealthPoints = 5; // the max hp a player starts with
        me.score = 0; //score starts at 0, +1 for every kill.
        me.dead = false; //reset to not dead
        me.addEnemy();
      }
    }
  };
  me.remove = function () {
    for (let i in Monster.list) { //looks into the monster list
      let m = Monster.list[i]; //t for monster list
      m.toRemove = true;
    }
    for (let i in Target.list) { //looks into the target list
      let t = Target.list[i]; //t for target list
      t.toRemove = true;
    }
    for (let i in HP.list) { //looks into the hp list
      let t = HP.list[i]; //t for hp list
      t.toRemove = true;
    }
    for (let i in Fire.list) { //looks into the fire list
      let t = Fire.list[i]; //t for fire list
      t.toRemove = true;
    }
    for (let i in Bullet.list) { //looks into the fire list
      let t = Bullet.list[i]; //t for fire list
      t.toRemove = true;
    }
    for (let i in Meteo.list) { //looks into the fire list
      let t = Meteo.list[i]; //t for fire list
      t.toRemove = true;
    }
    for (let i in Coin.list) { //looks into the fire list
      let t = Coin.list[i]; //t for fire list
      t.toRemove = true;
    }
  };
  me.addEnemy = function (data) { //this is what makes the enemy
    var t = Target(data);
    // let chance = Math.random();
    // let chanceRand = Math.random () * 500;
    if (chance <= 0.5) {
      t.x = 1;
      t.y = chanceRand;
    } else {
      t.x = chanceRand;
      t.y = 1;
    }
  };
  me.addMonster = function (data) { //this is what makes the enemy
    var t = Monster(data);
    if (chance <= 0.5) {
      t.x = 1;
      t.y = chanceRand;
    } else {
      t.x = chanceRand;
      t.y = 1;
    }
  };
  me.addMeteo = function (data) { //this is what makes the meteo
    var e = Meteo(data);
    if (Math.random() >= 0.5) {
      e.y = 1;
    } else {
      e.y = 499;
    }
    e.x = Math.random() * 500; //the x of the new meteo

  };
  me.addHP = function (data) { //this is what makes the meteo
    var e = HP(data);
    e.x = Math.random() * 500; //the x of the new meteo
    e.y = Math.random() * 500; //the y of the new meteo
  };
  me.addCoin = function (data) {
    var e = Coin(data);
    e.x = Math.random() * 500;
    e.y = Math.random() * 500;
  };
  me.fireBullet = function (angle) {
    me.shootingSpeed++;
    if (me.shootingSpeed == 4) {
      var b = Bullet(me.id, angle); //bullet id, with angle pack
      b.x = me.x;
      b.y = me.y;
      me.shootingSpeed = 0;
    }
  };
  me.updateSpeed = function () {
    if (me.pRight)
      me.speedX = me.maxSpeed;
    else if (me.pLeft)
      me.speedX = -me.maxSpeed;
    else
      me.speedX = 0; //reset movement speeds

    if (me.pUp)
      me.speedY = -me.maxSpeed;
    else if (me.pDown)
      me.speedY = me.maxSpeed;
    else
      me.speedY = 0; //reset movement speeds
  };
  me.retrieveInfoPack = function () { //this is what gets the info pack
    return {
      id: me.id, //all the players info ->
      x: me.x,
      y: me.y,
      number: me.number,
      healthPoints: me.healthPoints,
      maxHealthPoints: me.maxHealthPoints,
      score: me.score,
      space: me.space,
      dead: me.dead,
      eatHealth: me.eatHealth,
      playSound: me.playSound,
      healthInv: me.healthInv,
      rapidShooting: me.rapidShooting
    };
  };
  me.retrieveUpdatePack = function () { //this gets the update pack
    return {
      id: me.id, //all the players updated info ->
      x: me.x,
      y: me.y,
      healthPoints: me.healthPoints,
      score: me.score,
      space: me.space,
      dead: me.dead,
      eatHealth: me.eatHealth,
      playSound: me.playSound,
      healthInv: me.healthInv,
      rapidShooting: me.rapidShooting
    };
  };
  Player.list[id] = me;
  infoPack.player.push(me.retrieveInfoPack());
  return me;
};

Player.list = {};
Player.onConnect = function (socket) {
  var player = Player(socket.id);
  var target = Target(socket.id); //appears when the player logs in, enemy gets put in too!

  socket.on('movementKey', function (data) {
    if (data.inputId === 'left')
      player.pLeft = data.state; //moving left
    else if (data.inputId === 'right')
      player.pRight = data.state; //moving right
    else if (data.inputId === 'up')
      player.pUp = data.state; //moving up
    else if (data.inputId === 'down')
      player.pDown = data.state; //moving down on keyboard
    else if (data.inputId === 'attack')
      player.pAttack = data.state; //if click = true
    else if (data.inputId === 'mouseAngle')
      player.mouseAngle = data.state; //mouse angle (direction of shooting)
    else if (data.inputId === 'space')
      player.spaceReset = data.state;
  });

  var space = 'blackGal';


  for (let i in Monster.list) {
    let t = Monster.list[i];
  }

  for (let i in Meteo.list) {
    let t = Meteo.list[i];
  }

  for (let i in HP.list) {
    let t = HP.list[i];
  }

  for (let i in Coin.list) {
    let t = Coin.list[i];
  }

  socket.emit('starterPack', {
    meId: socket.id, //sends the id over to the client
    player: Player.mergePack(),  //sends player info pack to client
    bullet: Bullet.mergePack(), //sends bullet info pack to client
    target: Target.mergePack(), //sends target info pack to client
    monster: Monster.mergePack(), //sends monster info pack to client
    meteo: Meteo.mergePack(), //sends meteo pack
    hP: HP.mergePack(),
    fire: Fire.mergePack(),
    coin: Coin.mergePack()
  });
};

Player.mergePack = function () {
  var players = [];
  for (var i in Player.list)
    players.push(Player.list[i].retrieveInfoPack()); //this pushes the info pack
  return players;
};

Player.onDisconnect = function (socket) {
  delete Player.list[socket.id]; //delete player from players list
  // delete Target.list[socket.id];
  // delete Monster.list[socket.id];
  // delete Fire.list[socket.id];
  // delete Bullet.list[socket.id];
  removePack.player.push(socket.id);
  // removePack.target.push(socket.id);
  // removePack.monster.push(socket.id);
  // removePack.hP.push(socket.id);
  // removePack.fire.push(socket.id);
  // removePack.bullet.push(socket.id);

  for (let i in Target.list) { //Calls target list, to be able to remove all targets when you exit **
    let t = Target.list[i];
    t.toRemove = true;
    t.disConnect = true;
  }
  for (let i in Fire.list) { //Calls Fire list, to be able to remove all Fire when you exit **
    let f = Fire.list[i];
    f.toRemove = true;
  }
  for (let i in Coin.list) { //Calls coins list, to be able to remove all coins when you exit **
    let f = Coin.list[i];
    f.toRemove = true;
  }
  for (let i in HP.list) { //Calls hp list, to be able to remove all hp when you exit **
    let f = HP.list[i];
    f.toRemove = true;
  }
};

Player.update = function () {
  var pack = [];
  for (var i in Player.list) {
    var player = Player.list[i];
    player.update(); //update player
    pack.push(player.retrieveUpdatePack());//push player number, x & y
  }
  return pack;
};

Bullet = function (parent, angle) { //bullet 
  var me = Shared(); //uses shared properties with player
  me.id = Math.random(); //random id
  me.speedX = Math.cos(angle / 180 * Math.PI) * 10;
  me.speedY = Math.sin(angle / 180 * Math.PI) * 10;
  me.parent = parent; //so you dont shoot yourself.
  me.timer = 0; //bullet timer - dies at 100.
  me.toRemove = false; //if shot yourself then = true.
  var second_update = me.update;
  var chance = Math.random();
  var chanceRand = Math.random() * 500;
  me.update = function () {
    if (me.timer++ > 35) //timeout on bullet traveling
      me.toRemove = true; //removes it
    second_update();

    for (var i in Player.list) {
      var p = Player.list[i];
      if (me.getDist(p) < 32 && me.parent !== p.id) { //gets distance
        // p.healthPoints -= 1; //takes away 1hp if you get hit by bullet
        // if (p.healthPoints <= 0) {  //if healthpoints are lower than 0 or = to 0 then this happens ->
        //   var enemy = Player.list[me.parent];
        //   if (enemy)
        //     enemy.score += 1;  //enemy who shot you gets 1 point
        // }
        me.toRemove = true;
      }
    }
    for (let i in Target.list) { //WORKING BULLET COLLISION WITH TARGET **
      let t = Target.list[i];

      updateLocation = function () {
        if (chance <= 0.5) {
          t.x = 1;
          t.y = chanceRand;
        } else {
          t.x = chanceRand;
          t.y = 1;
        }
      };

      if (me.getDist(t) < 20 && me.parent !== t.id) { //gets distance
        t.life -= 1; //takes away 1hp if you get hit by bullet

        if (t.life <= 0) {  //if healthpoints are lower than 0 or = to 0 then this happens ->
          var enemy = Player.list[me.parent];
          if (enemy)
            enemy.score += 5;  //enemy who shot you gets 1 point
          enemy.counter += 1; //add counter after every kill
          enemy.speedCounter += 1; //add speed after every kill
          enemy.sCounter += 1; //special enemy
          t.life = t.maxLife; // you get 10 healthpoints again
          updateLocation();
        }
        me.toRemove = true; //remove bullet when it hits target
      }
    }
    for (let i in Monster.list) { //WORKING BULLET COLLISION WITH Monster **
      let t = Monster.list[i];
      if (me.getDist(t) < 20 && me.parent !== t.id) { //gets distance
        t.life -= 1; //takes away 1hp if you get hit by bullet

        if (t.life <= 0) {  //if healthpoints are lower than 0 or = to 0 then this happens ->
          let enemy = Player.list[me.parent];
          if (enemy) {
            enemy.score += 15;  //enemy who shot you gets 1 point
            enemy.sCounter += 1; //add 1 to counter after every kill
            // enemy.sSpeedCounter += 1; //add speed after every kill
            enemy.healthAppear = true;
            t.toRemove = true; //removes monster
          }
        }
        me.toRemove = true; //remove bullet when it hits target
      }
    }
    for (let i in Meteo.list) { //WORKING BULLET COLLISION WITH METEORITE **
      let t = Meteo.list[i];
      if (me.getDist(t) < 20 && me.parent !== t.id) { //gets distance
        t.life -= 2; //takes away 1hp if you get hit by bullet

        if (t.life <= 0) {  //if healthpoints are lower than 0 or = to 0 then this happens ->
          let enemy = Player.list[me.parent];
          if (enemy)
            enemy.score += 30;  //enemy who shot you gets 30 point
          t.toRemove = true; //removes monster
          enemy.addMeteo(); //adds another meteorite
        }
        me.toRemove = true; //remove bullet when it hits target
      }
    }
  };
  me.retrieveInfoPack = function () { //retrives the info pack for the bullet
    return {
      id: me.id, //bullets ID, x and y
      x: me.x,
      y: me.y,
    };
  };

  me.retrieveUpdatePack = function () { //retrives the UPDATE pack for the bullet
    return {
      id: me.id, //Updated bullets ID, x and y
      x: me.x,
      y: me.y,
    };
  };

  Bullet.list[me.id] = me;
  infoPack.bullet.push(me.retrieveInfoPack());
  return me;
};
Bullet.list = {}; //bullet 

Bullet.update = function () {  //pushes bullet
  var pack = [];
  for (var i in Bullet.list) {
    var bullet = Bullet.list[i];
    bullet.update(); //calls for the update on the pack
    if (bullet.toRemove) {
      delete Bullet.list[i]; //remove the bullet list if .toRemove is triggered at the collision stage.
      removePack.bullet.push(bullet.id);
    } else
      pack.push(bullet.retrieveUpdatePack()); //pushes the bullet updated pack
  }
  return pack;
};

Bullet.mergePack = function () {
  var bullets = [];
  for (var i in Bullet.list)
    bullets.push(Bullet.list[i].retrieveInfoPack()); //pushes the bullet info pack
  return bullets;
};

Target = function () { //Target 
  var me = Shared(); //uses shared properties with player
  me.x = 1;
  me.y = Math.random() * 500;
  me.life = 10;
  me.maxLife = 10;
  me.id = Math.random(); //random id
  me.speed = 1; //target speed
  me.targetAim = 0; //target aim
  me.toRemove = false;
  me.disConnect = false;
  var chance = Math.random();
  var chanceRand = Math.random() * 500;

  for (var i in Player.list) { //Player list
    var p = Player.list[i];
    // me.angle = Math.atan2(p.x, p.y) / Math.PI * 180;
    // me.angle = Math.atan2(p.y - me.y, p.x - me.x) / Math.PI * 180;
    me.fireShot = function (angle) {
      var b = Fire(me.id, angle); //fire id, with angle pack
      b.x = me.x;
      b.y = me.y;
    };

    var refreshIntervalId = setInterval(function () {
      if (p.healthPoints > 0) {
        var differenceX = p.x - me.x; //players x - targets x
        var differenceY = p.y - me.y; //players y - targets y
        me.angle = Math.atan2(differenceY, differenceX) / Math.PI * 180;
        // me.angle = Math.atan((me.y - p.y) / (me.x - p.x)) || 0;
        me.fireShot(me.angle); //target angle attack
      }
    }
      , 1800);
  }

  var second_update = me.update;
  me.update = function () { //this function calls a secondary update
    second_update();

    if (me.disConnect == true) {
      clearInterval(refreshIntervalId);
    }

    for (var i in Player.list) { //Player list
      var p = Player.list[i];

      if (p.dead == true) {
        clearInterval(refreshIntervalId);
      }

      if (p.toRemove == true) {
        clearInterval(refreshIntervalId);
      }

      var differenceX = p.x - me.x; //players x - targets x
      var differenceY = p.y - me.y; //players y - targets y

      if (differenceX > 0) {
        me.x += me.speed;
      } else if (differenceX < 0) {
        me.x -= me.speed;
      }

      if (differenceY > 0) {
        me.y += me.speed;
      } else if (differenceY < 0) {
        me.y -= me.speed;
      }
    }

    me.updateLocation = function () {
      if (chance <= 0.5) {
        me.x = 1;
        me.y = chanceRand;
      } else {
        me.x = chanceRand;
        me.y = 1;
      }
    };

    for (let i in Player.list) { ////ENEMY DETEC
      let p = Player.list[i];
      if (p.healthInv == true) {
        if (me.getDist(p) < 16) {
          me.updateLocation();
        }
      } else {
        if (me.getDist(p) < 20) { //gets distance (!== p.id)
          p.healthPoints -= 1; //takes away 1hp if you get hit by bullet 
          me.updateLocation();
          if (p.healthPoints <= 0) {
            me.toRemove = true;
          }
        }
      }
    }
  };

  me.retrieveInfoPack = function () { //info pack for the target
    return {
      id: me.id, //targets id, x and y 
      x: me.x,
      y: me.y,
      life: me.life,
      maxLife: me.maxLife
    };
  };

  me.retrieveUpdatePack = function () { //update pack for the target
    return {
      id: me.id, //targets UPDATED id, x and y 
      x: me.x,
      y: me.y,
      life: me.life,
      maxLife: me.maxLife
    };
  };

  Target.list[me.id] = me;

  infoPack.target.push(me.retrieveInfoPack()); //pushes the info pack on the target
  return me;
};
Target.list = {}; //target

Target.update = function () {  //pushes target
  var pack = [];
  for (var i in Target.list) {
    var target = Target.list[i];
    target.update(); //cals for the update on the target INFO
    if (target.toRemove) { //if triggered it will remove the Target pack but its currently disabled!
      delete Target.list[i];
      removePack.target.push(target.id);
    } else
      pack.push(target.retrieveUpdatePack()); //pushes the UPDATE pack for the target
  }
  return pack;
};

Target.mergePack = function () {
  var targets = [];
  for (var i in Target.list)
    targets.push(Target.list[i].retrieveInfoPack()); //pushes the info pack for the target
  return targets;
};

Monster = function () { //Target 
  var me = Shared(); //uses shared properties with player
  me.x = 1;
  me.y = Math.random() * 500;
  me.life = 30;
  me.maxLife = 30;
  me.id = Math.random(); //random id
  me.speed = 2; //enemy speed
  me.toRemove = false; //if shot yourself then = true.
  var chance = Math.random();
  var chanceRand = Math.random() * 500;
  var second_update = me.update;
  me.update = function () { //this function calls a secondary update
    second_update();

    for (var i in Player.list) { ////ENEMY movement
      var p = Player.list[i];

      var differenceX = p.x - me.x; //players x - monsters x
      var differenceY = p.y - me.y; //players y - monsters y

      if (differenceX > 0) //this is what makes the monster move towards the player.
        me.x += me.speed;
      else
        me.x -= me.speed;

      if (differenceY > 0)
        me.y += me.speed;
      else
        me.y -= me.speed;
    }

    me.updateLocation = function () {
      if (chance <= 0.5) {
        me.x = 1;
        me.y = chanceRand;
      } else {
        me.x = chanceRand;
        me.y = 1;
      }
    };

    for (let i in Player.list) { ////ENEMY DETEC
      let p = Player.list[i];
      if (p.healthInv == true) {
        if (me.getDist(p) < 16) {
          me.updateLocation();
        }
      } else {
        if (me.getDist(p) < 20) { //gets distance 
          p.healthPoints -= 2; //takes away 2hp if you get hit by monster
          me.updateLocation();
        }
      }
    }
  };

  me.retrieveInfoPack = function () { //info pack for the monster
    return {
      id: me.id, //monster id, x and y 
      x: me.x,
      y: me.y,
      life: me.life,
      maxLife: me.maxLife
    };
  };

  me.retrieveUpdatePack = function () { //update pack for the monster
    return {
      id: me.id, //monster UPDATED id, x and y 
      x: me.x,
      y: me.y,
      life: me.life,
      maxLife: me.maxLife
    };
  };

  Monster.list[me.id] = me;

  infoPack.monster.push(me.retrieveInfoPack()); //pushes the info pack on the target
  return me;
};
Monster.list = {}; //monster

Monster.update = function () {  //pushes monster
  var pack = [];
  for (var i in Monster.list) {
    var monster = Monster.list[i];
    monster.update(); //cals for the update on the target INFO
    if (monster.toRemove) { //if triggered it will remove the Target pack but its currently disabled!
      delete Monster.list[i];
      removePack.monster.push(monster.id);
    } else
      pack.push(monster.retrieveUpdatePack()); //pushes the UPDATE pack for the target
  }
  return pack;
};

Monster.mergePack = function () {
  var monster = [];
  for (var i in Monster.list)
    monster.push(Monster.list[i].retrieveInfoPack()); //pushes the info pack for the target
  return monster;
};

Meteo = function () { //meteorite 
  var me = Shared(); //uses shared properties with player
  me.x = 1;
  me.y = Math.random() * 500;
  me.life = 12;
  me.maxLife = 12;
  me.id = Math.random(); //random id
  me.toRemove = false; //if shot yourself then = true.
  me.xSpeed = 1;
  me.ySpeed = 4;

  var second_update = me.update;
  me.update = function () { //this function calls a secondary update
    second_update();

    me.x = me.x + me.xSpeed;
    me.y = me.y + me.ySpeed;

    var checkX = me.x;
    var checkY = me.y;

    if (checkX <= -30) {
      console.log('x - 30');
      // me.toRemove = true;
    }
    if (checkY <= -30) {
      console.log('y - 30');
      // me.toRemove = true;
    }
    if (checkX >= 505 || checkY >= 505) {
      // console.log('x PAST 530');
      me.toRemove = true;
    }

    for (var i in Player.list) { ////ENEMY DETEC
      var p = Player.list[i];
      if (p.healthInv == true) {
        if (me.getDist(p) < 16) {
          if (Math.random() >= 0.5) {
            me.y = 1;
          } else {
            me.y = 499;
          }
          me.x = Math.random() * 500; //the x of the new meteo
        }
      } else {
        if (me.getDist(p) < 20) { //gets distance (!== p.id)
          p.healthPoints -= 8; //takes away 8hp if you get hit by bullet
          me.toRemove = true;
        }
      }
    }
    for (let i in Monster.list) { ////ENEMY DETEC
      let p = Monster.list[i];
      if (me.getDist(p) < 20) { //gets distance (!== p.id)
        p.healthPoints -= 10; //takes away 10hp if you get hit by bullet
      }
    }
    for (let i in Target.list) { ////ENEMY DETEC
      let p = Target.list[i];
      if (me.getDist(p) < 20) { //gets distance (!== p.id)
        p.healthPoints -= 5; //takes away 5hp if you get hit by bullet   
      }
    }

  };

  me.retrieveInfoPack = function () { //info pack for the monster
    return {
      id: me.id, //monster id, x and y 
      x: me.x,
      y: me.y,
    };
  };

  me.retrieveUpdatePack = function () { //update pack for the monster
    return {
      id: me.id, //monster UPDATED id, x and y 
      x: me.x,
      y: me.y,
    };
  };

  Meteo.list[me.id] = me;

  infoPack.meteo.push(me.retrieveInfoPack()); //pushes the info pack on the target
  return me;
};
Meteo.list = {}; //monster

Meteo.update = function () {  //pushes meteorite
  var pack = [];
  for (var i in Meteo.list) {
    var meteo = Meteo.list[i];
    meteo.update(); //cals for the update on the meteorite INFO
    if (meteo.toRemove) { //if triggered it will remove the meteorite pack but its currently disabled!
      delete Meteo.list[i];
      removePack.meteo.push(meteo.id);
    } else
      pack.push(meteo.retrieveUpdatePack()); //pushes the UPDATE pack for the meteorite
  }
  return pack;
};

Meteo.mergePack = function () {
  var meteo = [];
  for (var i in Meteo.list)
    meteo.push(Meteo.list[i].retrieveInfoPack()); //pushes the info pack for the meteorite
  return meteo;
};

HP = function () { //hp
  var me = Shared(); //uses shared properties with player
  me.x = 1;
  me.y = Math.random() * 500;
  me.toRemove = false; // to remove heart

  var second_update = me.update;
  me.update = function () { //this function calls a secondary update
    second_update();

    for (var i in Player.list) { ////ENEMY DETEC
      var p = Player.list[i];
      if (me.getDist(p) < 20) { //gets distance
        p.healthPoints += 1; //takes away 8hp if you get hit by bullet
        me.toRemove = true;
        p.eatHealth = true;
        setTimeout(() => {
          p.eatHealth = false;
        }, 100);
      }
    }
  };

  me.retrieveInfoPack = function () { //info pack for the hp
    return {
      id: me.id, //hp id, x and y 
      x: me.x,
      y: me.y,
    };
  };

  me.retrieveUpdatePack = function () { //update pack for the hp
    return {
      id: me.id, //hp UPDATED id, x and y 
      x: me.x,
      y: me.y,
    };
  };

  HP.list[me.id] = me;

  infoPack.hP.push(me.retrieveInfoPack()); //pushes the info pack on the hp
  return me;
};
HP.list = {}; //hp

HP.update = function () {  //pushes hp
  var pack = [];
  for (var i in HP.list) {
    var hP = HP.list[i];
    hP.update(); //cals for the update on the meteorite INFO
    if (hP.toRemove) { //if triggered it will remove the meteorite pack but its currently disabled!
      delete HP.list[i];
      removePack.hP.push(hP.id);
    } else
      pack.push(hP.retrieveUpdatePack()); //pushes the UPDATE pack for the meteorite
  }
  return pack;
};

HP.mergePack = function () {
  var hPs = [];
  for (var i in HP.list)
    hPs.push(HP.list[i].retrieveInfoPack()); //pushes the info pack for the meteorite
  return hPs;
};

Coin = function () { //coin
  var me = Shared(); //uses shared properties with player
  me.x = 1;
  me.y = Math.random() * 500;
  me.id = Math.random(); //random id
  me.toRemove = false; // to remove coin


  var second_update = me.update;
  me.update = function () { //this function calls a secondary update
    second_update();

    for (var i in Player.list) { ////ENEMY DETEC
      var p = Player.list[i];
      if (me.getDist(p) < 20) { //gets distance (!== p.id)
        me.toRemove = true;

        let chance = Math.random();
        if (chance <= 0.33) {
          p.playSound = true;
          p.maxSpeed = 10;
          setTimeout(() => {
            p.playSound = false;
          }, 80);
          setTimeout(() => {
            p.maxSpeed = 6;
          }, 4250);

        } else if (chance <= 0.66) {
          p.rapidShooting = true;
          setTimeout(() => {
            p.rapidShooting = false;
          }, 3750);

        } else {
          p.healthInv = true;
          setTimeout(() => {
            p.healthInv = false;
          }, 8000);
        }
      }
    }
  };


  me.retrieveInfoPack = function () { //info pack for the coin
    return {
      id: me.id, //coin id, x and y 
      x: me.x,
      y: me.y,
    };
  };

  me.retrieveUpdatePack = function () { //update pack for the coin
    return {
      id: me.id, //coin UPDATED id, x and y 
      x: me.x,
      y: me.y,
    };
  };

  Coin.list[me.id] = me;

  infoPack.coin.push(me.retrieveInfoPack()); //pushes the info pack on the coin
  return me;
};
Coin.list = {}; //coin

Coin.update = function () {  //pushes coin
  var pack = [];
  for (var i in Coin.list) {
    var coin = Coin.list[i];
    coin.update(); //cals for the update on the meteorite INFO
    if (coin.toRemove) { //if triggered it will remove the meteorite pack but its currently disabled!
      delete Coin.list[i];
      removePack.coin.push(coin.id);
    } else
      pack.push(coin.retrieveUpdatePack()); //pushes the UPDATE pack for the meteorite
  }
  return pack;
};

Coin.mergePack = function () {
  var coins = [];
  for (var i in Coin.list)
    coins.push(Coin.list[i].retrieveInfoPack()); //pushes the info pack for the meteorite
  return coins;
};

Fire = function (parent, angle) { //fire 
  var me = Shared(); //uses shared properties with player
  me.id = Math.random(); //random id
  me.speedX = Math.cos(angle / 180 * Math.PI) * 7;
  me.speedY = Math.sin(angle / 180 * Math.PI) * 7;
  me.parent = parent; //so you dont shoot yourself.
  me.timer = 0; //fire timer - dies at 100.
  me.toRemove = false; //if shot yourself then = true.
  var second_update = me.update;

  me.update = function () {
    if (me.timer++ > 60) //timeout on fire traveling
      me.toRemove = true; //removes it
    second_update();

    for (let i in Player.list) {
      let p = Player.list[i];
      for (let i in Target.list) {
        let t = Target.list[i];
        if (p.healthInv == true) {
          if (me.getDist(p) < 16) {
            me.toRemove = true;
          }
        } else {
          if (me.getDist(p) < 16) { //gets distance
            p.healthPoints -= 1; //takes away 1hp if you get hit by the fire
            if (p.healthPoints <= 0) {  //if healthpoints are lower than 0 or = to 0 then this happens ->
              t.toRemove = true;
            }
            me.toRemove = true;
          }
        }
      }
    }
  };
  me.retrieveInfoPack = function () { //retrives the info pack for the fire
    return {
      id: me.id, //fire ID, x and y
      x: me.x,
      y: me.y,
    };
  };

  me.retrieveUpdatePack = function () { //retrives the UPDATE pack for the fire
    return {
      id: me.id, //Updated fire ID, x and y
      x: me.x,
      y: me.y,
    };
  };

  Fire.list[me.id] = me;
  infoPack.fire.push(me.retrieveInfoPack());
  return me;
};
Fire.list = {}; //fire 

Fire.update = function () {  //pushes fire
  var pack = [];
  for (var i in Fire.list) {
    var fire = Fire.list[i];
    fire.update(); //calls for the update on the pack
    if (fire.toRemove) {
      delete Fire.list[i]; //remove the fire list if .toRemove is triggered at the collision stage.
      removePack.fire.push(fire.id);
    } else
      pack.push(fire.retrieveUpdatePack()); //pushes the fire updated pack
  }
  return pack;
};

Fire.mergePack = function () {
  var fires = [];
  for (var i in Fire.list)
    fires.push(Fire.list[i].retrieveInfoPack()); //pushes the fire info pack
  return fires;
};
