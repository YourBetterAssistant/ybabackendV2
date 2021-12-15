import * as mongoose from 'mongoose';
export const count = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  voiceChannelID: {
    type: String,
    required: true,
  },
});
export class Count {
  constructor(public _id: string, public voiceChannelID: string) {}
}
