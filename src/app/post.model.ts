export class Post {
    constructor (
        public id: string, // or number, depending on what type the id should be
        public title: string, 
        public imgPath: string, 
        public description: string, 
        public author: string, 
        public dateCreated: Date,
        public numberOfLikes: number,
        public comments: string[] = [],
        public postedBy: string,
        public deleted?: boolean, 
        public permanentlyDeleted?: boolean
    ) {}
}