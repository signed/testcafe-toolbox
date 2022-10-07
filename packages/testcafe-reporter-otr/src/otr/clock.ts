export interface Clock {
  now(): Date
}

export class SystemTime implements Clock {
  now(): Date {
    return new Date()
  }
}
