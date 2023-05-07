import { createPubSub, createSchema } from "graphql-yoga";
import { context, CV, Skill } from "./db";
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
                return context.cvs;
            },
            cv: (parent, args, ctx, info) => {

                return context.cvs.find(cv => cv.id === args.id);
            },
            getCvSkills: (parent, args, ctx, info) => {
                return context.cvs.find(cv => cv.id === args.cvid)?.skills;
            },

            getCvUsers: (parent, args, ctx, info) => {
                return context.cvs.find(cv => cv.id === args.cvid)?.user;
            },

        },
        Mutation: {
            addCv: (parent, args, ctx, info) => {
                let skills: Skill[] = [];
                console.log(args.input);
                for (let id of args.input.skillIds) {
                    const result = context.skills.filter(skill => skill.id === id)
                    if (result.length === 0) {
                        throw new GraphQLError(`Element with id '${id}' not found.`)
                    }
                    // skills.push(context.skills.filter((skill) => skill.id === id))
                    skills.concat(result)
                }
                const _user = context.users.find(user => args.input.userId == user.id);
                const cv: CV = {
                    id:   context.cvs.length!,
                    name: args.input.name,
                    age: args.input.age,
                    job: args.input.job,
                    skills: skills,
                    user: _user!,
                }
                console.log(cv);
                context.cvs.push(cv)
                pubSub.publish(CV_UPDATED, { msg: 'CV_ADDED', cv: cv });

                return cv;
            },
            updateCv: (parent, args, ctx, info) => {
                let _cv = context.cvs.find(cv => cv.id === args.input.id);
                console.log(_cv);

                const index = context.cvs.indexOf(_cv!);
                _cv!.name = args.input.name;

                _cv!.age = args.input.age;
                _cv!.job = args.input.job;
                let skills: Skill[] = [];
                for (let id of args.input.skillIds) {
                    const result = context.skills.filter(skill => skill.id === id)
                    // skills.push(context.skills.filter((skill) => skill.id === id))
                    skills.concat(result)
                }
                _cv!.skills = skills;
                const _user = context.users.find(user => args.input.userId == user.id);
                _cv!.user = _user!;
                context.cvs[index] = _cv!
                pubSub.publish(CV_UPDATED, { msg: 'CV_UPDATED', cv: _cv });

                return _cv;
            },
            deleteCv: (parent, args, ctx, info) => {
                const _cv = context.cvs.find(cv => cv.id === args.id);
                const index = context.cvs.indexOf(_cv!);
                context.cvs.splice(index, 1)
                pubSub.publish(CV_UPDATED, { msg: 'CV_DELETED', cv: _cv });

                return true;
            }
        },
    }
})