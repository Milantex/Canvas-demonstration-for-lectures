window.addEventListener('load', init);

function init() {
    const gameState = {
        gameOver: false,
        startTime: window.performance.now(),
        lifeTime: 0,
        score: 0,
        bulletsShot: 0,
        asteroidsDestroyed: 0
    };

    const canvas = document.querySelector('#canvas');
    const g = canvas.getContext('2d');

    let bullets = [];
    let asteroids = [];

    let x = canvas.width / 2, y = canvas.height / 2, angle = 0, speed = 0;
    let lastTime = window.performance.now();

    const skyImage = new Image(800, 600);
    skyImage.src = 'assets/sky.jpg';

    const rocketImage = new Image(12, 22);
    rocketImage.src = 'assets/rocket.png';

    const asteroidImage = new Image(59, 45);
    asteroidImage.src = 'assets/asteroid.png';

    let keys = {};

    let nextAsteroidTimeout = 5000;

    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    canvas.addEventListener('click', clickEvent);
    
    function reset() {
        keys = {};

        gameState.gameOver = false;
        gameState.startTime = window.performance.now();
        gameState.bulletsShot = 0;
        gameState.asteroidsDestroyed = 0;
        gameState.lifeTime = 0;
        gameState.score = 0;

        bullets = [];
        asteroids = [];

        x = canvas.width / 2;
        y = canvas.height / 2;
        angle = 0;
        speed = 0;

        lastTime = window.performance.now();
        
        nextAsteroidTimeout = 5000;

        for (let i=0; i<15; i++) {
            createAnAsteroid(true);
        }

        setTimeout(spawnNextAsteroid, nextAsteroidTimeout);
    }

    reset();

    function clickEvent() {
        if (gameState.gameOver) {
            reset();
        }
    }

    function createAnAsteroid(initial) {
        let scale = Math.random() * 0.5 + 0.25;
        let x, y;

        if (initial) {
            x = Math.random() * canvas.width;
            y = Math.random() * canvas.height;
        } else {
            if (Math.random() < 0.5) {
                x = 0;
                y = Math.random() * canvas.height;
            } else {
                x = Math.random() * canvas.width;
                y = 0;
            }
        }

        asteroids.push({
            x: x,
            y: y,
            angle: Math.random() * 360,
            speed: Math.random() * 0.06,
            spinAngle: Math.random() * 360,
            spinSpeed: Math.random() * 4 - 2,
            width: scale * 60,
            height: scale * 48,
            scale: scale,
            shot: false
        });
    }

    function spawnNextAsteroid() {
        if (gameState.gameOver) {
            return;
        }

        createAnAsteroid(false);
        nextAsteroidTimeout * 0.75;
        setTimeout(spawnNextAsteroid, nextAsteroidTimeout);
    }

    function loop() {
        update(window.performance.now() - lastTime);
        draw();

        lastTime = window.performance.now();

        requestAnimationFrame(loop);
    }

    function tryToShootBullet() {
        if (bullets.length === 0) {
            shootBullet();
            return;
        }

        if (window.performance.now() - bullets[bullets.length-1].shotAtTime > 200) {
            shootBullet();
        }
    }

    function tryToShootadditionalBullets() {
        let offset = 5;

        if (bullets.length === 0) {
            shootBullet(-offset);
            shootBullet(+offset);
            return;
        }

        if (window.performance.now() - bullets[bullets.length-1].shotAtTime > 200) {
            shootBullet(-offset);
            shootBullet(+offset);
        }
    }

    function shootBullet(angleOffset) {
        let offset = 0;

        if (typeof angleOffset !== 'undefined') {
            offset = angleOffset;
        }

        bullets.push({
            x: x,
            y: y,
            angle: angle + offset,
            life: 4500,
            speed: speed + 0.15,
            width: 2,
            height: 2,
            shotAtTime: window.performance.now()
        });

        gameState.bulletsShot++;
    }
    
    function updateBullets(difference) {
        bullets.forEach(bullet => {
            bullet.life -= difference;

            let move = bullet.speed * difference;

            bullet.x += move * Math.sin(bullet.angle * Math.PI / 180.);
            bullet.y -= move * Math.cos(bullet.angle * Math.PI / 180.);

            let tollerance = 1;

            if (bullet.x < tollerance) {
                bullet.x = canvas.width + bullet.x + tollerance;
            }

            if (bullet.x > canvas.width + tollerance) {
                bullet.x = bullet.x - canvas.width - tollerance;
            }

            if (bullet.y < tollerance) {
                bullet.y = canvas.height + bullet.y + tollerance;
            }

            if (bullet.y > canvas.height + tollerance) {
                bullet.y = bullet.y - canvas.height - tollerance;
            }
        });

        bullets = bullets.filter(bullet => bullet.life > 0);
    }

    function updateAsteroids(difference) {
        asteroids.forEach(asteroid => {
            let move = asteroid.speed * difference;

            asteroid.x += move * Math.sin(asteroid.angle * Math.PI / 180.);
            asteroid.y -= move * Math.cos(asteroid.angle * Math.PI / 180.);
            
            let tollerance = 60;

            if (asteroid.x < tollerance) {
                asteroid.x = canvas.width + asteroid.x + tollerance;
            }

            if (asteroid.x > canvas.width + tollerance) {
                asteroid.x = asteroid.x - canvas.width - tollerance;
            }

            if (asteroid.y < tollerance) {
                asteroid.y = canvas.height + asteroid.y + tollerance;
            }

            if (asteroid.y > canvas.height + tollerance) {
                asteroid.y = asteroid.y - canvas.height - tollerance;
            }

            asteroid.spinAngle += asteroid.spinSpeed;
        });

        asteroids = asteroids.filter(asteroid => !asteroid.shot);
    }

    function updateRocket(difference) {
        let move = speed * difference;

        x += move * Math.sin(angle * Math.PI / 180.);
        y -= move * Math.cos(angle * Math.PI / 180.);

        if (x < 0) {
            x = canvas.width + x;
        }

        if (x > canvas.width) {
            x = x - canvas.width;
        }

        if (y < 0) {
            y = canvas.height + y;
        }

        if (y > canvas.height) {
            y = y - canvas.height;
        }
    }

    function updateLifeTime() {
        gameState.lifeTime = window.performance.now() - gameState.startTime;

        gameState.score = Number(gameState.lifeTime / 1000 + gameState.asteroidsDestroyed * 10 - gameState.bulletsShot * 2).toFixed(1) + '0';
    }

    function intersect(a, b) {
        return (a.left <= b.right &&
                b.left <= a.right &&
                a.top <= b.bottom &&
                b.top <= a.bottom);
    }

    function makeIntersectionBounds(x, y, w, h) {
        let realX = x - w/2;
        let realY = y - h/2;

        return {
            left: realX,
            top: realY,
            right: realX + w,
            bottom: realY + h
        };
    }

    function bulletAndAsteroidCollisionDetection() {
        for (let asteroidIndex in asteroids) {
            let asteroid = asteroids[asteroidIndex];

            for (let bulletIndex in bullets) {
                let bullet = bullets[bulletIndex];

                let asteroidAndBulletIntersect = intersect(
                    makeIntersectionBounds(asteroid.x, asteroid.y, asteroid.width, asteroid.height),
                    makeIntersectionBounds(bullet.x, bullet.y, bullet.width, bullet.height)
                );

                if (asteroidAndBulletIntersect) {
                    asteroids[asteroidIndex].shot = true;
                    bullets[bulletIndex].life = 0;
                    gameState.asteroidsDestroyed++;
                }
            }
        }
    }

    function rockerAndAsteroidCollisionDetection() {
        for (let asteroidIndex in asteroids) {
            let asteroid = asteroids[asteroidIndex];

            let asteroidAndRocketIntersect = intersect(
                makeIntersectionBounds(asteroid.x, asteroid.y, asteroid.width, asteroid.height),
                makeIntersectionBounds(x, y, rocketImage.width, rocketImage.height)
            );

            if (asteroidAndRocketIntersect) {
                endGame();
            }
        }
    }

    function recordScore() {
        let scoreRecord = {
            date: new Date(),
            score: gameState.score
        };

        let scoresString = localStorage.getItem('scores');
        if (scoresString === null) {
            scoresString = "[]";
        }

        let scores = JSON.parse(scoresString);

        scores.push(scoreRecord);

        scores.sort((a, b) => {
            return Number(a.score) < Number(b.score);
        });

        scores = scores.slice(0, 5);

        let newScoresString = JSON.stringify(scores);

        localStorage.setItem('scores', newScoresString);
    }

    function getTopScores() {
        let scoresString = localStorage.getItem('scores');

        if (scoresString === null) {
            scoresString = "[]";
        }

        return JSON.parse(scoresString);
    }

    function endGame() {
        gameState.gameOver = true;
        recordScore();
    }

    function update(difference) {
        if (gameState.gameOver) {
            return;
        }

        updateRocket(difference);

        bulletAndAsteroidCollisionDetection();

        updateBullets(difference);
        updateAsteroids(difference);

        rockerAndAsteroidCollisionDetection();
        
        updateLifeTime();
    }

    function drawImage(g, image, x, y, angle, scale) {
        if (typeof scale === 'undefined') {
            scale = 1.0;
        }

 	g.save(); 
 	g.translate(x, y);
 	g.rotate(angle * Math.PI / 180.);
 	g.drawImage(image, -image.width * scale / 2, -image.height * scale / 2, image.width * scale, image.height * scale);
 	g.restore(); 
    }
    
    function serbianDateFormat(date) {
        date = new Date(date);
        return date.getDate() + '. ' + (date.getMonth()+1) + '. ' +  date.getFullYear() + '.';
    }

    function printTopScores() {
        g.textAlign = 'center';
        g.fillStyle = '#66aaff';
        g.font = '24pt Calibri';

        g.fillText("Top Scores", canvas.width / 2, 50);

        g.font = '20pt Calibri';

        let scores = getTopScores();

        let position = 110;

        for (let score of scores) {
            g.fillText(serbianDateFormat(score.date) + " = " + score.score, canvas.width / 2, position);
            position += 30;
        }
    }

    function printScoreAndStats() {
        g.textAlign = 'right';
        g.fillStyle = '#33cc11';
        g.font = '18pt Calibri';

        g.fillText("Bullets shot: " + gameState.bulletsShot, canvas.width - 20, canvas.height - 80);
        g.fillText("Asteroids destroyed: " + gameState.asteroidsDestroyed, canvas.width - 20, canvas.height - 50);
        g.fillText("Score: " + gameState.score, canvas.width - 20, canvas.height - 20);
    }

    function drawBullets() {
        bullets.forEach(drawBullet);
    }

    function drawAsteroids() {
        asteroids.forEach(drawAsteroid);
    }

    function drawBullet(bullet) {
        g.fillStyle = '#fff';
        g.fillRect(bullet.x - bullet.width / 2, bullet.y - bullet.height / 2, bullet.width, bullet.height);
    }

    function drawAsteroid(asteroid) {
        drawImage(g, asteroidImage, asteroid.x, asteroid.y, asteroid.spinAngle, asteroid.scale);
    }
    
    function drawSky() {
        drawImage(g, skyImage, skyImage.width/2, skyImage.height/2, 0, 1.0);
    }

    function drawGameOver() {
        g.fillStyle = 'rgba(0, 0, 0, 0.5)';
        g.fillRect(0, 0, canvas.width, canvas.height);

        g.font = '32pt Calibri';
        g.textAlign = 'center';

        g.fillStyle = '#880000';
        g.fillText("Game Over", canvas.width / 2 + 1, canvas.height / 2 + 1);

        g.fillStyle = '#ffffff';
        g.fillText("Game Over", canvas.width / 2, canvas.height / 2);
        
        g.font = '18pt Calibri';
        g.fillText("Click to start again", canvas.width / 2, canvas.height / 2 + 50);
    }

    function draw() {
        g.fillStyle = '#000';
        g.fillRect(0, 0, canvas.width, canvas.height);
        
        drawSky();

        drawImage(g, rocketImage, x, y, angle);
        
        drawBullets();
        drawAsteroids();
        printScoreAndStats();

        if (gameState.gameOver) {
            drawGameOver();
            printTopScores();
        }
    }

    function keyUp(e) {
        e.preventDefault();

        keys[e.keyCode] = false;

        processKeys();
    }

    function keyDown(e) {
        e.preventDefault();

        keys[e.keyCode] = true;

        processKeys();
    }

    function processKeys() {
        if (gameState.gameOver) {
            return;
        }

        for (let keyCode in keys) {
            if (!keys[keyCode]) {
                continue;
            }

            switch (Number(keyCode)) {
                case 38: // Up
                    speed += 0.005;
                    break;
                case 40: // Down
                    speed -= 0.005;
                    speed = Math.max(0, speed);
                    break;
                case 37: // Left
                    angle -= 2.5;
                    break;
                case 39: // Right
                    angle += 2.5;
                    break;
                case 32: // Space
                    tryToShootBullet();
                    break;
                case 17: // Ctrl
                    tryToShootadditionalBullets();
                    break;
            }
        }
    }

    requestAnimationFrame(loop);
}
