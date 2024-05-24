'use client';

import { useEffect, useState } from 'react';
import BoardStore from './store';
import { observer } from 'mobx-react-lite';
import { BlockStatus, GameStatus } from './types';

const Board = () => {
  const {
    blockArray,
    minesObject,
    gameStatus,
    flagCount,
    init,
    reset,
    rightClick,
    leftClick,
    leftDoubleClick,
  } = BoardStore;
  const width = 8;
  const height = 8;
  const mineNumber = 10;
  const [time, setTime] = useState(0);
  useEffect(() => {
    init({ mineNumber, width, height });
  }, []);

  useEffect(() => {
    if (gameStatus !== GameStatus.Playing) {
      return;
    }
    const timerID = setInterval(() => {
      setTime((time) => time + 1);
    }, 1000);
    return () => clearInterval(timerID);
  }, [gameStatus]);

  return (
    <div className="flex flex-col justify-center items-center h-full w-full">
      <div className="flex flex-col justify-center items-center">
        <div>{GameStatus[gameStatus]}</div>
        <div className="flex w-full justify-between px-5 py-2">
          <div>{flagCount}</div>
          <button
            onClick={() => {
              reset();
              init({ mineNumber, width, height });
              setTime(0);
            }}
          >
            restart
          </button>
          <div>{time}</div>
        </div>

        <table>
          <tbody>
            {blockArray.map((rowData, index) => (
              <tr key={index}>
                {rowData.map((data, index) => (
                  <td
                    key={index}
                    className={`h-12 w-12 border-2 border-black text-center
                    ${!data.isOpen && data.blockStatus === BlockStatus.Block && 'bg-orange-300'}
                    ${!data.isOpen && data.blockStatus === BlockStatus.Flag && 'bg-sky-700'}
                    ${data.isOpen && minesObject[data.x * width + data.y] && 'bg-red-700'}
                    ${data.isOpen && 'bg-orange-500'}
                    `}
                    onClick={(e) => {
                      if (gameStatus === (GameStatus.Lose || GameStatus.Win)) {
                        e.stopPropagation();
                      }
                      if (
                        gameStatus === GameStatus.WaitForStart ||
                        gameStatus === GameStatus.Playing
                      )
                        leftClick(data.x, data.y, width);
                    }}
                    onDoubleClick={(e) => {
                      if (gameStatus === (GameStatus.Lose || GameStatus.Win)) {
                        e.stopPropagation();
                      }
                      leftDoubleClick(data.x, data.y, width);
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      if (gameStatus === (GameStatus.Lose || GameStatus.Win)) {
                        e.stopPropagation();
                      }
                      rightClick(data.x, data.y);
                    }}
                  >
                    {data.isOpen &&
                      data.text !== '0' &&
                      !minesObject[data.x * width + data.y] &&
                      data.text}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default observer(Board);
