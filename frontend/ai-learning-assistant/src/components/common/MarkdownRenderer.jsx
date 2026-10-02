import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHightlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/hljs";

const MarkdownRenderer = ({ content }) => {
  return (
    <div className="text-neutral-700">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-xl font-bold mt-4 mb-2" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-lg font-bold mt-4 mb-2" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-md font-bold mt-3 mb-2" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-sm font-bold mt-3 mb-1" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-2 leading-relaxed" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a className="text-[#00d492] hover:underline" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside mb-2 ml-4" {...props} />
          ),
          ol: ({ node, ...props }) => <ol className="mb-1" {...props} />,
          li: ({ node, ...props }) => (
            <li className="font-semibold" {...props} />
          ),
          strong: ({ node, ...props }) => <strong className="" {...props} />,
          em: ({ node, ...props }) => <em className="italic" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-neutral-300 pl-4 italic text-neutral-600 my-4"
              {...props}
            />
          ),
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHightlighter
                style={dracula}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHightlighter>
            ) : (
              <code
                className="bg-neutral-100 p-1 rounded font-mono text-sm"
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ node, ...props }) => (
            <pre
              className="bg-neutral-800 text-white p-3 rounded-md overflow-x-auto font-mono text-sm my-4"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
