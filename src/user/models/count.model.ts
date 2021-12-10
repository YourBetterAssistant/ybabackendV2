import * as mongoose from 'mongoose';
import { isString } from 'util';
export const count = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  voiceChannelID: {
    type: isString,
    required: true,
  },
});
export class Count {
  constructor(public _id: string, public voiceChannelID: string) {}
}
