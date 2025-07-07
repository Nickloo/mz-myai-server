import { Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { SignEntity } from '../entity/sign';

/**
 * 描述
 */
@Provide()
export class SignService extends BaseService {
  @InjectEntityModel(SignEntity)
  signEntity: Repository<SignEntity>;

  // 获取签到配置列表
  async getSignList() {
    return (await this.signEntity.find()).sort((a, b) => a.sort - b.sort);
  }
}
