let socket = null;
let totalSlides = 0;

const numberSlides = () => {
  const slides = [].slice.call(document.querySelectorAll('.slide'));
  totalSlides = slides.length;
  slides.forEach((slide, pos) => {
    const number = Number(pos) + 1;
    slide.id = `slide-${number}`;
  });
};
numberSlides();

const start = () => {
  socket = new WebSocket('ws://localhost:1337/notes');
  socket.onmessage = ({ data }) => {
    const oldSlide = document.querySelector('.slide:not(.hidden)');
    if (oldSlide) {
      oldSlide.classList.add('hidden');
    }
    const nextSlide = document.getElementById(`slide-${data}`);
    if (nextSlide) {
      nextSlide.classList.remove('hidden');
    }
    document.getElementById('slide-pos').innerHTML = `${data} of ${totalSlides}`;
  };
  socket.onclose = () => {
    setTimeout(() => { start(); }, 500);
  };
};
start();

const updateTime = () => {
  const date = new Date();
  document.getElementById('slide-clock').innerHTML = date.toLocaleTimeString();
};

const timer = setInterval(() => {
  updateTime();
}, 1000);

window.onbeforeunload = () => {
  socket.close();
};

