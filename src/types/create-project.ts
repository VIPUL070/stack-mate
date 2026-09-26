export interface CreateFormInput {
    repoUrl : string;
    projectName: string;
    githubToken?: string;
}

export interface ProjectProps {
    id: string;
    githubUrl : string;
    name: string;
    githubToken?: string;
}