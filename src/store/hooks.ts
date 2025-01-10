import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@store/index'
import { userApi } from './services/userApi';

export const useAppDispatch: () => AppDispatch = useDispatch
export const { useGetNotificationsQuery } = userApi;