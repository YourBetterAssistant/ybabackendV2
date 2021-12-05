import * as mongoose from 'mongoose';
export const users = new mongoose.Schema({
  discordId: { required: true, type: String },
  discordTag: { required: true, type: Number },
  avatar: { required: true, type: String },
  email: { required: true, type: String },
  guilds: { required: true, type: Object },
});
type Guild = {
  id: string;
  name: string;
  icon: string;
  owner: boolean;
  permissions: number;
  features: Array<string>;
  permissions_new: string;
};
export class Users {
  constructor(
    public avatar: string,
    public discordId: string,
    public discordTag: string,
    public email: number,
    public guilds: Array<Guild>,
  ) {}
}
