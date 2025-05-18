let timerDuration = 0.1 * 60; // 15分（秒）
let remainingTime = timerDuration;
let interval = null;

const timerDisplay = document.getElementById('timer');
const startButton = document.getElementById('startButton');
const doorOld = document.getElementById('doorOld');
const doorNew = document.getElementById('doorNew');

const bell = new Audio('bell.mp3');
const bgm = new Audio('mainBGM.mp3');
bgm.loop = true;

function updateTimer() {
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}


//音フェードイン関数
function fadeInAudio(audio, duration = 2000) {
    const maxVolume = 0.4;
    audio.volume = 0;
    audio.play().catch(err => console.warn("BGM再生エラー:", err));
  
    const stepTime = 100;
    const steps = duration / stepTime;
    let currentStep = 0;
  
    const interval = setInterval(() => {
      currentStep++;
      audio.volume = Math.min((currentStep / steps) * maxVolume, maxVolume);
      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, stepTime);
}

//音フェードアウト関数
function fadeOutAudio(audio, duration = 2000) {
    const stepTime = 100;
    const steps = duration / stepTime;
    let currentStep = 0;
  
    const initialVolume = audio.volume;
  
    const interval = setInterval(() => {
      currentStep++;
      const newVolume = Math.max(initialVolume * (1 - currentStep / steps), 0);
      audio.volume = newVolume;
  
      if (currentStep >= steps) {
        clearInterval(interval);
        audio.pause(); // 再生停止
        audio.currentTime = 0; // 必要なら先頭に戻す
      }
    }, stepTime);
}

function startTimer() {
  if (interval !== null) return;

  startButton.style.display = 'none'; // スタートボタンを非表示
  updateTimer();

  interval = setInterval(() => {
    remainingTime--;
    updateTimer();
    if (remainingTime <= 0) {
        clearInterval(interval);
        interval = null;
      
        //bgm止める
        fadeOutAudio(bgm, 800); 
        //鐘の音を鳴らす
        bell.volume = 1;
        bell.play();

        // アニメーションはすぐに開始しない
        // → キー入力 "c" を待つだけ
    }
  }, 1000);
}

function runDoorAnimation() {
    if (interval !== null) {
        clearInterval(interval);
        interval = null;
    }

    //bgm止める
    fadeOutAudio(bgm, 1500); 

    const frames = [
      'Door.gif',
      'DoorOpen1.png',
      'DoorOpen2.png',
      'white.png',
      'clear.png'
    ];
  
    let step = 0;

    //ドアの音を鳴らす
    const doorSound = new Audio('doorSound.mp3');
    doorSound.play();

  
    // 最初に1枚目を表示（background用）
    doorOld.src = frames[0];
    doorOld.style.opacity = 1;
  
    // 表示する側は doorNew
    step = 1;
  
    function fadeToNextFrame() {
      if (step < frames.length) {
        doorNew.src = frames[step];
        doorNew.style.opacity = 1;
  
        setTimeout(() => {
          // 完全に表示されたら doorOld にコピーして維持（透け防止）
          doorOld.src = frames[step];
          doorNew.style.opacity = 0;
  
          step++;
  
          if (step < frames.length) {
            //白い画像になったらタイマーを非表示にする
            if(step == frames.length-1 ){
                timerDisplay.style.display = 'none';
                //bgm再開
                fadeInAudio(bgm, 3000);
            }
            setTimeout(fadeToNextFrame, 300); // 次の画像へ
          } 
        }, 600); // フェード時間
      }
    }
  
    fadeToNextFrame();
  }
  
  

startButton.addEventListener('click', startTimer);
const onButton = document.getElementById('onButton');

onButton.addEventListener('click', () => {
  onButton.style.display = 'none';
  timerDisplay.style.display = 'block';
  startButton.style.display = 'block';
  //BGM再生
  fadeInAudio(bgm, 3000);
  // 鐘の音を一度無音で再生しておく（iOS対応）
  bell.volume = 0;
  bell.play().then(() => {
    bell.pause();
    bell.currentTime = 0;
  }).catch(err => {
    console.warn("鐘の事前再生エラー:", err);
  });
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') startTimer();
    //途中でもcが押されたらクリアにする
    if (e.key.toLowerCase() === 'c' ) runDoorAnimation();
    if (e.key.toLowerCase() === 'f') showFailedImage();
    if (e.key.toLowerCase() === 'o' && onButton.style.display !== 'none') {
        onButton.click();
    }
});

updateTimer(); // 初期表示

//初めは数字とボタンを表示しない
window.addEventListener('DOMContentLoaded', () => {
    timerDisplay.style.display = 'none';
    startButton.style.display = 'none';
});


//背景キラキラ処理
let bgToggle = false;
const background = document.getElementById('background');

setInterval(() => {
  bgToggle = !bgToggle;
  background.style.backgroundImage = `url(${bgToggle ? 'bg2.png' : 'bg1.png'})`;
}, 800); // 800msごとに切り替え


//答えが間違っていた時にFiledを表示する
const failedImage = document.getElementById('failedImage');
function showFailedImage() {
  // タイマーが動いてたら止める
  if (interval !== null) {
    clearInterval(interval);
    interval = null;
  }

  //bgmが止まってたら再開する
  if (bgm.paused) {
    fadeInAudio(bgm, 3000); // 2秒で再開
  }

  // タイマー非表示
  timerDisplay.style.display = 'none';

  // failedImage をフェードイン
  failedImage.style.opacity = 1;
}

