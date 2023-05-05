// JAVASCRIPT CODE //
// находим наш canvas
const cvs = document.getElementById("canvas");
const ctx = cvs.getContext("2d");

// Выделяем переменные с которыми будем работать дальше
let frame = 0;

// Выделим и загрузим спрайты изобрежний которые будем использовать дальше
const sprite = new Image();
sprite.src = "img/sprite.png";

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
      break;
    // если игра уже запущенна и состояние имеет значение game то запускается функция flap()
    case gameState.game:
      bird.flap();
      break;

    // если игра закончена нас возвращает в начало на getReady
    case gameState.over:
      gameState.current = gameState.getReady;
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
};

// Находи координаты и отрисовываем передний план . fg = foreground
const fg = {
  sX: 276,
  sY: 0,
  w: 224,
  h: 112,
  x: 0,
  y: cvs.height - 112,

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

  frame: 0,

  draw: function () {
    let bird = this.animation[this.frame];
    ctx.drawImage(
      sprite,
      bird.sX,
      bird.sY,
      this.w,
      this.h,
      this.x - this.w / 2,
      this.y - this.h / 2,
      this.w,
      this.h
    );
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
    } else {
      this.speed += this.gravity;
      this.y += this.speed;
      // если птичка касается пола то игра заканчивается
      if (this.y + this.h / 2 >= cvs.height - fg.h) {
        this.y = cvs.height - fg.h - this.h / 2;
        if (gameState.current == gameState.game) {
          gameState.current = gameState.over;
        }
      }
    }
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

// Отрисовка
function draw() {
  ctx.fillStyle = "#70c5ce";
  ctx.fillRect(0, 0, cvs.width, cvs.height);
  bg.draw();
  fg.draw();
  bird.draw();
  getReady.draw();
  gameOver.draw();
}

// Обновление кадров
function update() {
  bird.update();
}

// Повторение , вызов функции отрисовки и обновления по таймеру - создание анимации.

function loop() {
  update();
  draw();
  frame++;

  requestAnimationFrame(loop);
}

loop();
