import { Inject, Provide } from '@midwayjs/decorator';
import * as _ from 'lodash';
import moment from 'moment';
/**
 * 帮助类
 */
@Provide()
export class Utils {
  /**
   * 获取编号
   * @param typeStr 类型
   * @returns string
   */
  getNo(typeStr?: string) {
    function GetRandomNum(Min, Max) {
      let Range = Max - Min;
      let Rand = Math.random();
      return Min + Math.round(Rand * Range);
    }
    let date = moment().format('YYYYMMDDHHMMSS');
    let no = GetRandomNum(10, 99);
    return typeStr ? `${typeStr}-${date}${no}` : `${date}${no}`;
  }
}
