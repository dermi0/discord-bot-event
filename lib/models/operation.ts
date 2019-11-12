import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';
import { IOperation } from '../interfaces/operation';

/**
 * Schema of the operation
 */
const OperationSchema: Schema = new Schema({

    serverID: { // ID of the server
        type: String,
        required: true
    },
    name: { // Name of the operation
        type: String,
        required: true
    },
    description: { // Description of the operation
        type: String,
        required: true
    },
    creatorID: { // Creator ID
        type: String,
        required: true
    },
    date: { // Date of the event
        type: Number,
        required: true
    },
    participants: { // Array of userIDs
        type: Array,
        required: true
    }
});

export default mongoose.model<IOperation>('Operations', OperationSchema);
