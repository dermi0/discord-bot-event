import { Document } from 'mongoose';

/**
 * Interface of the operation
 */
export interface IEvent extends Document {

    // ID of the event
    id?: number;

    // ID of the server
    serverID: string;

    // Name of the operation
    name: string;

    // Description of the operation
    description: string;

    // Creator ID
    creatorID: string;

    // date of the event
    date: number;

    // Array of userIDs
    participants: string[];

}