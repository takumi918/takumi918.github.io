//おまじない
enchant();
var world = new PhysicsWorld(0, 9.8);

onload = () => {

	//ゲーム画面のサイズ
	var core = new Core(800, 800);

	//最大フレームレート
	core.fps = 60;

	//キーを登録
	core.keybind(16, "shift");

	//ロード画面を隠す
	document.getElementById("enchant-stage").style.visibility = "hidden";

	core.onload = () => {

		//再表示
		document.getElementById("enchant-stage").style.visibility = "visible";

		//中心座標でmoveTo
		function centerMoveTo(node, x, y) {
			node.x = x - node.width / 2;
			node.y = y - node.height / 2;
		}

		//四捨五入(桁指定)
		var orgRound = (value, base) => Math.round(value * base) / base;

		//円のSurface
		function circleSurf(size, color) {
			var result = new Surface(size, size);
			result.context.beginPath();
			result.context.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2, true);
			result.context.fillStyle = color;
			result.context.fill();
			return result;
		}

		//メインの画面
		var mainScene = new Scene();
		mainScene.backgroundColor = "#222";
		core.pushScene(mainScene);

		mainScene.addEventListener("enterframe", () => {
			//物理エンジンの設定
			world.step(core.fps);
			//実際のfpsの測定(約一秒間に一回)
			if(_.random(core.fps) == 1) console.log(`fps: ${core.actualFps}`);
		});

		//矩形(player)
		var player = new PhyBoxSprite(100, 12.5, enchant.box2d.STATIC_SPRITE, 1.0, 0.5, 2.0, true);
		centerMoveTo(player, 400, 675);
		player.backgroundColor = "#f8f8f8";
		var pSpeed = 6;
		player.on("enterframe", () => {
			if(core.input.left) {
				player.x -= pSpeed;
				pSpeed *= core.input.shift ? 0.99 : 1.01;
			}
			if(core.input.right) {
				player.x += pSpeed;
				pSpeed *= core.input.shift ? 0.99 : 1.01;
			}
		});
		mainScene.addChild(player);

		//playerの座標・速度・加速
		var pXLabel = new Label();
		pXLabel.x = 10;
		pXLabel.y = 734;
		pXLabel.color = "#aaa";
		pXLabel.font = "16px ProstoOne-Regular";
		pXLabel.on("enterframe", () => {
			if(core.frame % 2 == 0) pXLabel.text = `X: ${orgRound(player.x - 350, 1000)}`;
		});
		mainScene.addChild(pXLabel);
		var pSpeedLabel = new Label();
		pSpeedLabel.x = 10;
		pSpeedLabel.y = 750;
		pSpeedLabel.color = "#aaa";
		pSpeedLabel.font = "16px ProstoOne-Regular";
		var pSpeedMemory = player.x;
		var pSpeedLabelText;
		pSpeedLabel.on("enterframe", () => {
			if(core.frame % 6 == 0) {
				pSpeedLabelText = orgRound(Math.abs(player.x - pSpeedMemory), 1000);
				pSpeedLabel.text = `Speed: ${pSpeedLabelText}px/0.1s`;
				pSpeedMemory = player.x;
			}
		});
		mainScene.addChild(pSpeedLabel);
		var pAccelerationLabel = new Label();
		pAccelerationLabel.x = 10;
		pAccelerationLabel.y = 766;
		pAccelerationLabel.color = "#aaa";
		pAccelerationLabel.font = "16px ProstoOne-Regular";
		pAccelerationLabel.text = "Acceleration: x1"
		pAccelerationLabel.on("enterframe", () => {
			if(core.frame % 6 == 0 && core.input.left || core.input.right) {
				var text = orgRound(pSpeedLabelText / 6, 1000)
				if(text != 0) {
					pAccelerationLabel.text = `Acceleration: x${orgRound(pSpeedLabelText / 6, 1000)}`;
					text = orgRound(pSpeedLabelText / 6, 1000);
				}
			}
		});
		mainScene.addChild(pAccelerationLabel);

		//スコア
		var scoreLabel = new Label();
		scoreLabel.x = 10;
		scoreLabel.y = 10;
		scoreLabel.color = "#ccc";
		scoreLabel.font = "16px ProstoOne-Regular";
		scoreLabel.text = "Score: 0";
		mainScene.addChild(scoreLabel);
		var score = 0;
		var targetScore;
		function addScore(point) {
			score += point;
			scoreLabel.text = `Score: ${score}`;
			if(score >= targetScore) scoreLabel.color = "blanchedalmond";
		}

		//てき(enemy)
		var enemy = new Sprite(12, 12);
		centerMoveTo(enemy, 400, 125);
		enemy.image = circleSurf(12, "lightskyblue");
		mainScene.addChild(enemy);

		//スコアエフェクト
		var Bar = Class.create(Sprite, {
			initialize: function(centerX, centerY) {
				addScore(100);
				Sprite.call(this, 16, 16);
				centerMoveTo(this, centerX, centerY);
				this.scaleX = 0.25;
				this.scaleY = 0.25;
				this.image = circleSurf(16, "#eee");
				mainScene.addChild(this);
				this.tl.scaleBy(4, 4, 20).and().fadeOut(20)
				.then(() => mainScene.removeChild(this));
			}
		});

		//普遍エフェクト
		var Particle = Class.create(Sprite, {
			initialize: function(centerX, centerY, width, height) {
				Sprite.call(this, width * 1.5, height * 1.5);
				centerMoveTo(this, centerX, centerY);
				this.scaleX = 1 / 1.5;
				this.scaleY = 1 / 1.5;
				this.image = circleSurf(width * 1.5, "#eee");
				mainScene.addChild(this);
				this.tl.scaleBy(1.5, 1.5, 20).and().fadeOut(20)
				.then(() => mainScene.removeChild(this));
			}
		});

		//字幕StageX等(画面中央)
		var Telop = Class.create(Label, {
			initialize: function(y, color, font, text) {
				Label.call(this);
				centerMoveTo(this, 400, y);
				this.color = color;
				this.font = font;
				this.textAlign = "center";
				this.text = text;
				this.opacity = 0;
				mainScene.addChild(this);
				this.tl.fadeIn(45)
				.delay(30)
				.fadeOut(30).and().moveY(-400, 30, enchant.Easing.BACK_EASEIN)
				.then(() => mainScene.removeChild(this));
			}
		});

		//字幕残り時間(右上)フレーム基準
		var RestTime = Class.create(Label, {
			initialize: function(frame, scoreRate, ifAllDestroy) {
				var time = frame;
				var currentScore = score;
				Label.call(this);
				this.x = 450;
				this.y = 25;
				this.color = "#ccc";
				this.font = "24px Play";
				this.textAlign = "right";
				mainScene.addChild(this);
				this.on("enterframe", () => {
					if(time >= 0) {
						this.text = String(time).replace(/(\d)(?=(\d\d)+(?!\d))/g, '$1.');
						if(time < 10) {
							this.text = "0.0" + this.text;
						} else if(time < 100) this.text = "0." + this.text;
						time--;
					} else {
						this.tl.fadeOut(30)
						.then(() => {
							this.bonus = new Telop(300, "#aaa", "italic 16px ProstoOne-Regular", `Special bonus: +${score - currentScore} x${scoreRate}`);
						})
						.delay(39)
						.then(() => {
							if(ifAllDestroy) allDestroy = true;
						})
						.delay(1)
						.then(() => {
							allDestroy = false;
							this.bonus.text = `Special bonus: +${orgRound((score - currentScore) * scoreRate, 0.1)}`;
							addScore(orgRound((score - currentScore) * scoreRate, 0.1));
							mainScene.removeChild(this);
						});
					}
				});
			}
		});

		var allDestroy = false;

		//弾幕クラス円 使用方法: 直径[px], 色, 角度(上起点、時計回りに360度)[deg] , 速度[px/frame], 回転[deg/frame], 複製されてから何フレーム後にPhySprite化するか[frame], 毎フレーム実行する処理(任意)[function]
		var CreateBulletCircle = Class.create(Sprite, {
			initialize: function(size, color, angle, speed, rotate, whenToPhy, callback) {
				this.speed = speed;
				Sprite.call(this, size, size);
				centerMoveTo(this, enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
				this.rotation = angle;
				var currentRotate = rotate;
				this.image = circleSurf(size, color);
				var frame = core.frame;
				this.on("enterframe", () => {
					this.forward(speed);
					this.rotation += currentRotate;
					currentRotate /= 1.05;
					if(callback) callback();
					if(core.frame - frame == whenToPhy) this.toPhy();
					//弾幕クリア
					if(allDestroy) mainScene.removeChild(this);
				});
				mainScene.addChild(this);
			},
			forward: function(distance) {
				this.x += Math.cos((this.rotation - 90) * (Math.PI / 180)) * distance;
				this.y += Math.sin((this.rotation - 90) * (Math.PI / 180)) * distance;
			},
			toPhy: function() {
				//いったんもとのSpriteを消して、
				mainScene.removeChild(this);
				//同じ座標にPhySprite爆誕
				this.phy = new PhyCircleSprite(this.width / 2, enchant.box2d.DYNAMIC_SPRITE, 1.0, 0.5, 0.3, true);
				this.phy.centerX = this.x + this.width / 2;
				this.phy.centerY = this.y + this.height / 2;
				this.phy.image = circleSurf(this.width, "#f8f8f8");
				mainScene.addChild(this.phy);
				this.phy.applyImpulse(new b2Vec2(Math.cos(this.rotation * Math.PI / 180) * this.speed / 100, Math.sin(this.rotation * Math.PI / 180) / 10));
				var frame = core.frame;
				this.phy.on("enterframe", () => {
					this.phy.contact((sprite) => {
						if(sprite == player) {
							addScore(10);
						}
					});
					//画面に現れる前から消えない(約2秒後)
					if(core.frame - frame > 120 && this.phy.y <= 0) {
						new Bar(this.phy.x + this.phy.width / 2, -2);
						this.phy.destroy();
					}
					//画面外で消す
					if(this.phy.y > 800 || this.phy.x < -8 || this.phy.x > 800) this.phy.destroy();
					//弾幕クリア
					if(allDestroy) {
						addScore(10)    //弾残数x㍢
						new Particle(this.phy.x + this.phy.width / 2, this.phy.y + this.phy.height / 2, this.phy.width, this.phy.height);
						this.phy.destroy();
					}
				});
			}
		});

		//弾幕クラス矩形
		var CreateBulletRectandle = Class.create(CreateBulletCircle, {
			initialize: function(width, height, color, angle, speed, rotate, whenToPhy, callback) {
				this.speed = speed;
				Sprite.call(this, width, height);
				centerMoveTo(this, enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
				this.rotation = angle;
				var currentRotate = rotate;
				this.backgroundColor = color;
				var frame = core.frame;
				this.on("enterframe", () => {
					this.forward(speed);
					this.rotation += currentRotate;
					currentRotate /= 1.05;
					if(callback) callback();
					if(core.frame - frame == whenToPhy) this.toPhy();
					//弾幕クリア
					if(allDestroy) mainScene.removeChild(this);
				});
				mainScene.addChild(this);
			},
			forward: function(distance) {
				this.x += Math.cos((this.rotation - 90) * (Math.PI / 180)) * distance;
				this.y += Math.sin((this.rotation - 90) * (Math.PI / 180)) * distance;
			},
			toPhy: function() {
				//いったんもとのSpriteを消して、
				mainScene.removeChild(this);
				//同じ座標にPhySprite爆誕
				this.phy = new PhyBoxSprite(this.width, this.height, enchant.box2d.DYNAMIC_SPRITE, 1.0, 0.5, 0.3, true);
				this.phy.centerX = this.x + this.width / 2;
				this.phy.centerY = this.y + this.height / 2;
				this.phy.angle = this.rotation;
				this.phy.backgroundColor = "#f8f8f8";
				mainScene.addChild(this.phy);
				this.phy.applyImpulse(new b2Vec2(Math.cos(this.rotation * Math.PI / 180) * this.speed / 100, Math.sin(this.rotation * Math.PI / 180) / 10));
				var frame = core.frame;
				this.phy.on("enterframe", () => {
					this.phy.contact((sprite) => {
						if(sprite == player) {
							addScore(10);
						}
					});
					//画面に現れる前から消えない(約2秒後)
					if(core.frame - frame > 120 && this.phy.y <= 0) {
						new Bar(this.phy.x + this.phy.width / 2, -2);
						this.phy.destroy();
					}
					//画面外で消す
					if(this.phy.y > 800 || this.phy.x < -8 || this.phy.x > 800) this.phy.destroy();
					//弾幕クリア
					if(allDestroy) {
						addScore(10)    //弾残数x㍢
						new Particle(this.phy.x + this.phy.width / 2, this.phy.y + this.phy.height / 2, this.phy.width, this.phy.height);
						this.phy.destroy();
					}
				});
			}
		});

		/*以下、弾幕データ*/

		//pre定義 繰り返しbullet
		//special attack 1
		var sa1 = {
			0: function() {
				for(m = 0; m < 36; m++) {
					new CreateBulletCircle(6, "blanchedalmond", m * 10, 15, -2, 15);
				}
			},
			15: function() {
				for(m = 0; m < 36; m++) {
					new CreateBulletCircle(6, "blanchedalmond", m * 10, 15, -1, 15);
				}
			},
			30: function() {
				for(m = 0; m < 36; m++) {
					new CreateBulletCircle(6, "blanchedalmond", m * 10, 15, 0, 15);
				}
			},
			45: function() {
				for(m = 0; m < 36; m++) {
					new CreateBulletCircle(6, "blanchedalmond", m * 10, 15, 1, 15);
				}
			},
			60: function() {
				for(m = 0; m < 36; m++) {
					new CreateBulletCircle(6, "blanchedalmond", m * 10, 15, 2, 15);
				}
			}
		}

		var sa2 = {
			0: function() {
				for(m = 0; m < 18; m++) {
					new CreateBulletCircle(8, "aliceblue", 180 + 18 - m * 2, 12, 0, 30);
				}
			},
			30: function() {
				enemy.x = 200 - enemy.width / 2;
			},
			45: function() {
				for(m = 0; m < 18; m++) {
					new CreateBulletCircle(8, "aliceblue", 150 + 18 - m * 2, 12, 0, 30);
				}
			},
			75: function() {
				enemy.x = 600 - enemy.width / 2;
			},
			90: function() {
				for(m = 0; m < 18; m++) {
					new CreateBulletCircle(8, "aliceblue", 210 + 18 - m * 2, 12, 0, 30);
				}
			},
			120: function() {
				enemy.x = 400 - enemy.width - 2;
				m = 0;
			}
		}

		var m = 0;
		enemy.tl
		/*Stage 1*/
		.then(() => {
			targetScore = 25000;
		})
		//test

		//test
		.repeat(() => {    //全方位ばらまきx50(規則)1
			new CreateBulletCircle(8, "honeydew", m * 150, 10, -6, 30);
			m++;
		}, 50)
		.delay(150)
		.then(() => {    //字幕
			new Telop(400, "honeydew", "48px Play", "Stage 1");
			new Telop(475, "#ccc", "16px Play", `Target score: ${targetScore}`);
		})
		.delay(150)
		/*こっから*/
		.then(() => {    //36全方位弾1
			for(m = 0; m < 36; m++) {
				new CreateBulletCircle(8, "aliceblue", m * 10, 10, 3, 30);
			}
		})
		.delay(30)
		.then(() => {    //36全方位弾2
			for(m = 0; m < 36; m++) {
				new CreateBulletCircle(8, "aliceblue", m * 10, 10, -3, 30);
			}
			m = 0;
		})
		.delay(60)
		.repeat(() => {    //全方位ばらまきx100(規則)2
			new CreateBulletCircle(8, "honeydew", m * 170, 10, 6, 30);
			m++;
		}, 100)
		.delay(150)
		/*ここまで繰り返し3回(次若干変更はいります)*/
		/*こっから*/
		.then(() => {
			for(m = 0; m < 36; m++) {
				new CreateBulletCircle(8, "aliceblue", m * 10, 10, 3, 30);
			}
		})
		.delay(30)
		.then(() => {
			for(m = 0; m < 36; m++) {
				new CreateBulletCircle(8, "aliceblue", m * 10, 10, -3, 30);
			}
			m = 0;
		})
		.delay(60)
		.repeat(() => {
			new CreateBulletCircle(8, "honeydew", m * -170, 10, 6, 30);
			m++;
		}, 100)
		.delay(150)
		/*ここまで、繰り返しあと1回*/
		/*こっから*/
		.then(() => {
			for(m = 0; m < 36; m++) {
				new CreateBulletCircle(8, "aliceblue", m * 10, 10, 3, 30);
			}
		})
		.delay(30)
		.then(() => {
			for(m = 0; m < 36; m++) {
				new CreateBulletCircle(8, "aliceblue", m * 10, 10, -3, 30);
			}
			m = 0;
		})
		.delay(60)
		.repeat(() => {
			new CreateBulletCircle(8, "honeydew", m * 170, 10, 6, 30);
			m++;
		}, 100)
		.delay(200)
		/*ここまで、繰り返し終わり*/
		.then(() => {    //"Special attack!"
			new Telop(300, "#aaa", "italic 16px ProstoOne-Regular", "Special attack!");
			new RestTime(750, 1.5);
		})
		.delay(60)
		.cue(sa1)
		.delay(150)
		.cue(sa1)
		.delay(150)
		.cue(sa1)
		.delay(375)
		//
		.then(() => {
			tSC = new Telop(400, "#f8f8f8", "48px Play", `${score}`);
			new Telop(475, "#ccc", "16px Play", `Target score: ${targetScore}`);
			new Telop(500, "#ccc", "16px Play", score >= targetScore ? "Stage clear! Next stage..." : "Failed...");
		})
		.delay(40)
		.then(() => {
			if(score >= targetScore) tSC.color = "blanchedalmond";
		})
		/*Stage 2*/
		.delay(120)
		.then(() => {
			if(score <= targetScore) {
				enemy.tl.pause();
				location.href = "https://wkwktk.tk/";
			}
			targetScore = 75000;
			new Telop(400, "honeydew", "48px Play", "Stage 2");
			new Telop(475, "#ccc", "16px Play", `Target total score: ${targetScore}`);
			scoreLabel.color = "#ccc";
			enemy.image = circleSurf(12, "thistle");
		})
		.delay(150)
		.then(() => {
			for(m = 0; m < 18; m++) {
				new CreateBulletCircle(8, "aliceblue", 210 + 18 - m * 2, 12, 0, 30);
			}
			m = 0;
		})
		.delay(45)
		.then(() => {
			for(m = 0; m < 18; m++) {
				new CreateBulletCircle(8, "aliceblue", 180 + 18 - m * 2, 12, 0, 30);
			}
			m = 0;
		})
		.delay(45)
		.then(() => {
			for(m = 0; m < 18; m++) {
				new CreateBulletCircle(8, "aliceblue", 150 + 18 - m * 2, 12, 0, 30);
			}
			m = 0;
		})
		.delay(45)
		.repeat(() => {
			new CreateBulletCircle(8, "aliceblue", m * 130, 15, 6, 25);
			m++;
		}, 80)
		.delay(90)
		.then(() => {
			for(m = 0; m < 18; m++) {
				new CreateBulletCircle(8, "aliceblue", 150 + 18 - m * 2, 12, 0, 30);
			}
			m = 0;
		})
		.delay(45)
		.then(() => {
			for(m = 0; m < 18; m++) {
				new CreateBulletCircle(8, "aliceblue", 180 + 18 - m * 2, 12, 0, 30);
			}
			m = 0;
		})
		.delay(45)
		.then(() => {
			for(m = 0; m < 18; m++) {
				new CreateBulletCircle(8, "aliceblue", 210 + 18 - m * 2, 12, 0, 30);
			}
			m = 0;
		})
		.delay(45)
		.repeat(() => {
			new CreateBulletCircle(8, "aliceblue", m * -130, 15, 6, 25);
			m++;
		}, 60)
		.delay(76)
		.then(() => {
			allDestroy = true;
		})
		.delay(1)
		.then(() => {    //"Special attack!"
			allDestroy = false;
			new Telop(300, "#aaa", "italic 16px ProstoOne-Regular", "Special attack!");
			new RestTime(1150, 2.5, true);
		})
		.delay(60)
		/*繰り返し4回*/
		.cue(sa2)
		.delay(45)
		.repeat(() => {
			new CreateBulletCircle(8, "aliceblue", m * 130, 15, 6, 25);
			m++;
		}, 80)
		.delay(45)
		//
		.cue(sa2)
		.delay(45)
		.repeat(() => {
			new CreateBulletCircle(8, "aliceblue", m * 130, 15, 6, 25);
			m++;
		}, 80)
		.delay(45)
		//
		.cue(sa2)
		.delay(45)
		.repeat(() => {
			new CreateBulletCircle(8, "aliceblue", m * 130, 15, 6, 25);
			m++;
		}, 80)
		.delay(45)
		//
		.cue(sa2)
		.delay(45)
		.repeat(() => {
			new CreateBulletCircle(8, "aliceblue", m * 130, 15, 6, 25);
			m++;
		}, 80)
		/*ここまで*/
		.delay(90)
		//
		.then(() => {
			tSC = new Telop(400, "#f8f8f8", "48px Play", `${score}`);
			new Telop(475, "#ccc", "16px Play", `Target score: ${targetScore}`);
			new Telop(500, "#ccc", "16px Play", score >= targetScore ? "Stage clear! Next stage..." : "Failed...");
		})
		.delay(40)
		.then(() => {
			if(score >= targetScore) tSC.color = "blanchedalmond";
		})
		/*Stage 3*/
		.delay(180)
		.then(() => {
			if(score <= targetScore) {
				enemy.tl.pause();
				location.href = "https://wkwktk.tk/";
			}
			targetScore = 150000;
			new Telop(400, "honeydew", "48px Play", "Stage 3");
			new Telop(475, "#ccc", "16px Play", `Target total score: ${targetScore}`);
			scoreLabel.color = "#ccc";
			enemy.image = circleSurf(12, "navajowhite");
		})
		.delay(150)
		//全方位団36
		.then(() => {
			for(m = 0; m < 36; m++) {
				new CreateBulletCircle(6, "honeydew", m * 10, 10, 3, 30);
			}
		})
		//全方位団36(x2)
		.delay(30)
		.then(() => {
			for(m = 0; m < 36; m++) {
				new CreateBulletCircle(6, "honeydew", m * 10, 10, 3, 30);
			}
			for(m = 0; m < 36; m++) {
				new CreateBulletCircle(6, "honeydew", m * 10, 10, -3, 30);
			}
		})
		.then(() => {
			centerMoveTo(enemy, -enemy.width, 63);
			m = 0;
		})
		.delay(60)
		.repeat(() => {
			new CreateBulletRectandle(2, 16, "honeydew", m * 130, 10, 0, 30);
			enemy.x += 6;
			m++;
		}, 140)
		.delay(60)
		.then(() => {
			centerMoveTo(enemy, 400, 125);
		})
		//全方位団36
		.then(() => {
			for(m = 0; m < 36; m++) {
				new CreateBulletCircle(6, "honeydew", m * 10, 10, -3, 30);
			}
		})
		.delay(30)
		//全方位団36(x2)
		.then(() => {
			for(m = 0; m < 36; m++) {
				new CreateBulletCircle(6, "honeydew", m * 10, 10, 3, 30);
			}
			for(m = 0; m < 36; m++) {
				new CreateBulletCircle(6, "honeydew", m * 10, 10, -3, 30);
			}
		})
		.delay(200)
		.then(() => {    //"Special attack!"
			new Telop(300, "#aaa", "italic 16px ProstoOne-Regular", "Special attack!");
			new RestTime(850, 4.5);
		})
		.delay(60)
		//繰り返し1
		.repeat(() => {
			new CreateBulletRectandle(2, 16, "honeydew", m * 150, 10, -6, 30);
			m++;
		}, 20)
		.then(() => {
			for(m = 0; m < 36; m++) {
				new CreateBulletCircle(8, "aliceblue", m * 10, 10, 6, 30);
			}
			m = 0;
		})
		.repeat(() => {
			new CreateBulletRectandle(2, 16, "honeydew", m * 150, 10, 6, 30);
			m++;
		}, 20)
		.then(() => {
			for(m = 0; m < 36; m++) {
				new CreateBulletCircle(8, "blanchedalmond", m * 10, 10, -6, 30);
			}
			m = 0;
		})
		.repeat(() => {
			new CreateBulletRectandle(2, 16, "honeydew", m * 150, 10, -6, 30);
			m++;
		}, 20)
		.then(() => {
			for(m = 0; m < 36; m++) {
				new CreateBulletCircle(8, "honeydew", m * 10, 10, 6, 30);
			}
			m = 0;
		})
		.delay(150)
		//繰り返し2
		.repeat(() => {
			new CreateBulletRectandle(2, 16, "honeydew", m * 150, 10, 6, 30);
			m++;
		}, 20)
		.then(() => {
			for(m = 0; m < 36; m++) {
				new CreateBulletCircle(8, "aliceblue", m * 10, 10, -6, 30);
			}
			m = 0;
		})
		.repeat(() => {
			new CreateBulletRectandle(2, 16, "honeydew", m * 150, 10, -6, 30);
			m++;
		}, 20)
		.then(() => {
			for(m = 0; m < 36; m++) {
				new CreateBulletCircle(8, "blanchedalmond", m * 10, 10, 6, 30);
			}
			m = 0;
		})
		.repeat(() => {
			new CreateBulletRectandle(2, 16, "honeydew", m * 150, 10, 6, 30);
			m++;
		}, 20)
		.then(() => {
			for(m = 0; m < 36; m++) {
				new CreateBulletCircle(8, "honeydew", m * 10, 10, -6, 30);
			}
			m = 0;
		})
		.delay(150)
		//繰り返し3
		.repeat(() => {
			new CreateBulletRectandle(2, 16, "honeydew", m * 150, 10, -6, 30);
			m++;
		}, 20)
		.then(() => {
			for(m = 0; m < 36; m++) {
				new CreateBulletCircle(8, "aliceblue", m * 10, 10, 6, 30);
			}
			m = 0;
		})
		.repeat(() => {
			new CreateBulletRectandle(2, 16, "honeydew", m * 150, 10, 6, 30);
			m++;
		}, 20)
		.then(() => {
			for(m = 0; m < 36; m++) {
				new CreateBulletCircle(8, "blanchedalmond", m * 10, 10, -6, 30);
			}
			m = 0;
		})
		.repeat(() => {
			new CreateBulletRectandle(2, 16, "honeydew", m * 150, 10, -6, 30);
			m++;
		}, 20)
		.then(() => {
			for(m = 0; m < 36; m++) {
				new CreateBulletCircle(8, "honeydew", m * 10, 10, 6, 30);
			}
			m = 0;
		})
		.delay(900)
		.then(() => {
			tSC = new Telop(400, "#f8f8f8", "48px Play", `${score}`);
			new Telop(475, "#ccc", "16px Play", `Target score: ${targetScore}`);
			new Telop(500, "#ccc", "16px Play", score >= targetScore ? "Stage clear!" : "Failed...");
		})
		.delay(40)
		.then(() => {
			if(score >= targetScore) tSC.color = "blanchedalmond";
		})
		/*clear*/
		.delay(90)
		.then(() => {
			enemy.tl.pause();
			location.href = score >= targetScore ? "./clear" : "https://wkwktk.tk";
		})
	}

	core.start();
}