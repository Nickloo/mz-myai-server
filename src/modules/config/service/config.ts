import { Config, Inject, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { CacheManager } from '@midwayjs/cache';
import { ConfigEntity } from '../entity/config';
import { CONFIG_KEY } from '../../../comm/const';
/**
 * 描述
 */
@Provide()
export class ConfigService extends BaseService {
  @Inject()
  cacheManager: CacheManager;

  @InjectEntityModel(ConfigEntity)
  configEntity: Repository<ConfigEntity>;

  @Config('module.config')
  config;

  async getConfig(key) {
    // 先从缓存中获取
    let config = await this.cacheManager.get(key);
    if (config) return config;

    // 如果没有从数据库中获取
    let dbData = await this.configEntity.findOne({ where: { key } });
    config = dbData?.data || null;
    // 如果数据库中没有，保存默认值
    if (!config) {
      if (!this.config[key]) return {};
      config = this.config[key];
      await this.configEntity.save({ key: key, data: config });
    }
    // 获取后保存到缓存中
    this.cacheManager.set(`config:${key}`, config);
    return config;
  }

  async setConfig(key, config) {
    await this.cacheManager.set(`config:${key}`, config);
  }

  async add(param: any): Promise<any> {
    await this.configEntity.save(param);
    await this.setConfig(param.key, param.data);
  }

  async update(param: any): Promise<void> {
    await this.configEntity.update({ id: param.id }, { data: param.data });
    await this.setConfig(param.key, param.data);
  }
}
