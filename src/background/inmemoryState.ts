export class InmemoryState {
  // UTC timestamp in milliseconds
  private lastSync = 0;

  public prepareSync(debounce: number): boolean {
    const now = Date.now();
    const diff = now - this.lastSync ?? 0;
    this.lastSync = now;
    return diff < debounce;
  }
}
