import mongoose from "mongoose";
const TrainingProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    trainingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Training',
        required: true,
    },
    pass: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        default: 'Pending',
    },
    deadline: {
        type: Date,
        required: true,
    },
    modules: [
        {
            moduleId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Module',
                required: true,
            },
            pass: {
                type: Boolean,
                default: false,
            },
            videos: [
                {
                    videoId: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'Video',
                        required: true,
                    },
                    pass: {
                        type: Boolean,
                        default: false,
                    },
                },
            ],
        },
    ],
});

const TrainingProgress = mongoose.model('TrainingProgress', TrainingProgressSchema);
export default TrainingProgress;
