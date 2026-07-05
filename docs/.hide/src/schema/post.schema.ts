import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IPost } from 'docs/src/types/post';

@Entity('posts')
class Post implements IPost {
  @PrimaryColumn('uuid') id: string;
  @Column({ type: 'int' }) index: number;
  @Column({ type: 'varchar' }) body: string;
  @Column({ type: 'varchar' }) title: string;
  @Column({ type: 'uuid' }) createdBy: string;
  @CreateDateColumn({ type: 'timestamp' }) createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp' }) updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamp' }) deletedAt: Date | undefined;

  @BeforeUpdate()
  update() {
    this.updatedAt = new Date();
  }

  @BeforeInsert()
  insert() {
    const now = new Date();
    this.updatedAt = now;
    this.createdAt = now;
  }
}

export { Post };
