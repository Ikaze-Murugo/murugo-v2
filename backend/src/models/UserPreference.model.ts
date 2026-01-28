import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User.model';

@Entity('user_preferences')
export class UserPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column('jsonb', { nullable: true })
  surveyResponses: Record<string, any>;

  @Column('simple-array', { nullable: true })
  preferredLocations: string[];

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  budgetMin: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  budgetMax: number;

  @Column('simple-array', { nullable: true })
  propertyTypes: string[];

  @Column('int', { nullable: true })
  bedroomsMin: number;

  @Column('int', { nullable: true })
  bathroomsMin: number;

  @Column('simple-array', { nullable: true })
  requiredAmenities: string[];

  @Column({ nullable: true })
  moveInTimeline: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
