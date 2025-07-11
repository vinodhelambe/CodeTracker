import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const taskSchema = new Schema({
    activity: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    }
});


const routineSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    date: {
        type: String,
        required: true
    },
    tasks: [taskSchema]
}, { timestamps: true });

const Routine = mongoose.model('Routine', routineSchema);
export default Routine;