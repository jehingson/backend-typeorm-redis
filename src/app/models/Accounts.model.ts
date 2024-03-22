import {
  BaseEntity,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
  Column,
  OneToOne,
  JoinColumn,
} from "typeorm";
import bcrypt from "bcrypt";
import { Roles } from "../enum/roles.enum";
import { Status } from "../enum/status.enum";
import { Avatar } from "./Avatar.model";

@Entity()
export class Accounts extends BaseEntity {
  @PrimaryColumn({
    length: 36,
  })
  id: string;

  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: "enum",
    enum: Roles,
    default: Roles.Student,
  })
  role: Roles;

  @Column({ default: false })
  isVerified: boolean;

  @Column({
    type: "enum",
    enum: Status,
    default: Status.Active,
  })
  status: Status;

  @OneToOne(() => Avatar, (avatar) => avatar.account)
  @JoinColumn()
  avatar: Avatar;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  async comparePassword(password: string): Promise<boolean> {
    const hash = this.password.replace("$2y$", "$2a$");
    return await bcrypt.compare(password, hash);
  }
}
