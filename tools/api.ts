// index.ts
import axios from "axios";
const baseUrl = 'http://localhost:8145/api-source'
const commonHeaderConfig = {
  uID: '11188475'
}
/**
 * 
 * @param level 1=> 入门;2=>一般；3=>困难
 * @returns 
 */
export const apiFetchAll = async (level: number) => {
  const result = await axios.get<any>(`${baseUrl}/idiomLevel/all`, {
    params: { level },
    withCredentials: true,
    // headers: commonHeaderConfig
  })
  return result
}