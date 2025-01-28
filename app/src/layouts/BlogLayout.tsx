import { useEffect } from 'react';
import BaseLayout from "./BaseLayout";

export default function BlogLayout({ children, frontmatter }) {
  useEffect(() => {
    const headings = document.querySelectorAll(
      ".prose-styles h1,.prose-styles h2, .prose-styles h3"
    );
    const tocContainer = document.getElementById("table-of-contents");
    if (tocContainer && headings.length > 0) {
      const tocList = document.createElement("ul");
      tocList.classList.add(
        "divide-y-2", 
        "divide-black",
        "border-black",
        "[&>*:nth-child(1)]:uppercase"
      );
      headings.forEach((heading) => {
        const listItem = document.createElement("li");
        listItem.classList.add("p-4");
        const link = document.createElement("a");
        link.textContent = heading.textContent;
        link.href = `#${heading.id}`;
        link.classList.add("prose-styles");
        listItem.appendChild(link);
        tocList.appendChild(listItem);
      });
      tocContainer.appendChild(tocList);
      tocContainer.classList.remove("hidden");
    }
  }, []);

  return (
    <BaseLayout>
      <section
        aria-labelledby="post"
        id="post"
        className="mx-auto  bg-violet-300 border-b-2 2xl:border-x-2 border-black"
      >
        <img
          className="h-96 w-full object-contain"
          src={frontmatter.image.url}
          alt={frontmatter.image.alt}
        />
      </section>
      <section>
        <div className=" mx-auto 2xl:border-x-2 border-black">
          <p className="text-5xl font-display text-balance font-black md:text-7xl lg:text-8xl uppercase text-white">
            {frontmatter.page}
          </p>
        </div>
        <div className="2xl:border-x-2 border-black  mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 lg:divide-x-2 lg:divide-black">
            <div className="lg:col-span-1">
              <div
                id="table-of-contents"
                className="hidden lg:block sticky border-b border-black top-20"
              >
                <div className="p-4 border-b-2 border-black">
                  <h3 className="text-black text-3xl uppercase font-display">
                    Table of contents
                  </h3>
                </div>
                {/* Table of contents content here */}
              </div>
            </div>
            <div className="lg:col-span-3 p-8 lg:p-20">
              <div className="prose-styles">
                {children}
              </div>
            </div>
          </div>
        </div>
      </section>
    </BaseLayout>
  );
}
