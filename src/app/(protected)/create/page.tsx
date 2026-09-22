'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateFormInput } from "@/types/create-form-input";
import Image from "next/image";
import {useForm} from "react-hook-form";

const CreatePage = () => {
  const {register , handleSubmit , reset} = useForm<CreateFormInput>();

  function onSubmit(data: CreateFormInput){
    window.alert(JSON.stringify(data, null ,2));
    return true;
  }
  return(
    <div className="flex items-center justify-center gap-12 h-full">
      <Image src='/work-github.svg' alt="work-github" width={206} height={206}/>
      <div>
          <div>
            <h1 className="semi-bold text-2xl">
              Link of your GitHub Repository
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter the URL of your repossitory link to StackMate.
            </p>
            <div className="h-4"></div>
              <form onSubmit={handleSubmit(onSubmit)} >
                  <Input
                  {...register('projectName', {required: true})}
                  placeholder="Project Name"
                  required 
                  />
                  <div className="h-2"></div>
                   <Input
                  {...register('repoUrl', {required: true})}
                  placeholder="GitHub URL"
                  type="url"
                  required 
                  />
                  <div className="h-2"></div>
                   <Input
                  {...register('githubToken')}
                  placeholder="GitHub Token (Optional)"
                  />
                  <div className="h-4"></div>
                  <Button size="lg" type="submit" className="bg-active-primary text-active-text">
                    Create Project
                  </Button>
              </form>
          </div>
      </div>
    </div>
  )
}

export default CreatePage;