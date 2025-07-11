import mongoose from 'mongoose';
const Schema = mongoose.Schema;


const ProblemSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    ProblemName: { type: String, required: true },
    Topic: { type: String },
    URL: { type: String },
    Difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true }
}, { timestamps: true });

const Problem = mongoose.model('problem', ProblemSchema);
export default Problem;