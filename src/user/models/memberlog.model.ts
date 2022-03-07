import mongoose from 'mongoose';
export const memberLog = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  channelID: {
    type: String,
    required: true,
  },
});
export class MemberLog {
  constructor(public _id: string, public channelID: string) {}
}
