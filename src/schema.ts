import { createPubSub, createSchema } from "graphql-yoga";
import { db } from "./db";
import { realpathSync } from "fs";
import { log } from "console";
import { GraphQLError } from "graphql";
import { resolve } from "path";
const fs = require("fs");
const path = require("path");
const CV_UPDATED = 'CV_UPDATED';
const CV_DELETED = 'CV_DELETED';
const CV_ADDED = 'CV_ADDED';
const pubSub = createPubSub();
export const schema = createSchema({
    typeDefs: fs.readFileSync(
        path.join(__dirname, "schema/schema.graphql"),
        "utf-8"
    ),
    resolvers: {
        Subscription: {
            cvUpdated: {
                subscribe: () => pubSub.subscribe(CV_UPDATED),
                resolve: (payload) => { return payload }
            }
        },
        Query: {
            hello: () => "Hello World!",
            cvs: (parent, args, ctx, info) => {
                return db.cvs;
            },
            cv: (parent, args, ctx, info) => {
                const cvFound= db.cvs.find(cv => cv.id === +args.id);
                if (!cvFound) throw new GraphQLError("CV not found");
                return cvFound;
            },
            getCvSkills: (parent, args, ctx, info) => {
                return db.cvs.find(cv => cv.id === +args.cvid)?.skills;
            },

            getCvUsers: (parent, args, ctx, info) => {
                return db.cvs.find(cv => cv.id === +args.cvid)?.user;
            },

        },
        Mutation: {
            addCv: (parent, args, ctx, info) => {
                const id = db.cvs.length + 1;
                const { name, age, job, skillIds, userId } = args.input;
                console.log(args.input);
                const skills = db.skills.filter((skill) => skillIds.includes(skill.id));
                console.log(skills);
                const user = db.users.find(user => args.input.userId == user.id);
                if (!user) {
                    throw new GraphQLError (`user d'id ${userId} n'existe pas`);
                }
                const cv = {
                    id,
                    name,
                    age,
                    job,
                    skills,
                    user,
                };
                db.cvs.push(cv);
                console.log(cv);

                pubSub.publish(CV_UPDATED, { msg: 'CV_ADDED', cv: cv });

                return cv;
            },
            updateCv: (parent, args, ctx, info) => {
                const { id, skillIds } = args.input;
                const cvIndex = db.cvs.findIndex((cv) => cv.id === +id);
                if (cvIndex === -1) {
                    throw new GraphQLError(` cv d'id ${id} n'existe pas.`);
                }
                let _cv = db.cvs.find(cv => cv.id === args.input.id);
                console.log(_cv);

                const index = db.cvs.indexOf(_cv!);
                _cv!.name = args.input.name;

                _cv!.age = args.input.age;
                _cv!.job = args.input.job;

                let newSkills =[]
                if ( skillIds )
                {
                    newSkills = db.skills.filter((skill) => skillIds.includes(skill.id));
                    _cv!.skills = newSkills;
                }
                const _user = db.users.find(user => args.input.userId == user.id);
                _cv!.user = _user!;
                db.cvs[index] = _cv!
                pubSub.publish(CV_UPDATED, { msg: 'CV_UPDATED', cv: _cv });

                return _cv;
            },
            deleteCv: (parent, args, ctx, info) => {
                const _cv = db.cvs.find(cv => cv.id === args.id);
                const index = db.cvs.indexOf(_cv!);
                db.cvs.splice(index, 1)
                pubSub.publish(CV_UPDATED, { msg: 'CV_DELETED', cv: _cv });

                return true;
            }
        },
    }
})