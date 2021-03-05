const { Schema, model, Types } = require('mongoose');
const dateFormat = require('../utils/dateFormat')

const ReplySchema = new Schema(
    {
        //set custom id to avoid confusion with parent comment _id
        replyId: {
            type: Schema.Types.ObjectId,
            default: () => new Types.ObjectId()
        },
        replyBody: {
            type: String,
            required: 'Reply must be at least 1 character.',
            trim: true
        },
        writtenBy: {
            type: String,
            required: 'Author name is required.'
        },
        createdAt: {
            type: Date,
            default: Date.now,
            get: createdAtVal => dateFormat(createdAtVal)
        }
    },
    {
        toJSON: {
            getters: true
        }
    }
);

const CommentSchema = new Schema({
    writtenBy: {
        type: String,
        required: 'Author name is required'
    },
    commentBody: {
        type: String,
        required: 'Comment must be at least 1 character.'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        get: createdAtVal => dateFormat(createdAtVal)
    },
    replies: [ReplySchema]
},
{
    toJSON: {
        virtuals: true,
        getters: true
    },
    id: false
});

CommentSchema.virtual('replyCount').get(function() {
    return this.replies.length;
});

const Comment = model('Comment', CommentSchema);

module.exports = Comment;