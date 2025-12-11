import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux'; 
import type { RootState, AppDispatch } from './store';

// Sử dụng 2 hooks này trong toàn bộ app thay vì useDispatch/useSelector gốc
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;