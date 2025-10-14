import mongoose from "mongoose";
import { AttributeType } from "../../common/constants/attributeType";

export const ATTRIBUTE_COLLECTION_NAME = "Attributes";
export const ATTRIBUTE_DOCUMENT_NAME = "Attribute";

var attributeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            unique: true,
            require: true,
        },
        attributeKey: {
            type: String,
            unique: true,
        },
        type: { type: String, enum: Object.values(AttributeType), default: AttributeType.Manual },
        values: [
            {
                type: String || Number,
                default: [],
            },
        ],
    },
    {
        collection: ATTRIBUTE_COLLECTION_NAME,
        timestamps: true,
        versionKey: false,
    },
);

const Attribute = mongoose.model(ATTRIBUTE_DOCUMENT_NAME, attributeSchema);

export default Attribute;
