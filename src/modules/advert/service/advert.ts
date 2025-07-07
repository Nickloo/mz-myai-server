import { Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { AdvertEntity } from '../entity/advert';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
/**
 * 缓存
 */
@Provide()
export class AdvertService extends BaseService {
  @InjectEntityModel(AdvertEntity)
  advEntity: Repository<AdvertEntity>;

  /**
   * 通过编号获取广告详情
   * @param no 广告编号
   */
  async infoByNo(no: string) {
    return await this.advEntity.findOne({ where: { no: no } });
  }

  /**
   * 通过key获取广告详情
   * @param key 广告key
   */
  async infoByKey(key: string) {
    return await this.advEntity.findOne({ where: { key: key } });
  }
}
