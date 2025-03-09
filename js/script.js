console.log('Lets write JavaScript');
let currentSong = new Audio();
let songs=[];
let currFolder='';


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
  
    // Fetch the folder's info.json file
    let response = await fetch(`./songs/${folder}/info.json`);
    let data = await response.json(); // Parse JSON data
  
    songs = data.songs; // Extract the list of songs from info.json
  
    // Show all the songs in the playlist
    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = ""; // Clear the current list
  
    for (const song of songs) {
      songUL.innerHTML += `
        <li>
          <img class="invert" width="34" src="img/music.svg" alt="">
          <div class="info">
            <div>${song.title}</div>
            <div>${song.description}</div>
          </div>
          <div class="playnow">
            <span>Play Now</span>
            <img class="invert" src="img/play.svg" alt="">
          </div>
        </li>`;
    }
  
    // Attach an event listener to each song
    Array.from(document.querySelectorAll(".songList li")).forEach((e, index) => {
      e.addEventListener("click", () => {
        playMusic(songs[index].path); // Play the selected song
      });
    });
  
    return songs;
  }
  

  let currentIndex = 0; // Keeps track of the current song index

// Play the current song
  const playMusic = (track, pause = false) => {
    currentSong.src = `./songs/${currFolder}/` + track; // Set the song's source
    if (!pause) {
      currentSong.play();
      play.src = "img/pause.svg"; // Update the play button to pause
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"; // Reset the time display
  };

  
  async function displayAlbums() {
    console.log("Displaying albums");
  
    // Use a hardcoded array of info.json file paths
    let albums = [
      "/songs/Arijit_Singh/info.json",
      "/songs/sonu/info.json",
      "/songs/Love_(mood)/info.json",
      "/songs/Old_Songs/info.json",
      "/songs/Diljit/info.json",
      "/songs/Sleep_(mood)/info.json",
      "/songs/Devotional/info.json",
    ];
  
    let cardContainer = document.querySelector(".cardContainer");
  
    for (const albumPath of albums) {
      // Extract the folder name from the path
      let folder = albumPath.split("/").slice(-2)[0];
  
      // Fetch the album's metadata
      let response = await fetch(`./songs/${folder}/info.json`);
      let data = await response.json();
  
      // Create album cards
      cardContainer.innerHTML += `
        <div data-folder="${folder}" class="card">
          <div class="play">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
            </svg>
          </div>
          <img src="./songs/${folder}/cover.jpg" alt="">
          <h2>${data.title}</h2>
          <p>${data.description}</p>
        </div>`;
    }
  
    // Attach event listeners to album cards
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
      e.addEventListener("click", async (item) => {
        console.log("Fetching Songs");
        songs = await getSongs(item.currentTarget.dataset.folder);
        playMusic(songs[0].path); // Play the first song in the album
  
        // Show the playbar after clicking a card
        document.querySelector(".playbar").classList.add("show");
      });
    });
  }
  

async function main() {

    // Get the list of all the songs
    // await getSongs(folder)
    // playMusic(songs[0], true)

    // Display all the albums on the page
     await displayAlbums()


    // Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

     // Automatically play the next song when the current one ends
     currentSong.addEventListener("ended", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
        document.querySelector(".header").style.display = "none";
    })

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
        document.querySelector(".header").style.display = "flex";
    })

    // Play the next song
const playNext = () => {
  if (currentIndex < songs.length - 1) {
      currentIndex++;
  } else {
      currentIndex = 0; // Loop back to the first song
  }
  playMusic(songs[currentIndex].path);
};

// Play the previous song
const playPrevious = () => {
  if (currentIndex > 0) {
      currentIndex--;
  } else {
      currentIndex = songs.length - 1; // Loop back to the last song
  }
  playMusic(songs[currentIndex].path);
};

// Attach event listeners to "Next" and "Previous" buttons
document.getElementById("next").addEventListener("click", playNext);
document.getElementById("previous").addEventListener("click", playPrevious);

// Update currentIndex when a song is clicked directly
Array.from(document.querySelectorAll(".songList li")).forEach((e, index) => {
  e.addEventListener("click", () => {
      currentIndex = index; // Set the current index to the clicked song
      const songName = e.querySelector(".info div:first-child").textContent.trim();
      playMusic(songName);
  });
});

    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100")
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume >0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }

        else if (currentSong.volume == 0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("volume.svg", "mute.svg")
        }
    })

    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e=>{ 
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })


}


// Security to protect the code....
// document.oncontextmenu = () => {
//     alert("Don't try to hack us from right click. 😍🤪");
//     return false;
// }


document.onkeydown = e => {

    if (e.key == "F12") {
        alert("Don't try to inspect element. 😍");
        return false;
    }

    if (e.ctrlKey && e.key == "u") {
        alert("Page Source nhi milega re. 😍");
        return false;
    }

    if (e.ctrlKey && e.key == "U") {
        alert("Page Source nhi milega re. 😍");
        return false;
    }

    if (e.ctrlKey && e.key == "c") {
        alert("Don't try to copy page element. 😍");
        return false;
    }

    if (e.ctrlKey && e.key == "v") {
        alert("Don't try to paste anything to page. 😍");
        return false;
    }

    if (e.ctrlKey && e.shiftKey && e.key == "I") {
        alert("Are nhi Goli beta , Masti nhi. 😍");
        return false;
    }

    if (e.ctrlKey && e.shiftKey && e.key == "i") {
        alert("Naa munna naa , Tumse na ho payega. 😍");
        return false;
    }
}



main() 