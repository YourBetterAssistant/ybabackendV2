import * as mongoose from 'mongoose';
export const chatbot = new mongoose.Schema({
  guildID: {
    type: String,
    required: true,
  },
  channelID: {
    type: String,
    required: true,
  },
});
export class Chatbot {
  constructor(public guildID: string, public channelID: string) {}
}
