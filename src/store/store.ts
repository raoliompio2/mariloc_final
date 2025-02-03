import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './themeSlice';
import categoryReducer from './categorySlice';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    categories: categoryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
