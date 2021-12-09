import * as mongoose from 'mongoose';
export const prefix = new mongoose.Schema({
  guildID: {
    type: String,
    required: true,
  },
  prefix: {
    type: String,
    required: true,
  },
});
export class Prefix {
  constructor(public guildID: string, public prefix: string) {}
}
