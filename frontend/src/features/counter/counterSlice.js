/**
 * Counter Redux Slice
 * 
 * Manages simple counter state for demonstration purposes
 * Provides increment, decrement, and increment by amount actions
 */
import { createSlice } from '@reduxjs/toolkit';

/**
 * Initial counter state
 */
const initialState = { 
    value: 0 
};

/**
 * Redux Toolkit slice for counter functionality
 */
const counterSlice = createSlice({
    name: 'counter',
    initialState,
    reducers: {
        /**
         * Increments counter by 1
         * 
         * @param {Object} state - Current counter state
         */
        increment: (state) => {
            state.value += 1;
        },
        
        /**
         * Decrements counter by 1
         * 
         * @param {Object} state - Current counter state
         */
        decrement: (state) => {
            state.value -= 1;
        },
        
        /**
         * Increments counter by specified amount
         * 
         * @param {Object} state - Current counter state
         * @param {Object} action - Action payload
         * @param {number} action.payload - Amount to increment by
         */
        incrementByAmount: (state, action) => {
            state.value += action.payload;
        },
    },
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;
export default counterSlice.reducer;
