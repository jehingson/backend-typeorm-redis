import { BaseEntity, Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Accounts } from "./Accounts.model";

@Entity()
export class Avatar extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  public_id: string

  @Column()
  url: string

  @OneToOne(() => Accounts, account => account.avatar)
  account: Accounts

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
