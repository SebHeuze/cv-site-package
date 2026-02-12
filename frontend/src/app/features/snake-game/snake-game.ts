import { Component, ElementRef, HostListener, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Point {
  x: number;
  y: number;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type GameState = 'start' | 'playing' | 'gameover';

@Component({
  selector: 'app-snake-game',
  imports: [CommonModule],
  templateUrl: './snake-game.html',
  styleUrl: './snake-game.scss',
})
export class SnakeGame implements AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  readonly CELL_SIZE = 20;
  readonly GRID_COLOR = '#2a2a2a';
  readonly SNAKE_COLOR = '#26a69a';
  readonly SNAKE_HEAD_COLOR = '#2bbbad';
  readonly FOOD_COLOR = '#ef5350';
  readonly BG_COLOR = '#1e1e1e';

  state: GameState = 'start';
  score = 0;
  highScore = 0;

  private ctx!: CanvasRenderingContext2D;
  private cols = 0;
  private rows = 0;
  private snake: Point[] = [];
  private food: Point = { x: 0, y: 0 };
  private direction: Direction = 'RIGHT';
  private nextDirection: Direction = 'RIGHT';
  private gameLoop: number | null = null;
  private baseSpeed = 150;

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();
    this.drawStartScreen();
  }

  ngOnDestroy(): void {
    this.stopGame();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.resizeCanvas();
    if (this.state === 'start') {
      this.drawStartScreen();
    } else if (this.state === 'playing') {
      this.draw();
    } else if (this.state === 'gameover') {
      this.draw();
      this.drawGameOverOverlay();
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.code === 'Space') {
      event.preventDefault();
      if (this.state === 'start' || this.state === 'gameover') {
        this.startGame();
      }
      return;
    }

    if (this.state !== 'playing') return;

    switch (event.code) {
      case 'ArrowUp':
        event.preventDefault();
        if (this.direction !== 'DOWN') this.nextDirection = 'UP';
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (this.direction !== 'UP') this.nextDirection = 'DOWN';
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (this.direction !== 'RIGHT') this.nextDirection = 'LEFT';
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (this.direction !== 'LEFT') this.nextDirection = 'RIGHT';
        break;
    }
  }

  startGame(): void {
    this.score = 0;
    this.direction = 'RIGHT';
    this.nextDirection = 'RIGHT';
    this.state = 'playing';

    const startX = Math.floor(this.cols / 2);
    const startY = Math.floor(this.rows / 2);
    this.snake = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY },
    ];

    this.spawnFood();
    this.stopGame();
    this.scheduleStep();
  }

  private resizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const container = canvas.parentElement!;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    this.cols = Math.floor(canvas.width / this.CELL_SIZE);
    this.rows = Math.floor(canvas.height / this.CELL_SIZE);
  }

  private scheduleStep(): void {
    const speed = Math.max(60, this.baseSpeed - this.score * 2);
    this.gameLoop = window.setTimeout(() => {
      this.step();
    }, speed);
  }

  private step(): void {
    if (this.state !== 'playing') return;

    this.direction = this.nextDirection;
    const head = { ...this.snake[0] };

    switch (this.direction) {
      case 'UP': head.y--; break;
      case 'DOWN': head.y++; break;
      case 'LEFT': head.x--; break;
      case 'RIGHT': head.x++; break;
    }

    // Wall collision
    if (head.x < 0 || head.x >= this.cols || head.y < 0 || head.y >= this.rows) {
      this.gameOver();
      return;
    }

    // Self collision
    if (this.snake.some(s => s.x === head.x && s.y === head.y)) {
      this.gameOver();
      return;
    }

    this.snake.unshift(head);

    // Eat food
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      this.spawnFood();
    } else {
      this.snake.pop();
    }

    this.draw();
    this.scheduleStep();
  }

  private spawnFood(): void {
    let pos: Point;
    do {
      pos = {
        x: Math.floor(Math.random() * this.cols),
        y: Math.floor(Math.random() * this.rows),
      };
    } while (this.snake.some(s => s.x === pos.x && s.y === pos.y));
    this.food = pos;
  }

  private draw(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = this.ctx;

    // Background
    ctx.fillStyle = this.BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines
    ctx.strokeStyle = this.GRID_COLOR;
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= this.cols; x++) {
      ctx.beginPath();
      ctx.moveTo(x * this.CELL_SIZE, 0);
      ctx.lineTo(x * this.CELL_SIZE, this.rows * this.CELL_SIZE);
      ctx.stroke();
    }
    for (let y = 0; y <= this.rows; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * this.CELL_SIZE);
      ctx.lineTo(this.cols * this.CELL_SIZE, y * this.CELL_SIZE);
      ctx.stroke();
    }

    // Food
    const foodX = this.food.x * this.CELL_SIZE + this.CELL_SIZE / 2;
    const foodY = this.food.y * this.CELL_SIZE + this.CELL_SIZE / 2;
    ctx.fillStyle = this.FOOD_COLOR;
    ctx.beginPath();
    ctx.arc(foodX, foodY, this.CELL_SIZE / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    // Snake
    this.snake.forEach((segment, i) => {
      const x = segment.x * this.CELL_SIZE;
      const y = segment.y * this.CELL_SIZE;
      ctx.fillStyle = i === 0 ? this.SNAKE_HEAD_COLOR : this.SNAKE_COLOR;
      ctx.fillRect(x + 1, y + 1, this.CELL_SIZE - 2, this.CELL_SIZE - 2);
    });
  }

  private drawStartScreen(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = this.ctx;

    ctx.fillStyle = this.BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines
    ctx.strokeStyle = this.GRID_COLOR;
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= this.cols; x++) {
      ctx.beginPath();
      ctx.moveTo(x * this.CELL_SIZE, 0);
      ctx.lineTo(x * this.CELL_SIZE, this.rows * this.CELL_SIZE);
      ctx.stroke();
    }
    for (let y = 0; y <= this.rows; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * this.CELL_SIZE);
      ctx.lineTo(this.cols * this.CELL_SIZE, y * this.CELL_SIZE);
      ctx.stroke();
    }

    // Decorative snake
    const centerX = Math.floor(this.cols / 2);
    const centerY = Math.floor(this.rows / 2);
    const demoSnake = [
      { x: centerX + 2, y: centerY },
      { x: centerX + 1, y: centerY },
      { x: centerX, y: centerY },
      { x: centerX - 1, y: centerY },
      { x: centerX - 1, y: centerY + 1 },
      { x: centerX - 1, y: centerY + 2 },
    ];
    demoSnake.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? this.SNAKE_HEAD_COLOR : this.SNAKE_COLOR;
      ctx.fillRect(s.x * this.CELL_SIZE + 1, s.y * this.CELL_SIZE + 1, this.CELL_SIZE - 2, this.CELL_SIZE - 2);
    });
  }

  private drawGameOverOverlay(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = this.ctx;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#E95420';
    ctx.font = 'bold 36px Ubuntu, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 30);

    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Ubuntu, sans-serif';
    ctx.fillText(`Score: ${this.score}`, canvas.width / 2, canvas.height / 2 + 10);

    if (this.highScore > 0) {
      ctx.fillStyle = '#26a69a';
      ctx.font = '16px Ubuntu, sans-serif';
      ctx.fillText(`Best: ${this.highScore}`, canvas.width / 2, canvas.height / 2 + 40);
    }

    ctx.fillStyle = '#aaaaaa';
    ctx.font = '14px Ubuntu, sans-serif';
    ctx.fillText('Press SPACE to play again', canvas.width / 2, canvas.height / 2 + 75);
  }

  private gameOver(): void {
    this.state = 'gameover';
    if (this.score > this.highScore) {
      this.highScore = this.score;
    }
    this.draw();
    this.drawGameOverOverlay();
    this.stopGame();
  }

  private stopGame(): void {
    if (this.gameLoop !== null) {
      clearTimeout(this.gameLoop);
      this.gameLoop = null;
    }
  }
}
