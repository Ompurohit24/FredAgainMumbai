import { get, set, del } from 'idb-keyval'
export interface Meta { id: string; title: string; artist: string; cover?: string; color?: string; size: number; url?: string }
export const loadMeta = async (): Promise<Meta[]> => (await get<Meta[]>('meta')) ?? []
export const saveMeta = (m: Meta[]) => set('meta', m)
export const putBlob = (id: string, b: Blob) => set('blob:' + id, b)
export const getBlob = (id: string) => get<Blob>('blob:' + id)
export const delBlob = (id: string) => del('blob:' + id)
