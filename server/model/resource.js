import mongoose from 'mongoose';
const Schema = mongoose.Schema;


const resourceSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    type: String,
    title: String,
    content: String,
    url: String,
    tags: [String],
}, { timestamps: true });

const Resource = mongoose.model('Resource', resourceSchema);
export default Resource;