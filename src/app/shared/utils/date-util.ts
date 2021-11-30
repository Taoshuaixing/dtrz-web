/**
 *
 * @param datepart day|year|month|hour|minute|second
 * @param num 间隔数
 * @param date 日期
 */
export function dateAdd(datepart: string, num: number, date: Date): Date {
  const cloneDate = new Date(date.getTime());
  if (datepart === 'day') {
    cloneDate.setDate(cloneDate.getDate() + num);
  } else if (datepart === 'year') {
    cloneDate.setFullYear(cloneDate.getFullYear() + num);
  } else if (datepart === 'month') {
    cloneDate.setMonth(cloneDate.getMonth() + num);
  } else if (datepart === 'hour') {
    cloneDate.setHours(cloneDate.getHours() + num);
  } else if (datepart === 'minute') {
    cloneDate.setMinutes(cloneDate.getMinutes() + num);
  } else if (datepart === 'second') {
    cloneDate.setSeconds(cloneDate.getSeconds() + num);
  }
  return cloneDate;
}

/**
 * 月初
 * @param date
 */
export function monthFirstDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * 月末
 * @param date
 */
export function monthLastDate(date: Date): Date {
  const tmpDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  tmpDate.setDate(tmpDate.getDate() - 1);
  return tmpDate;
}

/**
 *
 * @param datepart year|month|week
 */
export function future(datepart: string) {
  const now = new Date();
  let cnt = 7;
  if (datepart === 'month') {
    cnt = 30;
  } else if (datepart === 'year') {
    cnt = 365;
  }
  const tmpDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const tmpDate2 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1 + cnt, 23, 59, 59);
  return [tmpDate, tmpDate2];
}

/**
 *
 * @param dayNum 天数
 */
export function recentDay(dayNum: number) {
  const now = new Date();
  const tmpDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayNum);
  const tmpDate2 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  return [tmpDate, tmpDate2];
}

export function diffDay(date1: Date, date2: Date) {
  return Math.abs(
    (new Date(date2.getFullYear(), date2.getMonth(), date2.getDate()).getTime() -
      new Date(date1.getFullYear(), date1.getMonth(), date1.getDate()).getTime()) /
      (1 * 24 * 60 * 60 * 1000),
  );
}

//白班的创建时间为当日9：00到18：30
// 夜班的创建时间为当日18：30到次日9点
export function getDuty(d: Date): string {
  if (
    (d.getHours() >= 9 && d.getHours() < 18) ||
    (d.getHours() === 18 && d.getMinutes() >= 0 && d.getMinutes() <= 30)
  ) {
    return 'm';
  }
  return 'n';
}

export function getDutyDate(d: Date): Date {
  if (d.getHours() >= 0 && d.getHours() < 9) {
    return dateAdd('day', -1, new Date());
  }
  return d;
}
