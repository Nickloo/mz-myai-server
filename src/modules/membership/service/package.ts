import { Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { MembershipPackageEntity } from '../entity/package';

/**
 * 描述
 */
@Provide()
export class PackageService extends BaseService {
  @InjectEntityModel(MembershipPackageEntity)
  packageEntity: Repository<MembershipPackageEntity>;

  /**
   * 套餐所有信息
   */
  async allInfo() {
    // 查询套餐列表下的会员等级、会员等级下的权益
    const qb = this.packageEntity.createQueryBuilder('a')
      .where('a.status = :status', { status: 1 })
      .leftJoinAndSelect('a.level', 'b')
      .leftJoinAndSelect('b.benefits', 'c')
      .leftJoinAndSelect('c.benefit', 'd')
      .addOrderBy('a.sort', 'ASC')
    return await qb.getMany();
  }
}
