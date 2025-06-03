import { CreateGame } from "./create-game";
import { AvailableGames } from "./available-games";

export function GameLobby() {
  return (
    <div className="grid lg:grid-cols-3 gap-8 mb-12">
      <div className="lg:col-span-1">
        <CreateGame />
      </div>
      <div className="lg:col-span-2">
        <AvailableGames />
      </div>
    </div>
  );
}
