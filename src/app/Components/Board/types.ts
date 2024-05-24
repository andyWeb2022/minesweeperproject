export enum BlockStatus {
  "Block" ,
  "Flag" 
}
export enum GameStatus{
  "WaitForStart",
  "Playing",
  "Win",
  "Lose"
}
export interface BlockT {
  x:number;
  y:number;
  isOpen:boolean;
  blockStatus: BlockStatus;
  text:string;
}
export  interface MinesObject {
  [position: number]: boolean;
}
export interface initParam {
  width:number;
  height:number;
  mineNumber:number;
}

