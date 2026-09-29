"use client";

import { CodeReference } from "@/types/ask-question";
import { useState } from "react";
import { Tabs, TabsContent } from "../ui/tabs";
import { cn } from "../../lib/utils";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const CodeReferences = ({ fileReferences }: CodeReference) => {
  const [tab, setTab] = useState<string>(fileReferences[0]?.fileName);
  if (!fileReferences.length) return null;

  return (
    <div className="max-w-[45vw]">
      <Tabs value={tab} onValueChange={setTab}>
        <div className="overflow-scroll scrollbar-none flex gap-2 p-1 bg-grey-200 rounded-md">
          {fileReferences.map((file) => {
            return (
              <button
                key={file.fileName}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-md font-medium transition-colors whitespace-nowrap text-muted-foreground hover:bg-muted",
                  {
                    "bg-active-primary text-active-text": tab == file.fileName,
                  }
                )}
                onClick={() => setTab(file.fileName)}
              >
                {file.fileName}
              </button>
            );
          })}
        </div>

        {fileReferences.map((file) => {
          return (
            <TabsContent
              key={file.fileName}
              value={file.fileName}
              className="max-h-[40vh] overflow-scroll scrollbar-none max-w-7xl rounded-md"
            >
              <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
                {file.sourceCode}
              </SyntaxHighlighter>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default CodeReferences;