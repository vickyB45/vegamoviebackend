import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    slug:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
    },
    description:{
        type:String,
        required:true
    },
    releaseDate:{
        type:Number
    },
    releaseYear:{
        type:Number,
        index:true
    },
    duration:{
        type:Number
    },
    language:{
        type:[String],
        default:[]
    },
    poster:{
        type:String,
        required:true
    },
    quality:{
        type:[String],
        enum:["480p", "720p", "1080p", "4K"]
    },
    redirectUrl: {
      type: String,
      trim: true,
    },
    rating:{
        type:Number,
        min:0,
        max:10,
        default:0
    },
    status:{
        type:String,
        enum:["draft", "published", "blocked"],
        default:"draft"
    },
     isTrending: {
      type: Boolean,
      default: false,
    },
},{timestamps:true})

const MovieModel = mongoose.model("Movie",movieSchema);
export default MovieModel;