"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  if (!content) return null;

  return (
    <div className={`markdown-body ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-7 mb-3 pb-2 border-b border-white/10 tracking-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-6 mb-3 pb-1 border-b border-white/5 tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-4 bg-emerald-400 rounded-full inline-block" />
              <span>{children}</span>
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base sm:text-lg font-semibold text-emerald-400 mt-5 mb-2 font-mono">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm sm:text-base font-semibold text-slate-200 mt-4 mb-2">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-4 font-normal">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-outside ml-5 space-y-1.5 mb-4 text-slate-300 text-sm sm:text-base">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside ml-5 space-y-1.5 mb-4 text-slate-300 text-sm sm:text-base">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-1 marker:text-emerald-400">
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-white">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-slate-200">{children}</em>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4 decoration-emerald-500/40 hover:decoration-emerald-400 transition-colors break-words font-medium"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-emerald-500/70 pl-4 py-1.5 my-4 bg-emerald-500/[0.04] rounded-r-lg text-slate-300 italic">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-6 border-white/10" />,
          img: ({ src, alt }) => (
            <span className="block my-6 overflow-hidden rounded-xl border border-white/10 bg-slate-950/60 shadow-lg">
              <img
                src={typeof src === "string" ? src : ""}
                alt={alt || "Imagen"}
                className="w-full h-auto max-h-[550px] object-contain mx-auto"
                loading="lazy"
              />
              {alt && (
                <span className="block py-2 px-3 text-center text-xs font-mono text-slate-400 bg-slate-900/60 border-t border-white/5">
                  {alt}
                </span>
              )}
            </span>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-5 rounded-lg border border-white/10">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-900 border-b border-white/10 text-white font-mono">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-white/5 bg-slate-950/40">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-white/[0.02] transition-colors">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2.5 font-semibold text-slate-200">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-slate-300">{children}</td>
          ),
          pre: ({ children }) => (
            <pre className="my-4 overflow-x-auto rounded-xl border border-white/10 bg-[#080d17] p-4 text-xs sm:text-sm font-mono text-slate-200 leading-normal shadow-inner">
              {children}
            </pre>
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className && typeof children === "string" && !children.includes("\n");
            if (isInline) {
              return (
                <code
                  className="font-mono text-xs sm:text-[13px] px-1.5 py-0.5 rounded bg-slate-900/90 text-emerald-300 border border-emerald-500/20"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className={className || "font-mono"} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

