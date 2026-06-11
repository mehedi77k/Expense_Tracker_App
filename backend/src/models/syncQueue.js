class SyncQueueStore {
  constructor() {
    this.items = [];
  }

  enqueue(item) {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      status: 'pending',
      retries: 0,
      createdAt: new Date().toISOString(),
      ...item,
    };

    this.items.push(entry);
    return entry;
  }

  list() {
    return [...this.items];
  }
}

module.exports = new SyncQueueStore();
