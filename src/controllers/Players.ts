const players = new Map();

type RegPlayer = Pick<Player, 'name' | 'password'>;

interface Player {
  playerId: number;
  name: string;
  password: string;
  wins: number;
  key: string;
}

interface regRes {
  name: string;
  playerId: number;
  error: boolean;
  errorText: string;
}

export const regPlayer = (data: RegPlayer, key: string): regRes => {
  let playerId = players.size + 1;
  let wins = 0;
  let errorText = '';
  if (players.has(data.name)) {
    const { playerId, name, password, wins, keyCon } = players.get(data.name);
    if (password !== data.password) {
      errorText = 'Invalid player password';
    }
    if (keyCon !== key)
      players.set(data.name, { playerId, name, password, wins, key });
  } else {
    players.set(data.name, { playerId, ...data, wins, key });
  }
  const player = players.get(data.name);
  console.log(players);

  const dataRegRes = errorText
    ? {
        name: player.name,
        playerId: player.playerId,
        error: true,
        errorText: errorText,
      }
    : {
        name: player.name,
        playerId: player.playerId,
        error: false,
        errorText: '',
      };
  return dataRegRes;
};
