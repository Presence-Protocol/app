import BaseLayout from "./BaseLayout";

export default function ChangelogLayout({ children, frontmatter }) {
  return (
    <BaseLayout>
      <section>
        <div className="items-center w-full mx-auto  2xl:border-x-2 border-black">
          <div className="p-8 lg:p-20 lg:py-32 items-center gap-12 h-full bg-red-500 border-b-2 border-black">
            <div className="text-center max-w-4xl mx-auto">
              <p className="text-5xl lg:text-7xl text-black">{frontmatter.page}</p>
              <p className="max-w-xl mt-4 xl:text-2xl mx-auto tracking-tight text-black">
                <time dateTime={frontmatter.pubDate.toString().slice(0, 10)}>
                  {frontmatter.pubDate.toString().slice(0, 10)}
                </time>
              </p>
            </div>
          </div>
          <div className="2xl:border-x-2  border-black mx-auto p-8 lg:p-20">
            <div className="max-w-3xl mx-auto">
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
