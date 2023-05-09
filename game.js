// JAVASCRIPT CODE //
// находим наш canvas
const cvs = document.getElementById("canvas");
const ctx = cvs.getContext("2d");

// Выделяем переменные с которыми будем работать дальше
let frame = 0;
const DEGREE = Math.PI / 180;

// Выделим и загрузим спрайты изобрежний которые будем использовать дальше
const sprite = new Image();
sprite.src = "img/sprite.png";
// Подключаем звук

const SCORE = new Audio();
SCORE.src = "audio/sfx_point.wav";

const FLAP = new Audio();
FLAP.src = "audio/sfx_flap.wav";

const DIE = new Audio();
DIE.src = "audio/sfx_die.wav";

const HIT = new Audio();
HIT.src = "audio/sfx_hit.wav";

const SWOOSHING = new Audio();
SWOOSHING.src = "audio/sfx_swooshing.wav";

// Кнопка начала игры

const startBtn = {
  x: 120,
  y: 263,
  w: 83,
  h: 29,
};
// Пишем логику стадий игры 1 - Начало игры . 2 - Процесс игры . 3 - Конец игры
const gameState = {
  // текущее значение
  current: 0,
  // начало
  getReady: 0,
  // процесс
  game: 1,
  // конец
  over: 2,
};
// Контроллер игры
cvs.addEventListener("click", function (e) {
  switch (gameState.current) {
    // если состояние игры getReady то при клике игра запускается, меняет current на game
    case gameState.getReady:
      gameState.current = gameState.game;
      SWOOSHING.play();
      break;
    // если игра уже запущенна и состояние имеет значение game то запускается функция flap()
    case gameState.game:
      bird.flap();
      FLAP.play();
      break;

    // если игра закончена нас возвращает в начало на getReady
    case gameState.over:
      let rect = cvs.getBoundingClientRect();
      let clickX = e.clientX - rect.left;
      let clickY = e.clientY - rect.top;
      if (
        clickX >= startBtn.x &&
        clickX <= startBtn.x + startBtn.w &&
        clickY >= startBtn.y &&
        clickY <= startBtn.y + startBtn.h
      ) {
        bird.speedReset();
        pipes.reset();
        score.reset();
        gameState.current = gameState.getReady;
      }

      break;
  }
});
// Находим координаты и отрисовываем фон
const bg = {
  sX: 0,
  sY: 0,
  w: 275,
  h: 226,
  x: 0,
  y: cvs.height - 226,

  dx: 2,
  draw: function () {
    ctx.drawImage(
      sprite,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x,
      this.y,
      this.w,
      this.h
    );
    // отрисовка недостоющей части через добалвение к this.x + this.w,
    // чтобы изображение отрисовалось рядом с предыдущей картинкой
    ctx.drawImage(
      sprite,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x + this.w,
      this.y,
      this.w,
      this.h
    );
  },

  update: function () {
    if (gameState.current == gameState.game) {
      this.x = (this.x - this.dx) % (this.w / 1.2);
    }
  },
};

// Находи координаты и отрисовываем передний план . fg = foreground
const fg = {
  sX: 276,
  sY: 0,
  w: 224,
  h: 112,
  x: 0,
  y: cvs.height - 112,

  dx: 2,
  draw: function () {
    ctx.drawImage(
      sprite,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x,
      this.y,
      this.w,
      this.h
    );

    // повторяет тот же прием что и с bg , добалвяем ширину чтобы отрисовать новое изображение
    // после предыдущего
    ctx.drawImage(
      sprite,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x + this.w,
      this.y,
      this.w,
      this.h
    );
  },

  update: function () {
    if (gameState.current == gameState.game) {
      this.x = (this.x - this.dx) % (this.w / 2);
    }
  },
};
// Находим координаты птички и отрисовываем ее
const bird = {
  // находим 3 состояния птички через координаты на спрайте
  animation: [
    { sX: 276, sY: 112 },
    { sX: 276, sY: 139 },
    { sX: 276, sY: 164 },
  ],
  x: 50,
  y: 150,
  w: 34,
  h: 26,
  // добавляем скорость, прыжок и гравитацию для анимации передвижения птички
  speed: 0,
  gravity: 0.25,
  jump: 4.6,
  // добавляем угол наклона птички при прыжке и падении
  rotation: 0,

  radius: 12,
  frame: 0,

  draw: function () {
    let bird = this.animation[this.frame];

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    ctx.drawImage(
      sprite,
      bird.sX,
      bird.sY,
      this.w,
      this.h,
      -this.w / 2,
      -this.h / 2,
      this.w,
      this.h
    );

    ctx.restore();
  },

  flap: function () {
    this.speed = -this.jump;
  },

  update: function () {
    // если игра в состоянии getReady то птичка машет крыльями медленее
    this.period = gameState.current == gameState.getReady ? 10 : 5;
    // увеличиваем кадры на 1 каждый период
    this.frame += frame % this.period == 0 ? 1 : 0;
    // кадры идут от 0 до 4, потом возвращаются к 0
    this.frame = this.frame % this.animation.length;
    // если игра запущщена и не производится никаких действий птичка начнет падать
    if (gameState.current == gameState.getReady) {
      // после конца игры возвращаем птичку на исходное положение
      this.y = 150;
      this.rotation = 0 * DEGREE;
    } else {
      this.speed += this.gravity;
      this.y += this.speed;

      // если птичка касается пола то игра заканчивается
      if (this.y + this.h / 2 >= cvs.height - fg.h) {
        this.y = cvs.height - fg.h - this.h / 2;
        if (gameState.current == gameState.game) {
          gameState.current = gameState.over;
          DIE.play();
        }
      }
      // если скорость больше чем значения прыжка то птичка падает вниз
      // постепенное понижение наклона птички
      if (this.speed >= this.jump) {
        this.rotation = 90 * DEGREE;
        this.frame = 1;
      } else if (this.speed >= this.jump / 2) {
        this.rotation = 60 * DEGREE;
      } else if (this.speed >= this.jump / 3) {
        this.rotation = 30 * DEGREE;
      } else {
        this.rotation = -15 * DEGREE;
      }
    }
  },

  speedReset: function () {
    this.speed = 0;
  },
};

// Рисуем начальное состояние "GET READY"
const getReady = {
  sX: 0,
  sY: 228,
  w: 173,
  h: 152,
  x: cvs.width / 2 - 173 / 2,
  y: 80,

  draw: function () {
    // добавляем проверку на состояние игры чтобы отрисовать сообщение
    if (gameState.current == gameState.getReady) {
      ctx.drawImage(
        sprite,
        this.sX,
        this.sY,
        this.w,
        this.h,
        this.x,
        this.y,
        this.w,
        this.h
      );
    }
  },
};

// Рисуем сообщение "GAME OVER"

const gameOver = {
  sX: 175,
  sY: 228,
  w: 225,
  h: 202,
  x: cvs.width / 2 - 225 / 2,
  y: 90,

  draw: function () {
    // добавляем проверку на состояние игры чтобы отрисовать сообщение

    if (gameState.current == gameState.over) {
      ctx.drawImage(
        sprite,
        this.sX,
        this.sY,
        this.w,
        this.h,
        this.x,
        this.y,
        this.w,
        this.h
      );
    }
  },
};

// Находим и отрисовываем трубы
const pipes = {
  position: [],

  top: {
    sX: 553,
    sY: 0,
  },
  bottom: {
    sX: 502,
    sY: 0,
  },

  w: 53,
  h: 400,
  gap: 85,
  maxYPos: -150,
  dx: 2,

  draw: function () {
    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i];

      let topYPos = p.y;
      let bottomYPos = p.y + this.h + this.gap;

      // верхняя труба
      ctx.drawImage(
        sprite,
        this.top.sX,
        this.top.sY,
        this.w,
        this.h,
        p.x,
        topYPos,
        this.w,
        this.h
      );

      // нижняя труба
      ctx.drawImage(
        sprite,
        this.bottom.sX,
        this.bottom.sY,
        this.w,
        this.h,
        p.x,
        bottomYPos,
        this.w,
        this.h
      );
    }
  },

  update: function () {
    if (gameState.current !== gameState.game) return;
    if (frame % 100 == 0) {
      this.position.push({
        x: cvs.width,
        y: this.maxYPos * (Math.random() + 1),
      });
    }

    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i];

      let bottomPipeYPos = p.y + this.h + this.gap;

      // Расчет коллизии
      // Верхняя труба
      if (
        bird.x + bird.radius > p.x &&
        bird.x - bird.radius < p.x + this.w &&
        bird.y + bird.radius > p.y &&
        bird.y - bird.radius < p.y + this.h
      ) {
        gameState.current = gameState.over;
        HIT.play();
      }
      // Нижняя труба
      if (
        bird.x + bird.radius > p.x &&
        bird.x - bird.radius < p.x + this.w &&
        bird.y + bird.radius > bottomPipeYPos &&
        bird.y - bird.radius < bottomPipeYPos + this.h
      ) {
        gameState.current = gameState.over;
        HIT.play();
      }

      // движение труб в левую сторону
      p.x -= this.dx;

      // если трубы выходят за пределы cavnas холста удаляем их из массива
      if (p.x + this.w <= 0) {
        this.position.shift();
        // записываем очки после того как трубы выйдут за канвас
        score.value += 1;
        SCORE.play();
        score.best = Math.max(score.value, score.best);
        localStorage.setItem("best", score.best);
      }
    }
  },

  reset: function () {
    this.position = [];
  },
};

// счет

const score = {
  best: parseInt(localStorage.getItem("best")) || 0,
  value: 0,

  draw: function () {
    ctx.fillStyle = "#FFF";
    ctx.strokeStyle = "#000";

    if (gameState.current == gameState.game) {
      ctx.lineWidth = 2;
      ctx.font = "35px Teko";
      ctx.fillText(this.value, cvs.width / 2, 50);
      ctx.strokeText(this.value, cvs.width / 2, 50);
    } else if (gameState.current == gameState.over) {
      // значение счета
      ctx.font = "25px Teko";
      ctx.fillText(this.value, 225, 186);
      ctx.strokeText(this.value, 225, 186);
      // лучшее значение счета
      ctx.fillText(this.best, 225, 228);
      ctx.strokeText(this.best, 225, 228);
    }
  },

  reset: function () {
    this.value = 0;
  },
};
// Отрисовка
function draw() {
  ctx.fillStyle = "#70c5ce";
  ctx.fillRect(0, 0, cvs.width, cvs.height);

  bg.draw();
  pipes.draw();
  fg.draw();
  bird.draw();

  getReady.draw();
  gameOver.draw();
  score.draw();
}

// Обновление кадров
function update() {
  bird.update();
  fg.update();
  // bg.update();
  pipes.update();
}

// Повторение , вызов функции отрисовки и обновления по таймеру - создание анимации.

function loop() {
  update();
  draw();
  frame++;

  requestAnimationFrame(loop);
}

loop();
