import { BaseEntity } from '@cool-midway/core';
import { Column, Entity, Index, OneToMany, OneToOne } from 'typeorm';
import { UserMembershipEntity } from './membership';

/**
 * 用户信息
 */
@Entity('user_info')
export class UserInfoEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ comment: '微信unionid', nullable: true })
  unionid: string;

  @Index({ unique: true })
  @Column({ comment: '用户名', length: 32, nullable: true })
  username: string;

  @Column({ comment: '头像', nullable: true })
  avatarUrl: string;

  @Column({ comment: '昵称', nullable: true, length: 50 })
  nickName: string;

  @Column({ comment: '个性签名', nullable: true, length: 200 })
  introduction: string;

  @Index({ unique: true })
  @Column({ comment: '手机号', nullable: true })
  phone: string;

  @Column({ comment: '电量，充当算力货币', default: 0 })
  dianliang: number;

  @Column({ comment: '性别 0-未知 1-男 2-女', default: 0 })
  gender: number;

  @Column({ comment: '是否是会员 0-否 1-是', default: 0 })
  isVip: number;

  @Column({ comment: '状态 0-禁用 1-正常', default: 1 })
  status: number;

  @Column({ comment: '登录方式 0-小程序 1-公众号 2-H5 3-PC', default: 3 })
  loginType: number;

  @Index({ unique: true })
  @Column({ comment: '邀请码', nullable: true })
  inviteCode: string;

  @Column({ comment: '邀请人id', nullable: true })
  friendId: number;

  // 关联userMembership表 一个用户可以有多个会员
  @OneToMany(() => UserMembershipEntity, userMembership => userMembership.userInfo)
  userMemberships: UserMembershipEntity[];

}
