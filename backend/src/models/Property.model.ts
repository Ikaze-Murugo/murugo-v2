import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './User.model';
import { PropertyMedia } from './PropertyMedia.model';
import { Favorite } from './Favorite.model';
import { Review } from './Review.model';
import { PropertyView } from './PropertyView.model';
import { Message } from './Message.model';

export enum PropertyType {
  HOUSE = 'house',
  APARTMENT = 'apartment',
  OFFICE = 'office',
  LAND = 'land',
  STUDIO = 'studio',
  VILLA = 'villa',
  COMMERCIAL = 'commercial',
}

export enum TransactionType {
  RENT = 'rent',
  SALE = 'sale',
  LEASE = 'lease',
}

export enum PropertyStatus {
  AVAILABLE = 'available',
  RENTED = 'rented',
  SOLD = 'sold',
  PENDING = 'pending',
}

interface Location {
  district: string;
  sector: string;
  cell: string;
  address: string;
  latitude: number;
  longitude: number;
}

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: PropertyType,
  })
  propertyType: PropertyType;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  transactionType: TransactionType;

  @Column('decimal', { precision: 12, scale: 2 })
  price: number;

  @Column({ default: 'RWF' })
  currency: string;

  @Column('jsonb')
  location: Location;

  @Column('simple-array')
  amenities: string[];

  @Column('int', { nullable: true })
  bedrooms: number;

  @Column('int', { nullable: true })
  bathrooms: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  sizeSqm: number;

  @Column('int', { nullable: true })
  parkingSpaces: number;

  @Column('int', { nullable: true })
  floorNumber: number;

  @Column({ nullable: true })
  yearBuilt: number;

  @Column({ nullable: true })
  availabilityDate: Date;

  @Column({
    type: 'enum',
    enum: PropertyStatus,
    default: PropertyStatus.AVAILABLE,
  })
  status: PropertyStatus;

  @Column({ default: 0 })
  viewsCount: number;

  @Column({ default: 0 })
  contactCount: number;

  @Column({ default: 0 })
  shareCount: number;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ nullable: true })
  featuredUntil: Date;

  @ManyToOne(() => User, (user) => user.properties)
  @JoinColumn({ name: 'listerId' })
  lister: User;

  @Column()
  listerId: string;

  @OneToMany(() => PropertyMedia, (media) => media.property, { cascade: true })
  media: PropertyMedia[];

  @OneToMany(() => Favorite, (favorite) => favorite.property)
  favorites: Favorite[];

  @OneToMany(() => Review, (review) => review.property)
  reviews: Review[];

  @OneToMany(() => PropertyView, (view) => view.property)
  views: PropertyView[];

  @OneToMany(() => Message, (message) => message.property)
  messages: Message[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
