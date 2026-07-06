type CodeBlockProps = {
  code: string;
};

export const CodeBlock = ({ code }: CodeBlockProps) => {
  return (
    <pre className="overflow-x-auto rounded-md border border-slate-200 bg-slate-950 p-4 text-sm leading-6 text-slate-100 shadow-sm">
      <code>{code}</code>
    </pre>
  );
};
