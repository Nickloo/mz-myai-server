import { Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { MembershipLevelEntity } from '../entity/membershipLevel';

/**
 * 描述
 */
@Provide()
export class MembershipLevelService extends BaseService {

  @InjectEntityModel(MembershipLevelEntity)
  levelEntity: Repository<MembershipLevelEntity>;

  /**
   * override cool的page方法
   */
  async page(query: any) {
    const qb = this.levelEntity.createQueryBuilder('a')
      .leftJoinAndSelect('a.benefits', 'b')
      .leftJoinAndSelect('b.benefit', 'c')
      // .where('a.name like :name', { name: `%${query.name}%` })
      // .andWhere('a.desc like :desc', { desc: `%${query.desc}%` })
      // .andWhere('a.status = :status', { status: query.status })
      .addOrderBy('a.sort', 'ASC')
    return await this.entityRenderPage(qb, query, false)
  }

  /**
   * 计算会员等级下属权益奖励的电量总值
   */
  async sumDianliangByLevelId(levelId: number): Promise<number> {
    // 权益的电量值sum 且status=1
    const qb = this.levelEntity.createQueryBuilder('a')
      .leftJoinAndSelect('a.benefits', 'b')
      .leftJoinAndSelect('b.benefit', 'c')
      .where('a.id = :id', { id: levelId })
      .andWhere('b.status = :status', { status: 1 })
      .select('SUM(c.benefitValue)', 'sum')
    const result = await qb.getRawOne()
    return result.sum
  }
}
