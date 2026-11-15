import { ref } from 'vue'

function defaultSerialize(params) {
  const entries = Object.entries(params || {})
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([a], [b]) => a.localeCompare(b))

  return JSON.stringify(entries)
}

export function useSmartListLoader(fetcher, options = {}) {
  const delay = options.delay ?? 300
  const serialize = options.serialize ?? defaultSerialize
  const getCacheKey = options.getCacheKey ?? serialize

  const loading = ref(false)
  const records = ref([])
  const total = ref(0)

  let timer = null
  let pendingDebounceResolve = null
  let controller = null
  let requestSequence = 0
  let latestKey = ''
  let latestResult = null

  function clearPendingTimer() {
    if (!timer) return
    clearTimeout(timer)
    timer = null
    pendingDebounceResolve?.(null)
    pendingDebounceResolve = null
  }

  async function run(params, runOptions = {}) {
    const cacheKey = getCacheKey(params)
    const useDebounce = runOptions.debounce ?? false

    if (latestKey === cacheKey && latestResult && !runOptions.force) {
      records.value = latestResult.records
      total.value = latestResult.total
      return latestResult
    }

    clearPendingTimer()

    if (controller) {
      controller.abort()
      controller = null
    }

    const execute = async () => {
      const requestId = ++requestSequence
      const currentController = new AbortController()
      controller = currentController
      loading.value = true
      try {
        const data = await fetcher(params, { signal: currentController.signal })
        if (requestId !== requestSequence || currentController.signal.aborted) {
          return null
        }
        const normalized = {
          records: data?.records || [],
          total: data?.total || 0
        }
        latestKey = cacheKey
        latestResult = normalized
        records.value = normalized.records
        total.value = normalized.total
        return normalized
      } catch (error) {
        if (error?.name === 'CanceledError' || error?.name === 'AbortError' || error?.code === 'ERR_CANCELED') {
          return null
        }
        throw error
      } finally {
        if (requestId !== requestSequence) {
          return
        }
        if (controller === currentController) {
          controller = null
        }
        if (currentController.signal.aborted) {
          loading.value = false
          return
        }
        loading.value = false
      }
    }

    if (!useDebounce) {
      return execute()
    }

    return new Promise((resolve, reject) => {
      pendingDebounceResolve = resolve
      timer = setTimeout(() => {
        timer = null
        pendingDebounceResolve = null
        execute().then(resolve).catch(reject)
      }, delay)
    })
  }

  function cancel() {
    clearPendingTimer()
    requestSequence += 1
    if (controller) {
      controller.abort()
      controller = null
    }
    loading.value = false
  }

  return {
    loading,
    records,
    total,
    run,
    cancel
  }
}
