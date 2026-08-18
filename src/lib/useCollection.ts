import { useEffect, useState } from 'react'
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  type DocumentData,
} from 'firebase/firestore'
import { db } from './firebase'

export interface WithId {
  id: string
}

/**
 * Realtime listener on a Firestore collection. Both partners see the
 * same list update live, with no refresh needed, because Firestore
 * pushes changes to every open listener the moment a write commits.
 */
export function useCollection<T extends DocumentData>(
  collectionName: string,
  orderByField = 'createdAt',
) {
  const [data, setData] = useState<(T & WithId)[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const q = query(collection(db, collectionName), orderBy(orderByField, 'desc'))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setData(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as T & WithId),
        )
        setLoading(false)
      },
      (err) => {
        console.error(`Failed to load ${collectionName}`, err)
        setError(err.message)
        setLoading(false)
      },
    )
    return unsubscribe
  }, [collectionName, orderByField])

  return { data, loading, error }
}
