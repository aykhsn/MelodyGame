import Phaser from 'phaser';

const assetsUrl = `assets`;

const tempo = 500;

// メロディの定義
const melody = [
    { note: 523.25, duration: 4 * tempo }, // ド（高）
    { note: 587.33, duration: 1 * tempo }, // レ（高）
    { note: 523.25, duration: 1 * tempo }, // ド（高）
    { note: 493.88, duration: 1 * tempo }, // シ
    { note: 523.25, duration: 1 * tempo }, // ド（高）
    { note: 440.00, duration: 2 * tempo }, // ラ
    { note: 523.25, duration: 2 * tempo },  // ド（高）
    { note: 523.25, duration: 4 * tempo },  // ド（高）
    { note: 523.25, duration: 4 * tempo }, // ド（高）
    { note: 587.33, duration: 1 * tempo }, // レ（高）
    { note: 523.25, duration: 1 * tempo }, // ド（高）
    { note: 493.88, duration: 1 * tempo }, // シ
    { note: 523.25, duration: 1 * tempo }, // ド（高）
    { note: 392.00, duration: 2 * tempo }, // ソ
    { note: 523.25, duration: 2 * tempo },  // ド（高）
    { note: 523.25, duration: 4 * tempo },  // ド（高）
];

// ボールの速さを定義（ミリ秒）
const ballSpeed = 3000; // ここでボールが下まで移動する速度を指定

// ゲームの横幅を最大600pxに設定
const maxGameWidth = 600 * window.devicePixelRatio;

class StartScene extends Phaser.Scene {
    private buttonSound: Phaser.Sound.BaseSound | null = null;
    private homeButton: HomeButton | null = null;

    constructor() {
        super('start-scene');
    }

    preload() {
        // HomeButton の関連リソースをプリロード
        this.load.image('home-button', `${assetsUrl}/home-button.png`);
        this.load.image('modal-text', `${assetsUrl}/modal-text.png`);
        this.load.image('home-yes', `${assetsUrl}/button-yes.png`);
        this.load.image('home-no', `${assetsUrl}/button-no.png`);
        this.load.image('modal-close', `${assetsUrl}/modal-close.png`);

        // Game
        this.load.image('startButton', `${assetsUrl}/button-start.png`);
        this.load.audio('buttonSound', `${assetsUrl}/chiroriro.mp3`);
    }

    create() {
        this.buttonSound = this.sound.add('buttonSound');

        // HomeButton インスタンスを作成
        this.homeButton = new HomeButton(this);

        // スタートボタンを配置
        const button = this.add.image(this.scale.width / 2, this.scale.height / 2, 'startButton');
        const buttonWidth = Math.min(this.scale.width, this.scale.height, 1200) * 1.2 / 2;
        button.setDisplaySize(buttonWidth, button.height * (buttonWidth / button.width));
        button.setInteractive();

        // スタートボタンがクリックされたときにGameシーンを開始
        button.on('pointerdown', () => {
            this.buttonSound!.play();
            this.scene.start('game');
        });
    }
}

class Game extends Phaser.Scene {
    private audioCtx: AudioContext | null = null;
    private homeButton: HomeButton | null = null;

    constructor() {
        super('game');
    }

    init() {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        this.audioCtx = new AudioContext();
    }

    preload() {
        // 画像のプリロード
        this.load.image('ball', `${assetsUrl}/ball.png`);
    }

    create() {
        // HomeButton インスタンスを作成
        this.homeButton = new HomeButton(this);

        // ボールを生成
        this.createBalls();
    }

    createBalls() {
        const gameWidth = Math.min(this.scale.width, maxGameWidth);
        const ballSize = gameWidth / 3;
        const margin = ballSize / 3; // 両サイドの余白をボールサイズの半分に設定

        // 3つのボールのX座標を計算し、中央に配置しつつ両サイドに余白を持たせる
        const positions = [
            this.scale.width / 2 - gameWidth / 3 + margin,
            this.scale.width / 2,
            this.scale.width / 2 + gameWidth / 3 - margin
        ];

        let accumulatedTime = 0; // 累積時間を初期化

        melody.forEach((note, index) => {
            this.time.delayedCall(accumulatedTime, () => this.spawnBall(index, positions, note), [], this);
            accumulatedTime += note.duration; // 累積時間を更新
        });
    }

    spawnBall(index: number, positions: number[], note: { note: number, duration: number }) {
        const x = positions[index % positions.length];
        const ball = this.add.image(x, 0, 'ball').setInteractive();

        // ボールのサイズをゲーム横幅の1/3に設定
        const gameWidth = Math.min(this.scale.width, maxGameWidth);
        const ballSize = gameWidth / 3;
        ball.setDisplaySize(ballSize, ballSize);

        // ボールが画面下まで移動するアニメーション
        this.tweens.add({
            targets: ball,
            y: this.scale.height,
            duration: ballSpeed,
            ease: 'Linear',
            onComplete: () => {
                ball.destroy();
            }
        });

        ball.on('pointerdown', () => {
            this.playNoteSound(note.note);
        });
    }

    playNoteSound(note: number) {
        if (!this.audioCtx) return;

        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(note, this.audioCtx.currentTime); // それぞれの音の周波数を現在の時間で設定
        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);

        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.5); // 音を0.5秒後にフェードアウト
        oscillator.stop(this.audioCtx.currentTime + 0.5); // 0.5秒後に停止
    }
}

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: window.innerWidth * window.devicePixelRatio,
    height: window.innerHeight * window.devicePixelRatio,
    scene: [StartScene, Game],
    backgroundColor: '#87CEEB',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    render: {
        pixelArt: false,
        antialias: true,
        antialiasGL: true,
    }
};

const game = new Phaser.Game(config);
