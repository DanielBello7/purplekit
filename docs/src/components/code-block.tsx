type CodeBlockProps = {
  code: string;
};

export const CodeBlock = ({ code }: CodeBlockProps) => {
  return (
    <pre className="max-w-full overflow-x-auto rounded-md border border-slate-200 bg-slate-950 p-3 text-xs leading-6 text-slate-100 shadow-sm sm:p-4 sm:text-sm">
      <code>{code}</code>
    </pre>
  );
};
