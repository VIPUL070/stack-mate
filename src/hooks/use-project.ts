import { api } from "@/trpc/react";

const useProject = () => {
    const {data: projects} = api.project.getProjects.useQuery();
    return {
        projects
    }
}

export default useProject;