type Queued = { method: string; url: string; body?: any; headers?: any }

const KEY = 'offline_queue_v1'

export function isOnline(): boolean { return navigator.onLine }

export function enqueue(req: Queued) {
  const q: Queued[] = JSON.parse(localStorage.getItem(KEY) || '[]')
  q.push(req)
  localStorage.setItem(KEY, JSON.stringify(q))
}

export function dequeueAll(): Queued[] {
  const q: Queued[] = JSON.parse(localStorage.getItem(KEY) || '[]')
  localStorage.removeItem(KEY)
  return q
}

export async function replayQueue(fetcher: (r: Queued)=>Promise<any>) {
  if (!isOnline()) return
  const items = dequeueAll()
  for (const item of items) {
    try { await fetcher(item) } catch { enqueue(item) }
  }
}