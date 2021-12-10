import * as mongoose from 'mongoose';
export const levellingEnabled = new mongoose.Schema({
  guildID: {
    type: String,
    required: true,
  },
  enabled: {
    type: Boolean,
    required: true,
  },
});
export class LevellingEnabled {
  constructor(public guildID: string, public enabled: boolean) {}
}
