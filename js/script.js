console.log('Lets write JavaScript');

let currentSong = new Audio();
let songs;
let currFolder;


function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let response = await fetch(`${folder}/`);
    let responseText = await response.text();
    let tempDiv = document.createElement("div");
    tempDiv.innerHTML = responseText;
    let links = tempDiv.getElementsByTagName("a");

    songs = Array.from(links)
        .filter(link => link.href.endsWith(".mp3"))
        .map(link => link.href.split(`/${folder}/`)[1]);

    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";

    for (const song of songs) {
        songUL.innerHTML += `<li>
            <img class="invert" width="34" src="img/music.svg" alt="">
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                <div>Jarvis</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="img/play.svg" alt="">
            </div>
        </li>`;
    }

    Array.from(songUL.getElementsByTagName("li")).forEach(li => {
        li.addEventListener("click", () => {
            playMusic(li.querySelector(".info div").innerText.trim());
        });
    });

    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `${currFolder}/${track}`;
    if (!pause) {
        currentSong.play();
        document.getElementById("play").src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerText = decodeURIComponent(track);
    document.querySelector(".songtime").innerText = "00:00 / 00:00";
};

async function displayAlbums() {
    console.log("Displaying albums");
    let response = await fetch(`/songs/`);
    let responseText = await response.text();
    let tempDiv = document.createElement("div");
    tempDiv.innerHTML = responseText;
    let links = tempDiv.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");

    for (const link of links) {
        if (link.href.includes("/songs") && link.href.split('/').slice(-2, -1)[0] !== "") {
            let folder = link.href.split("/").slice(-2, -1)[0];
            let metadata = {
                title: folder.replace(/_/g, ' '),
                description: "No description available."
            };

            try {
                let metadataResponse = await fetch(`/songs/${folder}/info.json`);
                if (metadataResponse.ok) {
                    metadata = await metadataResponse.json();
                }
            } catch (error) {
                console.warn(`Metadata for ${folder} not found:`, error);
            }

            cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
                <div class="play">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
                    </svg>
                </div>
                <img src="/songs/${folder}/cover.jpg" alt="${metadata.title}" onerror="this.src='img/default_cover.jpg';">
                <h2>${metadata.title}</h2>
                <p>${metadata.description}</p>
            </div>`;
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async () => {
            console.log("Fetching songs");
            songs = await getSongs(`songs/${card.dataset.folder}`);
            playMusic(songs[0]);
            document.querySelector(".playbar").classList.add("show");
        });
    });
}

async function main() {
    await getSongs("songs/ncs");
    playMusic(songs[0], true);

    await displayAlbums();

    let playButton = document.getElementById("play");
    playButton.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            playButton.src = "img/pause.svg";
        } else {
            currentSong.pause();
            playButton.src = "img/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerText = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = `${(currentSong.currentTime / currentSong.duration) * 100}%`;
    });

    currentSong.addEventListener("ended", () => {
        let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").pop()));
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = e.offsetX / e.target.offsetWidth;
        currentSong.currentTime = percent * currentSong.duration;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    document.getElementById("previous").addEventListener("click", () => {
        let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").pop()));
        if (index - 1 >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    document.getElementById("next").addEventListener("click", () => {
        let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").pop()));
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    document.querySelector(".range input").addEventListener("input", e => {
        currentSong.volume = e.target.value / 100;
        let volumeIcon = document.querySelector(".volume > img");
        volumeIcon.src = currentSong.volume > 0 ? "img/volume.svg" : "img/mute.svg";
    });

    document.querySelector(".volume > img").addEventListener("click", e => {
        let volumeInput = document.querySelector(".range input");
        if (currentSong.volume > 0) {
            currentSong.volume = 0;
            volumeInput.value = 0;
            e.target.src = "img/mute.svg";
        } else {
            currentSong.volume = 0.1;
            volumeInput.value = 10;
            e.target.src = "img/volume.svg";
        }
    });
}

document.oncontextmenu = () => {
    alert("Right-click is disabled.");
    return false;
};

document.onkeydown = e => {
    if (["F12", "U", "C", "V"].includes(e.key) && (e.ctrlKey || e.shiftKey)) {
        alert("This action is disabled.");
        return false;
    }
};

main();
