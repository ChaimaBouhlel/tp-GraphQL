import { defineArguments } from "graphql/type/definition";


interface CV {
    id: number;
    name: string;
    age: number;
    job: string;
    skills: Skill[];
    user: User

}

interface Skill {
    id: number;
    designation: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    role: 'user' | 'admin';
    // cv: CV[];
}
const skills: Skill[] = [
    { id: 1, designation: "Nest"},
    { id: 2, designation: "Java "},
    { id: 3, designation: "GraphQL" },
    { id: 4, designation: "java script"},
];

const users: User[] = [
    {
        id: 1,
        name: "nada",
        email: "nada@gmail.com",
        role: 'user',

    },
    {
        id: 2,
        name: "chaima ",
        email: "heyheyhey",
        role: 'user',

    },
    {
        id: 3,
        name: "nada khelif",
        email: "nada khelif",
        role: 'admin',

    },
    {
        id: 4,
        name: "eya",
        email: "eya",
        role: 'user',

    },
];


const cvs: CV[] = [
    {
        id: 1,
        name: "cv1",
        age: 50,
        job: "job1",
        skills: [skills[0]],
        user: users[0],
    },
    {
        id: 2,
        name: "cv2",
        age: 60,
        job: "job4",
        skills: [skills[1]],
        user: users[1],
    },
    {
        id: 3,
        name: "cv3",
        age: 21,
        job: "job3",
        skills:[skills[0],skills[2]],
        user: users[2],
    },
    {
        id: 4 ,
        name: "cv4",
        age: 30,
        job: "job4",
        skills:[skills[3]],
        user: users[0],
    },

];





class _context {
    cvs: CV[] = cvs;
    users: User[] = users;
    skills: Skill[] = skills
}
let context = new _context();
export { context, CV, User, Skill }