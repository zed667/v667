let video = document.getElementById("video");
let speedElem = document.getElementById("speed");
let startLine = document.getElementById("startLine");
let endLine = document.getElementById("endLine");
let timerStart = 0, started = false;

navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    .then(stream => {
        video.srcObject = stream;
    }).catch(err => {
        alert("🚫 دوربین فعال نشد: " + err);
    });

function makeDraggable(line) {
    line.addEventListener("touchstart", (e) => {
        e.preventDefault(); // این خیلی مهمه که تاچ رو بگیره
        let touch = e.touches[0];
        let offsetX = touch.clientX - line.getBoundingClientRect().left;

        function move(e) {
            e.preventDefault();
            let posX = e.touches[0].clientX - offsetX;
            if (posX >= 0 && posX <= window.innerWidth) {
                line.style.left = `${posX}px`; // تغییر از right به left
            }
        }

        function stop() {
            window.removeEventListener("touchmove", move);
            window.removeEventListener("touchend", stop);
        }

        window.addEventListener("touchmove", move, { passive: false });
        window.addEventListener("touchend", stop);
    });
}

makeDraggable(startLine);
makeDraggable(endLine);

function detectMovement() {
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");
    canvas.width = 100;
    canvas.height = 100;

    setInterval(() => {
        ctx.drawImage(video, 0, 0, 100, 100);
        let data = ctx.getImageData(0, 0, 100, 100).data;
        let sum = 0;
        for (let i = 0; i < data.length; i += 4) {
            sum += data[i] + data[i + 1] + data[i + 2];
        }

        if (sum > 500000 && !started) {
            timerStart = performance.now();
            started = true;
        }
    }, 50);
}

function calculateSpeed() {
    requestAnimationFrame(calculateSpeed);
    if (started) {
        let now = performance.now();
        let time = (now - timerStart) / 1000;

        let distance = Math.abs(parseInt(startLine.style.left) - parseInt(endLine.style.left)) / window.innerWidth * 10; 
        let speed = (distance / time) * 3.6;

        speedElem.textContent = speed.toFixed(2);
        started = false;
    }
}

detectMovement();
calculateSpeed();
