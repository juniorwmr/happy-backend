import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import secretKey from '../config/secretKey';

@Entity('users')
export default class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  reset_password_token: string;

  @Column({ nullable: true })
  reset_password_date_expires: Date;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async comparePassword(attempt: string): Promise<boolean> {
    return await bcrypt.compare(attempt, this.password);
  }

  createToken(user: User) {
    const expiresIn = '100m';
    const accessToken = jwt.sign(
      {
        id: user.id,
      },
      secretKey.secret,
      { expiresIn }
    );
    return {
      expiresIn,
      accessToken,
    };
  }
}
