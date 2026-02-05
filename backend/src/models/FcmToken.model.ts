import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User.model';

@Entity('fcm_tokens')
export class FcmToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  token: string;

  /** Optional: identify device so we can replace token for same device */
  @Column({ nullable: true })
  deviceId: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
