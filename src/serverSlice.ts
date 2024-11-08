import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface Player {
  id: string;
  display_name: string;
  profile_image_url: string;
  connected: boolean;
  done: boolean;
}
export interface ServerState {
  players: Player[];
}

const initialState: ServerState = {
  players: [],
};

export const serverSlice = createSlice({
  name: "server",
  initialState,
  reducers: {
    update: (state, action: PayloadAction<ServerState>) => {
      state.players = action.payload.players;
      console.log("Server update", state);
    },
  },
});

export default serverSlice.reducer;
export const { update } = serverSlice.actions;
