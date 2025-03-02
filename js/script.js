let video = document.getElementById("video");
let speedElem = document.getElementById("speed");
let startLine = document.getElementById("startLine");
let endLine = document.getElementById("endLine");
let timerStart = 0, started = false, speeds = [];

navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    .then(stream => {
        video.srcObject = stream;
        video.onloadedmetadata = () => {
            video.play();
            detectMovement(); // اینجا صبر میکنه تا ویدیو لود بشه
        };
    }).catch(err => {
        alert("🚫 دوربین فعال نشد: " + err);
    });


function makeDraggable(line) {
    line.addEventListener("touchstart", (e) => {
        e.preventDefault();
        let touch = e.touches[0];
        let offsetX = touch.clientX - line.getBoundingClientRect().left;

        function move(e) {
            e.preventDefault();
            let posX = e.touches[0].clientX - offsetX;
            if (posX >= 0 && posX <= window.innerWidth) {
                line.style.left = `${posX}px`;
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
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    setInterval(() => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        let data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let sum = 0;

        for (let i = 0; i < data.length; i += 4) {
            sum += data[i] + data[i + 1] + data[i + 2];
        }

        let average = sum / (canvas.width * canvas.height);

        let objectPosition = Math.random() * window.innerWidth;

        if (objectPosition >= parseInt(startLine.style.left) && !started) {
            timerStart = performance.now();
            started = true;
        }

        if (objectPosition >= parseInt(endLine.style.left) && started) {
            let time = (performance.now() - timerStart) / 1000;
            let distance = Math.abs(parseInt(startLine.style.left) - parseInt(endLine.style.left)) / window.innerWidth * 10;
            let speed = (distance / time) * 3.6;

            speedElem.textContent = speed.toFixed(2) + " km/h";
            speeds.push(speed.toFixed(2));
            showSavedSpeeds();

            started = false;
        }
    }, 50);
}

function showSavedSpeeds() {
    let list = document.getElementById("savedSpeeds");
    list.innerHTML = "";
    speeds.forEach(speed => {
        let li = document.createElement("li");
        li.textContent = speed + " km/h";
        list.appendChild(li);
    });
}

detectMovement();
