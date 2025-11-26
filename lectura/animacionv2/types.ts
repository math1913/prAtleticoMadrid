export interface SeatStatus {
  active: boolean;
  x: number;
  y: number;
}

export interface StadiumConfig {
  rows: number;
  cols: number;
}

export type PixelChar = number[][]; // 2D array of 0s and 1s