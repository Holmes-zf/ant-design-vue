/**
 * 业务时间工具（复刻自外部系统 `/@/utils/dayjs`，与组件逻辑逐字一致）
 *
 * 解耦说明：外部版本无任何基建依赖（仅 dayjs 本体 + utc 插件），
 * 可直接复刻到 busi 目录内，供 date-picker 组件群共享。
 */
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/zh-cn';

dayjs.extend(utc);

class Dayjs {
  dayjs = dayjs;
  /*
   * getTargetTime: 获取指定时间
   * day: 单位为天，0为当天，负数为今天之前，正数为今天之后，默认为当天
   * format: 返回数据格式，不传则返回dayjs数据格式
   */
  getTargetTime(day = 0, format) {
    let today = new Date().getTime();
    let interval = today + 1000 * 60 * 60 * 24 * day;
    if (format) {
      return dayjs(new Date(interval)).format(format);
    } else {
      return dayjs(new Date(interval));
    }
  }
  // 获取dayjs时间格式
  getDayjsTime(date) {
    if (Array.isArray(date)) {
      return date.map(item => {
        return dayjs(item);
      });
    }
    return dayjs(date);
  }
  // getTimeText: 获取时间文本
  getTimeText(date, format = 'YYYY-MM-DD HH:mm:ss') {
    if (Array.isArray(date)) {
      return date.map(item => {
        return dayjs(new Date(item)).format(format);
      });
    }
    return dayjs(new Date(date)).format(format);
  }
  /*
   * getToday: 获取今天日期
   * format: 返回数据格式，不传则返回dayjs数据格式
   */
  getToday(format) {
    if (format) {
      return dayjs(new Date()).format(format);
    } else {
      return dayjs(new Date());
    }
  }
  /**
   * 获取几个月前日期，0是当天，n则是几个月前的当天
   * @param {*} month
   * @param {*} format
   * @returns
   */
  getRecentMonth(n = 0, format = 'YYYY-MM-DD') {
    return dayjs(new Date()).subtract(n, 'months').format(format);
  }
  /**
   * 获取当前日期，几月前或者几月后的某一天
   * @param {*} n
   * @param {*} type
   */
  getMonthDate(n = 0, type = 'add', format = 'YYYY-MM-DD') {
    if (type == 'add') {
      return dayjs().add(n, 'month').format(format);
    } else {
      return dayjs().subtract(n, 'month').format(format);
    }
  }
  // 获取utc时间
  getUtc(format = 'YYYY-MM-DD') {
    return dayjs().utc().format(format);
  }
  // 获取指定时间
  getSomeDate(date, action = 'add', n, type) {
    if (action == 'add') {
      return dayjs(date).add(n, type);
    } else {
      return dayjs(date).subtract(n, type);
    }
  }
  // 获取时区时间
  getCurrentTimeZone = (timeZone, format = 'YYYY-MM-DD HH:mm') => {
    const utc = this.getUtc(format);
    const tz = timeZone ? Number(timeZone.replace(/UTC|utc/, '')) : 0;
    return tz > 0
      ? this.getSomeDate(utc, 'add', Math.abs(tz), 'hour')
      : this.getSomeDate(utc, 'subtract', Math.abs(tz), 'hour');
  };
  /*
   * padSeconds: 时间无秒时补秒，输出标准 yyyy-MM-dd HH:mm:ss（如 "2026-11-12 12:23" → "2026-11-12 12:23:00"）
   * time: 时间字符串，无法解析或空值原样返回
   * format: 返回格式，默认 "YYYY-MM-DD HH:mm:ss"
   */
  padSeconds(time, format = 'YYYY-MM-DD HH:mm:ss') {
    if (!time) {
      return time;
    }
    const d = dayjs(time);
    return d.isValid() ? d.format(format) : time;
  }
}

export default new Dayjs();
