const image = document.getElementById('cover');
const title = document.getElementById('music-title');
const artist = document.getElementById('music-artist');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const progress = document.getElementById('progress');
const playerProgress = document.getElementById('player-progress');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const playBtn = document.getElementById('play');
const likeBtn = document.getElementById('likeButton');
const background = document.getElementById('bg-img');
const shareBtn = document.getElementById('shareButton');
const snackbar = document.getElementById('snackbar');
const logoutBtn = document.getElementById('logoutButton');


// login

// Recuperar as informações do localStorage
var nome = localStorage.getItem("nome");
var fotoBase64 = localStorage.getItem("fotoBase64");

// Exibir as informações no documento HTML
document.getElementById("artist-name").textContent = nome;
document.getElementById("profile-image").src = fotoBase64;

// Salvar as informações de perfil no localStorage
localStorage.setItem("nome", nome);
localStorage.setItem("fotoBase64", fotoBase64);


// logout
logoutBtn.addEventListener('click', () => {
  if (confirm("Tem certeza de que deseja sair?")) {
    window.location.href = 'sign.html';
    localStorage.removeItem("nome");
    localStorage.removeItem("fotoBase64");
  }
});

const music = new Audio();

let songs = [];

let musicIndex = 0;
let isPlaying = false;
let copiedLinks = []; // Armazena os links copiados por música

function togglePlay() {
  if (isPlaying) {
    pauseMusic();
  } else {
    playMusic();
  }
}

function playMusic() {
  isPlaying = true;
  // Change play button icon
  playBtn.classList.replace('fa-play', 'fa-pause');
  // Set button hover title
  playBtn.setAttribute('title', 'Pause');
  music.play();
}

function pauseMusic() {
  isPlaying = false;
  // Change pause button icon
  playBtn.classList.replace('fa-pause', 'fa-play');
  // Set button hover title
  playBtn.setAttribute('title', 'Play');
  music.pause();
}

function loadMusic(song) {
  music.src = song.path;
  title.textContent = song.displayName;
  artist.textContent = song.artist;
  image.src = song.cover;
  background.src = song.cover;

  // Atualiza o valor do contador no local storage
  localStorage.setItem(`likeCounter_${musicIndex}`, song.likeCounter);

  // Atualiza o estado do botão "like" para a música atual
  if (song.liked) {
    likeBtn.classList.add('liked');
  } else {
    likeBtn.classList.remove('liked');
  }
  
}

function changeMusic(direction) {
  musicIndex = (musicIndex + direction + songs.length) % songs.length;
  loadMusic(songs[musicIndex]);
  playMusic();
  
}

function updateProgressBar() {
  const { duration, currentTime } = music;
  const progressPercent = (currentTime / duration) * 100;
  progress.style.width = `${progressPercent}%`;

  const formatTime = (time) => String(Math.floor(time)).padStart(2, '0');
  durationEl.textContent = `${formatTime(duration / 60)}:${formatTime(duration % 60)}`;
  currentTimeEl.textContent = `${formatTime(currentTime / 60)}:${formatTime(currentTime % 60)}`;
}

function setProgressBar(e) {
  const width = playerProgress.clientWidth;
  const clickX = e.offsetX;
  music.currentTime = (clickX / width) * music.duration;
}

function toggleLike() {
  if (likeBtn.classList.contains('liked')) {
    songs[musicIndex].likeCounter -= 1;
    likeBtn.classList.remove('liked');
    songs[musicIndex].liked = false;
    removeSongFromLikes(songs[musicIndex]); // Remove a música da lista de curtidas
  } else {
    songs[musicIndex].likeCounter += 1;
    likeBtn.classList.add('liked');
    songs[musicIndex].liked = true;
    addSongToLikes(songs[musicIndex]); // Adiciona a música à lista de curtidas
  }

  // Atualiza o valor do contador no local storage
  localStorage.setItem(`likeCounter_${musicIndex}`, songs[musicIndex].likeCounter);
  updateCounter(songs[musicIndex].likeCounter, musicIndex);

  // Selecionar o elemento do contador de informações da música
  const songInfoElement = document.querySelector(`#my-musics .song-item:nth-child(${musicIndex + 1}) .song-info`);

  if (songInfoElement) {
    // Remover o conteúdo existente
    while (songInfoElement.firstChild) {
      songInfoElement.removeChild(songInfoElement.firstChild);
    }

    // Criar o ícone de curtida
    const likeIcon = document.createElement('i');
    likeIcon.classList.add('fas', 'fa-heart');
    songInfoElement.appendChild(likeIcon);

    // Adicionar o contador de curtidas
    const likeCounter = document.createElement('span');
    likeCounter.textContent = songs[musicIndex].likeCounter;
    songInfoElement.appendChild(likeCounter);

    // Criar o ícone de compartilhamento
    const shareIcon = document.createElement('i');
    shareIcon.classList.add('fas', 'fa-share');
    songInfoElement.appendChild(shareIcon);

    // Adicionar o contador de compartilhamentos
    const shareCounter = document.createElement('span');
    shareCounter.textContent = songs[musicIndex].shareCounter;
    songInfoElement.appendChild(shareCounter);
  }
  
}

function addSongToLikes(song) {
  const myLikesList = document.getElementById('my-likes');

  const listItem = document.createElement('li');
  listItem.classList.add('liked-song');

  const songImage = document.createElement('img');
  songImage.src = song.cover;
  songImage.classList.add('liked-song-image');

  const songTitleArtist = document.createElement('span');
  songTitleArtist.classList.add('liked-song-title-artist');
  songTitleArtist.textContent = `${song.displayName} - ${song.artist}`;

  listItem.appendChild(songImage);
  listItem.appendChild(songTitleArtist);
  myLikesList.appendChild(listItem);

  listItem.addEventListener('click', () => {
    musicIndex = songs.indexOf(song);
    loadMusic(songs[musicIndex]);
    playMusic();
    mostrarPagina(1);
    toggleSidebar();
  });
  
}

function removeSongFromLikes(song) {
  const myLikesList = document.getElementById('my-likes');
  const likedSongs = myLikesList.getElementsByClassName('liked-song');

  for (let i = 0; i < likedSongs.length; i++) {
    const likedSong = likedSongs[i];
    const titleElement = likedSong.querySelector('.liked-song-title-artist');

    if (titleElement.textContent === `${song.displayName} - ${song.artist}`) {
      myLikesList.removeChild(likedSong);
      break;
    }
  }
  
}

function toggleShare() {
  if (copiedLinks.includes(musicIndex)) return; // Impede que o link seja copiado novamente para a mesma música

  const currentSong = songs[musicIndex];
  const songLink = currentSong.link;

  // Copiar o link para a área de transferência
  navigator.clipboard.writeText(songLink);

  // Exibir o snackbar
  snackbar.classList.add('show');

  // Atualizar o contador específico de compartilhamentos
  currentSong.shareCounter += 1;
  updateCounter(currentSong.shareCounter, musicIndex);

  // Remover a classe 'show' do snackbar após alguns segundos
  setTimeout(() => {
    snackbar.classList.remove('show');
  }, 3000);

  copiedLinks.push(musicIndex); // Adiciona a música à lista de links copiados

  // Selecionar o elemento do contador de informações da música
  const songInfoElement = document.querySelector(`#my-musics .song-item:nth-child(${musicIndex + 1}) .song-info`);

  if (songInfoElement) {
    // Remover o conteúdo existente
    while (songInfoElement.firstChild) {
      songInfoElement.removeChild(songInfoElement.firstChild);
    }

    // Criar o ícone de like
    const likeIcon = document.createElement('i');
    likeIcon.classList.add('fas', 'fa-heart');
    songInfoElement.appendChild(likeIcon);

    // Adicionar o contador de likes
    const likeCounter = document.createElement('span');
    likeCounter.textContent = songs[musicIndex].likeCounter;
    songInfoElement.appendChild(likeCounter);

    // Criar o ícone de share
    const shareIcon = document.createElement('i');
    shareIcon.classList.add('fas', 'fa-share');
    songInfoElement.appendChild(shareIcon);

    // Adicionar o contador de shares
    const shareCounter = document.createElement('span');
    shareCounter.textContent = songs[musicIndex].shareCounter;
    songInfoElement.appendChild(shareCounter);
  }
  
}

function updateCounter(value, index) {
  // Lógica para atualizar o contador no servidor para a música no índice 'index'
  console.log('Valor do contador atualizado:', value, 'para a música de índice:', index);

}

document.addEventListener('keydown', handleSpaceBar);

function addAndPlayMusic(newSong) {
  songs.push(newSong);

  musicIndex = songs.length - 1;
  loadMusic(songs[musicIndex]);
  playMusic();

  // Adicionar o som à lista de músicas no perfil
  addSongToList(newSong);

  // Redirecionar para a página 1
  mostrarPagina(1);
  toggleSidebar();
  
}

function addMusic() {
  const audioFileInput = document.getElementById('audio-file');
  const coverFileInput = document.getElementById('cover-file');

  if (audioFileInput.files.length === 0 || coverFileInput.files.length === 0) {
    alert('Selecione um arquivo de áudio e uma capa de música.');
    return;
  }

  const audioFile = audioFileInput.files[0];
  const coverFile = coverFileInput.files[0];

  const newSong = {};

  newSong.path = URL.createObjectURL(audioFile);

  // Obter o nome da música usando o prompt
  const songName = prompt('Digite o nome da música:');
  if (!songName) {
    // O usuário cancelou o prompt, abortar a adição da música
    return;
  }
  newSong.displayName = songName;

  newSong.cover = URL.createObjectURL(coverFile);

  // Obter o nome do artista usando o prompt
  const artistName = document.getElementById('artist-name').textContent;
  newSong.artist = artistName;

  newSong.likeCounter = 0;
  newSong.liked = false;
  newSong.shareCounter = 0;
  newSong.link = 'https://example.com';

  // Confirmar a adição da música
  const confirmation = confirm(`Deseja realmente adicionar a música ${newSong.displayName} de ${newSong.artist}?`);
  if (!confirmation) {
    // O usuário cancelou a adição da música
    return;
  }

  addAndPlayMusic(newSong);

  // Adicionar funcionalidade de rolagem novamente após adicionar a nova música
  const container = document.querySelector('.container');
  container.removeEventListener('wheel', handleScroll); // Remover o evento existente
  container.addEventListener('wheel', handleScroll); // Adicionar o evento atualizado

  audioFileInput.value = '';
  coverFileInput.value = '';
  
}

function addSongToList(song) {
  const musicList = document.getElementById('my-musics');

  const listItem = document.createElement('li');
  listItem.classList.add('song-item');

  const songCover = document.createElement('img');
  songCover.src = song.cover;
  songCover.alt = 'Album Cover';
  songCover.classList.add('song-cover');

  const songDetails = document.createElement('div');
  songDetails.classList.add('song-details');

  const songTitle = document.createElement('span');
  songTitle.textContent = song.displayName;
  songTitle.classList.add('song-title');

  const songInfo = document.createElement('span');
  songInfo.classList.add('song-info');

  // Criar o ícone de like
  const likeIcon = document.createElement('i');
  likeIcon.classList.add('fas', 'fa-heart');
  songInfo.appendChild(likeIcon);

  // Adicionar o contador de likes
  const likeCounter = document.createElement('span');
  likeCounter.textContent = song.likeCounter;
  songInfo.appendChild(likeCounter);

  // Criar o ícone de share
  const shareIcon = document.createElement('i');
  shareIcon.classList.add('fas', 'fa-share');
  songInfo.appendChild(shareIcon);

  // Adicionar o contador de shares
  const shareCounter = document.createElement('span');
  shareCounter.textContent = song.shareCounter;
  songInfo.appendChild(shareCounter);

  // Adicionar a classe 'song-info' ao elemento span
  songInfo.classList.add('song-info');

  const deleteBtn = document.createElement('button');
  deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
  deleteBtn.classList.add('delete-button');
  deleteBtn.addEventListener('click', () => confirmDelete(song));

  songDetails.appendChild(songTitle);
  songDetails.appendChild(songInfo);

  listItem.appendChild(songCover);
  listItem.appendChild(songDetails);
  listItem.appendChild(deleteBtn);

  musicList.appendChild(listItem);

  songDetails.addEventListener('click', () => {
    musicIndex = songs.indexOf(song);
    loadMusic(songs[musicIndex]);
    playMusic();
    mostrarPagina(1);
    toggleSidebar();
  });
  songCover.addEventListener('click', () => {
    musicIndex = songs.indexOf(song);
    loadMusic(songs[musicIndex]);
    playMusic();
    mostrarPagina(1);
    toggleSidebar();
  });
  
}

function deleteSong(song) {
  const songIndex = songs.indexOf(song);
  if (songIndex > -1) {
    songs.splice(songIndex, 1);
    localStorage.removeItem(`likeCounter_${songIndex}`);

    // Remover a música da lista de curtidas
    removeSongFromLikes(song);

    // Atualizar a exibição da lista de músicas
    const musicList = document.getElementById('my-musics');
    musicList.innerHTML = ''; // Limpar a lista atual

    songs.forEach((song) => {
      addSongToList(song);
    });

    // Se a música excluída for a música atualmente tocando, tocar a próxima música
    if (songIndex === musicIndex) {
      if (songs.length === 0) {
        // Não há mais músicas na lista, pare a reprodução
        pauseMusic();
        musicIndex = 0;
      } else if (musicIndex === songs.length) {
        // A música excluída era a última da lista, volte para a primeira música
        changeMusic(-1);
      } else {
        // A música excluída não era a última, reproduza a próxima música
        changeMusic(1);
      }
    }    
  }
  
}

function confirmDelete(song) {
  const confirmation = confirm(`Deseja realmente deletar a música ${song.displayName}?`);
  if (confirmation) {
    deleteSong(song);
    
  }
}

function handleScroll(event) {
  const delta = Math.sign(event.deltaY); // Obtém a direção do scroll (1 para baixo, -1 para cima)

  if (delta > 0) {
    // Scroll para baixo, avança para a próxima música
    changeMusic(1);
  } else if (delta < 0) {
    // Scroll para cima, retrocede para a música anterior
    changeMusic(-1);
  }
}

function mostrarPagina(numero) {
  // Oculta todas as páginas
  var pages = document.getElementsByClassName('container');
  for (var i = 0; i < pages.length; i++) {
    pages[i].style.display = 'none';
  }

  // Mostra a página selecionada
  var pagina = document.getElementById('pagina' + numero);
  pagina.style.display = 'flex';

  // Recolhe a sidebar
  toggleSidebar();

  // Verifica se a página atual é a página dois
  if (numero === 2) {
    document.removeEventListener('keydown', handleSpaceBar);
  } else {
    document.addEventListener('keydown', handleSpaceBar);
  }
}

function handleSpaceBar(event) {
  if (event.code === 'Space') {
    event.preventDefault(); // Impede o comportamento padrão da barra de espaço no navegador
    togglePlay();
  }
}

function toggleSidebar() {
  var sidebar = document.getElementsByClassName('sidebar')[0];
  sidebar.classList.toggle('active');

  var sidebarBtn = document.querySelector('.sidebar-btn');
  if (sidebar.classList.contains('active')) {
    sidebarBtn.classList.add('times');
  } else {
    sidebarBtn.classList.remove('times');
  }
}

function search() {
  const searchInput = document.getElementById('search-input');
  const searchQuery = searchInput.value.toLowerCase();
  const searchResults = document.getElementById('search-results');
  searchResults.addEventListener('click', handleSearchItemClick);

  function handleSearchItemClick(index) {
    musicIndex = songs.findIndex((song) => song.displayName === matchingSongs[index].displayName);
    loadMusic(songs[musicIndex]);
    playMusic();
  
    mostrarPagina(1);
    toggleSidebar();
  }

  // Limpar os resultados anteriores
  searchResults.innerHTML = '';

  // Realizar a pesquisa
  const matchingSongs = songs.filter((song) => {
    const lowerCaseTitle = song.displayName.toLowerCase();
    const lowerCaseArtist = song.artist.toLowerCase();
    return lowerCaseTitle.includes(searchQuery) || lowerCaseArtist.includes(searchQuery);
  });

  if (matchingSongs.length === 0) {
    const noResultsItem = document.createElement('p');
    noResultsItem.textContent = 'Nenhuma música ou artista correspondente foi encontrado.';
    searchResults.appendChild(noResultsItem);
  } else {
    matchingSongs.forEach((song, index) => {
      const songItem = document.createElement('li');
      
      // Criar elemento de imagem para a capa do álbum
      const albumCover = document.createElement('img');
      albumCover.src = song.cover;
      
      songItem.appendChild(albumCover);
      
      // Criar elemento de texto para o nome da música e artista
      const songText = document.createElement('span');
      songText.textContent = `${song.displayName} - ${song.artist}`;
      songItem.appendChild(songText);
    
      // Adicionar evento de clique para a imagem e o texto da música
      albumCover.addEventListener('click', () => handleSearchItemClick(index));
      songText.addEventListener('click', () => handleSearchItemClick(index));
      
      searchResults.appendChild(songItem);
    });        
  }

}

// Adicionar evento de escuta para a tecla "Enter" no campo de pesquisa
const searchInput = document.getElementById('search-input');
searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    search();
  }
});

playBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', () => changeMusic(-1));
nextBtn.addEventListener('click', () => changeMusic(1));
music.addEventListener('ended', () => changeMusic(1));
music.addEventListener('timeupdate', updateProgressBar);
playerProgress.addEventListener('click', setProgressBar);
likeBtn.addEventListener('click', toggleLike);
shareBtn.addEventListener('click', toggleShare);

loadMusic(songs[musicIndex]);

function mostrarLista(lista) {
  var myMusics = document.getElementById("my-musics");
  var myLikes = document.getElementById("my-likes");

  var listsContent = document.querySelector(".lists-content");

  // Oculta todas as listas
  myMusics.style.display = "none";
  myLikes.style.display = "none";

  // Mostra a lista selecionada
  if (lista === 1) {
    myMusics.style.display = "flex";
  } else if (lista === 2) {
    myLikes.style.display = "flex";
  }

  // Exibe o conteúdo das listas
  listsContent.style.display = "flex";
}

// Carrega o valor inicial do contador ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
  for (let i = 0; i < songs.length; i++) {
    let initialCounter = localStorage.getItem(`likeCounter_${i}`);
    if (initialCounter === null) {
      initialCounter = songs[i].likeCounter;
      localStorage.setItem(`likeCounter_${i}`, initialCounter);
    }
  }

  // Atualiza o estado do botão "like" para a música atual
  if (songs[musicIndex].liked) {
    likeBtn.classList.add('liked');
  } else {
    likeBtn.classList.remove('liked');
  }
});