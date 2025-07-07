import { CoolController, BaseController } from '@cool-midway/core';
import { MembershipLevelEntity } from '../../entity/membershipLevel';
import { In, Repository, SelectQueryBuilder } from 'typeorm';
import { Post } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { MembershipLevelService } from '../../service/membershipLevel';

/**
 * cool的curd无法返回嵌套数据结构
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: MembershipLevelEntity,
  service: MembershipLevelService,
  pageQueryOp: {
    // 指定返回字段，注意多表查询这个是必要的，否则会出现重复字段的问题
    select: ['a.*', 'c.name as benefitName',],
    keyWordLikeFields: ['name', 'desc'],
    addOrderBy: { 'sort': 'ASC' },
    extend: async (find: SelectQueryBuilder<MembershipLevelEntity>) => {
      // 查找出benefits
      // console.log(find.alias) // cool 会自动给表起别名“a”
      find.leftJoinAndSelect("a.benefits", "b")
        .leftJoinAndSelect("b.benefit", "c")
    },
  },
})
export class AdminMembershipLevelController extends BaseController {

  @InjectEntityModel(MembershipLevelEntity)
  levelEntity: Repository<MembershipLevelEntity>;

  @Post('/page2')
  async page2() {
    const qb = this.levelEntity.createQueryBuilder('a')
      .leftJoinAndSelect('a.benefits', 'b')
      .leftJoinAndSelect('b.benefit', 'c');

    const result = await qb.getMany();
    return this.ok({
      list: result,
      total: 0
    })
  }
}
