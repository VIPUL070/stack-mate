export type FileReference = {
    fileName: string;
    sourceCode: string;
    summary: string;
}

export type CodeReference = {
  fileReferences: FileReference[];
}