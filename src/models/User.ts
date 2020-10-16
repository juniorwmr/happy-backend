import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import secretKey from '../config/secretKey';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async comparePassword(attempt: string): Promise<boolean> {
    return await bcrypt.compare(attempt, this.password);
  }

  createToken(user: User) {
    const expiresIn = 3600;
    const accessToken = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
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
