import * as mongoose from 'mongoose';
export const chatBot = new mongoose.Schema({
  guildID: {
    type: String,
    required: true,
  },
  channelID: {
    type: String,
    required: true,
  },
});
export class chatbot {
  constructor(public guildID: string, public channelID: string) {}
}
