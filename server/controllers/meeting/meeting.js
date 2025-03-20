const mongoose = require('mongoose');
const MeetingHistory = require('../../model/schema/meeting'); // Importing the MeetingHistory model

// Create a new meeting with validations
const add = async (req, res) => {
    try {
        // Extracting required fields from the request body
        const { agenda, attendes, attendesLead, location, related, dateTime, notes, createBy } = req.body;
        
        // Checking if mandatory fields are provided
        if (!agenda || !createBy || !dateTime) {
            return res.status(400).json({ success: false, message: 'Agenda, createBy, and dateTime are required fields' });
        }
        
        // Ensuring attendes and attendesLead are arrays
        if (!Array.isArray(attendes) || !Array.isArray(attendesLead)) {
            return res.status(400).json({ success: false, message: 'Attendes and attendesLead should be arrays' });
        }
        
        // Creating a new meeting instance
        let meeting = new MeetingHistory(req.body);
        meeting = await meeting.save(); // Saving the meeting to the database
        
        // Fetching the saved meeting with populated fields
        meeting = await MeetingHistory.findById(meeting._id)
            .populate('attendes') // Populating attendes field
            .populate('attendesLead') // Populating attendesLead field
            .populate('createBy'); // Populating createBy field
        
        res.status(201).json({ success: true, message: 'Meeting added successfully', data: meeting });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message }); // Handling errors
    }
};

// Get all meetings
const index = async (req, res) => {
    try {
        // Retrieving meetings that are not deleted and populating referenced fields
        const meetings = await MeetingHistory.find({ deleted: false })
            .populate('attendes')
            .populate('attendesLead')
            .populate('createBy');
        
        res.status(200).json({ success: true, data: meetings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message }); // Handling errors
    }
};

// Get a single meeting by ID with validation
const view = async (req, res) => {
    try {
        // Validating if the provided ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid meeting ID' });
        }
        
        // Finding the meeting by ID and populating fields
        const meeting = await MeetingHistory.findById(req.params.id)
            .populate('attendes')
            .populate('attendesLead')
            .populate('createBy');
        
        if (!meeting) return res.status(404).json({ success: false, message: 'Meeting not found' });

        res.status(200).json({ success: true, data: meeting });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message }); // Handling errors
    }
};

// Delete a meeting by ID (Soft Delete) with validation
const deleteData = async (req, res) => {
    try {
        // Validating if the provided ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid meeting ID' });
        }
        
        // Marking the meeting as deleted (soft delete)
        const meeting = await MeetingHistory.findByIdAndUpdate(req.params.id, { deleted: true }, { new: true });
        
        if (!meeting) return res.status(404).json({ success: false, message: 'Meeting not found' });

        res.status(200).json({ success: true, message: 'Meeting deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message }); // Handling errors
    }
};

// Delete multiple meetings (Soft Delete) with validation
const deleteMany = async (req, res) => {
    try {
        const { ids } = req.body;
        
        // Validating if the IDs array is provided and not empty
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid request, ids must be a non-empty array' });
        }
        
        // Filtering out invalid IDs
        const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
        
        if (validIds.length === 0) {
            return res.status(400).json({ success: false, message: 'No valid meeting IDs provided' });
        }
        
        // Performing a soft delete on multiple meetings
        await MeetingHistory.updateMany({ _id: { $in: validIds } }, { deleted: true });

        res.status(200).json({ success: true, message: 'Meetings deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message }); // Handling errors
    }
};

module.exports = { add, index, view, deleteData, deleteMany }; // Exporting all functions
