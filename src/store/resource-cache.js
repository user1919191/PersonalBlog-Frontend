import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getCategories } from '@/api/category'
import { getPublicTags } from '@/api/article'
import { getFolders } from '@/api/user'

const DEFAULT_TTL = 5 * 60 * 1000

function createEntry(ttl = DEFAULT_TTL) {
  return {
    data: null,
    expiresAt: 0,
    promise: null,
    ttl
  }
}

function isFresh(entry) {
  return entry.expiresAt > Date.now() && entry.data !== null
}

async function resolveEntry(entry, loader, force = false) {
  if (!force && isFresh(entry)) {
    return entry.data
  }

  if (entry.promise) {
    return entry.promise
  }

  entry.promise = Promise.resolve(loader())
    .then((data) => {
      entry.data = data
      entry.expiresAt = Date.now() + entry.ttl
      return data
    })
    .finally(() => {
      entry.promise = null
    })

  return entry.promise
}

export const useResourceCacheStore = defineStore('resource-cache', () => {
  const categoriesEntry = ref(createEntry())
  const publicTagsEntry = ref(createEntry())
  const favoriteFoldersEntry = ref(createEntry())

  function invalidateFavoriteFolders() {
    favoriteFoldersEntry.value.expiresAt = 0
    favoriteFoldersEntry.value.data = null
  }

  function clearUserScopedCache() {
    invalidateFavoriteFolders()
  }

  return {
    getCategories: (force = false) => resolveEntry(categoriesEntry.value, getCategories, force),
    getPublicTags: (force = false) => resolveEntry(publicTagsEntry.value, getPublicTags, force),
    getFavoriteFolders: (force = false) => resolveEntry(favoriteFoldersEntry.value, getFolders, force),
    invalidateFavoriteFolders,
    clearUserScopedCache
  }
})
