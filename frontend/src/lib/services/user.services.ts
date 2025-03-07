import axios from './axios'

export const createUser = async (address: string) => axios.post('/createUser', { address })
export const getProfile = async (address: string) => axios.post('/getProfile', { address })
export const claimFirstCoin = async (address: string) => axios.post('/claimFirstCoin', { address })
