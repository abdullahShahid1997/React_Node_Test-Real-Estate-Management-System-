import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getApi, postApi, deleteApi, deleteManyApi } from '../../services/api';

// Async action to fetch all meetings from the API
export const fetchMeetingData = createAsyncThunk('fetchMeetingData', async () => {
    const user = JSON.parse(localStorage.getItem("user")); // Retrieve user data from local storage
    try {
        // API call to fetch meetings based on user role
        const response = await getApi(user.role === 'superAdmin' ? 'api/meeting/index' : `api/meeting/index?createBy=${user._id}`);
        
        // Ensure we extract the correct data array from the response
        return response.data?.data || []; 
    } catch (error) {
        throw error; // Propagate error for Redux to handle
    }
});

// Async action to add a new meeting
export const addMeeting = createAsyncThunk('addMeeting', async (meetingData) => {
    try {
        // API call to add a new meeting
        const response = await postApi('api/meeting/add', meetingData);
        return response.data?.data; // Return the added meeting data
    } catch (error) {
        throw error;
    }
});

// Async action to delete a single meeting by ID
export const deleteMeeting = createAsyncThunk('deleteMeeting', async (id) => {
    try {
        // API call to delete a specific meeting
        const response = await deleteApi('api/meeting/delete', `/${id}`);
        
        if (response.status === 200) {
            return id; // Return the deleted meeting ID
        } else {
            throw new Error("Failed to delete meeting");
        }
    } catch (error) {
        throw error;
    }
});

// Async action to delete multiple meetings
export const deleteMultipleMeetings = createAsyncThunk('deleteMultipleMeetings', async (ids) => {
    try {
        // API call to delete multiple meetings
        const response = await deleteManyApi('api/meeting/deleteMany', { ids : ids });

        if (response.status === 200) {
            return ids; // Return deleted meeting IDs
        } else {
            throw new Error("Failed to delete multiple meetings");
        }
    } catch (error) {
        throw error;
    }
});

// Meeting slice to handle Redux state management
const meetingSlice = createSlice({
    name: 'meetingData',
    initialState: {
        data: [], // Holds meeting data
        isLoading: false, // Loading state indicator
        error: "", // Holds error messages
    },
    extraReducers: (builder) => {
        builder
            // Handle fetching meetings
            .addCase(fetchMeetingData.pending, (state) => {
                state.isLoading = true; // Set loading state to true
            })
            .addCase(fetchMeetingData.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = Array.isArray(action.payload) ? action.payload : []; // Store fetched data
                state.error = ""; // Clear errors
            })
            .addCase(fetchMeetingData.rejected, (state, action) => {
                state.isLoading = false;
                state.data = []; // Reset data on failure
                state.error = action.error.message; // Store error message
            })
            // Handle adding a meeting
            .addCase(addMeeting.fulfilled, (state, action) => {
                if (action.payload) {
                    state.data.push(action.payload); // Append new meeting to the list
                }
            })
            // Handle deleting a single meeting
            .addCase(deleteMeeting.fulfilled, (state, action) => {
                state.data = state.data.filter(meeting => meeting._id !== action.payload); // Remove deleted meeting
            })
            // Handle deleting multiple meetings
            .addCase(deleteMultipleMeetings.fulfilled, (state, action) => {
                state.data = state.data.filter(meeting => !action.payload.includes(meeting._id)); // Remove deleted meetings
            });
    },
});

export default meetingSlice.reducer;
